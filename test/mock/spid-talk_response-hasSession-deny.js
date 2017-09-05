;(function(global) {
    //Not part of response. Hack to get the callback id
    var scripts = document.head.getElementsByTagName('script');
    var src = scripts[scripts.length-1].src;
    var id = src.match(/callback=[0-9a-f]+/i).pop().split("=").pop();

    if(global.SPiD) {
        global.SPiD.Talk.response(id, {"error":{"code":401,"type":"UserException","description":"No session found!"},"response":{"result":false,"serverTime":1390583898,"expiresIn":7182,"baseDomain":"","visitor":{"uid":"1kr188Xmrf4wxX7ttrcx","user_id":"2200021"}}});
    }
}(window));