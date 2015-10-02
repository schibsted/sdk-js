/*global chai:false*/
/*global describe:false*/
/*global it:false*/
/*global SPiD:false*/

describe('SPiD.Talk (the backwards compatible one)', function() {

    var assert = chai.assert;

    var serverUrl = './mock/';

    var setup = {
        client_id: '4d00e8d6bf92fc8648000000',
        server: 'stage.payment.schibsted.se',
        serverUrl: serverUrl,
        prod: false,
        logging: false,
        timeout: 500,
        _testMode: true
    };


    it('Make that request!', function(done) {
        var query = './mock/spid-talk-backwards-compatible_response-hasSession-sucess.js?a=b';
        SPiD.init(setup);
        SPiD.Talk.request(query, function(res) {
            if(res) {
                done();
            }
        });
    });

});
