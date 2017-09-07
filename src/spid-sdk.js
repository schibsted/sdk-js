/*global require:false, module:false*/
var
    _version = '<%= pkg.version %>',
    config = require('./spid-config'),
    _initiated = false,
    _session = {},
    util = require('./spid-util.js'),
    spidEvent = require('./spid-event'),
    eventTrigger = require('./spid-event-trigger'),
    persist = require('./spid-persist'),
    cookie = require('./spid-cookie'),
    cache = require('./spid-cache'),
    talk = require('./spid-talk'),
    noop = function () {};

function globalExport(global) {
    global.SPiD = global.SPiD || this;
    global.SPiD.Talk = require('./spid-talk');
}

function init(opts, callback) {
    config.init(opts);
    if(!config.options().noGlobalExport) {
        globalExport.call(this, window);
    }
    _initiated = true;
    if(callback) {
        callback();
    }
}

function hasSession(callback) {
    callback = callback || noop;
    var that = this,
        shouldCacheData = function(err, data) {
            return (!err && !!data.result) || (config.options().cache && config.options().cache.hasSession);
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
        respond = util.makeAsync(function(err, data) {
            if(!err && !!data.result) {
                cookie.tryVarnishCookie(data);
            }
            eventTrigger.session(_session, data);
            _session = data;
            callback(err, data);
        }),
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
                return talk.request(that.coreEndpoint(), null, {autologin: 1}, handleResponse);
            } else if(err) {
                spidEvent.fire('SPiD.error', err);
            }
            handleResponse(err, data);
        };

    var data = persist.get();
    if(data) {
        return respond(null, data);
    }

    talk.request(this.sessionEndpoint(), null, {autologin: 1}, handleException);
}

function hasProduct(productId, callback) {
    var that = this;
    callback = util.makeAsync(callback || noop);
    if(cache.enabled()) {
        var cacheVal = cache.get('prd_' + productId);
        if(cacheVal && (cacheVal.refreshed + config.options().refresh_timeout) > util.now()) {
            return callback(null, cacheVal);
        }
    }
    var cb = function(err, data) {
        if(cache.enabled() && !err && !!data.result) {
            data.refreshed = util.now();
            cache.set('prd_' + productId, data);
        }
        if(!err && !!data.result) {
            spidEvent.fire('SPiD.hasProduct', {
                productId: productId,
                result: data.result
            });
        }
        callback(err, data);
    };
    var params = {product_id: productId};
    this.hasSession(function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        if (data.sp_id) {
            params.sp_id = data.sp_id;
        }
        talk.request(that.server(), 'ajax/hasproduct.js', params, cb);
    });
}

function hasSubscription(productId, callback) {
    var that = this;
    callback = util.makeAsync(callback || noop);
    if(cache.enabled()) {
        var cacheVal = cache.get('sub_' + productId);
        if(cacheVal && (cacheVal.refreshed + config.options().refresh_timeout) > util.now()) {
            return callback(null, cacheVal);
        }
    }
    var cb = function(err, data) {
        if(cache.enabled() && !err && !!data.result) {
            data.refreshed = util.now();
            cache.set('sub_' + productId, data);
        }
        if(!err && !!data.result) {
            spidEvent.fire('SPiD.hasSubscription', {
                subscriptionId: productId,
                result: data.result
            });
        }
        callback(err, data);
    };
    var params = {product_id: productId};
    this.hasSession(function (err, data) {
        if (err) {
            callback(err);
            return;
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
    var cb = function(err, data) {
        if(data.result) {
            clearClientData();
        }

        if(!err && !!data.result) {
            spidEvent.fire('SPiD.logout', data);
        }

        if(callback) {
            callback(err, data);
        }
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
    version: function() {
        return _version;
    },
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
    acceptAgreement: acceptAgreement,
    event: spidEvent,
    sessionCache: persist,
    init: init,
    hasSession: hasSession,
    hasProduct: hasProduct,
    hasSubscription: hasSubscription,
    logout: logout
};
