describe('SPiD.Uri', function() {

    var assert = chai.assert;
    var setup = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', useSessionCluster:false, logging:false};
    var SPiD  = require('../../src/spid-sdk'),
        uri = require('../../src/spid-uri');

    before(function() {
        SPiD.init(setup);
    });

    it('SPiD.Uri.build should return correctly formatted URL', function() {
        assert.equal(uri.build('test', {a:1,b:2,c:null}), 'https://' + setup.server + '/test?a=1&b=2');
    });

    it('SPiD.Uri.login should return correctly formatted URL for login', function() {
        assert.equal(
            uri.login('http://random.com', '123' ),
            uri.build('flow/login', {'response_type':'code', 'client_id':'123', 'redirect_uri':encodeURIComponent('http://random.com') })
        );
        assert.equal(
            uri.login(null, '123'),
            uri.build('flow/login', {'response_type':'code', 'client_id':'123', 'redirect_uri':encodeURIComponent(window.location.toString()) })
        );
        assert.equal(
            uri.login(),
            uri.build('flow/login', {'response_type':'code', 'client_id':setup.client_id, 'redirect_uri':encodeURIComponent(window.location.toString()) })
        );
    });

    it('SPiD.Uri.auth should return correctly formatted URL for auth', function() {
        assert.equal(
            uri.auth('http://random.com', '123' ),
            uri.build('flow/auth', {'response_type':'code', 'client_id':'123', 'redirect_uri':encodeURIComponent('http://random.com') })
        );
        assert.equal(
            uri.auth(null, '123'),
            uri.build('flow/auth', {'response_type':'code', 'client_id':'123', 'redirect_uri':encodeURIComponent(window.location.toString()) })
        );
        assert.equal(
            uri.auth(),
            uri.build('flow/auth', {'response_type':'code', 'client_id':setup.client_id, 'redirect_uri':encodeURIComponent(window.location.toString()) })
        );
    });

    it('SPiD.Uri.signup should return correctly formatted URL for signup', function() {
        assert.equal(
            uri.signup('http://random.com', '123' ),
            uri.build('flow/signup', {'response_type': 'code', 'client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
        );
        assert.equal(
            uri.signup(null, '123'),
            uri.build('flow/signup', {'response_type': 'code', 'client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
        );
        assert.equal(
            uri.signup(),
            uri.build('flow/signup', {'response_type': 'code', 'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
        );
    });

    it('SPiD.Uri.logout should return correctly formatted URL for logout', function() {
        assert.equal(
            uri.logout('http://random.com', '123' ),
            uri.build('logout', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
        );
        assert.equal(
            uri.logout(null, '123'),
            uri.build('logout', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
        );
        assert.equal(
            uri.logout(),
            uri.build('logout', {'response_type': 'code','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
        );
    });

    it('SPiD.Uri.account should return correctly formatted URL for account summary', function() {
        assert.equal(
            uri.account('http://random.com', '123' ),
            uri.build('account/summary', {'client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
        );
        assert.equal(
            uri.account(null, '123'),
            uri.build('account/summary', {'client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
        );
        assert.equal(
            uri.account(),
            uri.build('account/summary', {'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
        );
    });

    it('SPiD.Uri.purchaseHistory should return correctly formatted URL for purchase history', function() {
        assert.equal(
            uri.purchaseHistory('http://random.com', '123' ),
            uri.build('account/purchasehistory', {'client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
        );
        assert.equal(
            uri.purchaseHistory(null, '123'),
            uri.build('account/purchasehistory', {'client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
        );
        assert.equal(
            uri.purchaseHistory(),
            uri.build('account/purchasehistory', {'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
        );
    });

    it('SPiD.Uri.subscriptions should return correctly formatted URL for subscriptions', function() {
        assert.equal(
            uri.subscriptions('http://random.com', '123' ),
            uri.build('account/subscriptions', {'client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
        );
        assert.equal(
            uri.subscriptions(null, '123'),
            uri.build('account/subscriptions', {'client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
        );
        assert.equal(
            uri.subscriptions(),
            uri.build('account/subscriptions', {'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
        );
    });

    it('SPiD.Uri.products should return correctly formatted URL for products', function() {
        assert.equal(
            uri.products('http://random.com', '123' ),
            uri.build('account/products', {'client_id':'123','redirect_uri': encodeURIComponent('http://random.com') })
        );
        assert.equal(
            uri.products(null, '123'),
            uri.build('account/products', {'client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
        );
        assert.equal(
            uri.products(),
            uri.build('account/products', {'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) })
        );
    });

    it('SPiD.Uri.redeem should return correctly formatted URL for voucher redeem', function() {
        assert.equal(
            uri.redeem('vcode','http://random.com', '123' ),
            uri.build('account/redeem', {'client_id': '123','redirect_uri': encodeURIComponent('http://random.com'), 'voucher_code': 'vcode' })
        );
        assert.equal(
            uri.redeem(null, null, '123'),
            uri.build('account/redeem', {'client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
        );
        assert.equal(
            uri.redeem(),
            uri.build('account/redeem', {'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) }));
    });

    it('SPiD.Uri.purchaseProduct should return correctly formatted URL for purchase product', function() {
        assert.equal(
            uri.purchaseProduct(10010,'http://random.com', '123' ),
            uri.build('flow/checkout', {'response_type': 'code','flow': 'payment','client_id':'123','redirect_uri': encodeURIComponent('http://random.com'), 'product_id': 10010 })
        );
        assert.equal(
            uri.purchaseProduct(null, null, '123'),
            uri.build('flow/checkout', {'response_type': 'code','flow': 'payment','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) })
        );
        assert.equal(
            uri.purchaseProduct(),
            uri.build('flow/checkout', {'response_type': 'code', 'flow':'payment', 'client_id':setup.client_id, 'redirect_uri':encodeURIComponent(window.location.toString()) })
        );
    });

    it('SPiD.Uri.purchaseCampaign should return correctly formatted URL for purchase product', function() {
        assert.equal(
            uri.purchaseCampaign(10020, 10010, 'vcode'),
            uri.build('flow/checkout', {'response_type': 'code','flow': 'payment','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()), 'campaign_id':10020, 'product_id': 10010, 'voucher_code':'vcode' })
        );
        assert.equal(
            uri.purchaseCampaign(10020, 10010),
            uri.build('flow/checkout', {'response_type': 'code','flow': 'payment','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()), 'campaign_id':10020, 'product_id': 10010 })
        );
    });
});
