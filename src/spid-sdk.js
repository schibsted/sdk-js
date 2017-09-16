/*global require:false, module:false*/
var
    _version = '2.5.0',
    config = require('./spid-config'),
    _initiated = false,
    _session = {},
    util = require('./spid-util.js'),
    spidEvent = require('./spid-event'),
    eventTrigger = require('./spid-event-trigger'),
    persist = require('./spid-persist'),
    cookie = require('./spid-cookie'),
    talk = require('./spid-talk'),
    cbs = require('./spid-callbacks'),
    noop = function () {};

function globalExport(global) {
    global.SPiD = global.SPiD || this;
    global.SPiD.Talk = require('./spid-talk');
}

function init(opts, callback) {
    callback = util.makeAsync(callback || noop);
    config.init(opts);
    if(!config.options().noGlobalExport) {
        globalExport.call(this, window);
    }
    _initiated = true;
     callback();
}

function version() {
    return _version;
}

function hasSession(callback) {
    var key = 'session';
    callback = util.makeAsync(callback || noop);
    cbs.register(key, callback);
    if (cbs.hasPending(key)) {
        return;
    }
    var that = this,
        shouldCacheData = function(err, data) {
            return (!err && data.result) || (config.options().cache && config.options().cache.hasSession);
        },
        getExpiresIn = function(data) {
            if (config.options().cache &&
                config.options().cache.hasSession &&
                config.options().cache.hasSession.ttlSeconds) {
                return config.options().cache.hasSession.ttlSeconds;
            } else {
                return data.expiresIn;
            }
        },
        respond = function(err, data) {
            if(!err && data.result) {
                cookie.tryVarnishCookie(data);
            }
            util.makeAsync(eventTrigger.session)(_session, data);
            _session = data;
            cbs.invokeAll(key, err, data);
        },
        handleResponse = function(err, data) {
            if(shouldCacheData(err, data)) {
                persist.set(data, getExpiresIn(data));
            }
            respond(err, data);
        },
        handleException = function(err, data) {
            if(err && err.type === 'LoginException') {
                spidEvent.fire('SPiD.loginException');
                //Fallback to core
                return talk.request(that.coreEndpoint(), null, {autologin: 1, v: version()}, handleResponse);
            } else if(err) {
                spidEvent.fire('SPiD.error', err);
            }
            handleResponse(err, data);
        };

    var data = persist.get();
    if(data) {
        return respond(null, data);
    }

    talk.request(this.sessionEndpoint(), null, {autologin: 1, v: version()}, handleException);
}

function hasProduct(productId, callback) {
    var key = 'prd' + productId;
    callback = util.makeAsync(callback || noop);
    cbs.register(key, callback);
    if (cbs.hasPending(key)) {
        return;
    }
    var that = this,
        respond = util.makeAsync(function(err, data) {
            spidEvent.fire('SPiD.hasProduct', {
                productId: data.productId,
                result: data.result
            });
            return cbs.invokeAll(key, null, data);
        }),
        cb = function(err, data) {
            if(!err) {
                var opts = config.options();
                var cacheTime = data.result ? opts.refresh_timeout : opts.cache_time_no_asset;
                persist.set(data, cacheTime, key);
            }
            respond(err, data);
        };

    var params = { product_id: productId, v: version() };
    this.hasSession(function (err, data) {
        if (err) {
            return cbs.invokeAll(key, err);
        }
        var cached = persist.get(key);
        if (cached && cached.uuid === data.uuid) {
            return respond(null, cached);
        }
        if (data.sp_id) {
            params.sp_id = data.sp_id;
        }
        talk.request(that.server(), 'ajax/hasproduct.js', params, cb);
    });
}

function hasSubscription(productId, callback) {
    var key = 'sub' + productId;
    callback = util.makeAsync(callback || noop);
    cbs.register(key, callback);
    if (cbs.hasPending(key)) {
        return;
    }
    var that = this,
        respond = util.makeAsync(function(err, data) {
            spidEvent.fire('SPiD.hasSubscription', {
                subscriptionId: data.subscriptionId,
                productId: data.productId,
                result: data.result
            });
            return cbs.invokeAll(key, null, data);
        }),
        cb = function(err, data) {
            if(!err) {
                var opts = config.options();
                var cacheTime = data.result ? opts.refresh_timeout : opts.cache_time_no_asset;
                persist.set(data, cacheTime, key);
            }
            respond(err, data);
        };

    var params = { product_id: productId, v: version() };
    this.hasSession(function (err, data) {
        if (err) {
            return cbs.invokeAll(key, err);
        }
        var cached = persist.get(key);
        if (cached && cached.uuid === data.uuid) {
            return respond(null, cached);
        }
        if (data.sp_id) {
            params.sp_id = data.sp_id;
        }
        talk.request(that.server(), 'ajax/hassubscription.js', params, cb);
    });
}

function clearClientData() {
    persist.clear();
    cookie.clearVarnishCookie();
}

function logout(callback) {
    callback = util.makeAsync(callback || noop);
    var cb = function(err, data) {
        if(data.result) {
            clearClientData();
        }

        if(!err && data.result) {
            spidEvent.fire('SPiD.logout', data);
        }

        callback(err, data);
    };
    talk.request(this.server(), 'ajax/logout.js', {}, cb);
}

function acceptAgreement(callback) {
    var that = this;
    var cb = function() {
        clearClientData();
        that.hasSession(callback);
    };
    talk.request(this.server(),'ajax/acceptAgreement.js', {}, cb);
}

//Async loader
util.makeAsync(function() {
    if(typeof (window.asyncSPiD) === 'function' && !window.asyncSPiD.hasRun) {
        window.asyncSPiD();
        window.asyncSPiD.hasRun = true;
    }
})();

module.exports = {
    initiated: function() {
        return _initiated;
    },
    server: function() {
        return (config.options().https ? 'https' : 'http') + '://' + config.options().server + '/';
    },
    sessionEndpoint: function() {
        return (config.options().https ? 'https' : 'http') + '://' + (config.options().useSessionCluster ? 'session.' + config.options().server + '/rpc/hasSession.js' : config.options().server + '/ajax/hasSession.js');
    },
    coreEndpoint: function() {
        return (config.options().https ? 'https' : 'http') + '://' + config.options().server + '/ajax/hasSession.js';
    },
    hasVarnishCookie: function() {
        return cookie.hasVarnishCookie();
    },
    options: function() {
        return config.options();
    },
    version: version,
    acceptAgreement: acceptAgreement,
    event: spidEvent,
    sessionCache: persist,
    init: init,
    hasSession: hasSession,
    hasProduct: hasProduct,
    hasSubscription: hasSubscription,
    logout: logout
};
