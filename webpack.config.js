var webpack = require('webpack')

// puts .env into actual env
require('dotenv').config({silent: true});

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
    new webpack.DefinePlugin({
      API_BASE_URL: JSON.stringify(process.env.API_BASE_URL) //process.env.API_BASE_URL)
    })
  ] : [
    new webpack.DefinePlugin({
      API_BASE_URL: JSON.stringify(process.env.API_BASE_URL) //process.env.API_BASE_URL)
    })
  ],

  devtool: 'cheap-module-source-map',

  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader?presets[]=es2015&presets[]=react&plugins[]=transform-object-rest-spread' }
    ]
  }
}

