#!/bin/sh
env="$1"

# Build the frontend
cd client
yarn install && yarn build

# Upload static files
gsutil -m rsync -r -c -d "out" "gs://elpiscloud-$env-site"
