
import json
import os
import time
from datetime import datetime

from dotenv import load_dotenv
import pandas as pd
import requests
import traceback


load_dotenv()


def access_key():
    return os.getenv('DEBANK_API_KEY')


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


# wallet = '0x849D52316331967b6fF1198e5E32A0eB168D039d'


def debank_protocol_api_call(wallet):
    # chain = 'eth'
    # URL de la API
    complex_protocol_list = f"https://pro-openapi.debank.com/v1/user/all_complex_protocol_list?id={wallet}"
    # simple_protocol_list = f"https://pro-openapi.debank.com/v1/user/all_simple_protocol_list?id={wallet}"
    # /v1/user/all_token_list
    # Headers para la solicitud
    headers = {"accept": "application/json", "AccessKey": access_key}

    # Realiza la solicitud GET
    response = requests.get(complex_protocol_list, headers=headers)

    # Verifica si la solicitud fue exitosa
    if response.status_code == 200:
        data = response.json()
        return data, wallet
    else:
        return {f"La solicitud falló con el código de estado {response.status_code}"}
        # print()
        # print(response.text)


def debank_protocol_to_df(input_data):
    wallet = input_data[1]
    data = input_data[0]

    debank_positions = pd.DataFrame()

    for element in data:
        for position in element["portfolio_item_list"]:
            df = debank_dataframe_from_pos_detail(
                element["chain"], wallet, element["name"], position)
            debank_positions = pd.concat(
                [debank_positions, df], ignore_index=True)

    # debank_positions.to_clipboard()

    return debank_positions


def debank_wallet_api_call(wallet):
    wallet_list = f"https://pro-openapi.debank.com/v1/user/all_token_list?id={wallet}"

    # Headers para la solicitud
    headers = {"accept": "application/json", "AccessKey": access_key()}

    # Realiza la solicitud GET
    response = requests.get(wallet_list, headers=headers)

    # Verifica si la solicitud fue exitosa
    if response.status_code == 200:
        data = response.json()
        # Aquí puedes trabajar con los datos de la respuesta, que estarán en formato JSON
        # print(data)
        return data, wallet
    else:
        return {f"La solicitud falló con el código de estado {response.status_code}"}


def debank_wallet_to_df(input_data):
    wallet = input_data[1]
    data = input_data[0]

    df_wallet = pd.DataFrame(data)
    df_wallet_w = df_wallet[df_wallet["is_wallet"]]
    df_wallet_w = df_wallet_w[["id", "chain", "symbol", "amount", "price"]]
    df_wallet_w = df_wallet_w[["chain", "symbol", "amount", "price"]]
    df_wallet_w["wallet"] = wallet
    df_wallet_w["protocol_name"] = "wallet"
    df_wallet_w["position"] = "wallet"
    df_wallet_w["pool_id"] = ""
    df_wallet_w["position_type"] = "wallet"
    df_wallet_w["token_type"] = "wallet"

    return df_wallet_w


