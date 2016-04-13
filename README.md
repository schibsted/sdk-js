# SPiD JS SDK

[![Build Status](https://travis-ci.org/schibsted/sdk-js.svg?branch=master)](https://travis-ci.org/schibsted/sdk-js)

SDK to integrate to the SPiD frontend API.
Used to check if user is logged in or not, or owns a product or not.

## Documentation

Documentation is available on http://techdocs.spid.no/sdks/javascript/
and make sure to read the API docs http://techdocs.spid.no/sdks/js/api-docs/.

## Release

Bump [Semver](http://semver.org/) version with this command

`$ npm version <patch | minor | major>`

`$ npm publish`

`npm version` will bump version, tag the release and push it.
Once pushed, [Travis CI](https://travis-ci.org/schibsted/sdk-js)
runs tests and uploads built js files to cdn/s3
and zip to [Github releases](https://github.com/schibsted/sdk-js/releases).

## Notes

All versions of the SDK will use a global variable/namespace&mdash;`SPiD.Talk.response`&mdash;when making JSONP calls.
This may change at a later date.
