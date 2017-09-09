describe('SPiD.Cookie', function() {

    var assert = chai.assert;
    var setup = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', useSessionCluster:false, logging:false, setVarnishCookie: true};
    var setupProd = {client_id : '4d00e8d6bf92fc8648000000', server: 'payment.schibsted.se', logging:false, cookie: false, setVarnishCookie: true};
    var spidCookie = require('../../src/spid-cookie'),
        SPiD = require('../../src/spid-sdk');

    var cookieDomain = (0 === window.location.host.indexOf('localhost:')) ? 'localhost' : window.location.host;


    describe('SPiD.Cookie Prod', function() {
        before(function() {
            SPiD.init(setupProd);
        });
    });

    describe('SPiD.Cookie Stage', function() {
        before(function() {
            SPiD.init(setup);
        });

        it('SPiD.Cookie.encode should return escaped JSON', function() {
            assert.equal(
                spidCookie.encode({str:'val',test:true}),
                '%7B%22str%22%3A%22val%22%2C%22test%22%3Atrue%7D'
            );
        });

        it('SPiD.Cookie.decode should return object', function() {
            assert.deepEqual(
                spidCookie.decode('%7B%22str%22%3A%22val%22%2C%22test%22%3Atrue%7D'),
                {str:'val',test:true}
            );
        });

        it('SPiD.Cookie.clearVarnishCookie should work before session data was set', function() {
            document.cookie = 'SP_ID=123; domain=' + cookieDomain;
            spidCookie.clearVarnishCookie(cookieDomain);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
        });

        it('SPiD.Cookie.set should set session cookie', function() {
            var session = {user:123, expiresIn: 5000, baseDomain: cookieDomain};
            var name = 'name';
            spidCookie.set(name, session, session.expiresIn);

            assert.notEqual(document.cookie.indexOf(name), -1);
        });

        it('SPiD.Cookie.setVarnishCookie should set varnish cookie', function() {
            var session = {user:123, sp_id: 123, expiresIn: 5000, baseDomain: cookieDomain};
            spidCookie.tryVarnishCookie(session, session.expiresIn);

            assert.notEqual(document.cookie.indexOf('SP_ID'), -1);
        });

        it('SPiD.Cookie.clearVarnishCookie should clear varnish cookie', function() {
            document.cookie = 'SP_ID=123; domain=' + cookieDomain;
            spidCookie.clearVarnishCookie(cookieDomain);

            assert.equal(document.cookie.indexOf('SP_ID'), -1);
        });

        it('SPiD.Cookie.hasVarnishCookie should check if varnish cookie exists', function() {
            var session = {user:123, sp_id: 123, expiresIn: 5000, baseDomain: cookieDomain};
            spidCookie.tryVarnishCookie(session, session.expiresIn);

            assert.equal(spidCookie.hasVarnishCookie(), true);
        });

        it('SPiD.Cookie.hasVarnishCookie should return false after cookie clearing', function() {
            document.cookie = 'SP_ID=123; domain=' + cookieDomain;
            spidCookie.clearVarnishCookie(cookieDomain);

            assert.equal(spidCookie.hasVarnishCookie(), false);
        });

        it('SPiD.Cookie.get should return session', function() {
            var session = {user:123, sp_id: 123, expiresIn: 5000, baseDomain: cookieDomain};
            spidCookie.set('name', session, session.expiresIn);

            var cookie = spidCookie.get('name');
            assert.equal(cookie.user, 123);
            assert.equal(cookie.sp_id, 123);
        });

        it('SPiD.Cookie.get should return null if no cookie', function() {
            spidCookie.clear('name', cookieDomain);
            var cookie = spidCookie.get('name');
            assert.isNull(cookie);
        });

        it('SPiD.Cookie.clear should remove cookies', function() {
            var session = {user:123, sp_id: 123, expiresIn: 5000, baseDomain: cookieDomain};
            spidCookie.set('name', session, session.expiresIn);
            spidCookie.clear('name', cookieDomain);
            assert.equal(document.cookie.indexOf('name'), -1);
            assert.equal(document.cookie.indexOf('SP_ID'), -1);
        });
    });
});
