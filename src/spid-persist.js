/*global require:false, module:false*/
var config = require('./spid-config'),
    _key = 'Session',
    noop = function() {
    };
function getPersistenceModule() {
    var cookie = require('./spid-cookie');
    var storages = {
        localstorage: require('./spid-localstorage'),
        cookie: {
            get: cookie.get,
            set: function(key, value) { cookie.set(value); },
            clear: cookie.clear
        },
        standard: {get: noop, set: noop, clear: noop}
    };
    return storages[(config.options().storage || 'standard')];
}

module.exports = {
    get: function() {
        return getPersistenceModule().get(_key);
    },
    set: function( value, expiresIn) {
        return getPersistenceModule().set(_key, value, expiresIn);
    },
    clear: function() {
        return getPersistenceModule().clear(_key);
    }
};
