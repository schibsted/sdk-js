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

function name() {
    var options = config.options();
    return 'spid_js_' + options.client_id;
}

module.exports = {
    get: function() {
        return getPersistenceModule().get(name());
    },
    set: function(value, expiresIn) {
        return getPersistenceModule().set(name(), value, expiresIn);
    },
    clear: function() {
        return getPersistenceModule().clear(name());
    }
};
