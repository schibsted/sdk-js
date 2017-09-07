/*global require:false, module:false*/

var _domain = document.domain, // use document domain by default
    _varnishCookieName = 'SP_ID',
    log = require('./spid-log'),
    config = require('./spid-config');

function decode(value) {
    return JSON.parse(window.unescape(value));
}

function encode(value) {
    return window.escape(JSON.stringify(value));
}


function _setRaw(name, value, expiresIn, domain) {
    var date = new Date();
    if (typeof expiresIn === 'number' && expiresIn > 0) {
        date.setTime(date.getTime() + (expiresIn * 1000));
    } else {
        date.setTime(0);
    }
    // If the domain is missing or of the wrong type, assume a good default
    if (typeof domain !== 'string') {
        domain = _domain || document.domain;
    }
    // To comply with https://tools.ietf.org/html/rfc6265#section-5.2.3 remove the leading dot
    if (domain.indexOf('.') === 0) {
        domain = domain.substr(1);
    }
    var cookie = '{n}={v}; expires={e}; path=/; domain={d}'
        .replace('{n}', name)
        .replace('{v}', value)
        .replace('{e}', date.toUTCString())
        .replace('{d}', domain);
    document.cookie = cookie;
}

function _clearRaw(name, domain) {
    return _setRaw(name, '', 0, domain);
}

function _setVarnishCookie(session, options) {
    var expiresIn = options.varnish_expiration || session.expiresIn;
    _setRaw(_varnishCookieName, session.sp_id, expiresIn, session.baseDomain);
    log.info('SPiD.Cookie.set({n})'.replace('{n}', _varnishCookieName));
}

function tryVarnishCookie(session) {
    var options = config.options();
    if(session.sp_id &&
        (options.setVarnishCookie === true ||
        (options.storage === 'cookie' && options.setVarnishCookie !== false))) {
        _setVarnishCookie(session, options);
    }
}

function clearVarnishCookie(domain) {
    log.info('SPiD.Cookie.clearVarnishCookie()');
    _clearRaw(_varnishCookieName, domain);
}

function hasVarnishCookie() {
    return document.cookie.indexOf(_varnishCookieName + '=') > -1;
}

function set(name, session, expiresInSeconds) {
    if(!session) { return false; }
    _domain = session.baseDomain;
    _setRaw(name, encode(session), expiresInSeconds, _domain);
    log.info('SPiD.Cookie.set({n})'.replace('{n}', name));
}

function get(name) {
    log.info('SPiD.Cookie.get()');
    var cookies = '; ' + document.cookie;
    var parts = cookies.split('; ' + name + '=');
    var cookie = (parts.length === 2) ? parts.pop().split(';').shift() : null;

    if (cookie) {
        // url encoded session stored as "sub-cookies"
        var session = decode(cookie);
        // decodes as a string, convert to a number
        session.expiresIn  = parseInt(session.expiresIn, 10);
        session.clientTime = parseInt(session.clientTime, 10);
        // capture base_domain for use when we need to clear
        _domain = session.baseDomain;
        return session;
    }
    return null;
}

function clear(name, domain) {
    log.info('SPiD.Cookie.clear()');
    _clearRaw(name, domain);
    clearVarnishCookie(domain);
}

function getVarnishCookie() {
    log.info('SPiD.Cookie.getVarnishCookie()');
    var cookies = '; ' + document.cookie;
    var parts = cookies.split('; ' + _varnishCookieName + '=');
    if (parts.length === 2) {
        return window.unescape(parts.pop().split(';').shift());
    }
    return null;
}

module.exports = {
    decode: decode,
    encode: encode,
    set: set,
    tryVarnishCookie: tryVarnishCookie,
    clearVarnishCookie: clearVarnishCookie,
    hasVarnishCookie: hasVarnishCookie,
    getVarnishCookie: getVarnishCookie,
    get: get,
    clear: clear,
    name: name
};
