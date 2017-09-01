var _scriptObject,
    _callbacks = {},
    _requestQueue = [],
    _timer = null,
    _redirectUri = encodeURIComponent(window.location.toString()),
    log = require('./spid-log'),
    util = require('./spid-util'),
    config = require('./spid-config');

function _guid() {
    return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
}

function _createCallback(callback) {
    var id = _guid();
    _callbacks[id] = function(err, res) {
        callback(err, res);
    };
    return id;
}

function _queue(id, url) {
    _requestQueue.push({ id: id, url: url });
}

function _isProcessing() {
    return _timer !== null;
}

function _removeScriptObject() {
    if (_scriptObject) {
        _scriptObject.parentNode.removeChild(_scriptObject);
        _scriptObject = null;
    }
}

function _done(id, data) {
    var f, err, res;
    window.clearTimeout(_timer);
    _timer = null;
    _removeScriptObject();
    // eslint-disable-next-line no-use-before-define
    _processQueue();

    if (_callbacks[id]) {
        f = _callbacks[id];
        _callbacks[id] = null;
        err = data.error || null;
        res = data.response || data;
        f(err, res);
    }
}

function _failure(message, id) {
    log.error(message);
    _done(id, {
        error: {
            type: 'communication',
            code: 503,
            description: message
        },
        response: {}
    });
}

function _createScriptObject(node) {
    var head;
    _scriptObject = document.createElement('SCRIPT');
    _scriptObject.src = node.url;
    _scriptObject.type = 'text/javascript';
    _scriptObject.onerror = function() {
        _failure('Browser triggered error', node.id);
    };
    head = document.getElementsByTagName('HEAD')[0];
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
    var node;
    if (!_isProcessing() && _requestQueue.length > 0) {
        node = _requestQueue.shift();
        _send(node);
    }
}

function request(server, path, params, callback) {
    var url, id = _createCallback(callback);
    params = params || {};
    params.callback = id;
    params.redirect_uri = _redirectUri;
    params.client_id = config.options().client_id;
    url = util.buildUri(server, path, params);
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
