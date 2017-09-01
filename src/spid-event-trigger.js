var spidEvent = require('./spid-event'),
    _sessionInitiatedSent = false,
    _userStatus = 'unknown';

function session(previous, current) {
    // Respons contains a visitor
    if (current.visitor) {
        spidEvent.fire('SPiD.visitor', current.visitor);
    }

    // User has created a session, or user is no longer the same
    if (current.userId && previous.userId !== current.userId) {
        spidEvent.fire('SPiD.login', current);
    }

    // User is no longer logged in
    if (previous.userId && !current.userId) {
        spidEvent.fire('SPiD.logout', current);
    }

    // One user was logged in, and it is no longer same user
    if (previous.userId && current.userId && previous.userId !== current.userId) {
        spidEvent.fire('SPiD.userChange', current);
    }

    // There is a user now, or there used to be a user
    if (current.userId || previous.userId) {
        spidEvent.fire('SPiD.sessionChange', current);
    }

    // No user neither before nor after
    if (!(current.userId || previous.userId)) {
        spidEvent.fire('SPiD.notLoggedin', current);
    }

    // Fired when the session is successfully initiated for the first time
    if (current.userId && !_sessionInitiatedSent) {
        _sessionInitiatedSent = true;
        spidEvent.fire('SPiD.sessionInit', current);
    }

    // Triggered when the userStatus flag in the session has changed
    if (current.userStatus !== _userStatus) {
        _userStatus = current.userStatus;
        spidEvent.fire('SPiD.statusChange', current);
    }

    // TODO: VGS.loginStatus?
}

module.exports = {
    session: session
};
