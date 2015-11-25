'use strict';

describe('SPiD.Talk', function() {
    var setup = { client_id: '4d00e8d6bf92fc8648000000', server: 'stage.payment.schibsted.se', useSessionCluster: false, logging: false, timeout: 500 };
    var SPiD  = require('../../src/spid-sdk'),
        talk = require('../../src/spid-talk');
    before(function() {
        SPiD.init(setup);
    });

    it('SPiD.Talk.request should send request and call callback with error and response when successful', function(done) {
        talk.request('/base/test/mock/', 'spid-talk_response-hasProduct-success.js', {}, function(err, res) {
            if (!err && res) {
                done();
            }
        });
    });

    it('SPiD.Talk.request should send request and call callback with error and response when error', function(done) {
        talk.request('/base/test/mock/', 'spid-talk_response-hasSession-deny.js', {}, function(err, res) {
            if (err && res) {
                done();
            }
        });
    });

    it('SPiD.Talk should call callback with error when script has timed out', function(done) {
        talk.request('/base/test/mock/', 'spid-talk_response-hasSession-timeout.js', {}, function(err, res) {
            if (err && res && err.code === 503 && err.description === 'Timeout reached') {
                done();
            }
        });
    });

    it('SPiD.Talk should call callback with error when browser triggers error', function(done) {
        talk.request('/base/test/mock/', 'spid-talk_response-404.js', {}, function(err, res) {
            if (err && res && err.code === 503 && err.description === 'Browser triggered error') {
                done();
            }
        });
    });
});
