/*global require:false, module:false*/
var config = require('./spid-config'),
    noop = function() {
    };
function getPersistenceModule() {
    var storages = {
        localstorage: require('./spid-localstorage'),
        cookie: require('./spid-cookie'),
        cache: require('./spid-cache'),
        standard: {get: noop, set: noop, clear: noop}
    };
    return storages[(config.options().storage || 'standard')];
}

module.exports = {
    get: function(key) {
        getPersistenceModule().get(key);
    },
    set: function(key, value, expiresIn) {
        getPersistenceModule().set(key, value, expiresIn);
    },
    clear: function(key) {
        getPersistenceModule().clear(key);
    }
};
