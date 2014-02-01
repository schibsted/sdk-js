/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global SPiD:false*/

describe('SPiD.Log', function() {

    var assert = chai.assert;

    it('SPiD.Log.enabled should return true', function() {
        var conf = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod:false, logging:true};
        SPiD.init(conf);
        assert.isTrue(SPiD.Log.enabled());
    });
    it('SPiD.Log.error should log to console.error', function(done) {
        var copy_error = window.console.error;
        window.console.error = function() { done(); };
        var conf = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod:false, logging:true};
        SPiD.init(conf);
        SPiD.Log.error('My message');
        window.console.error = copy_error;
    });
    it('SPiD.Log.info should log to console.info', function(done) {
        var copy_info = window.console.info;
        window.console.info = function() { done(); };
        var conf = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod:false, logging:true};
        SPiD.init(conf);
        SPiD.Log.info('My message');
        window.console.info = copy_info;
    });
    it('SPiD.Log.enabled should return false', function() {
        var conf = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', prod:false, logging:false};
        SPiD.init(conf);
        assert.isFalse(SPiD.Log.enabled());
    });
});
