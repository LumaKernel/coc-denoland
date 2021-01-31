const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: './client/src/extension.ts',
  target: 'node',
  mode: 'none',
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.js', '.ts'],
  },
  externals: {
    'coc.nvim': 'commonjs coc.nvim',
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, 'client/src')],
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                sourceMap: true,
              },
            },
          },
        ],
      },
    ],
  },
  output: {
    path: path.join(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: 'commonjs',
  },
  plugins: [],
  node: {
    __dirname: false,
    __filename: false,
  },
};