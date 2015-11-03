describe('SPiD.Log', function() {

    var assert = chai.assert;
    var SPiD  = require('../../src/spid-sdk'),
        log = require('../../src/spid-log');

    it('SPiD.Log.enabled should return true', function() {
        var conf = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', useSessionCluster:false, logging:true};
        SPiD.init(conf);
        assert.isTrue(log.enabled());
    });
    it('SPiD.Log.error should log to console.error', function(done) {
        var copy_error = window.console.error;
        window.console.error = function() { done(); };
        var conf = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', useSessionCluster:false, logging:true};
        SPiD.init(conf);
        log.error('My message');
        window.console.error = copy_error;
    });
    it('SPiD.Log.info should log to console.info', function(done) {
        var copy_info = window.console.info;
        window.console.info = function() { done(); };
        var conf = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', useSessionCluster:false, logging:true};
        SPiD.init(conf);
        log.info('My message');
        window.console.info = copy_info;
    });
    it('SPiD.Log.enabled should return false', function() {
        var conf = {client_id : '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', useSessionCluster:false, logging:false};
        SPiD.init(conf);
        assert.isFalse(log.enabled());
    });
});
