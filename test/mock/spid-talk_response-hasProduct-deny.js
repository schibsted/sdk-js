function triggerResponse(){
      var json = {"result":false,"serverTime":1390580626,"productId":10010,"userStatus":"connected","userId":2200021,"id":"4ebb7ce59caf7c1f22000001","displayName":"Joakim Developer","givenName":"Joakim","familyName":"Developer","gender":"male","photo":"http:\/\/www.gravatar.com\/avatar\/ec32937c22d1a4b1474657b776d0f398?s=200","expiresIn":7164,"baseDomain":"","sig":"FYHcpL-KJzjS9p_5mpCsFFxum2whgtYSvxwkoSjUTVk.eyJyZXN1bHQiOmZhbHNlLCJzZXJ2ZXJUaW1lIjoxMzkwNTgwNjI2LCJwcm9kdWN0SWQiOjEwMDEwLCJ1c2VyU3RhdHVzIjoiY29ubmVjdGVkIiwidXNlcklkIjoyMjAwMDIxLCJpZCI6IjRlYmI3Y2U1OWNhZjdjMWYyMjAwMDAwMSIsImRpc3BsYXlOYW1lIjoiSm9ha2ltIFdcdTAwZTVuZ2dyZW4iLCJnaXZlbk5hbWUiOiJKb2FraW0iLCJmYW1pbHlOYW1lIjoiV1x1MDBlNW5nZ3JlbiIsImdlbmRlciI6Im1hbGUiLCJwaG90byI6Imh0dHA6XC9cL3d3dy5ncmF2YXRhci5jb21cL2F2YXRhclwvZWMzMjkzN2MyMmQxYTRiMTQ3NDY1N2I3NzZkMGYzOTg_cz0yMDAiLCJleHBpcmVzSW4iOjcxNjQsImJhc2VEb21haW4iOiIiLCJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiJ9"}

     //Not part of response. Hack to get the callback id
     var scripts = document.head.getElementsByTagName('script');
     var src = scripts[scripts.length-1].src;
     var id = src.match(/callback=[0-9a-f]+/i).pop().split("=").pop();

     VGS.callbacks[id](json);
     parent.VGS.Ajax.responseReceived();
}