/*global chai:false*/
/*global sinon:false*/
/*global describe:false*/
/*global it:false*/

describe('SPiD.Persist', function() {

    var assert = chai.assert;
    var setup = {storage: null, client_id: 'xxx', server: 'payment.schibsted.se'};
    var SPiD  = require('../../src/spid-sdk'),
        persist = require('../../src/spid-persist');

    describe('SPiD no-storage setup', function() {
        it('SPiD.Persist default should have set/get/clear methods ', function() {
            SPiD.init(setup);
            assert.isFunction(persist.get);
            assert.isFunction(persist.set);
            assert.isFunction(persist.clear);
        });
    });

    describe(' with cookies setup ', function() {
        var _setup = setup;
        before(function() {
            _setup.storage = 'cookie';
            SPiD.init(_setup);
        });

        it('should have set/get/clear methods ', function() {
            assert.isFunction(persist.get);
            assert.isFunction(persist.set);
            assert.isFunction(persist.clear);
        });

        it('should have a get method that calls through to SPiD.Cookie ', function() {
            var methodSpy = sinon.spy(require('../../src/spid-cookie'), "get");
            persist.get('some');
            assert.equal('some', methodSpy.getCall(0).args[0]);
        });

        it('should have a set method that calls through to SPiD.Cookie ', function() {
            var methodSpy = sinon.spy(require('../../src/spid-cookie'), "set");
            persist.set('key','value');
            assert.equal('key', methodSpy.getCall(0).args[0]);
            assert.equal('value', methodSpy.getCall(0).args[1]);
        });

        it('should have a clear method that calls through to SPiD.Cookie', function() {
            var methodSpy = sinon.spy(require('../../src/spid-cookie'), "clear");
            persist.clear();
            assert.isTrue(methodSpy.called);
        });
    });

    describe(' with local storage setup ', function() {

        var _setup = setup;
        before(function() {
            _setup.storage = 'localstorage';
            SPiD.init(_setup);
        });

        it('should have set/get/clear methods ', function() {
            assert.isFunction(persist.get);
            assert.isFunction(persist.set);
            assert.isFunction(persist.clear);
        });

        it('should have a get method that calls through to SPiD.LocalStorage ', function() {
            var methodSpy = sinon.spy(require('../../src/spid-localstorage'), "get");
            persist.get('some');
            assert.equal('some', methodSpy.getCall(0).args[0]);
        });

        it('should have a set method that calls through to SPiD.LocalStorage ', function() {
            var methodSpy = sinon.spy(require('../../src/spid-localstorage'), "set");
            persist.set('key','value');
            assert.equal('key', methodSpy.getCall(0).args[0]);
            assert.equal('value', methodSpy.getCall(0).args[1]);
        });

        it('should have a clear method that calls through to SPiD.LocalStorage', function() {
            var methodSpy = sinon.spy(require('../../src/spid-localstorage'), "clear");
            persist.clear('key');
            assert.isTrue(methodSpy.called);
            assert.equal('key', methodSpy.getCall(0).args[0]);
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
            assert.isFunction(persist.get);
            assert.isFunction(persist.set);
            assert.isFunction(persist.clear);
        });

        it('should have a get method that calls through to SPiD.Cache ', function() {
            var methodSpy = sinon.spy(require('../../src/spid-cache'), "get");
            persist.get('some');
            assert.equal('some', methodSpy.getCall(0).args[0]);
        });

        it('should have a set method that calls through to SPiD.Cache ', function() {
            var methodSpy = sinon.spy(require('../../src/spid-cache'), "set");
            persist.set('key','value');
            assert.equal('key', methodSpy.getCall(0).args[0]);
            assert.equal('value', methodSpy.getCall(0).args[1]);
        });

        it('should have a clear method that calls through to SPiD.Cache', function() {
            var methodSpy = sinon.spy(require('../../src/spid-cache'), "clear");
            persist.clear('key');
            assert.isTrue(methodSpy.called);
            assert.equal('key', methodSpy.getCall(0).args[0]);
        });
    });

});
