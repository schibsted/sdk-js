;(function(global) {
    //Not part of response. Hack to get the callback id
    var scripts = document.head.getElementsByTagName('script');
    var src = scripts[scripts.length-1].src;
    var id = src.match(/callback=[0-9a-f]+/i).pop().split("=").pop();

    if(global.SPiD) {
        global.SPiD.Talk.response(id, {"result":true,"serverTime":1390824533,"expiresIn":7111,"baseDomain":"sdk.dev","visitor":{"uid":"15lswsXms7xoaXpdd852","user_id":"1844813"},"userStatus":"connected","userId":1844813,"id":"4f1e2ae59caf7c2f4a058b76","displayName":"Joakim Developer","givenName":"Joakim","familyName":"Developer","gender":"male","photo":"https:\/\/secure.gravatar.com\/avatar\/ec32937c22d1a4b1474657b776d0f398?s=200","sig":"5nqQdhfEvkcMqFr2XEgOrRCAtXn_H4_1EN_Qp-j_SCU.eyJyZXN1bHQiOnRydWUsInNlcnZlclRpbWUiOjEzOTA4MjQ1MzMsImV4cGlyZXNJbiI6NzExMSwiYmFzZURvbWFpbiI6Ind3dy5hZnRvbmJsYWRldC5zZSIsInZpc2l0b3IiOnsidWlkIjoiMTVsc3dzWG1zN3hvYVhwZGQ4NTIiLCJ1c2VyX2lkIjoiMTg0NDgxMyJ9LCJ1c2VyU3RhdHVzIjoiY29ubmVjdGVkIiwidXNlcklkIjoxODQ0ODEzLCJpZCI6IjRmMWUyYWU1OWNhZjdjMmY0YTA1OGI3NiIsImRpc3BsYXlOYW1lIjoiSm9ha2ltIFdcdTAwZTVuZ2dyZW4iLCJnaXZlbk5hbWUiOiJKb2FraW0iLCJmYW1pbHlOYW1lIjoiV1x1MDBlNW5nZ3JlbiIsImdlbmRlciI6Im1hbGUiLCJwaG90byI6Imh0dHBzOlwvXC9zZWN1cmUuZ3JhdmF0YXIuY29tXC9hdmF0YXJcL2VjMzI5MzdjMjJkMWE0YjE0NzQ2NTdiNzc2ZDBmMzk4P3M9MjAwIiwiYWxnb3JpdGhtIjoiSE1BQy1TSEEyNTYifQ"});
    }
}(window));