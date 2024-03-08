#!/bin/bash

if [[ "$PBA_ENV" == "production" ]]; then
  echo "Running in production mode"
  yarn start
else
  echo "Running in development mode"
  yarn dev
fi
