/*global SPiD:false*/
;(function(exports) {

    var logger = exports.Log,
        _callbacks = [],
        _ajax = {
            connectionId: -1,
            connections: [],
            interval: null,
            intervalPeriod: 300, // strongly suggested that you increase this to 1000 if debugging!!
            pollingDebugCount: 0,
            pollingDebugFirst: true,
            pollingDebugThrottle: 100, // show a debug message after every this many polling iterations
            requestQueue: [],
            scriptObject: null,
            serverUrl: '',
            sessionUrl: '',
            timeoutPeriod: 5000, // if a connection goes on for longer than this many milliseconds, then timeout
            version: '1.0',
            testMode: false // If true, this will allow for relative requests to be made. Used for writing tests
        };

    function _guid() {
        return 'f' + (Math.random() * (1 << 30)).toString(16).replace('.', '');
    }

    function _flushQueue() {
        logger.info('SPiD.Talk.flushQueue()');
        _ajax.requestQueue.length = 0;
    }

    function _stopPolling() {
        logger.info('SPiD.Talk.stopPolling()');
        _ajax.serverTimeoutTime = null;
        _flushQueue();
        if(_ajax.interval) {
            window.clearInterval(_ajax.interval);
        }
        _ajax.interval = null;
    }

    function _startPolling() {
        logger.info('SPiD.Talk.startPolling()');
        if(_ajax.interval == null) {
            logger.info('polling (re)started');
            _ajax.connections[_ajax.connectionId] = null;
            _poll();
            _ajax.interval = window.setInterval(function() {
                _ajax.connections[_ajax.connectionId] = null;
                _poll();
            }, _ajax.intervalPeriod);
        }
    }

    function _now() {
        return (new Date()).getTime();
    }

    function _poll() {
        logger.info('SPiD.Talk.poll()');
        if(_ajax.pollingDebugCount === _ajax.pollingDebugThrottle) {
            logger.info('-- poll [' + _now() + '] (x' + _ajax.pollingDebugCount + ')');
            _ajax.pollingDebugCount = 0;
        } else if(_ajax.pollingDebugFirst) {
            logger.info('-- poll [' + _now() + ']');
            _ajax.pollingDebugFirst = false;
            _ajax.pollingDebugCount = 0;
        }
        _ajax.pollingDebugCount++;
        if(_ajax.serverTimeoutTime) {
            if(_ajax.serverTimeoutTime <= _now()) {
                _stopPolling();
                _failure('Server Timed Out');
            } else if(parent.triggerResponse != null) {
                parent.triggerResponse();
            }
        } else if(_ajax.requestQueue.length > 0) {
            // Queue size validation in order to avoid abuse and overload of the platform. Allow max 10 requests in the queue.
            if(_ajax.requestQueue.length > 10) {
                _failure("Queue size too big: " + _ajax.requestQueue.length + " requests! In order to avoid abuse and overload of the platform we allow max 10 requests in the queue.");
                _stopPolling();
            } else {
                _makeRequest();
            }
        } else {
            _stopPolling();
        }
    }

    function _failure(errorMsg) {
        logger.info('SPiD.Talk.failure("' + errorMsg + '")');
        if(exports.Event) {
            exports.Event.fire('SPiD.error', {'type': 'communication', 'code': 503, 'description': errorMsg});
        }
    }

    function _makeRequest() {
        logger.info('SPiD.Talk.makeRequest()');
        if(_ajax.requestQueue.length > 0) {
            logger.info('Processing: on'); // fkn dumb
            var connectionCode = _ajax.requestQueue[0].connectionUrl;
            parent.triggerResponse = null;
            _createScriptObject(connectionCode);
            _ajax.serverTimeoutTime = _now() + _ajax.timeoutPeriod;
        }
    }

    function _createScriptObject(source) {
        logger.info('SPiD.Talk.createScriptObject("' + source + '")');
        _ajax.scriptObject = document.createElement('SCRIPT');
        _ajax.scriptObject.src = source;
        _ajax.scriptObject.type = 'text/javascript';
        _ajax.scriptObject.onerror = loadingError;
        var head = document.getElementsByTagName('HEAD')[0];
        head.appendChild(_ajax.scriptObject);
    }

    function _buildConnectionUrl(queryParam, id, allowRelativeUrls) {
        var query = queryParam + '&callback=' + id;
        logger.info('SPiD.Talk.buildConnectionUrl("' + query + '")');
        _ajax.connectionId = _ajax.connections.length;

        var client_id = exports.options().client_id,
            redirect_uri = window.location.toString(),
            requestBase = ((query.substr(0, 4) === 'http') || allowRelativeUrls) ? query : _ajax.serverUrl + query;

        var url = requestBase + '&connectionId=' + _ajax.connectionId + '&client_id=' + client_id + '&redirect_uri=' + (encodeURIComponent(redirect_uri));
        logger.info('-- built url: [' + url + ']');
        _ajax.requestQueue[_ajax.requestQueue.length] = _makeRequestQueueNode(url);
    }

    function _makeRequestQueueNode(url) {
        logger.info('Creating a new requestQueueNode("' + url + '")');
        return {
            connectionUrl: url,
            requestSent: false
        };
    }

    function loadingError() {
        logger.info('SPiD.Talk.loadingError()');
        _stopPolling();
        _failure('Server Timed Out');
    }

    function send(query, callback) {
        // Add the callback to the callbacks object
        var id = _guid();
        _callbacks[id] = callback;
        logger.info('SPiD.Talk.send("' + query + '")');
        _buildConnectionUrl(query, id, _ajax.testMode);
        _startPolling();
    }

    function init(options) {
        // Ported from VGS.init, should be applied on SPiD.init ???
        _ajax.timeoutPeriod = options.timeout || _ajax.timeoutPeriod;
        _ajax.serverUrl = (options.https ? 'https' : 'http') + '://' + options.server + '/';
        if(options.prod) {
            _ajax.sessionUrl = (options.https ? 'https' : 'http') + '://session.' + options.server + '/rpc/hasSession.js';
        } else {
            _ajax.sessionUrl = (options.https ? 'https' : 'http') + '://' + options.server + '/ajax/hasSession.js';
        }
        _ajax.testMode = options._testMode;
    }

    function _removeScriptObject() {
        logger.info('SPiD.Talk.removeScriptObject()', 'log');
        _ajax.scriptObject.parentNode.removeChild(_ajax.scriptObject);
        _ajax.scriptObject = null;
    }

    function _responseReceived() {
        logger.info('SPiD.Talk.responseReceived()');
        logger.info('Processing: off');
        _ajax.requestQueue.shift();
        _ajax.serverTimeoutTime = null;
        _removeScriptObject();
    }

    function compatSend(server, path, params, callback) {
        var url = exports.Util.buildUri(server, path, params);
        send(url, callback);
    }

    window.VGS = {
        Ajax: {
            responseReceived: _responseReceived
        },
        callbacks: _callbacks
    };

    exports.Talk = {
        request: function() {
            var sendFun = (arguments.length === 2) ? send: compatSend;
            return sendFun.apply(this, arguments);
        },
        init: init
    };

}(SPiD));