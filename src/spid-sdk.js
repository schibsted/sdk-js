(function (factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        window.VGS = window.VGS || factory();
    }
})(function () {
    var VGS = {
        version: '<%= pkg.version %>',
        client_id: false,
        redirect_uri: window.location.toString(),

        _session: null,
        _sessionInitiated: false,
        _userStatus: 'unknown', // or 'connected'

        _logging: false,
        _prod: true,

        _varnish_expiration: false,
        _refresh_timeout: 900000,
        _timeout: 5000,
        _cache: true,
        _cache_notloggedin: false,
        _cacheLastReset: (new Date()).getTime(),
        _track_throttle: 1,
        _track_anon_opt_out: false,
        _track_opt_out: false,
        _track_custom_data: null,

        // pending callbacks for VGS.getLoginStatus() calls
        callbacks: [],
        cachedResponses: [],

        /**
         * Generates a weak random ID.
         *
         * @access private
         * @return {String} a random ID
         */
        guid: function () {
            return 'f' + (Math.random() * (1 << 30)).toString(16).replace('.', '');
        },

        /**
         * Copies things from source into target.
         *
         * @access private
         * @param target {Object} the target object where things will be copied into
         * @param source {Object} the source object where things will be copied from
         * @param overwrite {Boolean} indicate if existing items should be overwritten
         * @param tranform {function} [Optional], transformation function for each item
         */
        copy: function (target, source, overwrite, transform) {
            for (var key in source) {
                if (overwrite || typeof target[key] === 'undefined') {
                    target[key] = transform ? transform(source[key])
                        : source[key];
                }
            }
            return target;
        },

        /**
         * @access public
         * @param options {Object}
         *
         * client_id          | String  | Your client_id.                  | *Mandatory* | `null`
         * server             | String  | Path to the SPiD server.         | *Mandatory* | `null`
         * cookie             | Boolean | `true` to enable cookie support. | *Optional*  | `true`
         * logging            | Boolean | `true` to enable logging.        | *Optional*  | `false`
         * session            | Object  | Use specified session object.    | *Optional*  | `null`
         * status             | Boolean | `true` to fetch fresh status.    | *Optional*  | `false`
         * prod               | Boolean | `true` to fetch from LIVE server | *Optional*  | `true`
         * varnish_expiration | Integer | Varnish cookie expiration        | *Optional*  | Same as session expiration (in secconds)
         * timeout            | Integer | Connection response timeout      | *Optional*  | `5000` // miliseconds (5 seconds)
         * refresh_timeout    | Integer | Refresh session timeout          | *Optional*  | `900000` // miliseconds (15 minutes)
         * cache              | Boolean | Response caching.                | *Optional*  | `true` // Uses refresh_timeout for caching refresh
         * cache_notloggedin  | Boolean | Cache user not logged in status  | *Optional*  | `false` // Uses refresh_timeout for caching refresh
         * track_throttle     | Float   | Use with tracker. Between 0-1    | *Optional*  | 1
         * track_anon_opt_out | Boolean | Use with tracker.                | *Optional*  | `false`
         * track_custom_data  | String  | Custom track data                | *Optional*  | `null`
         */
        init: function (options) {
            var valid = true;
            // only need to list values here that do not already have a falsy default
            options = VGS.copy(options || {}, {
                cache: VGS._cache,
                cache_notloggedin: VGS._cache_notloggedin,
                prod: VGS._prod,
                varnish_expiration: VGS._varnish_expiration,
                refresh_timeout: VGS._refresh_timeout,
                logging: VGS._logging,
                timeout: VGS._timeout,
                track_throttle: VGS._track_throttle,
                track_custom_data: VGS._track_custom_data,
                cookie: true,
                status: false,
                https: true
            });
            VGS._logging = options.logging;
            // disable logging if told to do so, but only if the url doesnt have
            // the token to turn it on. this allows for easier debugging of third
            // party sites even if logging has been turned off.
            if ((!options.logging && window.location.toString().indexOf('vgs_debug=1') < 0) || !window.console) {
                VGS._logging = false;
            }
            // Hardlimit to 1 minute
            if (options.refresh_timeout >= 60000) {
                VGS._refresh_timeout = options.refresh_timeout;
            }

            VGS.Cookie.enabled = options.cookie;
            VGS._prod = options.prod;
            VGS._varnish_expiration = options.varnish_expiration;
            VGS._cache = options.cache;
            VGS._cache_notloggedin = options.cache_notloggedin;
            VGS.Ajax.timeoutPeriod = options.timeout;
            VGS._track_throttle = options.track_throttle;
            VGS._track_anon_opt_out = options.track_anon_opt_out;
            VGS._track_custom_data = options.track_custom_data;
            VGS.log('Default connection timeout set to ("' + VGS.Ajax.timeoutPeriod + '")', 'log');

            if (typeof (options.client_id) === 'undefined') {
                VGS.log('VGS.init: client_id is missing!', 'error');
                valid = false;
            }
            if (typeof (options.server) === 'undefined') {
                VGS.log('VGS.init: server is missing!', 'error');
                valid = false;
            }
            if (!valid) {
                return;
            }
            VGS.client_id = options.client_id;
            VGS.Ajax.serverUrl = (options.https ? 'https' : 'http') + '://' + options.server + '/';
            if (VGS._prod) {
                VGS.Ajax.sessionUrl = (options.https ? 'https' : 'http') + '://session.' + options.server + '/rpc/hasSession.js';
                VGS.Cookie.name = 'vgs_js_' + VGS.client_id;
            } else {
                VGS.Ajax.sessionUrl = (options.https ? 'https' : 'http') + '://' + options.server + '/ajax/hasSession.js';
                VGS.Cookie.name = 'vgs_js_test_' + VGS.client_id;
            }
            VGS.log('VGS.init("' + VGS.client_id + ', ' + VGS.Ajax.serverUrl + '")', 'log');

            var session = null, cookie = null;
            if (VGS.Cookie.enabled) {
                // Check cookie for client session
                cookie = VGS.Cookie.get();
            }
            if (options.session != null) {
                VGS.log('VGS.init: Session object provided! Expires in ' + options.session.expiresIn + ' seconds', 'log');
                session = options.session;
            } else if (cookie != null) {
                VGS.log('VGS.init: Cookie set! Expires in ' + cookie.expiresIn + ' seconds', 'log');
                session = cookie;
                VGS.Auth._loadState = 'loaded'; // Cookie loaded! Set state to loaded it so it can be auto-refreshed
            } else {
                VGS.log('VGS.init: No session set! Status unknown.', 'log');
            }
            if (typeof (session) === 'object' && session != null) {
                // Update clientside session expiration
                var now = parseInt(VGS.Ajax.now(), 10);
                var expiresInMilliseconds = parseInt((session.expiresIn * 1000), 10);
                if (typeof (session.clientTime) !== 'undefined') {
                    // Updates session expiration based on client time
                    var newExpiresIn = parseInt(((session.clientTime + expiresInMilliseconds) - now) / 1000, 10);
                    session.expiresIn = (typeof newExpiresIn === 'number' && newExpiresIn > 0) ? newExpiresIn : session.expiresIn;
                    VGS.log('VGS.init: Session expiration updated to ' + session.expiresIn + ' seconds', 'log');
                }
                // set the session
                VGS.Auth.setSession(session, (typeof (session.userStatus) !== 'undefined') ? session.userStatus : 'unknown');
                if (options.status === true) {
                    VGS.getLoginStatus();
                }
            } else {
                // load a fresh session if requested
                if (options.status || session === null) {
                    VGS.getLoginStatus();
                }
            }
        },
        processing: function (status) {
            VGS.log('VGS.processing("' + status + '")', 'log');
        },
        log: function (message, level) {
            if (VGS._logging) {
                if (level === 'error') {
                    if (VGS.Event) {
                        if (typeof (message) === 'string') {
                            message = {'type': 'default', 'description': message, 'code': 400};
                        }
                        VGS.Event.fire('VGS.error', message);
                    }
                } else {
                    if (window.console) {
                        window.console.log(message);
                    }
                }
            }
            if (VGS.Event) {
                VGS.Event.fire('VGS.log', message);
            }
        },
        Ajax: {
            connectionId: -1,
            connections: [],
            interval: null,
            intervalPeriod: 300, // strongly suggested that you increase this to 1000 if debugging!!
            pollingDebugCount: 0,
            pollingDebugFirst: true,
            pollingDebugThrottle: 100, // show a debug message after every this many polling iterations
            requestQueue: [],
            scriptObject: null,
            serverUrl: '',
            sessionUrl: '',
            timeoutPeriod: 5000, // if a connection goes on for longer than this many milliseconds, then timeout
            version: '1.0',

            getFragmentFromUrl: function (url) {
                url = url || window.location.href;
                VGS.log('VGS.Ajax.getFragmentFromUrl("' + url + '")', 'log');
                var fragment = url.replace(/^[^#]*#?(.*)$/, '$1');
                VGS.log('-- complete fragment: ' + fragment + '', 'log');
                return fragment;
            },
            buildConnectionUrl: function (query) {
                VGS.log('VGS.Ajax.buildConnectionUrl("' + query + '")', 'log');
                VGS.Ajax.connectionId = VGS.Ajax.connections.length;
                var url = ((query.substr(0, 4) === 'http') ? query : VGS.Ajax.serverUrl + query) + '&connectionId=' + VGS.Ajax.connectionId + '&client_id=' + VGS.client_id + '&redirect_uri=' + (encodeURIComponent(VGS.redirect_uri));
                VGS.log('-- built url: [' + url + ']', 'log');
                VGS.Ajax.requestQueue[VGS.Ajax.requestQueue.length] = new VGS.Ajax.requestQueueNode(url);
            },
            buildUrl: function (path, params) {
                var p = [];
                for (var key in params) {
                    if (params[key]) {
                        p.push(key + '=' + params[key]);
                    }
                }
                var url = VGS.Ajax.serverUrl + path + '?' + p.join('&');
                VGS.log('-- built url: [' + url + ']', 'log');
                return url;
            },
            createScriptObject: function (source) {
                VGS.log('VGS.Ajax.createScriptObject("' + source + '")', 'log');
                VGS.Ajax.scriptObject = document.createElement('SCRIPT');
                VGS.Ajax.scriptObject.src = source;
                VGS.Ajax.scriptObject.type = 'text/javascript';
                VGS.Ajax.scriptObject.onerror = VGS.Ajax.loadingError;
                var head = document.getElementsByTagName('HEAD')[0];
                head.appendChild(VGS.Ajax.scriptObject);
            },
            failure: function (errorMsg) {
                VGS.log('VGS.Ajax.failure("' + errorMsg + '")', 'log');
                if (VGS.Event) {
                    VGS.Event.fire('VGS.error', {'type': 'communication', 'code': 503, 'description': errorMsg});
                }
            },
            flushQueue: function () {
                VGS.log('VGS.Ajax.flushQueue()', 'log');
                VGS.Ajax.requestQueue.length = 0;
            },
            makeRequest: function () {
                VGS.log('VGS.Ajax.makeRequest()', 'log');
                if (VGS.Ajax.requestQueue.length > 0) {
                    VGS.processing('on');
                    var connectionCode = VGS.Ajax.requestQueue[0].connectionUrl;
                    parent.triggerResponse = null;
                    VGS.Ajax.createScriptObject(connectionCode);
                    VGS.Ajax.serverTimeoutTime = VGS.Ajax.now() + VGS.Ajax.timeoutPeriod;
                }
            },
            now: function () {
                VGS.log('VGS.Ajax.now()', 'log');
                return (new Date()).getTime();
            },
            poll: function () {
                VGS.log('VGS.Ajax.poll()', 'log');
                if (VGS.Ajax.pollingDebugCount === VGS.Ajax.pollingDebugThrottle) {
                    VGS.log('-- poll [' + VGS.Ajax.now() + '] (x' + VGS.Ajax.pollingDebugCount + ')', 'log');
                    VGS.Ajax.pollingDebugCount = 0;
                } else if (VGS.Ajax.pollingDebugFirst) {
                    VGS.log('-- poll [' + VGS.Ajax.now() + ']', 'log');
                    VGS.Ajax.pollingDebugFirst = false;
                    VGS.Ajax.pollingDebugCount = 0;
                }
                VGS.Ajax.pollingDebugCount++;
                if (VGS.Ajax.serverTimeoutTime) {
                    if (VGS.Ajax.serverTimeoutTime <= VGS.Ajax.now()) {
                        VGS.Ajax.stopPolling();
                        VGS.Ajax.failure('Server Timed Out');
                    } else if (parent.triggerResponse != null) {
                        parent.triggerResponse();
                    }
                } else if (VGS.Ajax.requestQueue.length > 0) {
                    // Queue size validation in order to avoid abuse and overload of the platform. Allow max 10 requests in the queue.
                    if (VGS.Ajax.requestQueue.length > 10) {
                        VGS.Ajax.failure('Queue size too big: ' + VGS.Ajax.requestQueue.length + ' requests! In order to avoid abuse and overload of the platform we allow max 10 requests in the queue.');
                        VGS.Ajax.stopPolling();
                    } else {
                        VGS.Ajax.makeRequest();
                    }
                } else {
                    VGS.Ajax.stopPolling();
                }
            },
            removeScriptObject: function () {
                VGS.log('VGS.Ajax.removeScriptObject()', 'log');
                VGS.Ajax.scriptObject.parentNode.removeChild(VGS.Ajax.scriptObject);
                VGS.Ajax.scriptObject = null;
            },
            requestQueueNode: function (url) {
                VGS.log('VGS.Ajax.requestQueueNode("' + url + '")', 'log');
                this.connectionUrl = url;
                this.requestSent = false;
            },
            responseReceived: function () {
                VGS.log('VGS.Ajax.responseReceived()', 'log');
                VGS.processing('off');
                VGS.Ajax.requestQueue.shift();
                VGS.Ajax.serverTimeoutTime = null;
                VGS.Ajax.removeScriptObject();
            },
            send: function (query) {
                VGS.log('VGS.Ajax.send("' + query + '")', 'log');
                VGS.Ajax.buildConnectionUrl(query);
                VGS.Ajax.startPolling();
            },
            startPolling: function () {
                VGS.log('VGS.Ajax.startPolling()', 'log');
                if (VGS.Ajax.interval == null) {
                    VGS.log('polling (re)started');
                    VGS.Ajax.connections[VGS.Ajax.connectionId] = null;
                    VGS.Ajax.poll();
                    VGS.Ajax.interval = window.setInterval(function () {
                        VGS.Ajax.connections[VGS.Ajax.connectionId] = null;
                        VGS.Ajax.poll();
                    }, VGS.Ajax.intervalPeriod);
                }
            },
            stopPolling: function () {
                VGS.log('VGS.Ajax.stopPolling()', 'log');
                VGS.Ajax.serverTimeoutTime = null;
                VGS.Ajax.flushQueue();
                if (VGS.Ajax.interval) {
                    window.clearInterval(VGS.Ajax.interval);
                }
                VGS.Ajax.interval = null;
            },
            success: function (response) {
                if (response.success) {
                    VGS.log('SUCCESS: ' + response.success, 'log');
                } else if (response.error) {
                    VGS.log('ERROR: ' + response.error, 'log');
                    if (VGS.Event) {
                        VGS.Event.fire('VGS.error', {'type': 'response', 'code': 400, 'description': response.error});
                    }
                }
            },
            loadingError: function () {
                VGS.log('VGS.Ajax.loadingError()', 'log');
                VGS.Ajax.stopPolling();
                VGS.Ajax.failure('Server Timed Out');
            }
        },
        Cookie: {
            enabled: true,
            name: '',
            domain: '',
            decode: function (value) {
                return JSON.parse(window.unescape(value));
            },
            encode: function (value) {
                return window.escape(JSON.stringify(value));
            },
            set: function (session) {
                VGS.log('VGS.Cookie.set()', 'log');
                if (session) {
                    VGS.Cookie.setRaw(VGS.Cookie.encode(session), session.expiresIn, session.baseDomain, VGS.Cookie.name);
                    // Set sp_id cookie
                    if (session.sp_id) {
                        if (!VGS._varnish_expiration) {
                            VGS._varnish_expiration = session.expiresIn;
                        }
                        VGS.Cookie.setRaw(session.sp_id, VGS._varnish_expiration, session.baseDomain, 'SP_ID');
                    }
                } else {
                    VGS.Cookie.clear();
                }
                return session;
            },
            get: function () {
                VGS.log('VGS.Cookie.get() -- ' + VGS.Cookie.name, 'log');
                var cookie, session, name, carray = null;
                name = VGS.Cookie.name + '=';
                carray = document.cookie.split(';');
                for (var i = 0; i < carray.length; i++) {
                    var c = carray[i];
                    while (c.charAt(0) === ' ') {
                        c = c.substring(1, c.length);
                    }
                    if (c.indexOf(name) === 0) {
                        cookie = c.substring(name.length, c.length);
                    }
                }
                if (cookie) {
                    // url encoded session stored as "sub-cookies"
                    session = VGS.Cookie.decode(cookie);
                    // decodes as a string, convert to a number
                    session.expiresIn = parseInt(session.expiresIn, 10);
                    session.clientTime = parseInt(session.clientTime, 10);
                    // capture base_domain for use when we need to clear
                    VGS.Cookie.domain = session.baseDomain;
                }
                return session;
            },
            /**
             * Helper function to set cookie value.
             *
             * @access private
             * @param val    {String} the string value (should already be encoded)
             * @param ts     {Number} a unix timestamp denoting expiry
             * @param domain {String} optional domain for cookie
             * @param name   {String} optional name for cookie
             */
            setRaw: function (val, ts, domain, name) {
                VGS.log('VGS.Cookie.setRaw(val, ' + ts + ', ' + domain + ', ' + name + ')', 'log');
                var expires = '';
                if (typeof (name) === 'undefined') {
                    name = VGS.Cookie.name;
                }
                // capture domain for use when we need to clear
                VGS.Cookie.domain = domain;

                if (typeof (ts) !== 'undefined') {
                    var date = new Date();
                    date.setTime(date.getTime() + (ts * 1000));
                    expires = '; expires=' + date.toGMTString();

                    document.cookie = name + '=' + val + expires + '; path=/' + (domain ? '; domain=.' + domain : '');
                } else {
                    VGS.log('VGS.Cookie.setRaw() expiration is invalid:' + ts + ', no cookie set)', 'log');
                }
            },
            clear: function () {
                VGS.log('VGS.Cookie.clear() ' + VGS.Cookie.name, 'log');
                VGS.Cookie.setRaw('', 0, VGS.Cookie.domain);
                VGS.log('VGS.Cookie.clear() SP_ID', 'log');
                VGS.Cookie.setRaw('', 0, VGS.Cookie.domain, 'SP_ID');
            }
        },
        Auth: {
            valid: false,
            logout: function (cb) {
                VGS.log('VGS.Auth.logout', 'log');
                VGS.Auth.setSession(null, 'unknown');
                var id = '';
                if (typeof cb === 'function') {
                    id = VGS.guid();
                    VGS.callbacks[id] = cb;
                }
                // finally make the call to login status
                VGS.Ajax.send('ajax/logout.js?callback=' + id);
            },
            validate: function (response) {
                VGS.log('VGS.Auth.validate', 'log');
                VGS.Auth.valid = false;
                VGS._track_opt_out = response.tracking ? false : true;
                VGS.log('VGS._track_opt_out: ' + VGS._track_opt_out, 'log');

                // Trigger visitor events
                VGS.log(response, 'log');
                if (response.result) {
                    if (typeof (response.visitor) !== 'undefined') {
                        /**
                         * Fired when there is a identified visitor.
                         *
                         * @event auth.visitor
                         */
                        VGS.Event.fire('auth.visitor', response.visitor);
                    }
                    VGS.Auth.valid = response.result;
                    VGS.log('SUCCESS: ' + VGS.Auth.valid, 'log');
                    if (VGS.Auth.valid && typeof (response.userId) !== 'undefined') {
                        VGS.log('-- valid session, allow login', 'log');
                        VGS.Auth.setSession(response, (typeof (response.userStatus) !== 'undefined') ? response.userStatus : 'unknown');
                    } else {
                        VGS.log('-- invalid session, do not allow login', 'log');
                        VGS.Auth.setSession(null, 'unknown');
                    }
                } else if (response.error && response.response) {
                    if (typeof (response.response.visitor) !== 'undefined') {
                        /**
                         * Fired when there is a identified visitor.
                         *
                         * @event auth.visitor
                         */
                        VGS.Event.fire('auth.visitor', response.response.visitor);
                    }
                    // There is an error and a response indicating the session status
                    if (response.error.type === 'LoginException') {
                        VGS.log(response.error, 'log');
                        VGS.Event.fire('VGS.loginException', response);
                    } else {
                        VGS.log(response.error, 'error');
                        if (VGS._cache_notloggedin) {
                            // Override expiresIn to VGS._refresh_timeout
                            response.response.expiresIn = parseInt(VGS._refresh_timeout, 10) / 1000;
                            VGS.Auth.setSession(response.response, 'unknown');
                        } else {
                            VGS.Auth.setSession(null, 'unknown');
                        }
                    }
                } else {
                    VGS.log(response, 'error');
                    VGS.Auth.setSession(null, 'unknown');
                }
            },
            setSession: function (session, status) {
                VGS.log('VGS.Auth.setSession (' + (typeof session) + ' , ' + status + ')', 'log');
                // detect special changes before changing the internal session
                var newSession = false;
                var oldSession = false;
                if (typeof (session) === 'object' && session !== null && session.hasOwnProperty('userId')) {
                    newSession = true;
                }
                if (typeof (VGS._session) === 'object' && VGS._session !== null && VGS._session.hasOwnProperty('userId')) {
                    oldSession = true;
                }

                var login = (!oldSession && newSession),
                    logout = (oldSession && !newSession),
                    notLoggedin = (!oldSession && !newSession),
                    both = (oldSession && newSession && VGS._session.id !== session.id),
                    sessionChange = login || logout || (oldSession && newSession && VGS._session.sig !== session.sig) || notLoggedin,
                    statusChange = status !== VGS._userStatus;
                var response = {
                    session: session,
                    status: status
                };
                if (typeof (session) === 'object' && session !== null) {
                    session.clientTime = parseInt(VGS.Ajax.now(), 10);
                }

                VGS._session = session;
                VGS._userStatus = status;

                if (sessionChange && VGS.Cookie.enabled) {
                    VGS.Cookie.set(session);
                }

                if (notLoggedin) {
                    /**
                     * Fired when there is no session.
                     *
                     * @event auth.notLoggedin
                     */
                    VGS.Event.fire('auth.notLoggedin', response);
                }
                if (statusChange) {
                    /**
                     * Fired when the status changes.
                     *
                     * @event auth.statusChange
                     */
                    VGS.Event.fire('auth.statusChange', response);
                }
                if (logout || both) {
                    /**
                     * Fired when a logout action is performed.
                     *
                     * @event auth.logout
                     */
                    VGS.Event.fire('auth.logout', response);
                }
                if (login || both) {
                    /**
                     * Fired when a login action is performed.
                     *
                     * @event auth.login
                     */
                    VGS.Event.fire('auth.login', response);
                }
                if (sessionChange) {
                    /**
                     * Fired when the session changes. This includes a session
                     * being refreshed, or a login or logout action.
                     *
                     * @event auth.sessionChange
                     */
                    VGS.Event.fire('auth.sessionChange', response);
                }
                if (both) {
                    /**
                     * Fired when the user changes.
                     *
                     * @event auth.sessionChange
                     */
                    VGS.Event.fire('auth.userChange', response);
                }
                if (newSession && !VGS._sessionInitiated) {
                    VGS._sessionInitiated = true;
                    /**
                     * Fired when the session is successfully initiated for the first time
                     * @event auth.sessionInit
                     */
                    VGS.Event.fire('auth.sessionInit', response);
                }

                // re-setup a timer to refresh the session if needed. we only do this if
                // VGS.Auth._loadState exists, indicating that the application relies on the
                // JS to get and refresh session information (vs managing it themselves).
                if (VGS.Auth._refreshTimer) {
                    window.clearTimeout(VGS.Auth._refreshTimer);
                    delete VGS.Auth._refreshTimer;
                }
                if (VGS.Auth._loadState && session && session.expiresIn) {
                    // refresh every 15 minutes. we don't rely on the expires time because
                    // then we would also need to rely on the local time available in JS
                    // which is often incorrect.
                    VGS.log('--  refresh every ' + VGS._refresh_timeout + ' milliseconds', 'log');
                    VGS.Auth._refreshTimer = window.setTimeout(function () {
                        VGS.getLoginStatus(null, true); // force refresh
                    }, VGS._refresh_timeout);
                }
                return response;
            }
        },
        getSession: function () {
            VGS.log('VGS.getSession', 'log');
            return VGS._session;
        },
        getLoginStatus: function (cb, force) {
            VGS.log('VGS.getLoginStatus(' + cb + ',' + force + ')', 'log');
            if (!VGS.client_id) {
                VGS.log('ERROR: VGS.getLoginStatus() called before calling VGS.init().', 'error');
                return;
            }
            force = (force === true);
            // we either invoke the callback right away if the status has already been
            // loaded, or queue it up for when the load is done.
            var id;
            if (cb) {
                if (!force && VGS.Auth._loadState === 'loaded') {
                    VGS.log('VGS.getLoginStatus(): status has already been loaded! ' + VGS.Auth._loadState, 'log');
                    cb({
                        status: VGS._userStatus,
                        session: VGS._session
                    });
                    return;
                } else {
                    VGS.log('VGS.Event.subscribe(VGS.loginStatus) ' + VGS.Auth._loadState, 'log');
                    if (typeof (cb) === 'function') {
                        id = VGS.guid();
                        VGS.callbacks[id] = cb;
                        VGS.Event.subscribe('VGS.loginStatus', VGS.callbacks[id]);
                    } else {
                        VGS.Event.subscribe('VGS.loginStatus', cb);
                    }
                }
            }

            // if we're already loading, and this is not a force load, we're done
            if (!force && VGS.Auth._loadState === 'loading') {
                VGS.log('VGS.getLoginStatus() already loading, returning...' + VGS.Auth._loadState, 'log');
                return;
            }

            VGS.Auth._loadState = 'loading';

            // invoke the queued sessionLoad callbacks
            var lsCb = function (response) {
                VGS.log('VGS.callbacks -- ' + VGS.Auth._loadState, 'log');
                VGS.Auth._loadState = 'loaded';
                VGS.Auth.validate(response);
                VGS.Event.fire('VGS.loginStatus', response);
                VGS.Event.clear('VGS.loginStatus');
            };
            id = VGS.guid();
            VGS.callbacks[id] = lsCb;

            VGS.Event.subscribe('VGS.loginException', function () {
                id = VGS.guid();
                VGS.callbacks[id] = function (response) {
                    VGS.log('VGS.callbacks -- ' + VGS.Auth._loadState, 'log');
                    VGS.Auth._loadState = 'loaded';
                    VGS.Auth.validate(response);
                    VGS.Event.fire('VGS.loginStatus', response);
                    VGS.Event.clear('VGS.loginStatus');
                };
                VGS.Event.clear('VGS.loginException');
                VGS.Ajax.send('ajax/hasSession.js?callback=' + id + '&autologin=1');
            });

            // finally make the call to login status
            VGS.Ajax.send(VGS.Ajax.sessionUrl + '?callback=' + id);
        },
        hasProduct: function (product_id, callback, force) {
            VGS.log('VGS.hasProduct(' + product_id + ')', 'log');
            if (!VGS.client_id) {
                VGS.log('ERROR: VGS.hasProduct() called before calling VGS.init().', 'error');
                return;
            }
            force = (force === true);

            // Check if timed out
            var now = (new Date()).getTime();
            if (VGS._cacheLastReset + VGS._refresh_timeout < now) {
                VGS.log('VGS.hasProduct(' + product_id + '): Cache timedout, forcing request.', 'log');
                force = true;
            }

            if (!force && typeof (VGS.cachedResponses['prd_' + product_id]) === 'object' && VGS.cachedResponses['prd_' + product_id] !== null) {
                VGS.log('VGS.hasProduct(' + product_id + '): Product cached.', 'log');
                callback(VGS.cachedResponses['prd_' + product_id]);
                return;
            }
            VGS.log('VGS.hasProduct(' + product_id + '): Product NOT cached.', 'log');
            var lsCb = function (response) {
                VGS.cachedResponses['prd_' + product_id] = response;
                VGS._cacheLastReset = (new Date()).getTime();
                callback(response);
            };
            var id = VGS.guid();
            VGS.callbacks[id] = lsCb;

            VGS.Ajax.send('ajax/hasproduct.js?product_id=' + product_id + '&callback=' + id);
        },
        hasSubscription: function (product_id, callback, force) {
            VGS.log('VGS.hasSubscription(' + product_id + ')', 'log');
            if (!VGS.client_id) {
                VGS.log('ERROR: VGS.hasSubscription() called before calling VGS.init().', 'error');
                return;
            }
            force = (force === true);

            // Check if timed out
            var now = (new Date()).getTime();
            if (VGS._cacheLastReset + VGS._refresh_timeout < now) {
                VGS.log('VGS.hasSubscription(' + product_id + '): Cache timedout, forcing request.', 'log');
                force = true;
            }

            if (!force && typeof (VGS.cachedResponses['sub_' + product_id]) === 'object' && VGS.cachedResponses['sub_' + product_id] !== null) {
                VGS.log('VGS.hasSubscription(' + product_id + '): Product cached.', 'log');
                callback(VGS.cachedResponses['sub_' + product_id]);
                return;
            }
            VGS.log('VGS.hasSubscription(' + product_id + '): Product NOT cached.', 'log');
            var lsCb = function (response) {
                VGS.cachedResponses['sub_' + product_id] = response;
                VGS._cacheLastReset = (new Date()).getTime();
                callback(response);
            };
            var id = VGS.guid();
            VGS.callbacks[id] = lsCb;

            VGS.Ajax.send('ajax/hassubscription.js?product_id=' + product_id + '&callback=' + id);
        },
        setTraits: function (traits, callback) {
            VGS.log('VGS.setTraits(' + traits + ')', 'log');
            if (!VGS.client_id) {
                VGS.log('ERROR: VGS.setTraits() called before calling VGS.init().', 'error');
                return;
            }
            var lsCb = function (response) {
                callback(response);
            };
            var id = VGS.guid();
            VGS.callbacks[id] = lsCb;

            VGS.Ajax.send('ajax/traits.js?t=' + traits + '&callback=' + id);
        },
        getLoginURI: function (redirect_uri, client_id) {
            var params = {
                'response_type': 'code',
                'client_id': client_id || VGS.client_id,
                'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
            };
            return VGS.Ajax.buildUrl('flow/login', params);
        },
        getSignupURI: function (redirect_uri, client_id) {
            var params = {
                'response_type': 'code',
                'client_id': client_id || VGS.client_id,
                'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
            };
            return VGS.Ajax.buildUrl('flow/signup', params);
        },
        getLogoutURI: function (redirect_uri, client_id) {
            var params = {
                'client_id': client_id || VGS.client_id,
                'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
            };
            return VGS.Ajax.buildUrl('logout', params);
        },
        getAccountURI: function (redirect_uri, client_id) {
            var params = {
                'response_type': 'code',
                'client_id': client_id || VGS.client_id,
                'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
            };
            return VGS.Ajax.buildUrl('account/summary', params);
        },
        getPurchaseHistoryURI: function (redirect_uri, client_id) {
            var params = {
                'response_type': 'code',
                'client_id': client_id || VGS.client_id,
                'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
            };
            return VGS.Ajax.buildUrl('account/purchasehistory', params);
        },
        getSubscriptionsURI: function (redirect_uri, client_id) {
            var params = {
                'response_type': 'code',
                'client_id': client_id || VGS.client_id,
                'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
            };
            return VGS.Ajax.buildUrl('account/subscriptions', params);
        },
        getProductsURI: function (redirect_uri, client_id) {
            var params = {
                'response_type': 'code',
                'client_id': client_id || VGS.client_id,
                'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString())
            };
            return VGS.Ajax.buildUrl('account/products', params);
        },
        getRedeemVoucherURI: function (voucher_code, redirect_uri, client_id) {
            var params = {
                'response_type': 'code',
                'client_id': client_id || VGS.client_id,
                'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString()),
                'voucher_code': voucher_code || null
            };
            return VGS.Ajax.buildUrl('account/redeem', params);
        },
        getPurchaseProductURI: function (product_id, redirect_uri, client_id) {
            var params = {
                'response_type': 'code',
                'client_id': client_id || VGS.client_id,
                'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString()),
                'product_id': product_id || null
            };
            return VGS.Ajax.buildUrl('flow/checkout', params);
        },
        getPurchaseCampaignURI: function (campaign_id, product_id, voucher_code, redirect_uri, client_id) {
            var params = {
                'response_type': 'code',
                'client_id': client_id || VGS.client_id,
                'redirect_uri': encodeURIComponent(redirect_uri || window.location.toString()),
                'campaign_id': campaign_id || null,
                'product_id': product_id || null,
                'voucher_code': voucher_code || null
            };
            return VGS.Ajax.buildUrl('flow/checkout', params);
        },
        getFlowUrl: function (flowname, params) {
            params = VGS.copy(params, {
                'client_id': VGS.client_id,
                'redirect_uri': encodeURIComponent(window.location.toString()),
                'response_type': 'code'
            });
            var path = 'flow/' + flowname;
            return VGS.Ajax.buildUrl(path, params);
        },
        /**
         * Event handling mechanism for globally named events. Borrowed from Facebook connect js.
         */
        Event: {
            /**
             * Returns the internal subscriber array that can be directly manipulated by
             * adding/removing things.
             *
             * @access private
             * @return {Object}
             */
            subscribers: function () {
                // this odd looking logic is to allow instances to lazily have a map of
                // their events. if subscribers were an object literal itself, we would
                // have issues with instances sharing the subscribers when its being used
                // in a mixin style.
                if (!this._subscribersMap) {
                    this._subscribersMap = {};
                }
                return this._subscribersMap;
            },

            /**
             * Subscribe to a given event name, invoking your callback function whenever
             * the event is fired.
             *
             * For example, suppose you want to get notified whenever the session
             * changes:
             *
             *     VGS.Event.subscribe('auth.sessionChange', function(response) {
             *       // do something with response.session
             *     });
             *
             * Global Events:
             *
             * - auth.login -- fired when the user logs in
             * - auth.logout -- fired when the user logs out
             * - auth.sessionChange -- fired when the session changes
             * - auth.statusChange -- fired when the status changes
             *
             * @access public
             * @param name {String} Name of the event.
             * @param cb {Function} The handler function.
             */
            subscribe: function (name, cb) {
                var subs = this.subscribers();

                if (!subs[name]) {
                    subs[name] = [cb];
                } else {
                    subs[name].push(cb);
                }
            },

            /**
             * Removes subscribers, inverse of [VGS.Event.subscribe](VGS.Event.subscribe).
             *
             * Removing a subscriber is basically the same as adding one. You need to
             * pass the same event name and function to unsubscribe that you passed into
             * subscribe. If we use a similar example to
             * [VGS.Event.subscribe](VGS.Event.subscribe), we get:
             *
             *     var onSessionChange = function(response) {
             *       // do something with response.session
             *     };
             *     VGS.Event.subscribe('auth.sessionChange', onSessionChange);
             *
             *     // sometime later in your code you dont want to get notified anymore
             *     VGS.Event.unsubscribe('auth.sessionChange', onSessionChange);
             *
             * @access public
             * @param name {String} Name of the event.
             * @param cb {Function} The handler function.
             */
            unsubscribe: function (name, cb) {
                var subs = this.subscribers()[name];

                VGS.Array.forEach(subs, function (value, key) {
                    if (value === cb) {
                        subs[key] = null;
                    }
                });
            },

            /**
             * Repeatedly listen for an event over time. The callback is invoked
             * immediately when monitor is called, and then every time the event
             * fires. The subscription is canceled when the callback returns true.
             *
             * @access private
             * @param {string} name Name of event.
             * @param {function} callback A callback function. Any additional arguments
             * to monitor() will be passed on to the callback. When the callback returns
             * true, the monitoring will cease.
             */
            monitor: function (name, callback) {
                if (!callback()) {
                    var ctx = this, fn = function () {
                        if (callback.apply(callback, arguments)) {
                            ctx.unsubscribe(name, fn);
                        }
                    };

                    this.subscribe(name, fn);
                }
            },

            /**
             * Removes all subscribers for named event.
             *
             * You need to pass the same event name that was passed to VGS.Event.subscribe.
             * This is useful if the event is no longer worth listening to and you
             * believe that multiple subscribers have been set up.
             *
             * @access private
             * @param name    {String}   name of the event
             */
            clear: function (name) {
                delete this.subscribers()[name];
            },

            /**
             * Fires a named event. The first argument is the name, the rest of the
             * arguments are passed to the subscribers.
             *
             * @access private
             * @param name {String} the event name
             */
            fire: function () {
                var args = Array.prototype.slice.call(arguments), name = args.shift();

                VGS.Array.forEach(this.subscribers()[name], function (sub) {
                    // this is because we sometimes null out unsubscribed rather than jiggle
                    // the array
                    if (sub) {
                        VGS.log('VGS.Event.fire("' + name + '")', 'log');
                        sub.apply(this, args);
                    }
                });
            }
        },
        Array: {
            /**
             * For looping through Arrays and Objects.
             *
             * @param {Object}
             *            item an Array or an Object
             * @param {Function}
             *            fn the callback function for iteration. The function
             *            will be pass (value, [index/key], item) paramters
             * @param {Bool}
             *            proto indicate if properties from the prototype should
             *            be included
             *
             */
            forEach: function (item, fn, proto) {
                if (!item) {
                    return;
                }

                if (Object.prototype.toString.apply(item) === '[object Array]' || (!(item instanceof Function) && typeof item.length === 'number')) {
                    if (item.forEach) {
                        item.forEach(fn);
                    } else {
                        for (var i = 0, l = item.length; i < l; i++) {
                            fn(item[i], i, item);
                        }
                    }
                } else {
                    for (var key in item) {
                        if (proto || item.hasOwnProperty(key)) {
                            fn(item[key], key, item);
                        }
                    }
                }
            }
        }
    };

    window.setTimeout(function () {
        if (typeof (window.vgsAsyncInit) === 'function' && !window.vgsAsyncInit.hasRun) {
            window.vgsAsyncInit.hasRun = true;
            window.vgsAsyncInit();
        }
    }, 0);

    return VGS;
});
