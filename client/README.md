Source: [https://github.com/bazelbuild/rules_nodejs/tree/stable/examples/react_webpack](https://github.com/bazelbuild/rules_nodejs/tree/stable/examples/react_webpack).

This example shows how to use Webpack to build and serve a React app with Bazel.

We use the minimal webpack loaders, because Bazel takes care of things like Sass and TypeScript compilation before calling webpack.
