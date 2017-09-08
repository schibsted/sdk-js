describe('SPiD.Cache', function() {

    var assert = chai.assert;
    var setupEnabled = {client_id: '4d00e8d6bf92fc8648000000', cache: true, server: 'identity-pre.schibsted.com', useSessionCluster: false};
    var setupDisabled = {client_id: '4d00e8d6bf92fc8648000000', cache: false, server: 'identity-pre.schibsted.com', useSessionCluster: false, storage: 'standard'};
    var cache = require('../../src/spid-cache'),
        SPiD = require('../../src/spid-sdk');


    describe('SPiD.Cache Disabled', function() {
        before(function() {
            SPiD.init(setupDisabled);
        });

        it('SPiD.Cache.enabled should return false when disabled', function() {
            assert.isFalse(cache.enabled());
        });
        it('SPiD.Cache.get should return undefined when disabled', function() {
            cache.set('mykey', 'test');
            assert.isUndefined(cache.get('mykey'));
        });
    });

    describe('SPiD.Cache Enabled', function() {
        before(function() {
            SPiD.init(setupEnabled);
        });

        it('SPiD.Cache.encode should return escaped JSON', function() {
            assert.equal(
                cache.encode({str: 'val', test: true}),
                '%7B%22str%22%3A%22val%22%2C%22test%22%3Atrue%7D'
            );
        });

        it('SPiD.Cache.decode should return object', function() {
            assert.deepEqual(
                cache.decode('%7B%22str%22%3A%22val%22%2C%22test%22%3Atrue%7D'),
                {str: 'val', test: true}
            );
        });

        it('SPiD.Cache.get should return null if key not set', function() {
            var val = cache.get('nonexistentkey');
            assert.isNull(val);
        });

        it('SPiD.Cache.get should return value set', function() {
            var val = {user: 123, productId: 10010, result: true};
            cache.set('mykey', val);

            assert.deepEqual(
                cache.get('mykey'),
                val
            );
        });

        it('SPiD.Cache.clear should remove set key', function() {
            var set = {user: 123, productId: 10010, result: true};
            cache.set('mykeytoremove', set);
            cache.clear('mykeytoremove');

            var get = cache.get('mykeytoremove');
            assert.isNull(get);
        });

    });
});
