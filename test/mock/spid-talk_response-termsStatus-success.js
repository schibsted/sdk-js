function triggerResponse() {
    var json = {
        "result": true,
        "serverTime": 1390824533,
        "expiresIn": 7111,
        "showPopup": true,
        "popupData": {
            'header': 'Hi!',
            'logos': '',
            'description': 'SITENAME uses SPiD as a login service. SPiD has updated its Terms of Use and Privacy Policy.',
            'notice': 'If you do not accept the terms by YYYY-MM-DD, you will be logged out. Read more.',
            'acceptText': 'I accept the updated Terms of Use and Privacy Policy.',
            'buttonText': 'I accept the new Terms of Use',
            'declineText': 'Not now, remind me later.'
        }
    };

    //Not part of response. Hack to get the callback id
    var scripts = document.head.getElementsByTagName('script');
    var src = scripts[scripts.length - 1].src;
    var id = src.match(/callback=[0-9a-f]+/i).pop().split("=").pop();

    if (VGS) {
        VGS.callbacks[id](json);
        parent.VGS.Ajax.responseReceived();
    }
}
;(function (global) {
    //Not part of response. Hack to get the callback id
    var scripts = document.head.getElementsByTagName('script');
    var src = scripts[scripts.length - 1].src;
    var id = src.match(/callback=[0-9a-f]+/i).pop().split("=").pop();

    if (global.SPiD) {
        global.SPiD.Talk.response(id, {
            "result": true,
            "serverTime": 1390824533,
            "expiresIn": 7111,
            "showPopup": true,
            "popupData": {
                'header': 'Hi!',
                'logos': '',
                'description': 'SITENAME uses SPiD as a login service. SPiD has updated its Terms of Use and Privacy Policy.',
                'notice': 'If you do not accept the terms by YYYY-MM-DD, you will be logged out. Read more.',
                'acceptText': 'I accept the updated Terms of Use and Privacy Policy.',
                'buttonText': 'I accept the new Terms of Use',
                'declineText': 'Not now, remind me later.'
            }
        });
    }
}(window));