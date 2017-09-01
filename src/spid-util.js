var log = require('./spid-log.js');
function copy(target, source) {
    var key;
    for (key in source) {
        if (target[key] === undefined) {
            target[key] = source[key];
        }
    }
    return target;
}

function now() {
    return (new Date()).getTime();
}

function buildUri(server, path, params) {
    var key, url, p = [];
    for (key in params) {
        if (params[key]) {
            p.push(key + '=' + params[key]);
        }
    }
    url = server + (path || '') + '?' + p.join('&');
    log.info('SPiD.Util.buildUri() built {u}'.replace('{u}', url));
    return url;
}

function makeAsync(fn) {
    return function() {
        var args = arguments;
        setTimeout(function() {
            fn.apply(null, args);
        }, 0);
    };
}

module.exports = {
    copy: copy,
    now: now,
    buildUri: buildUri,
    makeAsync: makeAsync
};
