/*global describe:false*/
/*global it:false*/
/*global SPiD:false*/

describe('SPiD.Talk', function() {

    it('SPiD.Talk.request should send request and call callback with error and response when successful', function(done) {
        SPiD.Talk.request('./mock/','spid-talk_response-hasProduct-success.js', {}, function(err, res) {
            if(!err && res) {
                done();
            }
        });
    });

    it('SPiD.Talk.request should send request and call callback with error and response when error', function(done) {
        SPiD.Talk.request('./mock/','spid-talk_response-hasSession-deny.js', {}, function(err, res) {
            if(err && res) {
                done();
            }
        });
    });

});
