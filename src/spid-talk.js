/*global require:false, module:false, _processQueue*/
var _scriptObject,
    _callbackFunctions = {},
    _requestQueue = [],
    _timer = null,
    _redirectUri = encodeURIComponent(window.location.toString()),
    log = require('./spid-log'),
    util = require('./spid-util'),
    config = require('./spid-config');

function _guid() {
    return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
}

function _isArray(arg) {
    // Polyfill from MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
    return Object.prototype.toString.call(arg) === '[object Array]';
}

function _callAllCallbacks(id, err, res) {
    var callbackArr = _callbackFunctions[id];
    if (_isArray(callbackArr)) {
        for (var i = 0; i < callbackArr.length; i++) {
            try {
                callbackArr[i](err, res);
            } catch (e) {
                log.error('Failed to run a callback' + e);
            }
        }
    } else {
        log.error('No callback is registered for callback id ' + id);
    }
}

function _createCallback(callback) {
    var id = _guid();
    if (!_isArray(_callbackFunctions[id])) {
        _callbackFunctions[id] = [];
    }
    _callbackFunctions[id].push(callback);
    return id;
}

function _queue(id, url) {
    _requestQueue.push({id:id, url:url});
}

function _isProcessing() {
    return _timer !== null;
}

function _removeScriptObject() {
    if(_scriptObject) {
        _scriptObject.parentNode.removeChild(_scriptObject);
        _scriptObject = null;
    }
}

function _done(id, data) {
    window.clearTimeout(_timer);
    _timer = null;
    _removeScriptObject();
    _processQueue();

    if(_callbackFunctions[id]) {
        _callAllCallbacks(id, data['error'] || null, data['response'] || data);
    }
}

function _failure(message, id) {
    log.error(message);
    _done(id, {'error': {'type': 'communication', 'code': 503, 'description': message}, 'response': {}});
}

function _createScriptObject(node) {
    _scriptObject = document.createElement('SCRIPT');
    _scriptObject.src = node.url;
    _scriptObject.type = 'text/javascript';
    _scriptObject.onerror = function() {
        _failure('Browser triggered error', node.id);
    };
    var head = document.getElementsByTagName('HEAD')[0];
    head.appendChild(_scriptObject);
}

function _send(node) {
    var options = require('./spid-config').options();
    _createScriptObject(node);
    _timer = window.setTimeout(function() {
        _failure('Timeout reached', node.id);
    }, options.timeout);
}

function _processQueue() {
    if(!_isProcessing() && _requestQueue.length > 0) {
        var node = _requestQueue.shift();
        _send(node);
    }
}

function request(server, path, params, callback) {
    var id = _createCallback(callback);
    params = params || {};
    params.callback = id;
    params.redirect_uri = _redirectUri;
    params.client_id = config.options().client_id;
    var url = util.buildUri(server, path, params);
    log.info('Request: ' + url);
    _queue(id, url);
    _processQueue();
}

function response(id, data) {
    log.info('Response received');
    _done(id, data);
}

module.exports = {
    request: request,
    response: response
};
