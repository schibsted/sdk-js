/*global SPiD:false*/
;(function(exports) {

    if(!exports.Event) {
        throw new Error('SPiD.Event is not loaded');
    }

    var _sessionInitiatedSent = false;

    function session(previous, current) {
        //Respons contains a visitor
        if(current.visitor) {
            exports.Event.fire('SPiD.visitor', current.visitor);
        }

        //User has created a session, or user is no longer the same
        if(current.userId && previous.userId !== current.userId) {
            exports.Event.fire('SPiD.login', current);
        }

        //User is no longer logged in
        if(previous.userId && !current.userId) {
            exports.Event.fire('SPiD.logout', current);
        }

        //One user was logged in, and it is no longer same user
        if(previous.userId && current.userId && previous.userId !== current.userId) {
            exports.Event.fire('SPiD.userChange', current);
        }

        //There is a user now, or there used to be a user
        if(current.userId || previous.userId) {
            exports.Event.fire('SPiD.sessionChange', current);
        }

        // No user neither before nor after
        if(!(current.userId || previous.userId)) {
            exports.Event.fire('SPiD.notLoggedin', current);
        }

        // Fired when the session is successfully initiated for the first time
        if(current.userId && !_sessionInitiatedSent) {
            _sessionInitiatedSent = true;
            exports.Event.fire('SPiD.sessionInit', current);
        }
        // TODO: auth.statusChange / VGS.loginStatus?
    }

    function sessionError(err) {
        exports.Event.fire('SPiD.error', {'type': 'communication', 'description':err});
    }

    exports.EventTrigger = {
        session: session,
        sessionError: sessionError
    };

}(SPiD));