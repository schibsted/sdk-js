/*global SPiD:false*/
/*global VGS:false */
;(function(exports) {

    var _scriptObject,
        _callbacks = {},
        _poller,
        _pollInterval = 300,
        _pollMaxCount = 50;
        //_queue = {};

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

    function _createScriptObject(source) {
        _scriptObject = document.createElement('SCRIPT');
        _scriptObject.src = source;
        _scriptObject.type = 'text/javascript';
        _scriptObject.onerror = function() {
            _stopPoll();
            _failure('Browser triggered error');
        };
        var head = document.getElementsByTagName('HEAD')[0];
        head.appendChild(_scriptObject);
    }

    function _removeScriptObject() {
        if(_scriptObject) {
            _scriptObject.parentNode.removeChild(_scriptObject);
            _scriptObject = null;
        }
    }

    function _startPoll(path) {
        _createScriptObject(path);
        _poll();
        var count = 1;
        _poller = window.setInterval(function () {
            if(count >= _pollMaxCount) {
                _failure('Poll max limit reached');
                return _stopPoll();
            }
            count++;
            _poll();
        }, _pollInterval);
    }
    function _stopPoll() {
        window.clearInterval(_poller);
        _removeScriptObject();
    }
    function _poll() {
        exports.Log().info('Poll');
        if(window['triggerResponse']) {
            window.triggerResponse();
            window.triggerResponse = null;
        }
    }
    function _failure(message) {
        exports.Log().error(message);
    }

    function request(server, path, params, callback) {
        var id = _createCallback(callback);
        //Legacy
        VGS.callbacks[id] = function(data) { response(id, data); };
        params = params || {};
        params.callback = id;
        var url = exports.Util().buildUri(server, path, params);
        exports.Log().info('Request: '+url);
        _startPoll(url);
    }

    function response(id, data) {
        exports.Log().info('Response received');
        _stopPoll();
        if(_callbacks[id]) {
            var f = _callbacks[id];
            _callbacks[id] = null;
            var err = data['error'] ? data['error'] : null,
                res = data['response'] ? data['response'] : data;
            f(err, res);
        }
    }

    exports.Talk = {
        request: request,
        response: response
    };

}(SPiD));