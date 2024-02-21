import argparse
import requests
import json
import os
from roles_royce.applications.panic_button_app.utils import ENV, start_the_engine, fork_reset
from roles_royce.roles_modifier import update_gas_fees_parameters_and_nonce, set_gas_strategy, GasStrategies

# WEB3SIGNER_URL = "http://your-web3signer-url:port"  # Replace with your Web3Signer URL

WEB3SIGNER_URL = os.getenv("WEB3SIGNER_URL")

def main():
    try:
        parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)

        parser.add_argument("-d", "--dao", type=str, help="DAO whose funds are to be removed.")
        parser.add_argument("-b", "--blockchain", type=str, help="Blockchain where the funds are deposited.")

        parser.add_argument("-t", "--transaction", type=str, help="Transaction json to execute.")

        args = parser.parse_args()
        tx = json.loads(args.transaction)
        env = ENV(DAO=args.dao, BLOCKCHAIN=args.blockchain)
        w3, w3_MEV = start_the_engine(env)

        set_gas_strategy(GasStrategies.AGGRESIVE)
        tx = update_gas_fees_parameters_and_nonce(w3, tx)

        # if env.MODE == 'production':  
            # Send the transaction to Web3Signer for signing using JSON-RPC
        headers = {'Content-Type': 'application/json'}
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_signTransaction",
            "params": [tx],
            "id": 1
        }
        response = requests.post(WEB3SIGNER_URL, headers=headers, json=payload)
        signed_tx = response.json() 
        #["result"]
        print(signed_tx)

        # Send the signed transaction to the blockchain
        # tx_hash = w3.eth.send_raw_transaction(signed_tx)

        tx_hash = w3.eth.send_transaction(tx)
        w3.eth.wait_for_transaction_receipt(tx_hash)

        # else:  
        #     tx_hash = w3.eth.send_transaction(tx)
        #     w3.eth.wait_for_transaction_receipt(tx_hash)
        #     #reset = fork_reset(w3, w3.manager.provider.endpoint_uri)
        
        response_message = {"status": 200, "tx_hash": tx_hash.hex()}
    except Exception as e:
        response_message = {"status": 500, "message": f"Error: {e}"}

    print(json.dumps(response_message))


if __name__ == "__main__":
    main()