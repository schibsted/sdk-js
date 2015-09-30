/*global SPiD:false*/
;(function(exports) {

    var logger = exports.Log,
        keyPrefix = "SPID_",
        enabled = true;

    function decode(value) {
        return JSON.parse(value);
    }

    function encode(value) {
        return JSON.stringify(value);
    }

    function _toKey(key) {
        return keyPrefix + key;
    }

    function get(key) {
        try {
            return decode(window.localStorage.getItem(_toKey(key)));
        } catch(e) {
            logger.info(e);
        }
        return null;
    }

    function set(key, value) {
        try {
            window.localStorage.setItem(_toKey(key), encode(value));
        } catch(e) {
            logger.info(e);
        }
    }

    function clear(key) {
        try {
            window.localStorage.setItem(_toKey(key), null);
        } catch(e) {
            logger.info(e);
        }
    }

    exports.LocalStorage = {
        set: set,
        get: get,
        clear: clear,
        enabled: enabled
    };
}(SPiD));