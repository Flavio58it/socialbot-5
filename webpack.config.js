const path = require('path'),
    webpack = require('webpack'),
    OptimizeJsPlugin = require("optimize-js-plugin"),
    TerserPlugin = require('terser-webpack-plugin'),
    VueLoaderPlugin = require('vue-loader/lib/plugin');

var shortcuts = [
  path.resolve('./src/shared'),
  path.resolve('./src'),
  path.resolve('./node_modules')
]

var rules = [
  {
    test: /\.vue$/,
    loader: 'vue-loader'
  },
  {
    test: /\.js$/,
    loader: 'babel-loader',
    exclude: /node_modules/
  },
  {
    test: /\.css$/,
    use: [
      { loader: "style-loader" },
      { loader: "css-loader" }
    ]
  },
  {
    test: /\.scss$/,
    use: [
      'vue-style-loader',
      'css-loader',
      'sass-loader',
      {
        //Load the main variables into the sass files.
        loader: 'sass-resources-loader',
        options: {
          resources: path.resolve(__dirname, 'src/shared/assets/style/_variables.scss')
        }
      }
    ]
  }
  // File loader is not needed as the chrome extension does not have cache.
  /*{
    test: /\.(png|jpg|gif|svg)$/,
    loader: 'file-loader',
    options: {
      name: '[name].[ext]?[hash]'
    }
  }*/
]

module.exports = [
    page_mode('./src/popup/main.js', 'popup.js'),
    page_mode('./src/manager/main.js', 'manager.js'),
    {
      entry: "./src/service/main.js",
      output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: 'service.js'
      },
      resolve:{
        modules: shortcuts
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
          }
        ]
      }
    },
    {
      entry: "./src/content/main.js",
      output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: 'content.js'
      },
      resolve:{
        modules: shortcuts
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
          }
        ]
      }
    }
]


//Support different pages
function page_mode(input, output){
    return {
        entry: input,
        output: {
          path: path.resolve(__dirname, './dist'),
          publicPath: '/dist/',
          filename: output
        },
        module: {
          rules
        },
        resolve: {
          alias: {
            'vue$': 'vue/dist/vue.esm.js'
          },
          modules: shortcuts
        },
        /*devServer: {
          historyApiFallback: true,
          noInfo: true
        },*/
        performance: {
          hints: false
        },
        plugins:[
          new VueLoaderPlugin()
        ]
       // devtool: '#eval-source-map'
      }
}

module.exports.shortcuts = shortcuts;
module.exports.rules = rules

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html

  module.exports.forEach(function(t){
    t.plugins = (t.plugins||[]).concat([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }),
      // Fix the Unexpected token: keyword «const»
      // https://stackoverflow.com/questions/47439067/uglifyjs-throws-unexpected-token-keyword-const-with-node-modules
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
        }
      }),
      new OptimizeJsPlugin({
          sourceMap: false
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true
      })
    ])
  })
} else {
  module.exports.forEach(function(t){
    t.plugins = (t.plugins||[]).concat([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"development"'
        }
      })
    ])
  })
}
