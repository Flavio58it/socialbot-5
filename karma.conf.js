// Karma configuration
// Generated on Thu Nov 28 2019 17:36:00 GMT+0100 (GMT+01:00)
// Edited based on https://github.com/gabel/karma-webpack-example/blob/master/karma.conf.js

var webpack = require("webpack"),
    wconf = require("./webpack.config.js"),
    VueLoaderPlugin = require('vue-loader/lib/plugin');

process.env.CHROME_BIN = process.env.CHROMIUM_BIN = require('puppeteer').executablePath()

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
      'test/**/*.test.js'
    ],


    // list of files / patterns to exclude
    exclude: [
      
    ],

    plugins: [
      require("karma-webpack"),
      require("karma-mocha"),
      require("karma-chai"), // https://www.chaijs.com/
      require("karma-sinon-chai"), // https://sinonjs.org/
      require('karma-chrome-launcher'),
      require('karma-mocha-reporter')
    ],

    // https://railsware.com/blog/mocking-es6-module-import-without-dependency-injection/


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // only specify one entry point
      // and require all tests in there
      'test/**/*.test.js': ['webpack']
    },

    mochaReporter: {
      output: "autowatch"
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'], // https://www.npmjs.com/package/karma-mocha-reporter


    // Minimal webpack configuration in order to recognize services
    // Must add VUE configuration
    webpack: {
      mode: "development",
      optimization: {
        nodeEnv: "test"
      },
      module: {
        rules: wconf.rules
      },
      resolve: {
        alias: {
          'vue$': 'vue/dist/vue.esm.js'
        },
        modules: wconf.shortcuts
      },
      plugins:[
        new VueLoaderPlugin()
      ]
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [/*'Chromium'*/, "ChromiumHeadless"],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
