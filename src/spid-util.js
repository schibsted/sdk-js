/*global require:false, module:false*/
var log = require('./spid-log.js');
function copy(target, source) {
    for(var key in source) {
        if(target[key] === undefined) {
            target[key] = source[key];
        }
    }
    return target;
}

function now() {
    return (new Date()).getTime();
}

function buildUri(server, path, params) {
    var p = [];
    for(var key in params) {
        if(params[key]) {
            p.push(key + '=' + params[key]);
        }
    }
    var url = server + (path || '') + '?' + p.join('&');
    log.info('SPiD.Util.buildUri() built {u}'.replace('{u}', url));
    return url;
}

module.exports = {
    copy: copy,
    now: now,
    buildUri: buildUri
};
