/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global before:false*/

describe('SPiD.Util', function() {

    var assert = chai.assert;
    var setup = {client_id : '4d00e8d6bf92fc8648000000', server: 'identity-pre.schibsted.com', useSessionCluster:false, logging:false};
    var SPiD  = require('../../src/spid-sdk'),
        util = require('../../src/spid-util');

    before(function() {
        SPiD.init(setup);
    });

    it('SPiD.Util.buildUri should return correctly formatted URL', function() {
        assert.equal(util.buildUri('https://google.se/', 'test', {a:1,b:2,c:null}), 'https://google.se/test?a=1&b=2');
        assert.equal(util.buildUri('https://google.se/', null, {a:1,b:2,c:null}), 'https://google.se/?a=1&b=2');
    });

    it('SPiD.Util.copy should return empty object when feed empty objects', function() {
        assert.deepEqual(
            util.copy({},{}),
            {}
        );
    });

    it('SPiD.Util.copy should return combination of two objects', function() {
        assert.deepEqual(
            util.copy({test:true},{user:123}),
            {test:true, user:123}
        );
    });

    it('SPiD.Util.copy should premiere keys in target over source', function() {
        assert.deepEqual(
            util.copy({test:true, user:234},{user:123, test2:false}),
            {test:true, user:234, test2:false}
        );
    });

    it('SPiD.Util.now should return integer', function() {
        assert.isNumber(util.now());
    });

    it('SPiD.Util.now should return unix time in ms', function() {
        assert.closeTo(
            util.now(),
            (new Date()).getTime(),
            100
        );
    });


});
