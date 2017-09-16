describe('SPiD.Callbacks', function() {

    var assert = chai.assert,
        cbs = require('../../src/spid-callbacks');

    it('should register callbacks', function() {
        cbs.register('some-key', function() {});
        assert.isFalse(cbs.hasPending('some-key'));
        cbs.register('some-key', function() {});
        assert.isTrue(cbs.hasPending('some-key'));
    });

    it('should call all callbacks when invoke', function() {
        var cb = sinon.spy();
        cbs.register('some-key', cb);
        cbs.register('some-key', cb);
        cbs.register('some-key', cb);
        cbs.invokeAll('some-key', null, { result: true });
        assert(cb.calledThrice);
    });
});
