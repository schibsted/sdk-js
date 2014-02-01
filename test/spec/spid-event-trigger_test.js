/*global describe:false*/
/*global it:false*/
/*global before:false*/
/*global after:false*/
/*global SPiD:false*/

describe('SPiD.EventTrigger', function() {

    describe('SPiD.EventTrigger.session', function() {
        var copy_Event_fire;
        before(function() {
            copy_Event_fire = SPiD.Event.fire;
        });

        it('SPiD.EventTrigger.session should trigger SPiD.visitor event when visitor retrieved', function(done) {
            SPiD.Event.fire = function(name, data) {
                if(name === 'SPiD.visitor' && data.uid === "1kr188Xmrf4wxX7ttrcx") {
                    done();
                }
            };
            SPiD.EventTrigger.session({}, {"result":true, "visitor":{"uid":"1kr188Xmrf4wxX7ttrcx","user_id":"2200021"}});
        });

        it('SPiD.EventTrigger.session should trigger SPiD.login event when user logs in', function(done) {
            SPiD.Event.fire = function(name, data) {
                if(name === 'SPiD.login' && data.userId === 10) {
                    done();
                }
            };
            SPiD.EventTrigger.session({}, {"result":true, "userId": 10});
        });

        it('SPiD.EventTrigger.session should trigger SPiD.logout event when user was logged in and is not logged out', function(done) {
            SPiD.Event.fire = function(name, data) {
                if(name === 'SPiD.logout' && data.result === false) {
                    done();
                }
            };
            SPiD.EventTrigger.session({"userId":10}, {"result":false});
        });

        it('SPiD.EventTrigger.session should trigger SPiD.userChange and SPiD.login event when user was logged in and another is not logged in', function(done) {
            var loginCalled = false,
                userChangeCalled = false;
            SPiD.Event.fire = function(name, data) {
                switch (name) {
                    case "SPiD.login":
                        loginCalled = true;
                        break;
                    case "SPiD.userChange":
                        userChangeCalled = true;
                        break;
                    case "SPiD.sessionChange":
                        return;
                }
                if(loginCalled && userChangeCalled && data.userId === 11) {
                    done();
                }
            };
            SPiD.EventTrigger.session({"userId":10}, {"result":true, "userId":11});
        });

        after(function() {
            SPiD.Event.fire = copy_Event_fire;
        });
    });

});
