const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/code.ts',
  output: {
    filename: 'code.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
