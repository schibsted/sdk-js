/*global require:false, module:false*/

var subscribers = {},
    log = require('./spid-log');

/**
 * Subscribe to a given event name, invoking your callback function whenever
 * the event is fired.
 *
 * For example, suppose you want to get notified whenever the session
 * changes:
 *
 *     SPiD.Event.subscribe('auth.sessionChange', function(response) {
 *       // do something with response.session
 *     });
 *
 * @access public
 * @param name {String} Name of the event.
 * @param cb {Function} The handler function.
 */
function subscribe(name, cb) {
    log.info('SPiD.Event.subscribe({n})'.replace('{n}', name));
    if (!subscribers[name]) {
        subscribers[name] = [];
    }
    subscribers[name].push(cb);
}

/**
 * Removes subscribers, inverse of [SPiD.Event.subscribe](SPiD.Event.subscribe).
 *
 * Removing a subscriber is basically the same as adding one. You need to
 * pass the same event name and function to unsubscribe that you passed into
 * subscribe. If we use a similar example to
 * [SPiD.Event.subscribe](SPiD.Event.subscribe), we get:
 *
 *     var onSessionChange = function(response) {
 *       // do something with response.session
 *     };
 *     SPiD.Event.subscribe('auth.sessionChange', onSessionChange);
 *
 *     // sometime later in your code you dont want to get notified anymore
 *     SPiD.Event.unsubscribe('auth.sessionChange', onSessionChange);
 *
 * @access public
 * @param name {String} Name of the event.
 * @param cb {Function} The handler function.
 */
function unsubscribe(name, cb) {
    log.info('SPiD.Event.unsubscribe({n})'.replace('{n}', name));
    var subs = subscribers[name] || [];
    for (var i = 0, l = subs.length; i !== l; i++) {
        if (subs[i] === cb) {
            subs[i] = null;
        }
    }
}

/**
 * Fires a named event. The first argument is the name, the rest of the
 * arguments are passed to the subscribers.
 *
 * @access public
 * @param name {String} the event name
 */
function fire(/* polymorphic */) {
    var args = Array.prototype.slice.call(arguments),
        name = args.shift();
    log.info('SPiD.Event.fire({n})'.replace('{n}', name));
    var subs = subscribers[name] || [];
    for (var i = 0, l = subs.length; i !== l; i++) {
        if (subs[i]) {
            subs[i].apply(this, args);
        }
    }
}

module.exports = {
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    fire: fire
};
