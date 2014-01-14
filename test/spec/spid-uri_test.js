/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global before:false*/
/*global SPiD:false*/

var assert = chai.assert;

var setup = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod:false, logging:false};
var setupProd = {client_id : '4d00e8d6bf92fc8648000000', server: 'payment.schibsted.se', logging:false};

describe('SPiD.Uri', function() {

    describe('SPiD.Uri Prod', function() {
        before(function() {
            SPiD.init(setupProd);
        });

        it('SPiD.Uri.server should return URL to Core server', function() {
            assert.equal(
                SPiD.Uri.server(),
                'https://payment.schibsted.se/'
            );
        });

        it('SPiD.Uri.session should return URL to Session server', function() {
            assert.equal(
                SPiD.Uri.session(),
                'https://session.payment.schibsted.se/rpc/hasSession.js'
            );
        });
    });

    describe('SPiD.Uri Stage', function() {
        before(function() {
            SPiD.init(setup);
        });

        it('SPiD.Uri.server should return URL to Core server', function() {
            assert.equal(
                SPiD.Uri.server(),
                'https://stage.payment.schibsted.se/'
            );
        });

        it('SPiD.Uri.session should return URL to Core server', function() {
            assert.equal(
                SPiD.Uri.session(),
                'https://stage.payment.schibsted.se/ajax/hasSession.js'
            );
        });

        it('SPiD.Uri.build should return correctly formatted URL', function() {
            assert.equal(SPiD.Uri.build('test', {a:1,b:2,c:null}), 'https://' + setup.server + '/test?a=1&b=2');
        });

        it('SPiD.Uri.login should return correctly formatted URL for login', function() {
            assert.equal(
                SPiD.Uri.login('http://random.com', '123' ),
                SPiD.Uri.build('login', {'response_type':'code', 'flow':'signup', 'client_id':'123', 'redirect_uri':encodeURIComponent('http://random.com') })
            );
            assert.equal(
                SPiD.Uri.login(null, '123'),
                SPiD.Uri.build('login', {'response_type':'code', 'flow':'signup', 'client_id':'123', 'redirect_uri':encodeURIComponent(window.location.toString()) })
            );
            assert.equal(
                SPiD.Uri.login(),
                SPiD.Uri.build('login', {'response_type':'code', 'flow':'signup', 'client_id':setup.client_id, 'redirect_uri':encodeURIComponent(window.location.toString()) })
            );
        });

        it('SPiD.Uri.signup should return correctly formatted URL for signup', function() {
            assert.equal(
                SPiD.Uri.signup('http://random.com', '123' ),
                SPiD.Uri.build('signup', {'response_type': 'code','flow': 'signup','client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
            );
            assert.equal(
                SPiD.Uri.signup(null, '123'),
                SPiD.Uri.build('signup', {'response_type': 'code','flow': 'signup','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
            );
            assert.equal(
                SPiD.Uri.signup(),
                SPiD.Uri.build('signup', {'response_type': 'code','flow': 'signup','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
            );
        });

        it('SPiD.Uri.logout should return correctly formatted URL for logout', function() {
            assert.equal(
                SPiD.Uri.logout('http://random.com', '123' ),
                SPiD.Uri.build('logout', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
            );
            assert.equal(
                SPiD.Uri.logout(null, '123'),
                SPiD.Uri.build('logout', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
            );
            assert.equal(
                SPiD.Uri.logout(),
                SPiD.Uri.build('logout', {'response_type': 'code','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
            );
        });

        it('SPiD.Uri.account should return correctly formatted URL for account summary', function() {
            assert.equal(
                SPiD.Uri.account('http://random.com', '123' ),
                SPiD.Uri.build('account/summary', {'client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
            );
            assert.equal(
                SPiD.Uri.account(null, '123'),
                SPiD.Uri.build('account/summary', {'client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
            );
            assert.equal(
                SPiD.Uri.account(),
                SPiD.Uri.build('account/summary', {'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
            );
        });

        it('SPiD.Uri.purchaseHistory should return correctly formatted URL for purchase history', function() {
            assert.equal(
                SPiD.Uri.purchaseHistory('http://random.com', '123' ),
                SPiD.Uri.build('account/purchasehistory', {'client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
            );
            assert.equal(
                SPiD.Uri.purchaseHistory(null, '123'),
                SPiD.Uri.build('account/purchasehistory', {'client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
            );
            assert.equal(
                SPiD.Uri.purchaseHistory(),
                SPiD.Uri.build('account/purchasehistory', {'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
            );
        });

        it('SPiD.Uri.subscriptions should return correctly formatted URL for subscriptions', function() {
            assert.equal(
                SPiD.Uri.subscriptions('http://random.com', '123' ),
                SPiD.Uri.build('account/subscriptions', {'client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
            );
            assert.equal(
                SPiD.Uri.subscriptions(null, '123'),
                SPiD.Uri.build('account/subscriptions', {'client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
            );
            assert.equal(
                SPiD.Uri.subscriptions(),
                SPiD.Uri.build('account/subscriptions', {'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
            );
        });

        it('SPiD.Uri.products should return correctly formatted URL for products', function() {
            assert.equal(
                SPiD.Uri.products('http://random.com', '123' ),
                SPiD.Uri.build('account/products', {'client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
            );
            assert.equal(
                SPiD.Uri.products(null, '123'),
                SPiD.Uri.build('account/products', {'client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
            );
            assert.equal(
                SPiD.Uri.products(),
                SPiD.Uri.build('account/products', {'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
            );
        });

        it('SPiD.Uri.redeem should return correctly formatted URL for voucher redeem', function() {
            assert.equal(
                SPiD.Uri.redeem('vcode','http://random.com', '123' ),
                SPiD.Uri.build('account/redeem', {'client_id': '123','redirect_uri': encodeURIComponent('http://random.com'), 'voucher_code': 'vcode' })
            );
            assert.equal(
                SPiD.Uri.redeem(null, null, '123'),
                SPiD.Uri.build('account/redeem', {'client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
            );
            assert.equal(
                SPiD.Uri.redeem(),
                SPiD.Uri.build('account/redeem', {'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) }));
        });

        it('SPiD.Uri.purchaseProduct should return correctly formatted URL for purchase product', function() {
            assert.equal(
                SPiD.Uri.purchaseProduct(10010,'http://random.com', '123' ),
                SPiD.Uri.build('auth/start', {'response_type': 'code','flow': 'payment','client_id':'123','redirect_uri': encodeURIComponent('http://random.com'), 'product_id': 10010 })
            );
            assert.equal(
                SPiD.Uri.purchaseProduct(null, null, '123'),
                SPiD.Uri.build('auth/start', {'response_type': 'code','flow': 'payment','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
            );
            assert.equal(
                SPiD.Uri.purchaseProduct(),
                SPiD.Uri.build('auth/start', {'response_type': 'code', 'flow':'payment', 'client_id':setup.client_id, 'redirect_uri':encodeURIComponent(window.location.toString()) })
            );
        });

        it('SPiD.Uri.purchaseCampaign should return correctly formatted URL for purchase product', function() {
            assert.equal(
                SPiD.Uri.purchaseCampaign(10020, 10010, 'vcode'),
                SPiD.Uri.build('auth/start', {'response_type': 'code','flow': 'payment','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()), 'campaign_id':10020, 'product_id': 10010, 'voucher_code':'vcode' })
            );
            assert.equal(
                SPiD.Uri.purchaseCampaign(10020, 10010),
                SPiD.Uri.build('auth/start', {'response_type': 'code','flow': 'payment','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()), 'campaign_id':10020, 'product_id': 10010 })
            );
        });
    });
});
