module.exports = function(config) {
    config.set({
        frameworks: ['mocha', 'sinon-chai'],

        port: 9991,
        singleRun: true,
        browsers: [
            'PhantomJS'
        ],

        files: [
            'test/spec/*.js',
            {pattern: 'test/mock/*.js', included: false, served: true}
        ],
        preprocessors: {
            'test/spec/*.js': ['webpack']
        },
        webpack: {
        },
        webpackMiddleware: {
            noInfo: true
        },
        plugins: [
            require('karma-webpack'),
            'karma-phantomjs-launcher',
            'karma-mocha',
            'karma-sinon-chai'
        ]
    });
};