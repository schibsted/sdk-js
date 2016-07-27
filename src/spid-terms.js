/*global module:false, require:false*/
var log = require('./spid-log'),
    talk = require('./spid-talk');

function showPopup(element) {
    var callback = function (err, res) {
        var createPopupElement = function () {
            var template = require('mustache!./templates/popup.html');
            var htmlContent = template({
                offsetTop: element.offsetTop,
                offsetLeft: element.offsetLeft,
                header: res.popupData.header,
                logos: res.popupData.logos,
                description: res.popupData.description,
                notice: res.popupData.notice,
                acceptText: res.popupData.acceptText,
                buttonText: res.popupData.buttonText,
                declineText: res.popupData.declineText
            });

            var popup = document.createElement('div');
            var body = document.getElementsByTagName('body')[0];
            popup.innerHTML = htmlContent;
            body.appendChild(popup);
        };

        if (res.showPopup) {
            require('!style!css!./styles/popup.css');
            createPopupElement();
            window.console.log('Show popup');
        }
        window.console.log(res, 'callback test');
    };

    if (element != null) {
        log.info('popup');
        talk.request('http://localhost:9090/', 'test/mock/spid-talk_response-termsStatus-success.js', {}, callback);
    }
}

module.exports = {
    showPopup: showPopup
};
