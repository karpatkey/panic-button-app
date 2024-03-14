import argparse
import json
import os
from datetime import datetime

from decouple import config
import pandas as pd
import traceback
import aiohttp
import asyncio


def access_key():
    return config('DEBANK_API_KEY')


DEFAULT_WALLETS = []


def debank_dataframe_from_pos_detail(chain, wallet, name, objeto):
    """Genera un DataFrame a partir de un objeto JSON.

    Args:
      objeto: El objeto JSON que se va a convertir en DataFrame.

    Returns:
      Un DataFrame con las columnas especificadas.
    """

    # Obtener nombre de la posicion .

    tipo_position = objeto["name"]

    position = objeto.get("detail", {}).get("description")
    pool_id = objeto.get("pool", {}).get("id")

    # Obtener las listas de tokens de recompensa y suministro.
    reward_token_list = objeto.get("detail", {}).get("reward_token_list", [])

    supply_token_list = objeto.get("detail", {}).get("supply_token_list", [])
    borrow_token_list = objeto.get("detail", {}).get("borrow_token_list", [])

    # add special case fot other tokens
    token = objeto.get("detail", {}).get("token", None)
    other_tokens_list = [] if token is None else [token]

    # Crear un DataFrame vacío con las columnas especificadas.
    df = pd.DataFrame(
        {
            "chain": [chain] * len(reward_token_list)
            + [chain] * len(supply_token_list)
            + [chain] * len(borrow_token_list)
            + [chain] * len(other_tokens_list),
            "wallet": [wallet] * len(reward_token_list)
            + [wallet] * len(supply_token_list)
            + [wallet] * len(borrow_token_list)
            + [wallet] * len(other_tokens_list),
            "protocol_name": [name] * len(reward_token_list)
            + [name] * len(supply_token_list)
            + [name] * len(borrow_token_list)
            + [name] * len(other_tokens_list),
            "position": [position] * len(reward_token_list)
            + [position] * len(supply_token_list)
            + [position] * len(borrow_token_list)
            + [position] * len(other_tokens_list),
            "pool_id": [pool_id] * len(reward_token_list)
            + [pool_id] * len(supply_token_list)
            + [pool_id] * len(borrow_token_list)
            + [pool_id] * len(other_tokens_list),
            "position_type": [tipo_position] * len(reward_token_list)
            + [tipo_position] * len(supply_token_list)
            + [tipo_position] * len(borrow_token_list)
            + [tipo_position] * len(other_tokens_list),
            "token_type": ["rewards"] * len(reward_token_list)
            + ["supply"] * len(supply_token_list)
            + ["borrow"] * len(borrow_token_list)
            + ["tokens"] * len(other_tokens_list),
            "symbol": [token["symbol"] for token in reward_token_list]
            + [token["symbol"] for token in supply_token_list]
            + [token["symbol"] for token in borrow_token_list]
            + [token["symbol"] for token in other_tokens_list],
            "amount": [token["amount"] for token in reward_token_list]
            + [token["amount"] for token in supply_token_list]
            + [token["amount"] for token in borrow_token_list]
            + [token["amount"] for token in other_tokens_list],
            "price": [token["price"] for token in reward_token_list]
            + [token["price"] for token in supply_token_list]
            + [token["price"] for token in borrow_token_list]
            + [token["price"] for token in other_tokens_list],
        }
    )

    # Devolver el DataFrame.
    return df


def debank_protocol_to_df(data, wallet):
    debank_positions = pd.DataFrame()

    for element in data:
        for position in element["portfolio_item_list"]:
            df = debank_dataframe_from_pos_detail(
                element["chain"], wallet, element["name"], position)
            debank_positions = pd.concat(
                [debank_positions, df], ignore_index=True)

    return debank_positions


async def async_debank_protocol_api_call(wallet, session):
    retry_count = 3
    for _ in range(retry_count):
        try:
            url = f"https://pro-openapi.debank.com/v1/user/all_complex_protocol_list?id={wallet}"
            headers = {"accept": "application/json", "AccessKey": access_key()}
            async with session.get(url, headers=headers) as response:
                response.raise_for_status()
                data = await response.json()
                return data, wallet

        except aiohttp.ClientError as e:
            print(f"Error making request to {url}: {e}")
            await asyncio.sleep(1)  # Add a delay before retrying

    print(f"Failed to make request to {url} after {retry_count} retries.")
    return None


def debank_fetch_all(wallets):
    async def do_call():
        async with aiohttp.ClientSession() as session:
            tasks = [async_debank_protocol_api_call(
                wallet, session) for wallet in wallets]
            results = await asyncio.gather(*tasks)

        return results

    results = asyncio.get_event_loop().run_until_complete(do_call())
    return results


def main_debank_etl(wallets=[]):
    if not wallets:
        wallets = DEFAULT_WALLETS

    total_df = pd.DataFrame()

    results = debank_fetch_all(wallets)

    for (data, wallet) in results:
        try:
            df1 = debank_protocol_to_df(data, wallet)

            df1["datetime"] = datetime.now()
            total_df = pd.concat([total_df, df1], ignore_index=True)
        except Exception as e:
            print(f"Error in main_debank_etl: {e}")
            return {'error en el procesamiento'}

    return total_df


