/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global SPiD:false*/

describe('SPiD.Persist', function() {

    var assert = chai.assert;
    var setup = {storage: null, client_id: 'xxx', server: 'payment.schibsted.se'};

    describe('SPiD no-storage setup', function() {
        it('SPiD.Persist default should have set/get/clear methods ', function() {
            SPiD.init(setup);
            assert.isFunction(SPiD.Persist.get);
            assert.isFunction(SPiD.Persist.set);
            assert.isFunction(SPiD.Persist.clear);
        });
    });

    describe(' with cookies setup ', function() {
        var SPiDCookie;
        before(function() {
            var cookieSetup = setup;
            cookieSetup.storage = 'cookie';
            SPiD.init(cookieSetup);
            SPiDCookie = SPiD.Cookie;
        });

        it('should have set/get/clear methods ', function() {
            assert.isFunction(SPiD.Persist.get);
            assert.isFunction(SPiD.Persist.set);
            assert.isFunction(SPiD.Persist.clear);
        });

        it('should have a get method that calls through to SPiD.Cookie ', function(done) {
            SPiD.Cookie.get = function(key) {
                assert.equal('some', key);
                done();
            };
            SPiD.Persist.get('some');
        });

        it('should have a set method that calls through to SPiD.Cookie ', function(done) {
            SPiD.Cookie.set = function(key, value) {
                assert.equal('key', key);
                assert.equal('value', value);
                done();
            };
            SPiD.Persist.set('key', 'value');
        });

        it('should have a clear method that calls through to SPiD.Cookie', function(done) {
            SPiD.Cookie.clear = function(key) {
                assert.isUndefined(key);
                done();
            };
            SPiD.Persist.clear();
        });
    });

    describe(' with local storage setup ', function() {
        var SPiDLS;
        before(function() {
            var lsSetup = setup;
            lsSetup.storage = 'localstorage';
            SPiD.init(lsSetup);
            SPiDLS = SPiD.LocalStorage;
        });

        it('should have set/get/clear methods ', function() {
            assert.isFunction(SPiD.Persist.get);
            assert.isFunction(SPiD.Persist.set);
            assert.isFunction(SPiD.Persist.clear);
        });

        it('should have a get method that calls through to SPiD.LocalStorage ', function(done) {
            SPiD.LocalStorage.get = function(key) {
                assert.equal('some', key);
                done();
            };
            SPiD.Persist.get('some');
        });

        it('should have a set method that calls through to SPiD.LocalStorage ', function(done) {
            SPiD.LocalStorage.set = function(key, value) {
                assert.equal('key', key);
                assert.equal('value', value);
                done();
            };
            SPiD.Persist.set('key', 'value');
        });

        it('should have a clear method that calls through to SPiD.LocalStorage', function(done) {
            SPiD.LocalStorage.clear = function(key) {
                assert.equal('key', key);
                done();
            };
            SPiD.Persist.clear('key');
        });
    });

    describe(' with cache setup ', function() {
        var SPiDCache;
        before(function() {
            var cacheSetup = setup;
            cacheSetup.storage = 'cache';
            SPiD.init(cacheSetup);
            SPiDCache = SPiD.Cache;
        });

        it('should have set/get/clear methods ', function() {
            assert.isFunction(SPiD.Persist.get);
            assert.isFunction(SPiD.Persist.set);
            assert.isFunction(SPiD.Persist.clear);
        });

        it('should have a get method that calls through to SPiD.Cache ', function(done) {
            SPiD.Cache.get = function(key) {
                assert.equal('some', key);
                done();
            };
            SPiD.Persist.get('some');
        });

        it('should have a set method that calls through to SPiD.Cache ', function(done) {
            SPiD.Cache.set = function(key, value) {
                assert.equal('key', key);
                assert.equal('value', value);
                done();
            };
            SPiD.Persist.set('key', 'value');
        });

        it('should have a clear method that calls through to SPiD.Cache', function(done) {
            SPiD.Cache.clear = function(key) {
                assert.equal('key', key);
                done();
            };
            SPiD.Persist.clear('key');
        });
    });

});
