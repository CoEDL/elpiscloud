# elpisnet GUI

This document will go through the thought process for setting up the React app from scratch. It's inspired by [yakkomajuri/react-from-scratch](https://github.com/yakkomajuri/react-from-scratch).

- Bundler: Webpack
- Compiler: Babel
- Package manager: Yarn
- Language: TypeScript

## Step 1

Create this directory and initialise the project with `yarn`.

```
mkdir gui && cd gui && yarn init
```

There are a lot of prompts to work through: follow these:

```
question name (gui): elpisnet
question version (1.0.0): 0.0.1
question description: Software for creating speech recognition models.
question entry point (index.js): src/index.tsx
question repository url: https://github.com/CoEDL/elpisnet
question author: CoEDL
question license (MIT):
question private: true
```

## Step 2: Add Babel

Babel allows us to compile our ES6/"next-gen" JavaScript/TypeScript into something browsers can understand. In order to use Babel, we need to install some packages:

- `@babel/core` is the compiler
- `@babel/cli` is the CLI interface to the compiler
- `@babel/preset-env`: "allows you to use the latest JavaScript without needing to micromanage which syntax transforms (and optionally, browser polyfills) are needed by your target environment(s). This both makes your life easier and JavaScript bundles smaller!"
- `@babel/preset-react` and `@babel/preset-typescript` are self-explanatory (needed for JSX and TypeScript).

To add all these dependencies, we can do it in one command (note we use the `--dev` flag as these dependencies are only required for building, not using, the application):

```
yarn add --dev \
  @babel/core \
  @babel/cli \
  @babel/preset-env \
  @babel/preset-typescript \
  @babel/preset-react
```

*Note:* `node_modules` is starting to get a bit big, so it's worth adding a `.gitignore` file now with:

```
node_modules
```

We now need to create a `babel.config.json` in the root. Following the example [here](https://babeljs.io/docs/en/babel-preset-env), we only include polyfills and code transforms needed for users with browsers with >0.25% market share:

```
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "entry"
      }
    ],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ]
}
```

## Step 3: Add TypeScript

TypeScript is good.

```
yarn add --dev typescript \
    @types/react \
    @types/react-dom
```