/*global SPiD:false*/
;(function(exports) {

    var logger = exports.Log,
        keyPrefix = "SPiD_",
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
            var storedItem = decode(window.localStorage.getItem(_toKey(key)));
            if (isExpired(storedItem)) {
                clear(key);
                return null;
            }
            return storedItem;
        } catch(e) {
            logger.info(e);
        }
        return null;
    }

    function set(key, value, expiresInSeconds) {
        try {
            if(expiresInSeconds) {
                var date = new Date();
                date.setTime(date.getTime() + (expiresInSeconds * 1000));
                value._expires = date;
            }
            window.localStorage.setItem(_toKey(key), encode(value));
        } catch(e) {
            logger.info(e);
        }
    }

    function clear(key) {
        try {
            window.localStorage.clear(_toKey(key));
        } catch(e) {
            logger.info(e);
        }
    }

    function isExpired(item) {
        if(item._expires) {
            return new Date(item._expires).getTime() < new Date().getTime();
        }
        return false;
    }

    exports.LocalStorage = {
        set: set,
        get: get,
        clear: clear,
        enabled: enabled
    };
}(SPiD));