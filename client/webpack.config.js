module.exports = (env, argv) => ({
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(woff|woff2|eot|ttf)(\?.*$|$)/i,
        use: ["file-loader"],
      },
      {
        test: /\.(svg|png|jpe?g|gif)$/i,
        use: ["file-loader"],
      },
    ],
  },
});
