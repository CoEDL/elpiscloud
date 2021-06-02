# elpisnet GUI

This document will go through the thought process for setting up the React app from scratch. It's inspired by [yakkomajuri/react-from-scratch](https://github.com/yakkomajuri/react-from-scratch).

- Bundler: Webpack
- Compiler: Babel
- Package manager: Yarn
- Language: TypeScript

## Step 1: Add yarn

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

In `package.json`, we add the line

```
"browserslist": "> 0.25%, not dead"
```

## Step 3: Add TypeScript

TypeScript is good.

```
yarn add --dev typescript \
    @types/react \
    @types/react-dom
```

We also should generate a `tsconfig.json` file (note that for this you may need to install TypeScript globally with `npm install -g typescript`:

```
tsc --init
```

We might also need to make some changes to the generated file. Uncommit `"noEmit": true` and set `"jsx": "react"`, since we are only using `typescript` for typechecking, not compilation (we use Babel for typechecking).

## Step 4: Add Webpack

Webpack bundles everything together. Just like Babel, we need `webpack` for actually bundling and `webpack-cli` for running in CLI. We'll also need `webpack-dev-server` for running `webpack serve`. We'll also need loaders for bundling specific files we wish to process: in our case, `style-loader`, `css-loader` and `babel-loader`. (We don't need `ts-loader`, since we are using Babel.)

```
yarn add --dev webpack \
    webpack-cli \
    webpack-dev-server \
    style-loader \
    css-loader \
    babel-loader
```

Ordinarily, at this point we would make a `webpack.config.js` file. We're gonna do something now that's a little bit unusual: write our config in TypeScript (no JavaScript in this house!) [We reference this document.](https://webpack.js.org/configuration/configuration-languages/#typescript) We'll need a few type packages we haven't installed yet (I'm not quite sure why we need `ts-node`...):

```
yarn add --dev ts-node \
    @types/node \
    @types/webpack \
    @types/webpack-dev-server
```

Now create a file in the root called `webpack.config.ts`.

```ts
import * as path from 'path';
import { Configuration as WebpackConfiguration, HotModuleReplacementPlugin } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";

// All this stuff is to get devServer to typecheck...
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/27570
interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
  entry: './src/index.tsx',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/, // matches .js, .ts, and .tsx files
        loader: 'babel-loader', // uses babel-loader for the specified file types
        exclude: /node_modules/, 
      },
      {
        test: /\.css$/, // matches .css files only (i.e. not .scss, etc)
        use: ['style-loader', 'css-loader'], 
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'public/'),
    port: 3000,
    publicPath: 'http://localhost:3000/dist/',
    hotOnly: true,
  },
  plugins: [new HotModuleReplacementPlugin()], // used for hot reloading when developing
  devtool: 'eval-source-map', // builds high quality source maps
};

export default config;
```

## Step 5: Add React

Now we can start actually creating our app, with React. Let's install React (NOT as a dev dependency, rather as a regular dependency)

```
yarn add react react-dom react-hot-loader
```

`react` is self-explanatory. `react-dom` will be used to render our app on index.tsx, and `react-hot-loader` is used for development - it will auto update our app on file changes.

## Step 6: Add a script

To run our application (at least for development), we want `webpack serve --mode development`, so let's put this in our `package.json`:

```
"scripts": {
  "start": "webpack serve --mode development",
}
```

## Step 7: Add some boilerplate

Let's add some boilerplate HTML into `public/index.html`:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Elpis</title>
    </head>
    <body>
        <div id="root"></div>
        <noscript>You need to enable JavaScript to access this website.</noscript>
        <script src="../dist/bundle.js"></script>
    </body>
</html>
```

We need `src/index.tsx` and `src/App.tsx` now:

```ts
import React from 'react'
import ReactDOM from 'react-dom' 
import { App } from './App'

ReactDOM.render(
    <App />,
    document.getElementById('root')
)
```

```tsx
import React from 'react'
import { hot } from 'react-hot-loader/root'

export const App = hot(_App)
export function _App(): JSX.Element | null {
    return (
        <div>
            <h1>Hello world!</h1>
        </div>
    )
}
```

(Note: I'm not sure whether `App = hot(_App)` is really necessary.)