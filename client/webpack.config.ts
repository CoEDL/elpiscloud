import * as path from 'path';
import { Configuration as WebpackConfiguration, HotModuleReplacementPlugin } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";

// All this stuff is to get devServer to typecheck...
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/27570
interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const isDevelopment = process.env.NODE_ENV !== 'production';
const plugins = isDevelopment ? [new ReactRefreshWebpackPlugin()] : [];

const config: Configuration = {
  entry: { main: ['./src/index.tsx'] },
  mode: isDevelopment ? 'development' : 'production',
  target: process.env.NODE_ENV === "development" ? "web" : "browserslist",
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/, // matches .js, .ts, and .tsx files
        // loader: 'babel-loader', // uses babel-loader for the specified file types
        exclude: /node_modules/, 
        use: [
            {
                loader: require.resolve('babel-loader'),
                options: {
                    plugins: [
                        isDevelopment && require.resolve('react-refresh/babel')
                    ].filter(Boolean)
                }
            }
        ]
      },
      {
        test: /\.css$/, // matches .css files only (i.e. not .scss, etc)
        use: ['style-loader', 'css-loader'], 
      },
      {
        test: /\.(woff|woff2|eot|ttf)(\?.*$|$)/i,
        use: [
          'file-loader',
        ],
      },
      {
        test: /\.(svg|png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
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
    hot: true,
    hotOnly: true,
  },
  plugins: plugins, // used for hot reloading when developing
  devtool: 'eval-source-map', // builds high quality source maps
};

export default config;