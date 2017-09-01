describe('SPiD', function() {
    var assert = chai.assert;
    var setup = function() {
        return {
            client_id: '4d00e8d6bf92fc8648000000',
            server: 'identity-pre.schibsted.com',
            useSessionCluster: false,
            logging: false,
            cache: true,
            storage: 'cookie'
        };
    };
    var setupProd = {
        client_id: '4d00e8d6bf92fc8648000000',
        server: 'login.schibsted.com',
        logging: false,
        refresh_timeout: 100,
        storage: 'cookie'
    };
    var SPiD = require('../../src/spid-sdk');

    var cookieDomain = (0 === window.location.host.indexOf('localhost:')) ? 'localhost' : window.location.host;

    function clearVarnishCookie() {
        document.cookie = 'SP_ID=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=.' + cookieDomain;
    }

    function setVarnishCookie() {
        document.cookie = 'SP_ID=4f1e2ae59caf7c2f4a058b76; path=/; domain=.' + cookieDomain;
    }

    describe('SPiD.init', function() {
        it('SPiD.init should throw error when missing config', function() {
            assert.throws(SPiD.init, TypeError);
        });
    });

    describe('SPiD Production Url', function() {
        before(function() {
            SPiD.init(setupProd);
        });

        it('SPiD.server should return URL to Core server', function() {
            assert.equal(
                SPiD.server(),
                'https://login.schibsted.com/'
            );
        });

        it('SPiD.sessionEndpoint should return URL to Session server endpoint', function() {
            assert.equal(
                SPiD.sessionEndpoint(),
                'https://session.login.schibsted.com/rpc/hasSession.js'
            );
        });

        it('SPiD.coreEndpoint should return URL to Core Session server endpoint', function() {
            assert.equal(
                SPiD.coreEndpoint(),
                'https://login.schibsted.com/ajax/hasSession.js'
            );
        });
    });

    describe('SPiD Stage Url', function() {
        before(function() {
            SPiD.init(setup());
        });

        it('SPiD.server should return URL to Core server', function() {
            assert.equal(
                SPiD.server(),
                'https://identity-pre.schibsted.com/'
            );
        });

        it('SPiD.sessionEndpoint should return URL to Core Session server endpoint', function() {
            assert.equal(
                SPiD.sessionEndpoint(),
                'https://identity-pre.schibsted.com/ajax/hasSession.js'
            );
        });
        it('SPiD.coreEndpoint should return URL to Core Session server endpoint', function() {
            assert.equal(
                SPiD.coreEndpoint(),
                'https://identity-pre.schibsted.com/ajax/hasSession.js'
            );
        });
    });

    describe('SPiD initiated', function() {
        before(function() {
            SPiD.init(setupProd);
        });
        it('SPiD.version should return string', function() {
            var version = SPiD.version();
            assert.isString(version);
        });
        it('SPiD.initiated should return true', function() {
            assert.isTrue(SPiD.initiated());
        });
    });

    describe('SPiD.sessionCache', function() {
        it('SPiD.sessionCache should exist', function() {
            assert.isDefined(SPiD.sessionCache);
            assert.isFunction(SPiD.sessionCache.clear);
            assert.isFunction(SPiD.sessionCache.get);
            assert.isFunction(SPiD.sessionCache.set);
        });
    });

    describe('SPiD.hasSession', function() {
        var talkRequestStub,
            persistSetStub,
            persistGetStub;

        beforeEach(function() {
            talkRequestStub = sinon.stub(require('../../src/spid-talk'), 'request');
            persistSetStub = sinon.stub(require('../../src/spid-persist'), 'set');
            persistGetStub = sinon.stub(require('../../src/spid-persist'), 'get');
        });

        afterEach(function() {
            talkRequestStub.restore();
            persistSetStub.restore();
            persistGetStub.restore();
            clearVarnishCookie();
        });

        it('SPiD.hasSession should call Talk with parameter server, path, params, callback', function() {
            SPiD.init(setupProd);
            SPiD.hasSession(function() {});
            assert.equal(talkRequestStub.getCall(0).args[0], 'https://session.login.schibsted.com/rpc/hasSession.js');
            assert.equal(talkRequestStub.getCall(0).args[1], null);
            assert.equal(talkRequestStub.getCall(0).args[2].autologin, 1);
            assert.isFunction(talkRequestStub.getCall(0).args[3]);
        });

        it('SPiD.hasSession should call Talk again if LoginException is returned', function() {
            SPiD.init(setupProd);
            talkRequestStub.onFirstCall().callsArgWith(3, {
                code: 401,
                type: 'LoginException',
                description: 'Autologin required'
            }, {
                result: false
            });
            SPiD.hasSession(function() {});
            assert.equal(talkRequestStub.secondCall.args[0], 'https://login.schibsted.com/ajax/hasSession.js');
            assert.equal(talkRequestStub.secondCall.args[1], null);
            assert.equal(talkRequestStub.secondCall.args[2].autologin, 1);
            assert.isFunction(talkRequestStub.secondCall.args[3]);
        });

        it('SPiD.hasSession should try to set cookie (in this case) when successful', function() {
            var fakeSession = {
                result: true,
                expiresIn: 7111,
                baseDomain: cookieDomain,
                userStatus: 'connected',
                userId: 1844813,
                id: '4f1e2ae59caf7c2f4a058b76',
                sp_id: '4f1e2ae59caf7c2f4a058b76'
            };
            SPiD.init(setupProd);
            talkRequestStub.onFirstCall().callsArgWith(3, null, fakeSession);
            SPiD.hasSession(function() {});
            assert.equal(fakeSession.userId, persistSetStub.firstCall.args[0].userId);
            assert.isTrue(persistSetStub.firstCall.args[0].result);
            assert.equal(7111, persistSetStub.firstCall.args[1]);
        });

        it('SPiD.hasSession should try to return persisted data without calling Talk', function(done) {
            var storedSession = {
                result: true,
                expiresIn: 7111,
                baseDomain: cookieDomain,
                userStatus: 'connected',
                userId: 1844813,
                sp_id: '4f1e2ae59caf7c2f4a058b76'
            };
            SPiD.init(setupProd);

            persistGetStub.onFirstCall().returns(storedSession);
            SPiD.hasSession(function(err, res) {
                if (!err && res.result && res.userId === 1844813) {
                    done();
                }
            });
            assert.isFalse(talkRequestStub.called);
        });

        it('SPiD.hasSession should set SP_ID cookie when local storage is used and setVarnishCookie option is true', function(done) {
            var fakeSession, _setup = setup();
            _setup.setVarnishCookie = true;
            _setup.storage = 'localstorage';
            SPiD.init(_setup);

            fakeSession = {
                result: true,
                expiresIn: 7111,
                baseDomain: cookieDomain,
                userStatus: 'connected',
                userId: 1844813,
                id: '4f1e2ae59caf7c2f4a058b76',
                sp_id: '4f1e2ae59caf7c2f4a058b76'
            };

            talkRequestStub.onFirstCall().callsArgWith(3, null, fakeSession);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            SPiD.hasSession(function() {
                assert.notEqual(document.cookie.indexOf('SP_ID'), -1);
                done();
            });
        });

        it('SPiD.hasSession should set SP_ID cookie when cookies are used and setVarnishCookie option is true', function(done) {
            var fakeSession, _setup = setup();
            _setup.setVarnishCookie = true;
            _setup.storage = 'cookie';
            SPiD.init(_setup);

            fakeSession = {
                result: true,
                expiresIn: 7111,
                baseDomain: cookieDomain,
                userStatus: 'connected',
                userId: 1844813,
                id: '4f1e2ae59caf7c2f4a058b76',
                sp_id: '4f1e2ae59caf7c2f4a058b76'
            };

            talkRequestStub.onFirstCall().callsArgWith(3, null, fakeSession);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            SPiD.hasSession(function() {
                assert.notEqual(document.cookie.indexOf('SP_ID'), -1);
                done();
            });
        });

        it('SPiD.hasSession should not set SP_ID cookie when local storage is used and setVarnishCookie option is not set', function(done) {
            var fakeSession, _setup = setup();
            _setup.storage = 'localstorage';
            SPiD.init(_setup);

            fakeSession = {
                result: true,
                expiresIn: 7111,
                baseDomain: cookieDomain,
                userStatus: 'connected',
                userId: 1844813,
                id: '4f1e2ae59caf7c2f4a058b76',
                sp_id: '4f1e2ae59caf7c2f4a058b76'
            };

            talkRequestStub.onFirstCall().callsArgWith(3, null, fakeSession);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            SPiD.hasSession(function () {
                assert.equal(document.cookie.indexOf('SP_ID'), -1);
                done();
            });
        });

        it('SPiD.hasSession should set SP_ID cookie when cookies are used and setVarnishCookie option is not set', function(done) {
            var fakeSession, _setup = setup();
            _setup.storage = 'cookie';
            SPiD.init(_setup);

            fakeSession = {
                result: true,
                expiresIn: 7111,
                baseDomain: cookieDomain,
                userStatus: 'connected',
                userId: 1844813,
                id: '4f1e2ae59caf7c2f4a058b76',
                sp_id: '4f1e2ae59caf7c2f4a058b76'
            };

            talkRequestStub.onFirstCall().callsArgWith(3, null, fakeSession);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            SPiD.hasSession(function() {
                assert.notEqual(document.cookie.indexOf('SP_ID'), -1);
                done();
            });
        });

        it('SPiD.hasSession should not set SP_ID cookie when local storage is used and setVarnishCookie option is false', function(done) {
            var fakeSession, _setup = setup();
            _setup.setVarnishCookie = false;
            _setup.storage = 'localstorage';
            SPiD.init(_setup);

            fakeSession = {
                result: true,
                expiresIn: 7111,
                baseDomain: cookieDomain,
                userStatus: 'connected',
                userId: 1844813,
                id: '4f1e2ae59caf7c2f4a058b76',
                sp_id: '4f1e2ae59caf7c2f4a058b76'
            };

            talkRequestStub.onFirstCall().callsArgWith(3, null, fakeSession);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            SPiD.hasSession(function() {
                assert.equal(document.cookie.indexOf('SP_ID'), -1);
                done();
            });
        });

        it('SPiD.hasSession should not set SP_ID cookie when cookies are used and setVarnishCookie option is false', function(done) {
            var fakeSession, _setup = setup();
            _setup.setVarnishCookie = false;
            _setup.storage = 'cookie';
            SPiD.init(_setup);

            fakeSession = {
                result: true,
                expiresIn: 7111,
                baseDomain: cookieDomain,
                userStatus: 'connected',
                userId: 1844813,
                id: '4f1e2ae59caf7c2f4a058b76',
                sp_id: '4f1e2ae59caf7c2f4a058b76'
            };

            talkRequestStub.onFirstCall().callsArgWith(3, null, fakeSession);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
            SPiD.hasSession(function() {
                assert.equal(document.cookie.indexOf('SP_ID'), -1);
                done();
            });
        });

        it('SPiD.hasSession should update SP_ID cookie when data comes from persistence', function(done) {
            var storedSession, _setup = setup();
            _setup.setVarnishCookie = true;
            _setup.storage = 'localstorage';
            SPiD.init(_setup);

            storedSession = {
                result: true,
                expiresIn: 7111,
                baseDomain: cookieDomain,
                userStatus: 'connected',
                userId: 1844813,
                sp_id: '4f1e2ae59caf7c2f4a058b76'
            };

            persistGetStub.onFirstCall().returns(storedSession);
            SPiD.hasSession(function(err, res) {
                if (!err && res.result && res.userId === 1844813) {
                    assert.notEqual(document.cookie.indexOf('SP_ID'), -1);
                    done();
                }
            });
            assert.isFalse(talkRequestStub.called);
        });

        it('SPiD.hasSession should cache data upon erroneously response when cache.hasSession option is set', function(done) {
            var _session, _setup = setup();
            _setup.cache = { hasSession: { ttlSeconds: 360 } };
            _setup.storage = 'localstorage';
            SPiD.init(_setup);

            _session = {
                baseDomain: cookieDomain,
                expiresIn: null,
                result: false,
                serverTime: 1464685017
            };
            talkRequestStub.onFirstCall().callsArgWith(3, null, _session);

            SPiD.hasSession(function() {
                assert.isTrue(persistSetStub.calledOnce);
                assert.equal(persistSetStub.firstCall.args[1], _setup.cache.hasSession.ttlSeconds);
                done();
            });
        });
    });

    describe('SPiD.acceptAgreement', function() {
        var talkRequestStub, persistClearStub;

        beforeEach(function() {
            SPiD.init(setup());
            talkRequestStub = sinon.stub(require('../../src/spid-talk'), 'request');
            persistClearStub = sinon.stub(require('../../src/spid-persist'), 'clear');
        });
        afterEach(function() {
            talkRequestStub.restore();
            persistClearStub.restore();
        });

        it('SPiD.acceptAgreement should call Talk with parameter server, path, callback', function() {
            SPiD.acceptAgreement(function() {});
            assert.equal(talkRequestStub.getCall(0).args[0], 'https://identity-pre.schibsted.com/');
            assert.equal(talkRequestStub.getCall(0).args[1], 'ajax/acceptAgreement.js');
            assert.isFunction(talkRequestStub.getCall(0).args[3]);
            assert.isTrue(talkRequestStub.calledOnce);
        });

        it('SPiD.acceptAgreement should call persist.clear and hasSession on successful talk response', function() {
            var fakeSession = {
                result: true,
                expiresIn: 7111,
                baseDomain: cookieDomain,
                userStatus: 'connected',
                userId: 1844813,
                id: '4f1e2ae59caf7c2f4a058b76',
                sp_id: '4f1e2ae59caf7c2f4a058b76'
            };
            var cbfun = function() {};
            talkRequestStub.onFirstCall().callsArg(3); // acceptAgreement
            talkRequestStub.onSecondCall().callsArgWith(3, null, fakeSession);
            SPiD.acceptAgreement(cbfun);
            assert.isTrue(talkRequestStub.calledTwice);
            assert.isTrue(persistClearStub.calledOnce);
        });

        it('SPiD.acceptAgreement should clear SP_ID cookie on successful talk response', function() {
            var cbfun, fakeSession;
            setVarnishCookie();
            fakeSession = {
                result: true,
                expiresIn: 7111,
                baseDomain: cookieDomain,
                userStatus: 'connected',
                userId: 1844813,
                id: '4f1e2ae59caf7c2f4a058b76',
                sp_id: '4f1e2ae59caf7c2f4a058b76'
            };
            cbfun = function() {};
            talkRequestStub.onFirstCall().callsArg(3); // acceptAgreement
            talkRequestStub.onSecondCall().callsArgWith(3, null, fakeSession);
            SPiD.acceptAgreement(cbfun);
            assert.isTrue(document.cookie.indexOf('SP_ID') === -1);
        });
    });


    describe('SPiD.hasProduct', function() {
        var talkRequestStub,
            cacheGetStub,
            cacheSetStub;
        before(function() {
            var cacheSetup = setup();
            cacheSetup.storage = 'cache';
            SPiD.init(cacheSetup);
        });
        beforeEach(function() {
            talkRequestStub = sinon.stub(require('../../src/spid-talk'), 'request');
            cacheGetStub = sinon.stub(require('../../src/spid-cache'), 'get');
            cacheSetStub = sinon.stub(require('../../src/spid-cache'), 'set');
        });

        afterEach(function() {
            talkRequestStub.restore();
            cacheGetStub.restore();
            cacheSetStub.restore();
        });

        it('SPiD.hasProduct should call Talk with parameter server, path, params, callback', function() {
            SPiD.hasProduct(10010, function() {});
            assert.equal(talkRequestStub.getCall(0).args[0], 'https://identity-pre.schibsted.com/');
            assert.equal(talkRequestStub.getCall(0).args[1], 'ajax/hasproduct.js');
            assert.equal(talkRequestStub.getCall(0).args[2].product_id, 10010);
            assert.isFunction(talkRequestStub.getCall(0).args[3]);
            assert.isTrue(talkRequestStub.calledOnce);
        });

        it('SPiD.hasProduct should try and set cache on successful return', function() {
            talkRequestStub.onFirstCall().callsArgWith(3, null, { result: true, productId: 10010 });
            SPiD.hasProduct(10010, function() {});
            assert.isTrue(cacheSetStub.calledOnce);
            assert.equal(cacheSetStub.getCall(0).args[0], 'prd_10010');
            assert.equal(cacheSetStub.getCall(0).args[1].result, true);
            assert.equal(cacheSetStub.getCall(0).args[1].productId, 10010);
            assert.isNumber(cacheSetStub.getCall(0).args[1].refreshed);
        });

        it('SPiD.hasProduct should try and get from cache', function() {
            SPiD.hasProduct(10010, function() {});
            assert.isTrue(cacheGetStub.calledOnce);
        });

        it('SPiD.hasProduct should not call cache when cache disabled', function(done) {
            var _setup = setup();
            _setup.cache = false;
            SPiD.init(_setup);
            talkRequestStub.onFirstCall().callsArgWith(3, null, { result: true, productId: 10010 });
            SPiD.hasProduct(10010, function() {
                done();
                assert.isFalse(cacheGetStub.called);
                assert.isFalse(cacheSetStub.called);
            });
        });
    });

    describe('SPiD.hasSubscription', function() {
        var talkRequestStub,
            cacheGetStub,
            cacheSetStub;
        before(function() {
            var cacheSetup = setup();
            cacheSetup.storage = 'cache';
            SPiD.init(cacheSetup);
        });
        beforeEach(function() {
            talkRequestStub = sinon.stub(require('../../src/spid-talk'), 'request');
            cacheGetStub = sinon.stub(require('../../src/spid-cache'), 'get');
            cacheSetStub = sinon.stub(require('../../src/spid-cache'), 'set');
        });
        afterEach(function() {
            talkRequestStub.restore();
            cacheGetStub.restore();
            cacheSetStub.restore();
        });

        it('SPiD.hasSubscription should call Talk with parameter server, path, params, callback', function() {
            SPiD.hasSubscription(10010, function() {});
            assert.equal(talkRequestStub.getCall(0).args[0], 'https://identity-pre.schibsted.com/');
            assert.equal(talkRequestStub.getCall(0).args[1], 'ajax/hassubscription.js');
            assert.equal(talkRequestStub.getCall(0).args[2].product_id, 10010);
            assert.isFunction(talkRequestStub.getCall(0).args[3]);
            assert.isTrue(talkRequestStub.calledOnce);
        });

        it('SPiD.hasSubscription should try and set cache on successful return', function() {
            talkRequestStub.onFirstCall().callsArgWith(3, null, { result: true, productId: 10010 });
            SPiD.hasSubscription(10010, function() {});

            assert.isTrue(cacheSetStub.calledOnce);
            assert.equal(cacheSetStub.getCall(0).args[0], 'sub_10010');
            assert.equal(cacheSetStub.getCall(0).args[1].result, true);
            assert.equal(cacheSetStub.getCall(0).args[1].productId, 10010);
            assert.isNumber(cacheSetStub.getCall(0).args[1].refreshed);
        });

        it('SPiD.hasSubscription should try and get from cache', function() {
            SPiD.hasSubscription(10010, function() {});
            assert.isTrue(cacheGetStub.calledOnce);
            assert.equal(cacheGetStub.getCall(0).args[0], 'sub_10010');
        });

        it('SPiD.hasSubscription should not call cache when cache disabled', function(done) {
            var _setup = setup();
            _setup.cache = false;
            SPiD.init(_setup);
            talkRequestStub.onFirstCall().callsArgWith(3, null, { result: true, productId: 10010 });
            SPiD.hasSubscription(10010, function() {
                assert.isFalse(cacheGetStub.called);
                assert.isFalse(cacheSetStub.called);
                done();
            });
        });
    });

    describe('SPiD.setTraits', function() {
        var talkRequestStub;
        beforeEach(function() {
            SPiD.init(setup());
            talkRequestStub = sinon.stub(require('../../src/spid-talk'), 'request');
        });

        afterEach(function() {
            talkRequestStub.restore();
        });

        it('SPiD.setTraits should call Talk with parameter server, path, params, callback', function() {
            SPiD.setTraits('traitObject', function() {});
            assert.equal(talkRequestStub.getCall(0).args[0], 'https://identity-pre.schibsted.com/');
            assert.equal(talkRequestStub.getCall(0).args[1], 'ajax/traits.js');
            assert.equal(talkRequestStub.getCall(0).args[2].t, 'traitObject');
            assert.isFunction(talkRequestStub.getCall(0).args[3]);
            assert.isTrue(talkRequestStub.calledOnce);
        });
    });

    describe('SPiD.logout', function() {
        var talkRequestStub,
            cookieClearStub;
        beforeEach(function() {
            SPiD.init(setup());
            talkRequestStub = sinon.stub(require('../../src/spid-talk'), 'request');
            cookieClearStub = sinon.stub(require('../../src/spid-cookie'), 'clear');
        });

        afterEach(function() {
            talkRequestStub.restore();
            cookieClearStub.restore();
        });

        it('SPiD.logout should call Talk with parameter server, path, params, callback', function() {
            SPiD.logout(function() {});
            assert.equal(talkRequestStub.getCall(0).args[0], 'https://identity-pre.schibsted.com/');
            assert.equal(talkRequestStub.getCall(0).args[1], 'ajax/logout.js');
            assert.isFunction(talkRequestStub.getCall(0).args[3]);
            assert.isTrue(talkRequestStub.calledOnce);
        });

        it('SPiD.logout should call callback with error and response', function (done) {
            talkRequestStub.onFirstCall().callsArgWith(3, { error: true }, { result: true });
            SPiD.logout(function(err, res) {
                if (err.error && res.result) {
                    done();
                }
            });
        });

        it('SPiD.logout should call SPiD.Cookie.clear() when successful', function() {
            talkRequestStub.onFirstCall().callsArgWith(3, { error: true }, { result: true });
            SPiD.logout();
            assert.isTrue(cookieClearStub.calledOnce);
        });

        it('SPiD.logout should clear SP_ID cookie', function(done) {
            talkRequestStub.onFirstCall().callsArgWith(3, { error: true }, { result: true });
            setVarnishCookie();
            SPiD.logout(function() {
                assert.isTrue(document.cookie.indexOf('SP_ID') === -1);
                done();
            });
        });
    });
});
