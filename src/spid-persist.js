/*global require:false, module:false*/
var config = require('./spid-config'),
    noop = function() {
    };
function getPersistenceModule() {
    var storages = {
        localstorage: require('./spid-localstorage'),
        cookie: require('./spid-cookie'),
        standard: {get: noop, set: noop, clear: noop}
    };
    return storages[(config.options().storage || 'standard')];
}

module.exports = {
    get: function(key) {
        return getPersistenceModule().get(key);
    },
    set: function(key, value, expiresIn) {
        return getPersistenceModule().set(key, value, expiresIn);
    },
    clear: function(key) {
        return getPersistenceModule().clear(key);
    }
};
