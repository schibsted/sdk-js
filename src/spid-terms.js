/*global module:false, require:false*/
var log = require('./spid-log'),
    talk = require('./spid-talk');
require('css!./style.css');

function showPopup(element) {
    var callback = function (err, res) {
        var createPopupElement = function (content) {
            var popup = document.createElement('div');
            popup.innerHTML = content;
            element.appendChild(popup);
        };

        if (res.showPopup) {
            //load css here

            createPopupElement(res.popupContent);
            window.console.log('Show popup');
        }
        window.console.log(res, 'callback test');
    };

    if (element != null) {
        element.onclick = function () {
            log.info('popup');
            talk.request('http://localhost:9090/', 'test/mock/spid-talk_response-termsStatus-success.js', {}, callback);
        };
    }
}

module.exports = {
    showPopup: showPopup
};
