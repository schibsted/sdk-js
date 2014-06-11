# SPiD SDK for Javascript [![Build Status](https://travis-ci.org/schibsted/sdk-js.svg?branch=master)](https://travis-ci.org/schibsted/sdk-js)

The official SPiD SDK for Javascript. Pull requests are welcome.

## Setup for Development

The JS SDK is developed, concatinated, minified and tested with nodejs and grunt.
If you want to contribute with development, or set up your own development envirionment, follow these steps.

Install nodejs via Homebrew or [nvm](https://github.com/creationix/nvm) or your preferred setup.

### Dependencies
```bash
# To run grunt tasks
npm install -g grunt-cli

# To run tests with mocha
npm install -g phantomjs

# Install SDK devDependencies
npm install
```

### Documentation
Docs are available in our [techdocs](http://techdocs.spid.no/sdks/javascript/)

### Usage
Remember to build the SDK, or use one from the dist directory. It can also be retrieved and installed using [Bower](http://bower.io/).

Do not use Pulse version unless explicitly told so.
