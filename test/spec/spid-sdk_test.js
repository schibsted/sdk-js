/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global before:false*/
/*global after:false*/
/*global SPiD:false*/

describe('SPiD', function() {

    var assert = chai.assert;
    var setup = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod:false, logging:false, cache:true};
    var setupProd = {client_id : '4d00e8d6bf92fc8648000000', server: 'payment.schibsted.se', logging:false};

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

    describe('SPiD.hasProduct', function() {
        var copy_Talk_request,
            copy_Cache_get,
            copy_Cache_set;
        before(function() {
            SPiD.init(setup);
            copy_Talk_request = SPiD.Talk.request;
            copy_Cache_get = SPiD.Cache.get;
            copy_Cache_set = SPiD.Cache.set;
        });

        it('SPiD.hasProduct should call Talk with parameter server, path, params, callback', function() {
            SPiD.Talk.request = function(server, path, param, callback) {
                assert.equal(server, 'https://stage.payment.schibsted.se/');
                assert.equal(path, 'ajax/hasproduct.js');
                assert.equal(param.product_id, 10010);
                assert.isFunction(callback);
            };
            SPiD.hasProduct(10010, function() {});
        });

        it('SPiD.hasProduct should try and set cache on successful return', function() {
            SPiD.Cache.set = function(key, data) {
                assert.equal(key, 'prd_10010');
                assert.equal(data.result, true);
                assert.equal(data.productId, 10010);
                assert.isNumber(data.refreshed);
            };
            SPiD.Talk.request = function(s, p, pm, cb) {
                s = p = null;
                cb(null, {result: true, productId: 10010});
            };
            SPiD.hasProduct(10010, function() {});
        });

        it('SPiD.hasProduct should try and get from cache', function() {
            SPiD.Cache.get = function(key) {
                assert.equal(key, 'prd_10010');
            };
            SPiD.Cache.set = function() {};
            SPiD.Talk.request = function() {};
            SPiD.hasProduct(10010, function() {});
        });

        it('SPiD.hasProduct should not call cache when cache disabled', function(done) {
            var oldCache = setup.cache;
            setup.cache = false;
            SPiD.init(setup, function() {
                SPiD.Cache.get = function() {
                    done(new Error('Called SPiD.Cache.get()'));
                };
                SPiD.Cache.set = function() {
                    done(new Error('Called SPiD.Cache.set()'));
                };
                SPiD.Talk.request = function(s, p, pm, cb) {
                    cb(null, {result:true, productId: 10010});
                };
                SPiD.hasProduct(10010, function() {
                    done();
                });
            });
            setup.cache = oldCache;
        });

        after(function() {
            SPiD.Talk.request = copy_Talk_request;
            SPiD.Cache.get = copy_Cache_get;
            SPiD.Cache.set = copy_Cache_set;
        });
    });

    describe('SPiD.hasSubscription', function() {
        var copy_Talk_request,
            copy_Cache_get,
            copy_Cache_set;
        before(function() {
            SPiD.init(setup);
            copy_Talk_request = SPiD.Talk.request;
            copy_Cache_get = SPiD.Cache.get;
            copy_Cache_set = SPiD.Cache.set;
        });

        it('SPiD.hasSubscription should call Talk with parameter server, path, params, callback', function() {
            SPiD.Talk.request = function(server, path, param, callback) {
                assert.equal(server, 'https://stage.payment.schibsted.se/');
                assert.equal(path, 'ajax/hassubscription.js');
                assert.equal(param.product_id, 10010);
                assert.isFunction(callback);
            };
            SPiD.hasSubscription(10010, function() {});
        });

        it('SPiD.hasSubscription should try and set cache on successful return', function() {
            SPiD.Cache.set = function(key, data) {
                assert.equal(key, 'sub_10010');
                assert.equal(data.result, true);
                assert.equal(data.productId, 10010);
                assert.isNumber(data.refreshed);
            };
            SPiD.Talk.request = function(s, p, pm, cb) {
                s = p = null;
                cb(null, {result: true, productId: 10010});
            };
            SPiD.hasSubscription(10010, function() {});
        });

        it('SPiD.hasSubscription should try and get from cache', function() {
            SPiD.Cache.get = function(key) {
                assert.equal(key, 'sub_10010');
            };
            SPiD.Cache.set = function() {};
            SPiD.Talk.request = function() {};
            SPiD.hasSubscription(10010, function() {});
        });

        it('SPiD.hasSubscription should not call cache when cache disabled', function(done) {
            var oldCache = setup.cache;
            setup.cache = false;
            SPiD.init(setup, function() {
                SPiD.Cache.get = function() {
                    done(new Error('Called SPiD.Cache.get()'));
                };
                SPiD.Cache.set = function() {
                    done(new Error('Called SPiD.Cache.set()'));
                };
                SPiD.Talk.request = function(s, p, pm, cb) {
                    cb(null, {result:true, productId: 10010});
                };
                SPiD.hasSubscription(10010, function() {
                    done();
                });
            });
            setup.cache = oldCache;
        });

        after(function() {
            SPiD.Talk.request = copy_Talk_request;
            SPiD.Cache.get = copy_Cache_get;
            SPiD.Cache.set = copy_Cache_set;
        });
    });

    describe('SPiD.setTraits', function() {
        var copy_Talk_request;
        before(function() {
            SPiD.init(setup);
            copy_Talk_request = SPiD.Talk.request;
        });

        it('SPiD.setTraits should call Talk with parameter server, path, params, callback', function() {
            SPiD.Talk.request = function(server, path, param, callback) {
                assert.equal(server, 'https://stage.payment.schibsted.se/');
                assert.equal(path, 'ajax/traits.js');
                assert.equal(param.t, 'traitObject');
                assert.isFunction(callback);
            };
            SPiD.setTraits('traitObject', function() {});
        });

        after(function() {
            SPiD.Talk.request = copy_Talk_request;
        });
    });

    describe('SPiD.logout', function() {
        var copy_Talk_request;
        before(function() {
            SPiD.init(setup);
            copy_Talk_request = SPiD.Talk.request;
        });

        it('SPiD.logout should call Talk with parameter server, path, params, callback', function() {
            SPiD.Talk.request = function(server, path, param, callback) {
                assert.equal(server, 'https://stage.payment.schibsted.se/');
                assert.equal(path, 'ajax/logout.js');
                assert.isFunction(callback);
            };
            SPiD.logout(function() {});
        });

        after(function() {
            SPiD.Talk.request = copy_Talk_request;
        });
    });
});
