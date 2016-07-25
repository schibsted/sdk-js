/*global module:false, require:false*/
var log = require('./spid-log'),
    talk = require('./spid-talk');

function showPopup(element) {
    var callback = function (err, res) {
        var createPopopElement = function(content) {
            var popup = document.createElement("div");
            
        };

        if (res.showPopup) {
            //load css here
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
