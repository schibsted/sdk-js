/*global VGS */
(function(win, v) {

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
            pageLoadTime = new Date().getTime();

        function pulse(attr) {
            var payload = { url: win.document.URL, agent: win.navigator.userAgent, uid: uid, sid: sid, arrive: pageLoadTime, throttle: config.throttlingFactor, spid: spid };
            for (var a in attr) {
                payload[a] = attr[a];
            }
            win.console.log(JSON.stringify(payload));
        }

        //This will trigger on every link click
        on('a', 'click', function() {
            pulse({toUrl: this.getAttribute('href'), leave: new Date()});
        });
        //This will trigger on every unload, meaning also when linked is clicked
        on(win, 'beforeunload', function() {
            pulse({leave: new Date()});
        });
    }

    var spid,
        executed = false;
    v.Event.subscribe('auth.sessionChange', function(data) {
        spid = data.session ? data.session.userId : 0;
        if (Math.random() <= config.throttlingFactor && !executed) { report(); executed = true; }
    });
}(window, VGS));


/*
$(document).ready(function () {
    try {
        function reportStatistics() {
            var pulseServer = 'http://127.0.0.1:8080/pulse/rest/analytics/report';
            var clientId = '5087dc1b421c7a0b79000000';
            var spidServer = 'https://payment.schibsted.no/ajax/hassession.js?callback=hasSession&connectionId=0&client_id=' + clientId;
            var events = 'article#content .relatedContents li a, article#content .bodyText .relationArticle a, article#content .bodyText p a';
            var cookiePrefix = 'spd_pls_';

            // cookie util
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

            var uid = updateCookie(cookiePrefix + 'uid', 365, 0);
            var sid = updateCookie(cookiePrefix + 'sid', 0, 15);

            var pageLoadTime = new Date().getTime();
            var spid = 0;

            var loginInfo = null;

            var VGS = {
                callbacks: {
                    hasSession: function (user) {
                        try {
                            if (user.error) {
                                loginInfo = null;
                            } else {
                                loginInfo = user;
                            }
                        } catch (e) {
                        }
                    }
                },
                Ajax: {
                    responseReceived: function () {
                    }
                }
            };
            parent.VGS = VGS;

            $.getScript(spidServer,
                function () {
                    try {
                        parent.triggerResponse();
                        sendReport();
                    } catch (e) {
                    }
                });

            function createPayload(attr) {
                var payload = {uid: uid, spid: spid, url: document.URL, arrive: pageLoadTime, agent: navigator.userAgent, sid: sid, throttle: throttlingFactor};
                for (var a in attr) {
                    payload[a] = attr[a];
                }
                return payload;
            }

            function sendPulse(payload) {
                $.post(pulseServer, { text: JSON.stringify(payload)});
            }

            function sendReport() {
                if (loginInfo != null) {
                    spid = loginInfo['uid'];
                }
                var payload = createPayload({});
                sendPulse(payload);
            }

            // hook into clicks from this page
            var onClick = function () {
                try {
                    var payload = createPayload({toUrl: $(this).attr("href"), leave: new Date()});
                    sendPulse(payload);
                } catch (e) {
                }
            };

            $('a').on('click', onClick);
            $(events).on('click', onClick);

            // hook into exiting this page
            window.addEventListener(
                'beforeunload',
                function () {
                    try {
                        var payload = createPayload({leave: new Date()});
                        sendPulse(payload);
                    } catch (e) {
                    }
                },
                false
            );

        }

        var throttlingFactor = 1.0;
        if (throttlingFactor === 1.0 || Math.random() < throttlingFactor) { reportStatistics(); }

    } catch (e) {
    }
});
*/