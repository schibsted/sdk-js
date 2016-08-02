/*global module:false, require:false*/
var talk = require('./spid-talk');

function showPopup(element) {

    var popup = (function () {
        var popup;
        var setPopupPosition = function (element, breakpointWindowWidth) {
            if (window.innerWidth < breakpointWindowWidth) {
                popup.style.top = 0;
                popup.style.left = 0;
                popup.style.right = 0;
                popup.style.bottom = 0;
                popup.style.width = '100%';
                popup.style.maxWidth = '100%';
            } else {
                var rect = element.getBoundingClientRect();
                popup.removeAttribute('style');
                popup.style.top = rect.top + rect.height + 'px';
                popup.style.right = window.innerWidth - (rect.left + rect.width) + 'px';
            }
        };

        var addClosingPopupListener = function (overlay) {
            var closingElement = document.getElementById('close-popup');
            closingElement.onclick = function () {
                document.body.removeChild(overlay);
                document.body.removeChild(popup);
            };
        };

        var init = function (res, breakpointWindowWidth) {
            var breakpointWidth = (typeof breakpointWindowWidth === 'undefined') ? 380 : breakpointWindowWidth;
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
            popup = document.createElement('div');
            overlay.className = 'overlay';
            popup.className = 'popup';
            popup.innerHTML = htmlContent;
            setPopupPosition(element, breakpointWidth);
            document.body.appendChild(overlay);
            document.body.appendChild(popup);

            window.addEventListener('resize', function () {
                setPopupPosition(element, breakpointWidth);
            });

            addClosingPopupListener(overlay);
        };

        return {
            init: init
        };

    })();

    var callback = function (err, res) {
        if (res.showPopup) {
            require('!style!css!./styles/popup.css');
            popup.init(res);
        }
    };

    if (element != null) {
        talk.request('http://localhost:9090/', 'test/mock/spid-talk_response-termsStatus-success.js', {}, callback);
    }
}

module.exports = {
    showPopup: showPopup
};
