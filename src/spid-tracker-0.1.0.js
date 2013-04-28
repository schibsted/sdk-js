/*global VGS */
(function(win, vgs) {

    var config = {
        pulseServer      : 'http://pulse.pulse-analytics.com/pulse/rest/analytics/report',
        cookiePrefix     : 'spd_pls_',
        throttlingFactor : 1.0
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
                var old = element["on"+event] ? element["on"+event] : function() {};
                element["on"+event] = function(e) {
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
            var c_value = value + "; expires=" + exdate.toUTCString();
            document.cookie = name + "=" + c_value;
        }

        function getCookie() {
            var i, x, y, biscuits = document.cookie.split(";");
            for (i = 0; i < biscuits.length; i++) {
                x = biscuits[i].substr(0, biscuits[i].indexOf("="));
                y = biscuits[i].substr(biscuits[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
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

    function report() {

        //Update cookies and get load datetime
        var uid = updateCookie(config.cookiePrefix + 'uid', 365, 0),
            sid = updateCookie(config.cookiePrefix + 'sid', 0, 15),
            pageLoadTime = (new Date()).getTime();

        /**
        * Sends ping to pulse server, through an img and query params
        * @param    attr    object  contain key/val pairs to add to ping
        */
        function pulse(attr) {
            // a=arrive, t=throttle, l=leave
            var payload = { url: win.encodeURIComponent(win.document.URL), uid: uid, sid: sid, a: pageLoadTime, t: config.throttlingFactor, spid: spid },
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

        //Main app. Place event handlers and callbacks to send pulse
        var triggered = false;
        on('a', 'click', function() {
            //Listener for link clicks. If link clicked, avoid unload event
            var link = this.getAttribute('href');
            if(link.substr(0,4) === 'http') {
                //Only send links that starts with http, encoded. Also supply l for leave.
                pulse({toUrl: win.encodeURIComponent(link), l: (new Date()).getTime()});
                triggered = true;
            }
        });

        on(win, 'unload', function() {
            //Only trigger if not already triggered by link
            if(!triggered) {
                pulse({l: (new Date()).getTime()});
            }
        });
    }

    var spid,
        executed = false;
    vgs.Event.subscribe('auth.sessionChange', function(data) {
        config.throttlingFactor = VGS._track_throttle;
        //Listen to sessionChange event, always triggered and sometimes multiple. Avoids multiple event placements.
        spid = data.session ? data.session.userId : 0;
        if (Math.random() <= config.throttlingFactor && !executed) { report(); executed = true; }
    });
}(window, VGS));