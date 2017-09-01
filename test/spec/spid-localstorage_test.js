describe('SPiD.Localstorage', function() {
    var assert = chai.assert;
    var storage  = require('../../src/spid-localstorage');

    it(' set/get should work ', function() {
        var data = { I: 'love', 'to:': { nest: 'data' } };
        storage.set('test', data);
        assert.isDefined(window.localStorage);
        assert.deepEqual(data, storage.get('test'));
    });

    it(' clear should clear ', function() {
        var data = 'xxx';
        storage.set('test', data);
        storage.clear('test');
        assert.isNull(storage.get('test'));
    });

    it(' clear only clears one key', function () {
        var preExistingValueRead, preExistingKey = 'a';
        var valueStored = 'foo';
        storage.set(preExistingKey, valueStored);

        storage.set('b');
        storage.clear('b');

        preExistingValueRead = storage.get('a');

        assert.equal(valueStored, preExistingValueRead);
    });

    it(' passing an expires parameter should add expires field that\'s in the future', function() {
        var time, storedData, data = { thought: 'leader' };
        storage.set('test', data, 100);
        storedData = JSON.parse(window.localStorage.getItem('test'));
        time = new Date(storedData._expires).getTime();
        assert.closeTo(new Date().getTime() +100*1000, time, 1000 );
    });

    it(' NOT passing an expires parameter should NOT add expires field', function() {
        var storedData, data = { thought: 'leader' };
        storage.set('test', data);
        storedData = window.localStorage.getItem('test');
        assert.isUndefined(storedData._expires);
    });

    it(' reading an expired object should remove it from storage and return null ', function() {
        var expired = { thought: 'leader', _expires: new Date(1337) };
        window.localStorage.setItem('test', JSON.stringify(expired));
        assert.isNull(storage.get('test'));
        assert.isNull( window.localStorage.getItem('test'));
    });
});
