/*global describe:false*/
/*global sinon:false*/
/*global it:false*/
/*global before:false*/
/*global after:false*/
describe('SPiD.EventTrigger', function() {

    var eventTrigger = require('../../src/spid-event-trigger');

    describe('SPiD.EventTrigger.session', function() {
        var eventSpy;
        beforeEach(function() {
            eventSpy = sinon.spy(require('../../src/spid-event'), 'fire');
        });
        afterEach(function() {
            eventSpy.restore();
        });

        it('SPiD.EventTrigger.session should trigger SPiD.visitor event when visitor retrieved', function() {
            eventTrigger.session({}, {
                "result": true,
                "visitor": {"uid": "1kr188Xmrf4wxX7ttrcx", "user_id": "2200021"}
            });
            assert.isTrue(eventSpy.calledWithMatch('SPiD.visitor', {"uid": "1kr188Xmrf4wxX7ttrcx"}));
        });

        it('SPiD.EventTrigger.session should trigger SPiD.login event when user logs in', function() {
            eventTrigger.session({}, {"result": true, "userId": 10});
            assert.isTrue(eventSpy.calledWithMatch('SPiD.login', {"userId": 10, "result": true}));
        });

        it('SPiD.EventTrigger.session should trigger SPiD.logout event when user was logged in and is not logged out', function() {
            var eventTrigger = require('../../src/spid-event-trigger');
            eventTrigger.session({"userId": 10}, {"result": false});
            assert.isTrue(eventSpy.calledWithMatch('SPiD.logout', {"result": false}));
        });

        it('SPiD.EventTrigger.session should trigger SPiD.userChange and SPiD.login event when user was logged in and another is not logged in', function() {
            eventTrigger.session({"userId": 10}, {"result": true, "userId": 11});
            assert.isTrue(eventSpy.calledWithMatch('SPiD.login'));
            assert.isTrue(eventSpy.calledWithMatch('SPiD.userChange'));
            assert.isTrue(eventSpy.calledWithMatch('SPiD.sessionChange'));
        });
    });

});
