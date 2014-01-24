/*global SPiD:false*/
;(function(exports) {

    var _instance,
        _storage = {};

    function decode(value) {
        return JSON.parse(window.unescape(value));
    }

    function encode(value) {
        return window.escape(JSON.stringify(value));
    }

    function set(key, value) {
        _storage[key] = encode(value);
    }

    function get(key) {
        return _storage[key] ? decode(_storage[key]) : null;
    }

    function clear(key) {
        if(_storage[key]) {
            _storage[key] = null;
        }
    }

    function enabled() {
        var options = exports.options();
        //Double negative to force boolean
        return !!options.cache;
    }

    exports.Cache = function() {
        _instance = _instance || {
            decode: decode,
            encode: encode,
            set: set,
            get: get,
            clear: clear,
            enabled: enabled
        };
        return _instance;
    };

}(SPiD));