/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global before:false*/
/*global SPiD:false*/

var assert = chai.assert;

var setup = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod:false, logging:false};
var setupProd = {client_id : '4d00e8d6bf92fc8648000000', server: 'payment.schibsted.se', logging:false, cookie: false};

describe('SPiD.Cookie', function() {

    describe('SPiD.Cookie Prod', function() {
        before(function() {
            SPiD.init(setupProd);
        });

        it('SPiD.Cookie.name should return correct name', function() {
            assert.equal(
                SPiD.Cookie.name(),
                'spid_js_'+setup.client_id
            );
        });
        it('SPiD.Cookie.enabled should return false', function() {
            assert.isFalse(
                SPiD.Cookie.enabled()
            );
        });
    });

    describe('SPiD.Cookie Stage', function() {
        before(function() {
            SPiD.init(setup);
        });

        it('SPiD.Cookie.name should return correct name', function() {
            assert.equal(
                SPiD.Cookie.name(),
                'spid_js_test_'+setup.client_id
            );
        });

        it('SPiD.Cookie.enabled should return true', function() {
            assert.isTrue(
                SPiD.Cookie.enabled()
            );
        });

        it('SPiD.Cookie.encode should return escaped JSON', function() {
            assert.equal(
                SPiD.Cookie.encode({str:'val',test:true}),
                '%7B%22str%22%3A%22val%22%2C%22test%22%3Atrue%7D'
            );
        });

        it('SPiD.Cookie.decode should return object', function() {
            assert.deepEqual(
                SPiD.Cookie.decode('%7B%22str%22%3A%22val%22%2C%22test%22%3Atrue%7D'),
                {str:'val',test:true}
            );
        });

        it('SPiD.Cookie.set should set session cookie', function() {
            var session = {user:123, expiresIn: 5000, baseDomain: window.location.host};
            SPiD.Cookie.set(session);

            assert.notEqual(document.cookie.indexOf(SPiD.Cookie.name()), -1);
        });

        it('SPiD.Cookie.set should set varnish cookie', function() {
            var session = {user:123, sp_id: 123, expiresIn: 5000, baseDomain: window.location.host};
            SPiD.Cookie.set(session);

            assert.notEqual(document.cookie.indexOf('SP_ID'), -1);
        });

        it('SPiD.Cookie.get should return session', function() {
            var session = {user:123, sp_id: 123, expiresIn: 5000, baseDomain: window.location.host};
            SPiD.Cookie.set(session);

            var cookie = SPiD.Cookie.get();
            assert.equal(cookie.user, 123);
            assert.equal(cookie.sp_id, 123);
        });

        it('SPiD.Cookie.get should return null if no cookie', function() {
            SPiD.Cookie.clear();

            var cookie = SPiD.Cookie.get();
            assert.isNull(cookie);
        });

        it('SPiD.Cookie.clear should remove cookies', function() {
            var session = {user:123, sp_id: 123, expiresIn: 5000, baseDomain: window.location.host};
            SPiD.Cookie.set(session);
            SPiD.Cookie.clear();
            assert.equal(document.cookie.indexOf(SPiD.Cookie.name()), -1);
            assert.equal(document.cookie.indexOf('SP_ID'), -1);
        });

    });
});
