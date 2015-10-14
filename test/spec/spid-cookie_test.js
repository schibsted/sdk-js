/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global before:false*/

describe('SPiD.Cookie', function() {

    var assert = chai.assert;
    var setup = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', useSessionCluster:false, logging:false};
    var setupProd = {client_id : '4d00e8d6bf92fc8648000000', server: 'payment.schibsted.se', logging:false, cookie: false, cache:false};
    var spidCookie = require('../../src/spid-cookie'),
        SPiD = require('../../src/spid-sdk');

    var cookieDomain = (0 === window.location.host.indexOf("localhost:")) ? "localhost" : window.location.host;


    describe('SPiD.Cookie Prod', function() {
        before(function() {
            SPiD.init(setupProd);
        });

        it('SPiD.Cookie.name should return correct name', function() {
            assert.equal(
                spidCookie.name(),
                'spid_js_'+setup.client_id
            );
        });
    });

    describe('SPiD.Cookie Stage', function() {
        before(function() {
            SPiD.init(setup);
        });

        it('SPiD.Cookie.name should return correct name', function() {
            assert.equal(
                spidCookie.name(),
                'spid_js_'+setup.client_id
            );
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

        it('SPiD.Cookie.set should set session cookie', function() {

            var session = {user:123, expiresIn: 5000, baseDomain: cookieDomain};
            spidCookie.set(session);
            assert.notEqual(document.cookie.indexOf(spidCookie.name()), -1);
        });

        it('SPiD.Cookie.set should set varnish cookie', function() {
            var session = {user:123, sp_id: 123, expiresIn: 5000, baseDomain: cookieDomain};
            spidCookie.set(session);

            assert.notEqual(document.cookie.indexOf('SP_ID'), -1);
        });

        it('SPiD.Cookie.get should return session', function() {
            var session = {user:123, sp_id: 123, expiresIn: 5000, baseDomain: cookieDomain};
            spidCookie.set(session);

            var cookie = spidCookie.get();
            assert.equal(cookie.user, 123);
            assert.equal(cookie.sp_id, 123);
        });

        it('SPiD.Cookie.get should return null if no cookie', function() {
            spidCookie.clear();
            var cookie = spidCookie.get();
            assert.isNull(cookie);
        });

        it('SPiD.Cookie.clear should remove cookies', function() {
            var session = {user:123, sp_id: 123, expiresIn: 5000, baseDomain: cookieDomain};
            spidCookie.set(session);
            spidCookie.clear();
            assert.equal(document.cookie.indexOf(spidCookie.name()), -1);
            assert.equal(document.cookie.indexOf('SP_ID'), -1);
        });
    });
});
