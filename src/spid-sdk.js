;(function(exports) {

    var
        _version = '<%= pkg.version %>',
        _defaults = {
            server: null,
            client_id: null,

            logging: false,
            prod: true,
            https: true,
            storage: 'localstorage',
            timeout: 15000,
            refresh_timeout: 900000,
            varnish_expiration: null
        },
        _options = {},
        _initiated = false,
        _session = {};

    function init(options, callback) {
        _options = this.Util.copy(options, _defaults);
        if(!_options['server']) { throw new TypeError('[SPiD] server parameter is required'); }
        if(!_options['client_id']) { throw new TypeError('[SPiD] client_id parameter is required'); }

        //Set minimum refresh timeout
        if(_options.refresh_timeout <= 60000) {
            _options.refresh_timeout = 60000;
        }

        _initiated = true;
        if(callback) {
            callback();
        }
    }

    function hasSession(callback) {
        callback = callback || function() {};
        var that = this,
            respond = function(err, data) {
                if(that.EventTrigger) {
                    that.EventTrigger.session(_session, data);
                }
                _session = data;
                callback(err, data);
            },
            handleResponse = function(err, data) {
                if(that.Persist && !err && !!data.result) {
                    that.Persist.set("Session", data, data.expiresIn);
                }
                respond(err, data);
            },
            handleException = function(err, data) {
                if(err && err.type === "LoginException") {
                    if(that.Event) {
                        that.Event.fire('SPiD.loginException');
                    }
                    //Fallback to core
                    return that.Talk.request(that.coreEndpoint(), null, {autologin:1}, handleResponse);
                } else if(err && that.EventTrigger) {
                    that.EventTrigger.sessionError(err);
                }
                handleResponse(err, data);
            };

        if(this.Persist) {
            var data = this.Persist.get("Session");
            if(data) {
                _session = data;
                return respond(null, data);
            }
        }
        this.Talk.request(this.sessionEndpoint(), null, {autologin:1}, handleException);
    }

    function hasProduct(productId, callback) {
        var cache = this.Persist,
            util = this.Util,
            that = this;
        callback = callback || function() {};
        if(cache) {
            var cacheVal = cache.get('prd_{id}'.replace('{id}', productId));
            if(cacheVal && (cacheVal.refreshed + _options.refresh_timeout) > util.now()) {
                return callback(null, cacheVal);
            }
        }
        var cb = function(err, data) {
            if(cache && !err && !!data.result) {
                data.refreshed = util.now();
                cache.set('prd_{id}'.replace('{id}', productId), data);
            }
            if(that.Event && !err && !!data.result) {
                that.Event.fire('SPiD.hasProduct', {
                    productId: productId,
                    result: data.result
                });
            }
            callback(err, data);
        };
        this.Talk.request(this.server(), 'ajax/hasproduct.js', {product_id: productId}, cb);
    }

    function hasSubscription(productId, callback) {
        var cache = this.Persist,
            util = this.Util,
            that = this;
        callback = callback || function() {};
        if(cache) {
            var cacheVal = cache.get('sub_{id}'.replace('{id}', productId));
            if(cacheVal && (cacheVal.refreshed + _options.refresh_timeout) > util.now()) {
                return callback(null, cacheVal);
            }
        }
        var cb = function(err, data) {
            if(cache && !err && !!data.result) {
                data.refreshed = util.now();
                cache.set('sub_{id}'.replace('{id}', productId), data);
            }
            if(that.Event && !err && !!data.result) {
                that.Event.fire('SPiD.hasSubscription', {
                    subscriptionId: productId,
                    result: data.result
                });
            }
            callback(err, data);
        };
        this.Talk.request(this.server(), 'ajax/hassubscription.js', {product_id: productId}, cb);
    }

    function setTraits(traits, callback) {
        callback = callback || function() {};
        this.Talk.request(this.server(), 'ajax/traits.js', {t: traits}, callback);
    }

    function logout(callback) {
        var that = this;
        var cb = function(err, data) {
            if(data.result) {
                that.Persist.clear("Session");
            }
            if(callback) {
                callback(err, data);
            }
        };
        this.Talk.request(this.server(), 'ajax/logout.js', {}, cb);
    }


    exports.SPiD = {
        version: function() {
            return _version;
        },
        options: function() {
            return _options;
        },
        initiated: function() {
            return _initiated;
        },
        server: function() {
            return (_options.https ? 'https' : 'http')+'://'+_options.server+'/';
        },
        sessionEndpoint: function() {
            return (_options.https ? 'https' : 'http') + '://' + (_options.prod ? 'session.'+_options.server+'/rpc/hasSession.js' : _options.server+'/ajax/hasSession.js');
        },
        coreEndpoint: function() {
            return (_options.https ? 'https' : 'http') + '://' + _options.server+'/ajax/hasSession.js';
        },
        init: init,
        hasSession: hasSession,
        hasProduct: hasProduct,
        hasSubscription: hasSubscription,
        setTraits: setTraits,
        logout: logout
    };

    //Async loader
    window.setTimeout(function() {
        if (typeof (window.asyncSPiD) === 'function' && !window.asyncSPiD.hasRun) {
            window.asyncSPiD();
            window.asyncSPiD.hasRun = true;
        }
    }, 0);

}(window));