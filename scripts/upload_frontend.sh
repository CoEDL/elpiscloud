#!/bin/sh
env="$1"

# Build the frontend
cd client
yarn install && yarn build

# Upload static files
gcloud storage cp --recursive "out/*" "gs://elpiscloud-$env-site"
