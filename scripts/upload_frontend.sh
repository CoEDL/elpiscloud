#!/bin/sh
project="$1"
env="$2"

# Build the frontend
cd client
yarn install && yarn build

# Upload static files
gsutil -m rsync -r -c -d "out" "gs://$project-$env-site"
