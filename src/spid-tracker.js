/*global VGS */
(function(win, vgs) {

    var config = {
        pulseServer      : (win.location.protocol.substr(0,5) === 'https' ? 'https' : 'http' ) +'://pulse.spid.se/pulse',
        cookiePrefix     : 'spd_pls_',
        throttlingFactor : vgs._track_throttle || 1.0
    };

    /**
    * Event binder
    * @param selector  string | element  'a' or window
    * @param event     string            type of event, 'click'
    * @param callback  function          called on event triggers. function() { this }
    */
    function on(selector, event, callback) {
        function getAttacher() {
            function traverse(node) {
                //Traverse DOM upwards until selector node is found or document is reached
                while(node.nodeName !== selector.toUpperCase() && node.nodeType !== 9) {
                    node = node.parentNode;
                }
                return node.nodeType === 1 ? node : false;
            }
            function cb(evt) {
                //Cross browser event getting
                var e = evt || win.event;
                var elem = e.target || e.srcElement;
                //traverse to node if selector is string (not window)
                var match = (typeof selector === 'string') ? traverse(elem) : elem;
                //Only call callback if we have a match
                if(match) { callback.call(match); }
            }
            //Event listener for modern browsers
            if(win.addEventListener) {
                return function(element, event) { element.addEventListener(event, cb , false); };
            }
            //Event listener for IE
            if(win.attachEvent) {
                return function(element, event) { element.attachEvent('on'+event, cb); };
            }
            //Event listener for old browsers
            return function(element, event) {
                var old = element['on'+event] ? element['on'+event] : function() {};
                element['on'+event] = function(e) {
                    if (!e) { e = win.event; }
                    old.call(this, e);
                    cb.call(this, e);
                };
            };
        }
        var attach = getAttacher();
        if(typeof selector === 'string') {
            //if selector is string, add listener to document
            attach(win.document, event);
        } else {
            //otherwise add to selector
            attach(selector, event);
        }
    }

    /**
    * Updates or sets tracking cookie
    * @param name       string  Name of cookie
    * @param days       int     days from now to expire
    * @param minutes    int     minutes from now to expire
    */
    function updateCookie(name, days, minutes) {
        function setCookie(value) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + days);
            exdate.setMinutes(exdate.getMinutes() + minutes);
            var c_value = value + '; expires=' + exdate.toUTCString();
            document.cookie = name + '=' + c_value;
        }

        function getCookie() {
            var i, x, y, biscuits = document.cookie.split(';');
            for (i = 0; i < biscuits.length; i++) {
                x = biscuits[i].substr(0, biscuits[i].indexOf('='));
                y = biscuits[i].substr(biscuits[i].indexOf('=') + 1);
                x = x.replace(/^\s+|\s+$/g, '');
                if (x === name) {
                    return y;
                }
            }
            return null;
        }

        var value = getCookie();
        if (value === null) {
            value = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        setCookie(value);
        return value;
    }

    function throttle() {
        return Math.random() <= config.throttlingFactor;
    }

    function report() {

        var user = { user_id: 0, distinct_id: 0 };

        //Update cookies and get load datetime
        var uid = updateCookie(config.cookiePrefix + 'uid', 365, 0),
            sid = updateCookie(config.cookiePrefix + 'sid', 0, 15),
            pageLoadTime = (new Date()).getTime();

        function get_viewport_size(win) {
            var w = win,
                d = win.document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                y = w.innerHeight|| e.clientHeight|| g.clientHeight;
            return x + 'x' + y;
        }

        function get_screensize() {
            return screen.width + 'x' + screen.height;
        }

        function get_scroll() {
            var doc = document.documentElement;
            var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
            var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
            return left + 'x' + top;
        }

        function get_meta_tags(win) {
            var meta_info = {};
            var meta_tags = win.document.getElementsByTagName('meta');

            for (var i=0; i<meta_tags.length; i++) {
                var key = meta_tags[i].getAttribute('name');
                if (key === undefined || key === null) {
                    key = meta_tags[i].getAttribute('property');
                }
                var value = meta_tags[i].getAttribute('content');
                meta_info[key] = value;
            }
            return meta_info;
        }

        function safe_url(value) {
            return win.encodeURIComponent(value);
        }

        function setUser(user_id, distinct_id) {
            user.user_id = user_id || user.user_id;
            user.distinct_id = distinct_id || user.distinct_id;
        }

        /**
        * Sends ping to pulse server, through an img and query params
        * @param    attr    object  contain key/val pairs to add to ping
        */
        function pulse(attr) {
            // Opt-out for anonymous and logged in users.
            vgs.log('pulse: vgs._track_opt_out', 'log');
            if (vgs._track_opt_out || (!user.user_id && vgs._track_anon_opt_out)) {
                return null;
            }
            var meta_info = get_meta_tags(win);
            var payload = {
                    url: safe_url(win.document.URL),  // page url
                    uid: uid,                                                 // user id
                    sid: sid,                                                 // session id
                    a: pageLoadTime,                                          // arrive time
                    t: config.throttlingFactor,                               // throttle
                    spid: user.user_id,                                       // user_id from SPiD
                    did: user.distinct_id,                                    // distinct_id
                    cid: vgs.client_id,                                       // client_id
                    ti: safe_url(win.document.title),                         // document title
                    ref: safe_url(win.document.referrer),                     // document referer
                    vs: get_viewport_size(win),                               // viewport size
                    ss: get_screensize(win),                                  // screen size
                    ps: get_scroll(),                                         // page scroll
                    mti: safe_url(meta_info.title),                           // meta title
                    md: safe_url(meta_info.description),                      // meta description
                    mta: safe_url(meta_info.tags),                            // meta tags
                    moti: safe_url(meta_info['og:title']),                    // meta og:title
                    moty: safe_url(meta_info['og:type']),                     // meta og:type
                    mou: safe_url(meta_info['og:url']),                       // meta og:url
                    moi: safe_url(meta_info['og:image']),                     // meta og:image
                    modes: safe_url(meta_info['og:description']),             // meta og:description
                    moa: safe_url(meta_info['og:audio']),                     // meta og:audio
                    modet: safe_url(meta_info['og:determiner']),              // meta og:determiner
                    mol: safe_url(meta_info['og:local']),                     // meta og:local
                    mola: safe_url(meta_info['og:local:alternate']),          // meta og:local:aleternate
                    mosn: safe_url(meta_info['og:site_name']),                // meta og:site_name
                    mov: safe_url(meta_info['og:video']),                     // meta og:video
                    cust: safe_url(vgs.custom_data || vgs._track_custom_data) // custom data
                },
                query = [],
                i;
            for (i in attr) {
                payload[i] = attr[i];
            }
            for (i in payload) {
                query.push(i+'='+payload[i]);
            }
            (new Image()).src = config.pulseServer + '?' + query.join('&');
        }

        return {
            pulse: pulse,
            setUser: setUser
        };
    }

    var reporter = report(),
        triggered = false;

    // Place listener for clicks on a-tags
    on('a', 'click', function() {
        if (!throttle()) {
            return;
        }

        //Listener for link clicks. If link clicked, avoid unload event
        var link = this.getAttribute('href');
        if (!link || link.substr(0,4) !== 'http') {
            //Only send links that starts with http
            return;
        }

        // Supply l for leave.
        reporter.pulse({name: 'page_exit', toUrl: win.encodeURIComponent(link), l: (new Date()).getTime()});
        triggered = true;
    });

    // Place listener on unload, to trigger on exit
    // Issue: This event is not triggered when you close a tab or the browser, so you loose all the one-page readers.
    on(win, 'unload', function() {
        if (!throttle() && !triggered) {
            return;
        }
        reporter.pulse({name: 'page_exit', l: (new Date()).getTime()});
    });

    vgs.Event.subscribe('auth.visitor', function(data) {
        if (!throttle()) {
            return;
        }
        reporter.setUser(data.user_id, data.uid);
        reporter.pulse({name: 'page_entry', r: (new Date()).getTime()});
    });

    vgs.Event.subscribe('auth.sessionChange', function(data) {
        if (!throttle()) {
            return;
        }
        if (data.session) {
            reporter.setUser(data.session.userId);
        }
        reporter.pulse();
    });

    // Add custom event tracking function to VGS
    vgs.Event.track = function(name, options){
        reporter.pulse({name: name, cust: JSON.stringify(options)});
    };

}(window, VGS));
