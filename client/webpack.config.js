const path = require("path");
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = (env, argv) => ({
  mode: isDevelopment ? "development" : "production",
  entry: {
    main: "./client/src/index.tsx",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: path.join(__dirname, "src"),
        use: [
          isDevelopment && {
            loader: "babel-loader",
            options: { plugins: ["react-refresh/babel"] },
          },
          "ts-loader",
        ].filter(Boolean),
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(woff|woff2|eot|ttf)(\?.*$|$)/i,
        use: ["file-loader"],
      },
      {
        test: /\.(ico|svg|png|jpe?g|gif)$/i,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    isDevelopment && new ReactRefreshPlugin(),
    new HtmlWebpackPlugin({
      filename: "./index.html",
      template: "./client/public/index.html",
      favicon: "./client/public/favicon.ico",
    }),
  ].filter(Boolean),
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  devServer: {
    historyApiFallback: true,
  },
});
