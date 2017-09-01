var config = require('./spid-config'),
    util = require('./spid-util');

function _encode(redirectUri) {
    return encodeURIComponent(redirectUri || window.location.toString());
}

function globalExport(global) {
    global.SPiD_Uri = global.SPiD_Uri || this;
}

function build(path, params) {
    return util.buildUri(config.server(), path, params);
}

function login(redirectUri, clientId) {
    var options = config.options();
    var params = {
        response_type: 'code',
        client_id: clientId || options.client_id,
        redirect_uri: _encode(redirectUri)
    };
    return build('flow/login', params);
}

function auth(redirectUri, clientId) {
    var options = config.options();
    var params = {
        response_type: 'code',
        client_id: clientId || options.client_id,
        redirect_uri: _encode(redirectUri)
    };
    return build('flow/auth', params);
}

function signup(redirectUri, clientId) {
    var options = config.options();
    var params = {
        response_type: 'code',
        client_id: clientId || options.client_id,
        redirect_uri: _encode(redirectUri)
    };
    return build('flow/signup', params);
}

function logout(redirectUri, clientId) {
    var options = config.options();
    var params = {
        response_type: 'code',
        client_id: clientId || options.client_id,
        redirect_uri: _encode(redirectUri)
    };
    return build('logout', params);
}

function account(redirectUri, clientId) {
    var options = config.options();
    var params = {
        response_type: 'code',
        client_id: clientId || options.client_id,
        redirect_uri: _encode(redirectUri)
    };
    return build('account/summary', params);
}

function purchaseHistory(redirectUri, clientId) {
    var options = config.options();
    var params = {
        client_id: clientId || options.client_id,
        redirect_uri: _encode(redirectUri)
    };
    return build('account/purchasehistory', params);
}

function subscriptions(redirectUri, clientId) {
    var options = config.options();
    var params = {
        client_id: clientId || options.client_id,
        redirect_uri: _encode(redirectUri)
    };
    return build('account/subscriptions', params);
}

function products(redirectUri, clientId) {
    var options = config.options();
    var params = {
        client_id: clientId || options.client_id,
        redirect_uri: _encode(redirectUri)
    };
    return build('account/products', params);
}

function redeem(voucherCode, redirectUri, clientId) {
    var options = config.options();
    var params = {
        client_id: clientId || options.client_id,
        redirect_uri: _encode(redirectUri),
        'voucher_code': voucherCode || null
    };
    return build('account/redeem', params);
}

function purchaseProduct(productId, redirectUri, clientId) {
    var options = config.options();
    var params = {
        response_type: 'code',
        'flow': 'payment',
        client_id: clientId || options.client_id,
        redirect_uri: _encode(redirectUri),
        'product_id': productId || null
    };
    return build('flow/checkout', params);
}

function purchaseCampaign(campaignId, productId, voucherCode, redirectUri, clientId) {
    var options = config.options();
    var params = {
        response_type: 'code',
        'flow': 'payment',
        client_id: clientId || options.client_id,
        redirect_uri: _encode(redirectUri),
        'campaign_id': campaignId || null,
        'product_id': productId || null,
        'voucher_code': voucherCode || null
    };
    return build('flow/checkout', params);
}

module.exports = {
    init: function(opts) {
        config.init(opts);

        if(!config.options().noGlobalExport) {
            globalExport.call(this, window);
        }
    },
    build: build,
    login: login,
    auth: auth,
    signup: signup,
    logout: logout,
    account: account,
    purchaseHistory: purchaseHistory,
    subscriptions: subscriptions,
    products: products,
    redeem: redeem,
    purchaseProduct: purchaseProduct,
    purchaseCampaign: purchaseCampaign
};
