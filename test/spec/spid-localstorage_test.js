/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global SPiD:false*/

describe('SPiD.Localstorage', function() {

    var assert = chai.assert;

    it(' set/get should work ', function() {
        var data = {"I": "love", "to:": {"nest": "data"}};
        SPiD.LocalStorage.set("test", data);
        assert.isDefined(window.localStorage);
        assert.deepEqual(data, SPiD.LocalStorage.get("test"));
    });

    it(' clear should clear ', function() {
        var data = "xxx";
        SPiD.LocalStorage.set("test", data);
        SPiD.LocalStorage.clear("test");
        assert.isNull(SPiD.LocalStorage.get("test"));
    });

    it(' passing an expires parameter should add expires field that\'s in the future', function() {
        var data = {"thought" : "leader"};
        SPiD.LocalStorage.set("test", data, 100);
        var storedData = JSON.parse(window.localStorage.getItem("SPiD_test"));
        var time = new Date(storedData._expires).getTime();
        assert.closeTo(new Date().getTime() +100*1000 ,time, 1000 );
    });

    it(' NOT passing an expires parameter should NOT add expires field', function() {
        var data = {"thought" : "leader"};
        SPiD.LocalStorage.set("test", data);
        var storedData = window.localStorage.getItem("SPiD_test");
        assert.isUndefined(storedData._expires);
    });

    it(' reading an expired object should remove it from storage and return null ', function() {
        var expired = {"thought" : "leader", "_expires" : new Date(1337) };
        window.localStorage.setItem("SPiD_test", JSON.stringify(expired));
        assert.isNull(SPiD.LocalStorage.get("test"));
        assert.isNull( window.localStorage.getItem("SPiD_test"));
    });


});
