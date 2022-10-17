# Contributing to Elpis Cloud

<!---
## Reporting an Issue

## Making feature requests

-->

## Contributing to the Documentation

To help flesh out our documentation at `docs.elpis.com`, you'll first need to install
[mkdocs](https://www.mkdocs.org/getting-started/).

The easiest way to do this is with `pip install mkdocs` (or `pip3` for mac users).

After that, from the project root, run `mkdocs serve` to serve the local version
of the documentation. Now any changes you make should be live at [localhost:8000](localhost:8000)

### Adding New Pages

There are a few steps to adding a new page to the online documentation.

- Create a new markdown file for the page you want to add, at `docs/your_page.md`
- If you want this page to appear in the navigation menu, you will need to edit
  `mkdocs.yml` to include the new page under the `nav` section:

```
...

nav:
- Home: index.md
- About: about.md
...
- Your Page Title: your_page.md
```

Your should now see your page in the sidebar!

### `mkdocs` Development Commands

- `mkdocs serve` - Start the live-reloading docs server.
- `mkdocs build` - Build the documentation site.
- `mkdocs -h` - Print help message and exit.

For full documentation visit [mkdocs.org](https://www.mkdocs.org).

## Contributing Code

To be able to contribute code, you'll first need to clone the monorepo:

`git clone https://github.com/CoEDL/elpiscloud.git`

Now create a dedicated branch for our work:

```
cd elpiscloud
git checkout -b your_branch_name
```

Make sure your branch name is descriptive of the proposed changes.

### Setting up the Appropriate Dev Environment

The elpiscloud repo is split into 4 main development "sub-projects". You should
only setup the parts you'll need to implement your required feature.

#### The Frontend Client

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

To prepare the cloud functions devlopment environment, [make sure you have Poetry installed](https://python-poetry.org/docs/),
and optionally, setup the appropriate Python version with a tool like `asdf` or `pyenv`.

Currently we're using Python 3.10 for our Python functions and services.

Navigate to the cloud functions folder:

`cd functions`

And install the Poetry dependencies:

`poetry install`

And you're ready to go!

#### Cloud Run Services

To prepare the services devlopment environment:

- [Make sure you have Poetry installed](https://python-poetry.org/docs/)
- Optionally, setup the appropriate Python version with a tool like `asdf` or `pyenv`.
  Currently we're using Python 3.10 for our Python functions and services.
- If applicable, make sure you have a version of docker to build the container.

Navigate to the relevant service folder:

`cd services/trainer`

or

`cd services/transcriber`

And install the Poetry dependencies:

`poetry install`

And you should be ready to go.

<!--
TODO

#### Terraform architecture files
-->

### Write Your Code

Now it's time to write some code! While doing so, here are some things you may
want to keep in mind:

- We have a set of fairly opinionated linters/formatters for our stack.
  [Make sure to run them](#formatting-your-code) before creating a PR.
- Write appropriate documentation for any changes you make.
  - For Python code, this means [google-style docstrings](https://sphinxcontrib-napoleon.readthedocs.io/en/latest/example_google.html)
    for any functions/classes you add.
  - For tsx files, we don't currently have a standard documentation format.
  - If your changes would change our online documentation, make sure to [update it](#contributing-to-the-documentation)!

### Formatting Your Code

We've decided that it's too much of a hassle to have to eyeball style-guides,
and to that end, have provided some linters/formatters for front and backend
development.

#### Frontend Linting/Formatting

Within the client folder, you can run the linter with `yarn lint`.

The `.eslintrc.json` and `.prettierrc.js` files should work with common IDE
extensions (eslint and prettier respectively on vscode), so that the diagnostics
and formatting are provided automatically when you're editing a frontend file.

#### Backend Linting/Formatting

All of our Python related components of elpiscloud use [black](https://github.com/psf/black)
for formatting/linting.

Within a Poetry folder (`functions` or `services/**`), after you've installed  
the dependencies, you can run `poetry run black .` to format the directory.

This can also be done through vscode extensions, but whatever floats your boat.

### Testing Your Code

Before you start the process of submitting a PR, it is important to write some
tests for your feature (if applicable).

For our backend, we're using `pytest` and `pytest-mock` for testing.
On the frontend, we don't currently have tests, but this may change in the future.

#### Testing Poetry Environments

From within a Poetry folder (`functions` or `services/**`), you can run the
full test suite with `poetry run pytest`.

For the services, this isn't always recommended since in the integration tests,
we perform a full training/inference run through, which can take a while.

To run the non-integration tests from within a service, you can instead run:

`poetry run pytest -m 'not integration'`

Which will skip those tests.

#### Writing Your Own Tests

When writing your own tests, I'd recommend following the style of the preexisting
tests for that folder. Generally in Poetry folders, the tests exist under the
`tests` directory.

As a general naming convention for tests you write, we recommend:
`test_some_function_with_x_should_do_y()`.

e.g.:

- `test_double`
- `test_process_dataset_with_invalid_data_should_raise_exception`
- `test_extract_annotations_with_elan_file_should_call_extract_elan`

For the **positive** case where the function performs as expected, you can omit the
_with_ and _should_ sections of the name.

We don't expect for you to write docstrings for any of the test functions you
write, but as with the source code, if you're making an assertion about some
expected value that might not be immediately clear in the code, there's no harm
in adding a comment.

### Commit Your Changes

When you're happy with the code on your computer, you need to commit your changes:

`git commit -a`

This should fire up your editor to write a commit message. When you have finished,
save, and close to continue.

<!---
TODO Describe Commit format
-->

### Update Your Branch

It's likely that other changes to `main` may have happened while you were working.
To update your branch with these changes:

```
git checkout main
git pull --rebase
```

Now apply those changes to your branch:

```
git rebase my_new_branch
git checkout my_new_branch
```

If there are no merge conflicts, and the tests are still passing,
it's time to proceed.

### Forking (Public Contributors)

If you're not part of the CoEDL organisation on Github, you won't have push
access to the elpiscloud repository, and therefore won't be able to push your
branch directly to the remote before you make a Pull Request.

Instead, what public contributors will have to do is make a _fork_ of the repo
(which can be thought of as a copy of the entire project),
and then make the PR from a forked branch to the main branch on the original
repository.

The steps to do so are provided below:

First, navigate to the [elpiscloud github repo](https://github.com/CoEDL/elpiscloud)
and click the fork button at the top right of the screen.

On the new page, click **Create Fork**

Now run the following command to add your fork as a remote:

`git remote add fork https://github.com/<your username>/elpiscloud.git`

Push your feature branch to the forked repository:

`git push -u fork your_branch_name`

Now you should be ready to [open a pull request](#opening-a-pr)!

### Pushing Your Branch to the Remote (CoEDL Members)

If you have push access to the repository already, you don't have to make a
fork and can instead run the following:

```
git push -u origin your_branch_name
```

This will create a new branch on the elpiscloud repo from which you can make  
your PR.

### Opening a PR

Navigate to the repository you just pushed to
(e.g. https://github.com/your-user-name/elpiscloud) and click on "Pull Requests"
in the top bar (just above the code). On the next page, click "New pull request"
in the upper right-hand corner.

- The pull request should target the base repository `CoEDL/elpiscloud` and the branch `main.`
- The head repository will be your work (`your-user-name/elpiscloud`),
  and the branch will be whatever name you gave your branch.

Click _"Create pull request"_ when you're ready.

- Make sure that the changes you made are included in the PR.
- Fill in some details about your changes using the pull request template provided.
- If your PR address an issue, make sure to add it in the description.

When finished, click _"Create pull request"_ again.

### PR Feedback

Most pull requests will go through a few iterations before they get merged.
Different contributors will sometimes have different opinions, and often,
fixes/features will need to be revised.

If changes are requested, push to your forked feature branch, and those changes
should now be visible on the PR.

When addressing feedback comments in a PR, if your latest commit fixes a comment
from a previous revision, mark it as resolved to keep the PR clean.

While you're waiting for feedback on your pull request, open up a few other
pull requests and give someone else some! They'll appreciate it in the same
way that you appreciate feedback on your patches.
