/*global require:false*/
var
    _options = {},
    _defaults = {
        server: null,
        client_id: null,
        cache: false,
        logging: false,
        useSessionCluster: true,
        https: true,
        storage: 'localstorage',
        timeout: 15000,
        refresh_timeout: 900000,
        varnish_expiration: null
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
    },
    server: function() {
        return (_options.https ? 'https' : 'http') + '://' + _options.server + '/';
    }
};