Source: [here](https://github.com/bazelbuild/rules_nodejs/tree/stable/examples/react_webpack).

This app uses Bazel, Webpack and React so far. To setup:
- Linting with TSLint/prettier
- Babel

# Instructions

- Make sure to run `yarn` first to install packages!
- `yarn serve` to serve on `localhost:8080`.
- `yarn build` to build. Files are located in `bazel-out` and `dist` folders (I still haven't wrapped my head around the file structure yet).

> This example shows how to use Webpack to build and serve a React app with Bazel.
>
> We use the minimal webpack loaders, because Bazel takes care of things like Sass and TypeScript compilation before calling webpack.
