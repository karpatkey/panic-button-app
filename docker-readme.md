## Docker compose testing enironment


- In order to test the app locally , we have docker-compose.yml file


### Normal Testing

- create the `.env` file

```docker compose up -d```

- hit: http://localhost:3000/


```docker compose logs -f```

### Webb3Signer Testing

- create the `.env` file

- create `key.yaml` file

- copy `modified-execute.py` to `roles_royce/roles_royce/applications/panic_button_app/execute.py` 

```
type: "file-raw"
keyType: "SECP256K1"
privateKey: "Pk here"
```

- Un-comment the below portion in docker-compose.yml

  ```

  #  web3signer:
  #   image: consensys/web3signer:develop
  #   container_name: signer
  #   ports:
  #     - "9000:9000"
  #   volumes:
  #     - ./key.yaml:/home/node/signer/keyFiles/key.yaml
  #     - ./config.yaml:/home/node/signer/config.yaml
  #   command: 
  #     - "--config-file=/home/node/signer/config.yaml"
  #     - "--swagger-ui-enabled=true"
  #     - "--logging=DEBUG"
  #     - "eth1"
  #     - "--chain-id=100"

    ```

```docker compose up -d```

- hit: http://localhost:3000/


```docker compose logs -f```

