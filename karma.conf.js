'use strict';

module.exports = function(config) {
    config.set({
        frameworks: [
            'mocha',
            'sinon-chai'
        ],
        port: 9991,
        singleRun: true,
        browsers: [
            'PhantomJS'
        ],
        files: [
            'test/spec/*.js',
            {
                pattern: 'test/mock/*.js',
                included: false,
                served: true
            }
        ],
        preprocessors: {
            'test/spec/*.js': ['webpack']
        },
        reporters: [
            'coverage',
            'dots'
        ],
        coverageReporter: {
            dir: 'coverage',
            reporters: [
                { type: 'html' }
            ]
        },
        webpack: {
            module: {
                preLoaders: [
                    {
                        test: /\.js$/,
                        exclude: /(node_modules|resources\/js\/vendor)/,
                        loader: 'istanbul-instrumenter'
                    }
                ]
            }
        },
        webpackMiddleware: {
            noInfo: true
        },
        plugins: [
            require('karma-webpack'),
            'karma-phantomjs-launcher',
            'karma-mocha',
            'karma-sinon-chai',
            'karma-coverage'
        ]
    });
};
