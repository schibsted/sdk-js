;(function(exports) {

    var
        _version = '<%= pkg.version %>',
        _defaults = {
            server: null,
            client_id: null,
            https: true,
            cookie: true,
            logging: false,
            prod: true,

            cache: true,
            refresh_timeout: 900000,
            timeout: 5000,
            varnish_expiration: null
        },
        _options = {};

    function _copy(target, source) {
        for (var key in source) {
            if (target[key] === undefined) {
                target[key] = source[key];
            }
        }
        return target;
    }

    function init(options) {
        _options = _copy(options, _defaults);
        if(!_options['server']) { throw new TypeError('[SPiD] server parameter is required'); }
        if(!_options['client_id']) { throw new TypeError('[SPiD] client_id parameter is required'); }

        //Set minimum refresh timeout
        if(options.refresh_timeout <= 60000) {
            options.refresh_timeout = 60000;
        }
    }

    exports.SPiD = {
        version: function() {
            return _version;
        },
        options: function() {
            return _options;
        },
        init: init
    };
}(window));