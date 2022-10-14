# Contributing to Elpis Cloud

Say hi

## Reporting an Issue

## Making feature requests

## Contributing to the Documentation

## Contributing code

To be able to contribute code, you'll first need to clone the monorepo:

`git clone https://github.com/CoEDL/elpiscloud.git`

Now create a dedicated branch for our work:

```
cd elpiscloud
git checkout -b your_branch_name
```

Make sure your branch name is descriptive of the proposed changes.

### Setting up the appropriate dev environment

The elpiscloud repo is split into 4 main development "sub-projects". You should
only setup the parts you'll need to implement your required feature.

#### The frontend client

To get started with the frontend client, jump into its directory:

`cd client`

Make sure [you've installed yarn](https://yarnpkg.com/getting-started/install).

And install the required node modules:

`yarn`

To start the development server:

`yarn dev`

Any changes you make in the frontend should be reflected immediately in your
browser.

#### Cloud Functions

To prepare the cloud functions devlopment environment, [make sure you have poetry installed](https://python-poetry.org/docs/),
and optionally, setup the appropriate python version with a tool like `asdf` or `pyenv`.

Currently we're using python 3.10 for our python functions and services.

Navigate to the cloud functions folder:

`cd functions`

And install the poetry dependencies:

`poetry install`

And you're ready to go!

#### Cloud run Services

To prepare the services devlopment environment:

- [Make sure you have poetry installed](https://python-poetry.org/docs/)
- Optionally, setup the appropriate python version with a tool like `asdf` or `pyenv`.
  Currently we're using python 3.10 for our python functions and services.
- If applicable, make sure you have a version of docker to build the container.

Navigate to the relevant service folder:

`cd services/trainer`

or

`cd services/transcriber`

And install the poetry dependencies:

`poetry install`

#### Terraform architecture files

TODO

### Write your Code

Now it's time to write some code! While doing so, here are some things you may
want to keep in mind:

- We have a set of fairly opinionated linters/formatters for our stack.
  [Make sure to run them](#formatting-your-code) before creating a PR.
- Write appropriate documentation for any changes you make.
  - For python code, this means [google-style docstrings](https://sphinxcontrib-napoleon.readthedocs.io/en/latest/example_google.html)
    for any functions/classes you add.
  - For tsx files, we don't currently have a standard documentation format.
  - If your changes would change our online documentation, make sure to update it!

### Formatting your code

#### Frontend linting/formatting

#### Backend linting/formatting

### Testing your code

### Commit your changes

### Update your branch

### Forking

### Opening a PR

### PR Feedback

### Branch History
