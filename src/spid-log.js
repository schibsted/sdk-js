/*global SPiD:false*/
;(function(exports) {

    /* Singleton */
    var _instance;

    function enabled() {
        var options = exports.options();
        return !!window.console && (!!options.logging || window.location.toString().indexOf('spid_debug=1') !== -1);
    }

    function info(message) {
        _log(message, 'info');
    }

    function error(message) {
        _log(message, 'error');
    }

    function _log(message, level) {
        if(enabled()) {
            window.console[level]('[SPiD] ' + message);
        }
    }

    exports.Log = function() {
        _instance = _instance || {
            enabled: enabled,
            info: info,
            error: error
        };
        return _instance;
    };
}(SPiD));