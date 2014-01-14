/*global SPiD */
;(function(exports) {

    var _scriptObject,
        _queue = {};

    function _createScriptObject(source) {
        _scriptObject = document.createElement('SCRIPT');
        _scriptObject.src = source;
        _scriptObject.type = 'text/javascript';
        _scriptObject.onerror = function() {/*@TODO*/};
        var head = document.getElementsByTagName('HEAD')[0];
        head.appendChild(_scriptObject);
    }

    function _removeScriptObject() {
        _scriptObject.parentNode.removeChild(_scriptObject);
        _scriptObject = null;
    }


    function request() {}
    function hasSession() {}
    function hasProduct(productId, callback) {
        var options = exports.options();
        if(!!options.cache) {
            //Look in cache
            return callback();
        }
        request('ajax/hasproduct.js?product_id={p}&callback={cb}'.replace('{p}', productId).replace('{cb}', ''));
        if(!!options.cache) {
            //Write to cache
        }
        return callback();

    }
    function hasSubscription(productId) {}
    function setTraits() {}

    exports.IO = {
        hasSession: hasSession,
        hasProduct: hasProduct,
        hasSubscription: hasSubscription,
        setTraits: setTraits
    };
}(SPiD));