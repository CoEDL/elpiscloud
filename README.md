# ElpisCloud

:cloud: [elpis.cloud](https://elpis.cloud) :cloud:

A rework of the [ELPIS Project](https://github.com/CoEDL/elpis), but cloud-based and chic.

Our documentation is being written [here](https://docs.elpis.cloud). :book:

## Want to help?

Check out our [guide on how to contribute](CONTRIBUTING.md). 

## Overview

This is a monorepo containing all the infrastructure and documentation for the project.
Development is still ongoing, with only the inference flow and user management to go before public release.

### Stack

We're using:

- [GCP](https://cloud.google.com/) as our cloud provider.
- [terraform](https://www.terraform.io/) to manage our cloud infrastructure.
- [firebase](https://firebase.google.com/) for auth and firestore.
- [next.js](https://nextjs.org/), React and Typescript for the frontend.
- [poetry](https://python-poetry.org/) and Python3.10 for the backend.

### Repo Structure

- `architecture/`: Where the terraform files live, which define our cloud architecture.
- `client/`: The frontend files.
- `functions/`: The cloud function source.
- `services/`: Cloud run services, w docker images.
- `docs/`: The documentation source.
- `scripts/`: Some useful utilities.

## Exporting the frontend files.

_(TODO, move this to docs)_
For the steps below, the `gcloud` CLI tools are required [(see here)](https://formulae.brew.sh/cask/google-cloud-sdk).

1. Make sure you are signed into an account with iam privileges for the elpis frontend bucket.
2. Set your project to 'elpiscloud': `gcloud config set project elpiscloud`
3. From the root directory, run `./scripts/upload_frontend.sh prod`. The frontend
   will make a static export, and then copy these files across to the bucket.