def main_debank_etl(wallet=None):
    start_time = time.time()
    if wallet is not None:
        wallets = [wallet]
    else:
        wallets = [
            "0x0efccbb9e2c09ea29551879bd9da32362b32fc89",
            "0x616de58c011f8736fa20c7ae5352f7f6fb9f0669",
            "0x4F2083f5fBede34C2714aFfb3105539775f7FE64",
            "0x458cd345b4c05e8df39d0a07220feb4ec19f5e6f",
            "0x4971dd016127f390a3ef6b956ff944d0e2e1e462",
            "0x849d52316331967b6ff1198e5e32a0eb168d039d",
            "0x10e4597ff93cbee194f4879f8f1d54a370db6969",
            "0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c",
            "0x54e191b01aa9c1f61aa5c3bce8d00956f32d3e71",
            "0x5ff85ecf773ea3885cb4b691068ab6d7bf8bda9a",
            "0x048a5ecc705c280b2248aeff88fd581abbeb8587",
            "0x9298dfD8A0384da62643c2E98f437E820029E75E",
            "0x51d34416593a8acf4127dc4a40625a8efab9940c",
            "0x43fd1f07da06b51097a697d4e3c7d369e2e3fd60",
            "0x3e40d73eb977dc6a537af587d48316fee66e9c8c",
            "0xca771eda0c70aa7d053ab1b25004559b918fe662",
            "0xce91228789b57deb45e66ca10ff648385fe7093b",
            "0xa1cb7762f40318ee0260f53e15de835ff001cb7e",
            "0xc498e8063c95b65d97fe9172bf952bf1c8d33330",
            "0xa03be496e67ec29bc62f01a428683d7f9c204930",
            "0x5d4020b9261f01b6f8a45db929704b0ad6f5e9e6",
            "0xfe89cc7abb2c4183683ab71653c4cdc9b02d44b7",
            "0x283af0b28c62c092c9727f1ee09c02ca627eb7f5",
            "0x253553366da8546fc250f225fe3d25d0c782303b",
            "0x10a19e7ee7d7f8a52822f6817de8ea18204f2e4f",
            "0xee071f4b516f69a1603da393cde8e76c40e5be85",
            "0xaf23dc5983230e9eeaf93280e312e57539d098d0",
            "0x570154c8c9f8cb35dc454f1cde33dc8fe30ecd63",
            "0x1ca861c023b09efa4932d96f1b09de906ebbc4cd",
            "0x0DA0C3e52C977Ed3cBc641fF02DD271c3ED55aFe",
            "0x80d63b12aecf8ae5884cbf1d3536bb0c5f612cfc",
            "0xd3cf852898b21fc233251427c2dc93d3d604f3bb",
            "0xf51842ebf4dc1e6f89d74ab0768c670ab04d928b",
            "0x23b4f73fb31e89b27de17f9c5de2660cc1fb0cdf",
            "0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c",
            "0x053d55f9b5af8694c503eb288a1b7e552f590710",
            "0xb2289e329d2f85f1ed31adbb30ea345278f21bcf",
            "0xe8599f3cc5d38a9ad6f3684cd5cea72f10dbc383",
            "0x5ba7fd868c40c16f7adfae6cf87121e13fc2f7a0",
            "0x25f2226b597e8f9514b3f68f00f494cf4f286491",
            "0x205e795336610f5131be52f09218af19f0f3ec60",
            "0xd784927ff2f95ba542bfc824c8a8a98f3495f6b5",
        ]

    total_df = pd.DataFrame()

    for wallet in wallets:
        try:
            df1 = debank_protocol_to_df(debank_protocol_api_call(wallet))

            # df2 = debank_wallet_to_df(debank_wallet_api_call(wallet))

            # final_df = pd.concat([df1, df2], ignore_index=True)

            df1["datetime"] = datetime.now()
            total_df = pd.concat([total_df, df1], ignore_index=True)
        except Exception as e:
            print(f"Error in main_debank_etl: {e}")
            return {'error en el procesamiento'}
            # print(f"Error procesando la wallet {wallet}: {e}")

    end_time = time.time()
    elapsed_time = end_time - start_time
    # print(f"La función debank_etl() tardó {elapsed_time} segundos en ejecutarse")

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


# Aplicar la función a las columnas 'position', 'protocol', 'chain' y 'symbol' usando apply


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


def get_debank_positions(wallet=None):
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

    df = main_debank_etl(wallet=wallet)
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

    second_merged_df.to_clipboard()
    json_data = second_merged_df.to_json(orient='records')
    return json_data


if __name__ == "__main__":
    try:
        data_json = get_debank_positions()
        print(data_json)
        # print('Python Get DeBank Data Worked')
    except Exception as e:
        # print ('Error:',e)
        print(f"Error in main: {e}")
        print(traceback.format_exc())
