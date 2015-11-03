/*global require:false, module:false*/

function enabled() {
    var config = require('./spid-config');
    return !!window.console && (!!config.options().logging || window.location.toString().indexOf('spid_debug=1') !== -1);
}

function _log(message, level) {
    if(enabled()) {
        window.console[level]('[SPiD] ' + message);
    }
}

function info(message) {
    _log(message, 'info');
}

function error(message) {
    _log(message, 'error');
}

module.exports = {
    enabled: enabled,
    info: info,
    error: error
};
