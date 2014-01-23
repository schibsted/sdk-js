/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global before:false*/
/*global SPiD:false*/

var assert = chai.assert;

var setup = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod:false, logging:false};
var setupProd = {client_id : '4d00e8d6bf92fc8648000000', server: 'payment.schibsted.se', logging:false};

describe('SPiD', function() {

    describe('SPiD.init', function() {
        it('SPiD.init should throw error when missing config', function() {
            assert.throws(SPiD.init, TypeError);
        });
        it('SPiD.options should return empty object', function() {
            var options = SPiD.options();
            assert.isObject(options);
            assert.equal(Object.keys(options), 0);
        });
    });
    describe('SPiD Production Url', function() {
        before(function() {
            SPiD.init(setupProd);
        });

        it('SPiD.server should return URL to Core server', function() {
            assert.equal(
                SPiD.server(),
                'https://payment.schibsted.se/'
            );
        });

        it('SPiD.sessionEndpoint should return URL to Session server endpoint', function() {
            assert.equal(
                SPiD.sessionEndpoint(),
                'https://session.payment.schibsted.se/rpc/hasSession.js'
            );
        });

        it('SPiD.coreEndpoint should return URL to Core Session server endpoint', function() {
            assert.equal(
                SPiD.coreEndpoint(),
                'https://payment.schibsted.se/ajax/hasSession.js'
            );
        });
    });
    describe('SPiD Stage Url', function() {
        before(function() {
            SPiD.init(setup);
        });

        it('SPiD.server should return URL to Core server', function() {
            assert.equal(
                SPiD.server(),
                'https://stage.payment.schibsted.se/'
            );
        });

        it('SPiD.sessionEndpoint should return URL to Core Session server endpoint', function() {
            assert.equal(
                SPiD.sessionEndpoint(),
                'https://stage.payment.schibsted.se/ajax/hasSession.js'
            );
        });
        it('SPiD.coreEndpoint should return URL to Core Session server endpoint', function() {
            assert.equal(
                SPiD.coreEndpoint(),
                'https://stage.payment.schibsted.se/ajax/hasSession.js'
            );
        });
    });
    describe('SPiD initiated', function() {
        before(function() {
            SPiD.init(setup);
        });

        it('SPiD.options should return non empty object', function() {
            var options = SPiD.options();
            assert.isObject(options);
            assert.notEqual(Object.keys(options), 0);
        });
        it('SPiD.version should return string', function() {
            var version = SPiD.version();
            assert.isString(version);
        });
    });
});
