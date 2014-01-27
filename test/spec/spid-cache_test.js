/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global before:false*/
/*global SPiD:false*/

describe('SPiD.Cache', function() {

    var assert = chai.assert;
    var setupEnabled = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod: false};
    var setupDisabled = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod: false, cache:false};

    describe('SPiD.Cache Disabled', function() {
        before(function() {
            SPiD.init(setupDisabled);
        });

        it('SPiD.Cache.enabled should return false when disabled', function() {
            assert.isFalse(
                SPiD.Cache.enabled()
            );
        });
        it('SPiD.Cache.get should return undefined when disabled', function() {
            SPiD.Cache.set('mykey', 'test');
            assert.isUndefined(
                SPiD.Cache.get('mykey')
            );
        });
    });

    describe('SPiD.Cache Enabled', function() {
        before(function() {
            SPiD.init(setupEnabled);
        });

        it('SPiD.Cache.enabled should return true', function() {
            assert.isTrue(
                SPiD.Cache.enabled()
            );
        });

        it('SPiD.Cache.encode should return escaped JSON', function() {
            assert.equal(
                SPiD.Cache.encode({str:'val',test:true}),
                '%7B%22str%22%3A%22val%22%2C%22test%22%3Atrue%7D'
            );
        });

        it('SPiD.Cache.decode should return object', function() {
            assert.deepEqual(
                SPiD.Cache.decode('%7B%22str%22%3A%22val%22%2C%22test%22%3Atrue%7D'),
                {str:'val',test:true}
            );
        });

        it('SPiD.Cache.get should return null if key not set', function() {
            var val = SPiD.Cache.get('nonexistentkey');
            assert.isNull(val);
        });

        it('SPiD.Cache.get should return value set', function() {
            var val = {user:123, productId: 10010, result: true};
            SPiD.Cache.set('mykey', val);

            assert.deepEqual(
                SPiD.Cache.get('mykey'),
                val
            );
        });

        it('SPiD.Cache.clear should remove set key', function() {
            var set = {user:123, productId: 10010, result: true};
            SPiD.Cache.set('mykeytoremove', set);
            SPiD.Cache.clear('mykeytoremove');

            var get = SPiD.Cache.get('mykeytoremove');
            assert.isNull(get);
        });

    });
});
