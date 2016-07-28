/*global module:false, require:false*/
var log = require('./spid-log'),
    talk = require('./spid-talk');

function showPopup(element) {
    var callback = function (err, res) {

        var getRightOffset = function(el){
            var rect = el.getBoundingClientRect();
            return window.innerWidth - (rect.left + rect.width);
        };

        var createPopupElement = function () {
            var template = require('mustache!./templates/popup.html');
            var htmlContent = template({
                header: res.popupData.header,
                logos: res.popupData.logos,
                description: res.popupData.description,
                notice: res.popupData.notice,
                acceptText: res.popupData.acceptText,
                buttonText: res.popupData.buttonText,
                declineText: res.popupData.declineText
            });

            var overlay = document.createElement('div');
            var popup = document.createElement('div');
            overlay.className = 'overlay';
            popup.className = 'popup';
            popup.innerHTML = htmlContent;
            var rect = element.getBoundingClientRect();
            var top = rect.top + rect.height;
            popup.style.top = top + 'px';
            popup.style.right = getRightOffset(element) + 'px';
            document.body.appendChild(overlay);
            document.body.appendChild(popup);

            window.addEventListener('resize', function () {
                popup.style.right = getRightOffset(element) + 'px';
            });
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
