/*global module:false*/
var _callbacks = {};

function ensureArray(key) {
    if(!_callbacks[key]) {
        _callbacks[key] = [];
    }
}

function register(key, cb) {
    ensureArray(key);
    _callbacks[key].push(cb);
}

function invokeAll(key, err, data) {
    ensureArray(key);
    _callbacks[key].forEach(function (cb) {
        cb(err, data);
    });
    delete _callbacks[key];
}

function hasPending(key) {
    ensureArray(key);
    return _callbacks[key].length > 1;
}

module.exports = {
    register: register,
    invokeAll: invokeAll,
    hasPending: hasPending
};
