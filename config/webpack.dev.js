var helpers = require("./helpers"),
  webpackMerge = require("webpack-merge"),
  ExtractTextPlugin = require("extract-text-webpack-plugin"),
  commonConfig = require("./webpack.common.js"),
  CssSourcemapPlugin = require("css-sourcemaps-webpack-plugin");

module.exports = webpackMerge(commonConfig, {
  devtool : "source-map",

  output : {
    path : helpers.root("dist"),
    publicPath : "http://localhost:8080/",
    filename : "[name].js",
    chunkFilename : "[id].chunk.js"
  },

  plugins : [
    new CssSourcemapPlugin(),
    new ExtractTextPlugin("[name].css")
  ],

  devServer : {
    historyApiFallback : true,
    stats : "minimal"
  }
});
