/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global before:false*/
/*global SPiD:false*/

describe('SPiD.Util', function() {

    var assert = chai.assert;
    var setup = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod:false, logging:false};

    before(function() {
        SPiD.init(setup);
    });
    it('SPiD.Util.buildUri should return correctly formatted URL', function() {
        assert.equal(SPiD.Util.buildUri('https://google.se/', 'test', {a:1,b:2,c:null}), 'https://google.se/test?a=1&b=2');
        assert.equal(SPiD.Util.buildUri('https://google.se/', null, {a:1,b:2,c:null}), 'https://google.se/?a=1&b=2');
    });

    it('SPiD.Util.copy should return empty object when feed empty objects', function() {
        assert.deepEqual(
            SPiD.Util.copy({},{}),
            {}
        );
    });

    it('SPiD.Util.copy should return combination of two objects', function() {
        assert.deepEqual(
            SPiD.Util.copy({test:true},{user:123}),
            {test:true, user:123}
        );
    });

    it('SPiD.Util.copy should premiere keys in target over source', function() {
        assert.deepEqual(
            SPiD.Util.copy({test:true, user:234},{user:123, test2:false}),
            {test:true, user:234, test2:false}
        );
    });

    it('SPiD.Util.now should return integer', function() {
        assert.isNumber(SPiD.Util.now());
    });

    it('SPiD.Util.now should return unix time in ms', function() {
        assert.closeTo(
            SPiD.Util.now(),
            (new Date()).getTime(),
            100
        );
    });


});
