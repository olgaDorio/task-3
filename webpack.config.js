const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtraneousFileCleanupPlugin = require('webpack-extraneous-file-cleanup-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');

const config = require(__dirname + '/config.json');

module.exports = {
  entry: {
    bundle: './js/main.js',
  },

  output: {
    filename: 'bundle/[name].js',
    path: path.resolve(__dirname, config.publicDir),
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },

      {
        test: /\.pug$/,
        loader: 'pug-loader',
      },

      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.scss$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },

      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },

      {
        test: /\.(png|jpg|svg|ttf)$/,
        loader: 'url-loader',
      },
    ]
  },

  resolve: {
    modules: [__dirname, 'node_modules', __dirname + '/component'],
    extensions: ['*', '.js', '.vue', '.json']
  },

  devServer: {
    index: 'index.html',
    contentBase: config.publicDir,
    noInfo: true,
    overlay: false,
    historyApiFallback: true,
  },

  devtool: '#eval-source-map',

  plugins: [
    new CleanWebpackPlugin(path.resolve(__dirname, config.publicDir)),

    new HtmlWebpackExcludeAssetsPlugin(),

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.pug',
      excludeAssets: [/.js/],
    }),

    new ExtraneousFileCleanupPlugin({
      extensions: ['.js'],
      paths: ['/bundle'],
    }),
  ],
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),

    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings: false
      }
    }),

    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
  ])
} else {
  module.exports.module.rules = ([
    {
      enforce: "pre",
      test: /\.vue$/,
      exclude: /node_modules|Icons.vue/,
      loader: "vue-pug-lint-loader",
      options: require('./.pug-lintrc.js'),
    },
    {
      enforce: "pre",
      test: /\.(js|vue)$/,
      exclude: /node_modules/,
      loader: "eslint-loader",
      options: {
        formater: require('eslint-friendly-formatter'),
      }
    }
  ]).concat(module.exports.module.rules || []);

  module.exports.plugins = (module.exports.plugins || []).concat([
    new StyleLintPlugin({
      files: ['**/*.vue'],
    }),
  ]);
}
