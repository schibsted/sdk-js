/*global SPiD:false*/
;(function(exports) {

    var noop = function() {
    };

    function getPersistenceModule() {
        var storages = {
            localstorage: exports.LocalStorage,
            cookie: exports.Cookie,
            cache: exports.Cache,
            standard: {get: noop, set: noop, clear: noop}
        };
        return storages[(exports.options().storage || 'standard')];
    }

    exports.Persist = {
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

}(SPiD));