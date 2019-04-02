const path = require('path')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'babel-loader',
          options: {
            "presets": [
              [
                "@babel/preset-env",
                {
                  "useBuiltIns": "entry",
                  "targets": "node 8"
                }
              ]
            ]
          }
        }, 'ts-loader'],
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'whats-my-line.js',
    libraryTarget: 'umd',
  },
  devtool: isProd ? false : 'source-map',
  target: 'node',
}
