/*global require:false, module:false*/
var config = require('./spid-config'),
    noop = function() {};

function getPersistenceModule() {
    var storages = {
        localstorage: require('./spid-localstorage'),
        cookie: require('./spid-cookie'),
        cache: require('./spid-cache'),
        standard: {get: noop, set: noop, clear: noop}
    };
    return storages[config.options().storage] || storages.localstorage;
}

function name(key) {
    var options = config.options();
    key = key ? '_' + key : '';
    return 'spid_js_' + options.client_id + key;
}

module.exports = {
    get: function(key) {
        return getPersistenceModule().get(name(key));
    },
    set: function(value, expiresIn, key) {
        return getPersistenceModule().set(name(key), value, expiresIn);
    },
    clear: function(key) {
        return getPersistenceModule().clear(name(key));
    }
};
