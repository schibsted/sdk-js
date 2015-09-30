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

    exports.Cache = {
        decode: decode,
        encode: encode,
        set: set,
        get: get,
        clear: clear
    };

}(SPiD));