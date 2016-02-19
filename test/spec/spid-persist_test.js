describe('SPiD.Persist', function() {

    var assert = chai.assert;
    var setup = {storage: null, client_id: 'xxx', server: 'payment.schibsted.se'};
    var SPiD  = require('../../src/spid-sdk'),
        persist = require('../../src/spid-persist');

    var cookieDomain = (0 === window.location.host.indexOf('localhost:')) ? 'localhost' : window.location.host;

    function clearVarnishCookie() {
        document.cookie = 'SP_ID=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=.' + cookieDomain;
    }

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


    describe(' when varnish cookie option is set to true ', function() {

        var _setup = setup;
        beforeEach(function() {
            _setup.setVarnishCookie = true;
        });

        afterEach(function() {
            clearVarnishCookie();
        });

        it('should set varnish cookie even when local storage is used', function() {
            _setup.storage = 'localstorage';
            SPiD.init(_setup);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            persist.set({sp_id: 12345, expiresIn: 5000, baseDomain: cookieDomain});
            assert.notEqual(document.cookie.indexOf('SP_ID'), -1);
        });

        it('should set varnish cookie when cookies are used', function() {
            _setup.storage = 'cookie';
            SPiD.init(_setup);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            persist.set({sp_id: 12345, expiresIn: 5000, baseDomain: cookieDomain});
            assert.notEqual(document.cookie.indexOf('SP_ID'), -1);
        });

    });

    describe(' when varnish cookie option is not set ', function() {

        var _setup = setup;
        beforeEach(function() {
            delete _setup.setVarnishCookie;
        });

        afterEach(function() {
            clearVarnishCookie();
        });

        it('should not set varnish cookie when local storage is used', function() {
            _setup.storage = 'localstorage';
            SPiD.init(_setup);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            persist.set({sp_id: 12345, expiresIn: 5000, baseDomain: cookieDomain});
            assert.equal(document.cookie.indexOf('SP_ID'), -1);
        });

        it('should set varnish cookie when cookies are used', function() {
            _setup.storage = 'cookie';
            SPiD.init(_setup);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            persist.set({sp_id: 12345, expiresIn: 5000, baseDomain: cookieDomain});
            assert.notEqual(document.cookie.indexOf('SP_ID'), -1);
        });

    });

    describe(' when varnish cookie option is set to false ', function() {

        var _setup = setup;
        beforeEach(function() {
            _setup.setVarnishCookie = false;
        });

        afterEach(function() {
            clearVarnishCookie();
        });

        it('should not set varnish cookie when local storage is used', function() {
            _setup.storage = 'localstorage';
            SPiD.init(_setup);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            persist.set({sp_id: 12345, expiresIn: 5000, baseDomain: cookieDomain});
            assert.equal(document.cookie.indexOf('SP_ID'), -1);
        });

        it('should not set varnish cookie even when cookies are used', function() {
            _setup.storage = 'cookie';
            SPiD.init(_setup);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            persist.set({sp_id: 12345, expiresIn: 5000, baseDomain: cookieDomain});
            assert.equal(document.cookie.indexOf('SP_ID'), -1);
        });

    });
});
