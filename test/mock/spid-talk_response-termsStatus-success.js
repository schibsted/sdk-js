function triggerResponse(){
    var json = {"result":true,"serverTime":1390824533,"expiresIn":7111,"showPopup":true,"popupContent":"<h1>Hi</h1>"};

    //Not part of response. Hack to get the callback id
    var scripts = document.head.getElementsByTagName('script');
    var src = scripts[scripts.length-1].src;
    var id = src.match(/callback=[0-9a-f]+/i).pop().split("=").pop();

    if(VGS) {
        VGS.callbacks[id](json);
        parent.VGS.Ajax.responseReceived();
    }
}
;(function(global) {
    //Not part of response. Hack to get the callback id
    var scripts = document.head.getElementsByTagName('script');
    var src = scripts[scripts.length-1].src;
    var id = src.match(/callback=[0-9a-f]+/i).pop().split("=").pop();

    if(global.SPiD) {
        global.SPiD.Talk.response(id, {"result":true,"serverTime":1390824533,"expiresIn":7111,"showPopup":true,"popupContent":"<h1>Hi</h1>"});
    }
}(window));