/*global module:false, require:false*/
var talk = require('./spid-talk');

function showPopup(element) {

    var popup = (function () {
        var DOMElement, overlay, breakpointWidth;

        var setPopupPosition = function (elementWhichPopupIsPinnedTo) {
            if (window.innerWidth < breakpointWidth) {
                DOMElement.style.top = 0;
                DOMElement.style.left = 0;
                DOMElement.style.right = 0;
                DOMElement.style.bottom = 0;
                DOMElement.style.width = '100%';
                DOMElement.style.maxWidth = '100%';
            } else {
                var rect = elementWhichPopupIsPinnedTo.getBoundingClientRect();
                DOMElement.removeAttribute('style');
                DOMElement.style.top = rect.top + rect.height + 'px';
                DOMElement.style.right = window.innerWidth - (rect.left + rect.width) + 'px';
            }
        };

        var addClosingPopupListener = function (closingElement) {
            closingElement.addEventListener('click', function () {
                document.body.removeChild(overlay);
                document.body.removeChild(DOMElement);
                window.removeEventListener('resize', function () {
                    setPopupPosition(element, breakpointWidth);
                });
            });
        };

        var init = function (res, breakpointWindowWidth) {
            breakpointWidth = (typeof breakpointWindowWidth === 'undefined') ? 380 : breakpointWindowWidth;
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

            overlay = document.createElement('div');
            DOMElement = document.createElement('div');
            overlay.className = 'overlay';
            DOMElement.className = 'popup';
            DOMElement.innerHTML = htmlContent;
            setPopupPosition(element);
            document.body.appendChild(overlay);
            document.body.appendChild(DOMElement);

            window.addEventListener('resize', function () {
                setPopupPosition(element);
            });

            document.querySelectorAll('[data-js="close-popup"]').forEach(addClosingPopupListener);
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