def transform_position(row):
    try:
        if row['protocol_name'] == 'Aura' and row['position_type'] == 'Locked':
            return 'Locked AURA'
        elif row['protocol_name'] == 'Lido' and row['chain'] == 'gnosis':
            return row['symbol']
        elif isinstance(row['position'], int):
            return row['position']
        elif isinstance(row['position'], float):
            return row['position']
        elif row['position'] is not None:
            return row['position'].replace('-', '/').replace('/vault', '').replace('#', '')
        else:
            return None  # O cualquier otro valor predeterminado que desees asignar

    except Exception as e:
        print(f"Error in transform_position: {e}")
        return {f'transform_position failed on {e}'}


def transform_pool_id(row):
    # --balancer bb-ag-usd fix:
    if row['pool_id'] == '0xde3b7ec86b67b05d312ac8fd935b6f59836f2c41':
        return '0xFEdb19Ec000d38d92Af4B21436870F115db22725'
    else:
        return row['pool_id']


def transform_chain(chain):
    chain_mapping = {
        'eth': 'ethereum',
        'xdai': 'gnosis',
        'matic': 'polygon',
        'arb': 'arbitrum',
        'op': 'optimism',
        'pls': 'pulse',
        'avax': 'avalanche',
        'bsc': 'base'
    }

    return chain_mapping.get(chain, chain)


def get_debank_positions(wallets=[]):
    """
    Retrieves and transforms DeBank positions data for a given wallet.

    Parameters:
    - wallet (str): The wallet address for which to fetch DeBank positions.

    Returns:
    str: JSON representation of the transformed DeBank positions data.

    The function fetches DeBank data using the main_debank_etl function and applies
    filtering and transformation steps to the DataFrame. It filters positions based
    on the specified protocols ('Aura Finance', 'LIDO', 'Balancer V2'), renames the
    protocols according to a predefined mapping, and processes the 'position' and
    'pool_id' columns using the transform_position and transform_pool_id functions.
    Finally, the function returns the resulting DataFrame in JSON format.

    Example:
    >>> json_data = get_debank_positions('0xYourWalletAddress')
    >>>
    """

    df = main_debank_etl(wallets=wallets)
    # Filter protocols:
    # print(df)
    protocols = ['Aura Finance', 'LIDO', 'Balancer V2']
    filtered_df = df[df['protocol_name'].isin(protocols)]
    df_debank_data = filtered_df.copy()

    # Rename protocols

    protocol_mapping = {'Aura Finance': 'Aura',
                        'Balancer V2': 'Balancer', 'LIDO': 'Lido'}
    df_debank_data.loc[:, 'protocol_name'] = df_debank_data['protocol_name'].replace(
        protocol_mapping)

    # Work on positiolns

    df_debank_data['position'] = df_debank_data.apply(
        transform_position, axis=1)

    # Work on pool_id

    df_debank_data['pool_id'] = df_debank_data.apply(transform_pool_id, axis=1)

    # Work on chain renaming:

    df_debank_data['chain'] = df_debank_data['chain'].apply(transform_chain)

    # print(df_debank_data)

    # A) Get data using debank data (Aura renaming) data:
    debank_file = os.path.join(os.path.dirname(__file__), "debank_data.json")

    with open(debank_file, "r") as f:

        debank_data = json.load(f)
    df_debank_ref = pd.DataFrame(debank_data)

    first_merge_df = pd.merge(df_debank_data, df_debank_ref,
                              left_on=['protocol_name', 'position', 'chain'],
                              right_on=['protocol',
                                        'debank_position_name', 'blockchain'],
                              how='left')
    # Coalesce after merge:

    first_merge_df['position'] = first_merge_df['position_name'].fillna(
        first_merge_df['position'])
    first_merge_df = first_merge_df.drop(
        columns=['protocol',	'position_name',	'blockchain', 'debank_position_name'])

    # B ) Get data using pool id Kitchen data:
    kitchen_file = os.path.join(os.path.dirname(__file__), "kitchen.json")

    with open(kitchen_file, "r") as f:

        kitchen_data = json.load(f)
    df_kitchen = pd.DataFrame(kitchen_data)

    # 1. Realizar la operación JOIN
    second_merged_df = pd.merge(first_merge_df, df_kitchen,
                                left_on=['chain', 'pool_id',
                                         'protocol_name', 'wallet'],
                                right_on=[
                                    'blockchain', 'lptoken_address', 'protocol', 'wallet'],
                                how='left')

    # Coalesce after merge:
    second_merged_df['position'] = second_merged_df['lptoken_name'].fillna(
        second_merged_df['position'])
    second_merged_df = second_merged_df.drop(
        columns=['lptoken_name', 'protocol', 'lptoken_address', 'blockchain', 'contains_wsteth',	'nonfarming_position', 'position_id', 'dao'])

    json_data = second_merged_df.to_json(orient='records')
    return json_data


def main():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)

    parser.add_argument("-w", "--wallets", type=str,
                        help="DAO whose funds are to be removed.", default="")

    args = parser.parse_args()
    wallets = args.wallets.split(",")
    wallets = list(filter(None, wallets))

    try:
        data_json = get_debank_positions(wallets)
        print(data_json)
        # print('Python Get DeBank Data Worked')
    except Exception as e:
        # print ('Error:',e)
        print(f"Error in main: {e}")
        print(traceback.format_exc())


if __name__ == "__main__":
    main()
