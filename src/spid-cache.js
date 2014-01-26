/*global SPiD:false*/
;(function(exports) {

    var _storage = {};

    function decode(value) {
        return JSON.parse(window.unescape(value));
    }

    function encode(value) {
        return window.escape(JSON.stringify(value));
    }

    function set(key, value) {
        if(enabled()) {
            _storage[key] = encode(value);
        }
    }

    function get(key) {
        if(enabled()) {
            return _storage[key] ? decode(_storage[key]) : null;
        }
    }

    function clear(key) {
        if(enabled() && _storage[key]) {
            _storage[key] = null;
        }
    }

    function enabled() {
        var options = exports.options();
        //Double negative to force boolean
        return !!options.cache;
    }

    exports.Cache = {
        decode: decode,
        encode: encode,
        set: set,
        get: get,
        clear: clear,
        enabled: enabled
    };

}(SPiD));