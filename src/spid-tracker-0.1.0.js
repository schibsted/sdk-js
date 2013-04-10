/*global VGS */
(function(win, vgs) {

    var config = {
        pulseServer      : 'http://127.0.0.1:8080/pulse/rest/analytics/report',
        cookiePrefix     : 'spd_pls_',
        throttlingFactor : 1.0
    };

    function on(selector, event, callback) {
        function getHandler() {
            if(win.addEventListener) {
                return function(element, event, callback) { element.addEventListener(event, callback, false); };
            }
            if(win.attachEvent) {
                return function(element, event, callback) { element.attachEvent('on'+event, function() { callback.call(this, win.event); }); };
            }
            return function(element, event, callback) {
                var old = element["on"+event] ? element["on"+event] : function() {};
                element["on"+event] = function(e) {
                    if (!e) {
                        e = win.event;
                    }
                    old.call(this, e);
                    callback.call(this, e);
                };
            };
        }
        var handler = getHandler();
        var elements;
        if(typeof selector === 'string') {
            elements = Array.prototype.slice.call(win.document.getElementsByTagName(selector));
        } else {
            elements = [selector];
        }
        for(var i in elements) {
            handler(elements[i], event, callback);    
        }
    }

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

        var uid = updateCookie(config.cookiePrefix + 'uid', 365, 0),
            sid = updateCookie(config.cookiePrefix + 'sid', 0, 15),
            pageLoadTime = (new Date()).getTime();

        function pulse(attr) {
            // a=arrive, t=throttle, l=leave
            var payload = { url: win.encodeURIComponent(win.document.URL), uid: uid, sid: sid, a: pageLoadTime, t: config.throttlingFactor, spid: spid };
            for (var a in attr) {
                payload[a] = attr[a];
            }
            var query = [];
            for (var i in payload) {
                query.push(i+'='+payload[i]);
            }
            (new Image()).src = config.pulseServer + '?' + query.join('&');
        }

        var triggered = false;
        on('a', 'click', function() {
            var link = this.getAttribute('href');
            if(link.substr(0,4) === 'http') {
                pulse({toUrl: link, l: (new Date()).getTime()});
                triggered = true;
            }
        });

        on(win, 'beforeunload', function() {
            if(!triggered) {
                pulse({l: (new Date()).getTime()});
            }
        });
    }

    var spid,
        executed = false;
    vgs.Event.subscribe('auth.sessionChange', function(data) {
        spid = data.session ? data.session.userId : 0;
        if (Math.random() <= config.throttlingFactor && !executed) { report(); executed = true; }
    });
}(window, VGS));