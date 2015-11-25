describe('SPiD.Config', function() {

    var assert = chai.assert;
    var setupProd = { client_id : '4d00e8d6bf92fc8648000000', server: 'login.schibsted.com', logging:false, refresh_timeout: 100, storage: 'cookie' };
    var SPiD  = require('../../src/spid-sdk'),
        config = require('../../src/spid-config');

    it('Config.options should return empty object before init', function() {
        var options = config.options();
        assert.isObject(options);
        assert.equal(Object.keys(options), 0);
    });

    describe('SPiD initiated', function() {
        before(function() {
            SPiD.init(setupProd);
        });

        it('SPiD.options should return non empty object', function() {
            var options = config.options();
            assert.isObject(options);
            assert.notEqual(Object.keys(options), 0);
        });
        it('SPiD.options should not set lower refresh_timeout than 60000', function() {
            var options = config.options();
            assert.equal(options.refresh_timeout, 60000);
        });
    });

});
