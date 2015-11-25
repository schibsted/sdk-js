/*global module:false, require:false*/
var _storage = {},
    config = require('./spid-config');

function decode(value) {
    return JSON.parse(window.unescape(value));
}

function encode(value) {
    return window.escape(JSON.stringify(value));
}

function enabled() {
    //Double negative to force boolean
    return !!(config.options().cache);
}

function set(key, value) {
    if (enabled()) {
        _storage[key] = encode(value);
    }
}

function get(key) {
    if (enabled()) {
        return _storage[key] ? decode(_storage[key]) : null;
    }
}
function clear(key) {
    if (enabled() && _storage[key]) {
        _storage[key] = null;
    }
}

module.exports = {
    decode: decode,
    encode: encode,
    enabled: enabled,
    set: set,
    get: get,
    clear: clear
};
