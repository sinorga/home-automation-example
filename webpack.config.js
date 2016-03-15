var webpack = require('webpack')

module.exports = {
  entry: './app/index.js',

  output: {
    path: 'public',
    filename: 'bundle.js',
    publicPath: ''
  },

  plugins: process.env.NODE_ENV === 'production' ? [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ] : [
  ],

  devtool: 'cheap-module-source-map',

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader?presets[]=es2015&presets[]=react' }
    ]
  }
}

