/*global module:false, require:false*/
var log = require('./spid-log'),
    talk = require('./spid-talk');

function showPopup(element) {
    var callback = function (data) {
        window.console.log(data, 'callback test');
    };

    if (element != null) {
        element.onclick = function () {
            log.info('popup');
            talk.request('http://localhost:9090/', 'test/mock/spid-terms_request', {}, callback);
        };
    }
}

module.exports = {
    showPopup: showPopup
};
