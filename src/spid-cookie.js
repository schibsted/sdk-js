/*global SPiD:false*/
;(function(exports) {

    var _domain,
        _varnishCookieName = 'SP_ID';

    function decode(value) {
        return JSON.parse(window.unescape(value));
    }

    function encode(value) {
        return window.escape(JSON.stringify(value));
    }

    function set(session) {
        var options = exports.options();
        if(!session) { return false; }
        _domain = session.baseDomain;
        _setRaw(name(), encode(session), session.expiresIn, _domain);
        exports.Log().info('SPiD.Cookie.set({n})'.replace('{n}', name()));
        if(session.sp_id) {
            var expiresIn = options.varnish_expiration || session.expiresIn;
            _setRaw(_varnishCookieName, session.sp_id, expiresIn, _domain);
            exports.Log().info('SPiD.Cookie.set({n})'.replace('{n}', _varnishCookieName));
        }
    }

    function get() {
        exports.Log().info('SPiD.Cookie.get()');
        var cookies = "; " + document.cookie;
        var parts = cookies.split("; " + name() + "=");
        var cookie = (parts.length === 2) ? parts.pop().split(";").shift() : null;

        if (cookie) {
            // url encoded session stored as "sub-cookies"
            var session = decode(cookie);
            // decodes as a string, convert to a number
            session.expiresIn  = parseInt(session.expiresIn, 10);
            session.clientTime = parseInt(session.clientTime, 10);
            // capture base_domain for use when we need to clear
            _domain = session.baseDomain;
            return session;
        }
        return null;
    }

    function clear() {
        exports.Log().info('SPiD.Cookie.clear()');
        _setRaw(name(), '', 0, _domain);
        _setRaw(_varnishCookieName, '', 0, _domain);
    }

    function name() {
        var options = exports.options();
        return 'spid_js_' + (options.prod ? '' : 'test_') + options.client_id;
    }

    function enabled() {
        var options = exports.options();
        //Double negative to force boolean
        return !!options.cookie;
    }

    function _setRaw(name, value, expiresIn, domain) {

        var date = new Date();
        date.setTime(date.getTime() + (expiresIn * 1000));

        var cookie = '{n}={v}; expires={e}; path=/; domain=.{d}'
            .replace('{n}', name)
            .replace('{v}', value)
            .replace('{e}', date.toGMTString())
            .replace('{d}', domain);
        document.cookie = cookie;
    }

    exports.Cookie = {
        decode: decode,
        encode: encode,
        set: set,
        get: get,
        clear: clear,
        name: name,
        enabled: enabled
    };
}(SPiD));