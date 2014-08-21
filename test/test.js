/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global before:false*/
/*global VGS:false*/

var assert = chai.assert;

var setup = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod:false, logging:false};

describe('VGS', function() {

	describe('VGS is loaded', function () {
		it('VGS should be defined', function() {
			assert.isObject(VGS, 'object', 'Its an object');
		});
	});
	describe('VGS initiated', function() {
		before(function() {
			VGS.init(setup);
		});
		//Test VGS init?

		describe('Test URL generation', function() {
			it('VGS.Ajax.buildUrl should return correctly formatted URL', function() {
				assert.equal(VGS.Ajax.buildUrl('test', {a:1,b:2,c:null}), 'https://' + setup.server + '/test?a=1&b=2');
			});
			it('VGS.getLoginURI should return correctly formatted URL for login', function() {
				assert.equal(VGS.getLoginURI('http://random.com', '123' ), VGS.Ajax.buildUrl('flow/login', {'response_type':'code', 'client_id':'123', 'redirect_uri':encodeURIComponent('http://random.com') }));
				assert.equal(VGS.getLoginURI(null, '123'), VGS.Ajax.buildUrl('flow/login', {'response_type':'code', 'client_id':'123', 'redirect_uri':encodeURIComponent(window.location.toString()) }));
				assert.equal(VGS.getLoginURI(), VGS.Ajax.buildUrl('flow/login', {'response_type':'code', 'client_id':setup.client_id, 'redirect_uri':encodeURIComponent(window.location.toString()) }));
			});
			it('VGS.getSignupURI should return correctly formatted URL for signup', function() {
				assert.equal(VGS.getSignupURI('http://random.com', '123' ), VGS.Ajax.buildUrl('flow/signup', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent('http://random.com') }));
				assert.equal(VGS.getSignupURI(null, '123'), VGS.Ajax.buildUrl('flow/signup', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) }));
				assert.equal(VGS.getSignupURI(), VGS.Ajax.buildUrl('flow/signup', {'response_type': 'code','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) }));
			});
			it('VGS.getLogoutURI should return correctly formatted URL for logout', function() {
				assert.equal(VGS.getLogoutURI('http://random.com', '123' ), VGS.Ajax.buildUrl('logout', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent('http://random.com') }));
				assert.equal(VGS.getLogoutURI(null, '123'), VGS.Ajax.buildUrl('logout', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) }));
				assert.equal(VGS.getLogoutURI(), VGS.Ajax.buildUrl('logout', {'response_type': 'code','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) }));
			});
			it('VGS.getAccountURI should return correctly formatted URL for account summary', function() {
				assert.equal(VGS.getAccountURI('http://random.com', '123' ), VGS.Ajax.buildUrl('account/summary', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent('http://random.com') }));
				assert.equal(VGS.getAccountURI(null, '123'), VGS.Ajax.buildUrl('account/summary', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) }));
				assert.equal(VGS.getAccountURI(), VGS.Ajax.buildUrl('account/summary', {'response_type': 'code','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) }));
			});
			it('VGS.getPurchaseHistoryURI should return correctly formatted URL for purchase history', function() {
				assert.equal(VGS.getPurchaseHistoryURI('http://random.com', '123' ), VGS.Ajax.buildUrl('account/purchasehistory', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent('http://random.com') }));
				assert.equal(VGS.getPurchaseHistoryURI(null, '123'), VGS.Ajax.buildUrl('account/purchasehistory', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) }));
				assert.equal(VGS.getPurchaseHistoryURI(), VGS.Ajax.buildUrl('account/purchasehistory', {'response_type': 'code','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) }));
			});
			it('VGS.getSubscriptionsURI should return correctly formatted URL for subscriptions', function() {
				assert.equal(VGS.getSubscriptionsURI('http://random.com', '123' ), VGS.Ajax.buildUrl('account/subscriptions', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent('http://random.com') }));
				assert.equal(VGS.getSubscriptionsURI(null, '123'), VGS.Ajax.buildUrl('account/subscriptions', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) }));
				assert.equal(VGS.getSubscriptionsURI(), VGS.Ajax.buildUrl('account/subscriptions', {'response_type': 'code','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) }));
			});
			it('VGS.getProductsURI should return correctly formatted URL for products', function() {
				assert.equal(VGS.getProductsURI('http://random.com', '123' ), VGS.Ajax.buildUrl('account/products', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent('http://random.com') }));
				assert.equal(VGS.getProductsURI(null, '123'), VGS.Ajax.buildUrl('account/products', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) }));
				assert.equal(VGS.getProductsURI(), VGS.Ajax.buildUrl('account/products', {'response_type': 'code','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) }));
			});
			it('VGS.getRedeemVoucherURI should return correctly formatted URL for voucher redeem', function() {
				assert.equal(VGS.getRedeemVoucherURI('vcode','http://random.com', '123' ), VGS.Ajax.buildUrl('account/redeem', {'response_type': 'code','client_id': '123','redirect_uri': encodeURIComponent('http://random.com'), 'voucher_code': 'vcode' }));
				assert.equal(VGS.getRedeemVoucherURI(null, null, '123'), VGS.Ajax.buildUrl('account/redeem', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) }));
				assert.equal(VGS.getRedeemVoucherURI(), VGS.Ajax.buildUrl('account/redeem', {'response_type': 'code','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()) }));
			});
			it('VGS.getPurchaseProductURI should return correctly formatted URL for purchase product', function() {
				assert.equal(VGS.getPurchaseProductURI(10010,'http://random.com', '123' ), VGS.Ajax.buildUrl('flow/checkout', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent('http://random.com'), 'product_id': 10010 }));
				assert.equal(VGS.getPurchaseProductURI(null, null, '123'), VGS.Ajax.buildUrl('flow/checkout', {'response_type': 'code','client_id':'123','redirect_uri': encodeURIComponent(window.location.toString()) }));
				assert.equal(VGS.getPurchaseProductURI(), VGS.Ajax.buildUrl('flow/checkout', {'response_type':'code', 'client_id':setup.client_id, 'redirect_uri':encodeURIComponent(window.location.toString()) }));
			});
			it('VGS.getPurchaseCampaignURI should return correctly formatted URL for purchase product', function() {
				assert.equal(VGS.getPurchaseCampaignURI(10020, 10010, 'vcode'), VGS.Ajax.buildUrl('flow/checkout', {'response_type': 'code','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()), 'campaign_id':10020, 'product_id': 10010, 'voucher_code':'vcode' }));
				assert.equal(VGS.getPurchaseCampaignURI(10020, 10010), VGS.Ajax.buildUrl('flow/checkout', {'response_type': 'code','client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()), 'campaign_id':10020, 'product_id': 10010 }));
			});
			it('VGS.getFlowUrl should return correctly formatted URL for given flow', function() {
				assert.equal(
					VGS.getFlowUrl('checkout', { 'product_id': 10010 }),
					VGS.Ajax.buildUrl('flow/checkout',
						{'product_id': 10010, 'client_id':setup.client_id,'redirect_uri': encodeURIComponent(window.location.toString()), 'response_type': 'code'}));
				assert.equal(
					VGS.getFlowUrl('checkout', { 'client_id': '123', 'redirect_uri': 'http://google.com', 'product_id': 10010 }),
					VGS.Ajax.buildUrl('flow/checkout',
						{'client_id': '123', 'redirect_uri': 'http://google.com', 'product_id': 10010, 'response_type': 'code'}));
			});
		});
	});
});
