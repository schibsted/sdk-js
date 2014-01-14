/*global SPiD:false*/
;(function(exports) {

    function server() {
        var options = exports.options();
        return (options.https ? 'https' : 'http')+'://'+options.server+'/';
    }

    function session() {
        var options = exports.options();
        return (options.https ? 'https' : 'http') + '://' + (options.prod ? 'session.'+options.server+'/rpc/hasSession.js' : options.server+'/ajax/hasSession.js');
    }

    function build(path, params) {
        var p = [];
        for(var key in params) {
            if(params[key]) {
                p.push(key+'='+params[key]);
            }
        }
        var url = server()+path+'?'+p.join('&');
        exports.Log.info('SPiD.Uri.build() built {u}'.replace('{u}', url));
        return url;
    }

    function login(redirect_uri, client_id) {
        var options = exports.options();
        var params = {
            'response_type': 'code',
            'flow': 'signup',
            'client_id': client_id || options.client_id,
            'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
        };
        return build('login', params);
    }

    function signup(redirect_uri, client_id) {
        var options = exports.options();
        var params = {
            'response_type': 'code',
            'flow': 'signup',
            'client_id': client_id || options.client_id,
            'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
        };
        return build('signup', params);
    }

    function logout(redirect_uri, client_id) {
        var options = exports.options();
        var params = {
            'response_type': 'code',
            'client_id': client_id || options.client_id,
            'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
        };
        return build('logout', params);
    }

    function account(redirect_uri, client_id) {
        var options = exports.options();
        var params = {
            'client_id': client_id || options.client_id,
            'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
        };
        return build('account/summary', params);
    }

    function purchaseHistory(redirect_uri, client_id) {
        var options = exports.options();
        var params = {
            'client_id': client_id || options.client_id,
            'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
        };
        return build('account/purchasehistory', params);
    }

    function subscriptions(redirect_uri, client_id) {
        var options = exports.options();
        var params = {
            'client_id': client_id || options.client_id,
            'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
        };
        return build('account/subscriptions', params);
    }

    function products(redirect_uri, client_id) {
        var options = exports.options();
        var params = {
            'client_id': client_id || options.client_id,
            'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
        };
        return build('account/products', params);
    }

    function redeem(voucher_code, redirect_uri, client_id) {
        var options = exports.options();
        var params = {
            'client_id': client_id || options.client_id,
            'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString()),
            'voucher_code': voucher_code || null
        };
        return build('account/redeem', params);
    }

    function purchaseProduct(product_id, redirect_uri, client_id) {
        var options = exports.options();
        var params = {
            'response_type': 'code',
            'flow': 'payment',
            'client_id': client_id || options.client_id,
            'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString()),
            'product_id': product_id || null
        };
        return build('auth/start', params);
    }

    function purchaseCampaign(campaign_id, product_id, voucher_code, redirect_uri, client_id) {
        var options = exports.options();
        var params = {
            'response_type': 'code',
            'flow': 'payment',
            'client_id': client_id || options.client_id,
            'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString()),
            'campaign_id': campaign_id || null,
            'product_id': product_id || null,
            'voucher_code': voucher_code || null
        };
        return build('auth/start', params);
    }

    exports.Uri = {
        server: server,
        session: session,
        build: build,
        login: login,
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
}(SPiD));