/*global module:false, require:false*/
var
    _options = {},
    _defaults = {
        server: null,
        client_id: null,
        cache: {},
        logging: false,
        useSessionCluster: true,
        https: true,
        setVarnishCookie: null,
        storage: 'localstorage',
        timeout: 5000,
        refresh_timeout: 12*60*60, // sec
        varnish_expiration: 12*60*60, // sec
        cache_time_no_asset: 10 // sec
    },
    util = require('./spid-util');

module.exports = {
    options: function() {
        return _options;
    },
    init: function(opts) {
        _options = util.copy(opts, _defaults);
        if(!_options['server']) {
            throw new TypeError('[SPiD] server parameter is required');
        }
        if(!_options['client_id']) {
            throw new TypeError('[SPiD] client_id parameter is required');
        }

        //Set minimum refresh timeout
        if(_options.refresh_timeout <= 60000) {
            _options.refresh_timeout = 60000;
        }

        // Disallow setting to storag to false
        _options.storage = opts.storage || _defaults.storage;
    },
    server: function() {
        return (_options.https ? 'https' : 'http') + '://' + _options.server + '/';
    }
};
