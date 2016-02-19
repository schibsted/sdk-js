/*global require:false, module:false*/
var config = require('./spid-config'),
    noop = function() {};

function getPersistenceModule(name) {
    var storages = {
        localstorage: require('./spid-localstorage'),
        cookie: require('./spid-cookie'),
        standard: {get: noop, set: noop, clear: noop}
    };
    return storages[name || (config.options().storage || 'standard')];
}

function name() {
    var options = config.options();
    return 'spid_js_' + options.client_id;
}

function tryVarnishCookie(session) {
    var options = config.options();
    if(session.sp_id &&
        (options.setVarnishCookie === true ||
        (options.storage === 'cookie' && options.setVarnishCookie !== false))) {
        getPersistenceModule('cookie').setVarnishCookie(session, options);
    }
}

module.exports = {
    get: function() {
        return getPersistenceModule().get(name());
    },
    set: function(value, expiresIn) {
        tryVarnishCookie(value);
        return getPersistenceModule().set(name(), value, expiresIn);
    },
    clear: function() {
        return getPersistenceModule().clear(name());
    }
};
