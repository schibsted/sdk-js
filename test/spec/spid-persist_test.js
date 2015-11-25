'use strict';

describe('SPiD.Persist', function() {
    var assert = chai.assert;
    var setup = { storage: null, client_id: 'xxx', server: 'payment.schibsted.se' };
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
            var methodSpy = sinon.spy(require('../../src/spid-cookie'), 'get');
            persist.get('some');
            assert.isTrue(methodSpy.called);
        });

        it('should have a set method that calls through to SPiD.Cookie ', function() {
            var methodSpy = sinon.spy(require('../../src/spid-cookie'), 'set');
            persist.set('value');
            assert.isTrue(methodSpy.called);
            assert.equal('value', methodSpy.getCall(0).args[1]);
        });

        it('should have a clear method that calls through to SPiD.Cookie', function() {
            var methodSpy = sinon.spy(require('../../src/spid-cookie'), 'clear');
            persist.clear();
            assert.isTrue(methodSpy.called);
        });
    });

    describe(' with local storage setup ', function() {

        var _setup = setup;
        beforeEach(function() {
            _setup.storage = 'localstorage';
            SPiD.init(_setup);
        });

        it('should have set/get/clear methods ', function() {
            assert.isFunction(persist.get);
            assert.isFunction(persist.set);
            assert.isFunction(persist.clear);
        });

        it('should have a get method that calls through to SPiD.LocalStorage ', function() {
            var methodSpy = sinon.spy(require('../../src/spid-localstorage'), 'get');
            persist.get('ignored');
            assert.include(methodSpy.getCall(0).args[0], _setup.client_id, 'key should include client id');
        });

        it('should have a set method that calls through to SPiD.LocalStorage ', function() {
            var methodSpy = sinon.spy(require('../../src/spid-localstorage'), 'set');
            persist.set('value', 10000);
            var spyArgs = methodSpy.getCall(0).args;
            assert.include(spyArgs[0], _setup.client_id, 'key should include client id');
            assert.equal('value', spyArgs[1]);
            assert.equal(10000, spyArgs[2]);
        });

        it('should have a clear method that calls through to SPiD.LocalStorage', function() {
            var methodSpy = sinon.spy(require('../../src/spid-localstorage'), 'clear');
            persist.clear();
            assert.isTrue(methodSpy.called);
            assert.include(methodSpy.getCall(0).args[0], _setup.client_id, 'key should include client id');
        });
    });
});
