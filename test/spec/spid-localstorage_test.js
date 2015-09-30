/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global SPiD:false*/

describe('SPiD.Localstorage', function() {

    var assert = chai.assert;

    it('SPiD.Localstorage.set/get should work ', function() {
        var data = {"I": "love", "to:": {"nest": "data"}};
        SPiD.LocalStorage.set("test", data);
        assert.isDefined(window.localStorage);
        assert.deepEqual(data, SPiD.LocalStorage.get("test"));
    });

    it('SPiD.Localstorage.clear should clear ', function() {
        var data = "xxx";
        SPiD.LocalStorage.set("test", data);
        SPiD.LocalStorage.clear("test");
        assert.isNull(SPiD.LocalStorage.get("test"));
    });
});
