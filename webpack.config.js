const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const isDevelopment = process.env.NODE_ENV !== 'production'

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: {
    app: './src/main.tsx',
  },
  output: {
    path: `${__dirname}/dist`,
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [require.resolve('react-refresh/babel'), '@babel/plugin-transform-runtime'],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  target: ['web', 'es5'],
  plugins: [
    new HtmlWebpackPlugin({
      title: 'hello react',
      template: path.resolve(__dirname, './src/index.html'),
      filename: 'index.html',
    }),
    new ReactRefreshWebpackPlugin(),
  ],
  devServer: {
    port: 3000,
    contentBase: 'dist',
    open: true,
    hot: true,
    inline: true,
    hotOnly: true,
  },
  bail: true,
}
