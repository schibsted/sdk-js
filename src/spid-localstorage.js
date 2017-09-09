/*global require:false, module:false*/
var log = require('./spid-log');

function decode(value) {
    return JSON.parse(value);
}

function encode(value) {
    return JSON.stringify(value);
}

function set(key, value, expiresInSeconds) {
    try {
        if(expiresInSeconds) {
            var date = new Date();
            date.setTime(date.getTime() + (expiresInSeconds * 1000));
            value._expires = date;
        }
        window.localStorage.setItem(key, encode(value));
    } catch(e) {
        log.info(e);
    }
}

function clear(key) {
    try {
        window.localStorage.removeItem(key);
    } catch(e) {
        log.info(e);
    }
}

function isExpired(item) {
    if(item && item._expires) {
        return new Date(item._expires).getTime() < new Date().getTime();
    }
    return false;
}

function get(key) {
    try {
        var storedItem = decode(window.localStorage.getItem(key));
        if (isExpired(storedItem)) {
            clear(key);
            return null;
        }
        return storedItem;
    } catch(e) {
        log.info(e);
    }
    return null;
}

module.exports = {
    set: set,
    get: get,
    clear: clear
};
