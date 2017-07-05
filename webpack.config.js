var path = require('path')
var webpack = require('webpack')
var shortcuts = [
  path.resolve('./src/shared'),
  path.resolve('./src'),
  path.resolve('./node_modules')
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
          rules: [
            {
              test: /\.vue$/,
              loader: 'vue-loader',
              options: {
                loaders: {
                  // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                  // the "scss" and "sass" values for the lang attribute to the right configs here.
                  // other preprocessors should work out of the box, no loader config like this necessary.
                  'scss': [
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
                  ],
                  'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
                }
                // other vue-loader options go here
              }
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
       // devtool: '#eval-source-map'
      }
}

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
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        mangle: true,
        compress: {
          warnings: false,
          sequences: true,
          dead_code: true,
          conditionals: true,
          booleans: true,
          unused: true,
          if_return: true,
          join_vars: true,
          drop_console: true
        }
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true
      })
    ])
  })
}
