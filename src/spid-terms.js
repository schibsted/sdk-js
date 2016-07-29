/*global module:false, require:false*/
var talk = require('./spid-talk');

function showPopup(element) {

    var popup = {
        init: function (res) {
            var setRightOffset = function(element, popup){
                var rect = element.getBoundingClientRect();
                popup.style.right = window.innerWidth - (rect.left + rect.width) + 'px';
            };

            var addClosingPopupListener = function(overlay, popup){
                var closingElement = document.getElementById('close-popup');
                closingElement.onclick = function(){
                    document.body.removeChild(overlay);
                    document.body.removeChild(popup);
                };
            };

            var createPopupElement = (function () {
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
                setRightOffset(element, popup);
                document.body.appendChild(overlay);
                document.body.appendChild(popup);

                window.addEventListener('resize', function () {
                    setRightOffset(element, popup);
                });

                addClosingPopupListener(overlay, popup);
            })();
        }
    };

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
