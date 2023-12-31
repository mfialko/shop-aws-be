const path = require('path');

module.exports = {
  entry: {
    getProducts: './handlers/getProducts.js',
    getProductById: './handlers/getProductById.js',
    createProduct: './handlers/createProduct.js',
    catalogBatchProcess: './handlers/catalogBatchProcess.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
