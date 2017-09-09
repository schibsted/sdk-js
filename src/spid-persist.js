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

function name(suffix) {
    var options = config.options();
    suffix = suffix ? '_' + suffix : '';
    return 'spid_js_' + options.client_id + suffix;
}

module.exports = {
    get: function(suffix) {
        return getPersistenceModule().get(name(suffix));
    },
    set: function(value, expiresIn, suffix) {
        return getPersistenceModule().set(name(suffix), value, expiresIn);
    },
    clear: function(suffix) {
        return getPersistenceModule().clear(name(suffix));
    }
};
