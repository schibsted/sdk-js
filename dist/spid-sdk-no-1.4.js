/*
http://www.JSON.org/json2.js 2010-11-17	Public Domain.
*/
if (!this.JSON) {
    this.JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/**
 * Schibsted Payment JS SDK
 * @author Daniel Bentes
 * @version = 1.3
 */
if (!VGS) {
	var VGS = {
		client_id : false,
		redirect_uri : window.location.toString(),
		
		_session : null,
		_userStatus : 'unknown', // or 'notConnected' or 'connected'
		
		_logging : true,
		_prod : true,
		
		_domain : {
			prod : {
				api : 'https://payment.schibsted.no/api/',
				www : 'https://payment.schibsted.no/'
			},
			test : {
				api : 'https://stage.payment.schibsted.no/api/',
				www : 'https://stage.payment.schibsted.no/'
			}
		},
		
		// pending callbacks for VGS.getLoginStatus() calls
		callbacks: [],
		
		/**
	     * Generates a weak random ID.
	     *
	     * @access private
	     * @return {String} a random ID
	     */
	    guid: function() {
	      return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
	    },

		/**
		 * Copies things from source into target.
		 * 
		 * @access private
		 * @param target {Object} the target object where things will be copied into
		 * @param source {Object} the source object where things will be copied from
		 * @param overwrite {Boolean} indicate if existing items should be overwritten
		 * @param tranform {function} [Optional], transformation function for each item
		 */
		copy : function(target, source, overwrite, transform) {
			for ( var key in source) {
				if (overwrite || typeof target[key] === 'undefined') {
					target[key] = transform ? transform(source[key])
							: source[key];
				}
			}
			return target;
		},

	    /**
		 * @access public
		 * @param options {Object}
		 * 
		 * client_id| String 	| Your client_id. 					| *Mandatory*	| `null`
		 * cookie 	| Boolean 	| `true` to enable cookie support. 	| *Optional* 	| `true` 
		 * logging 	| Boolean 	| `true` to enable logging. 		| *Optional* 	| `false` 
		 * session 	| Object 	| Use specified session object. 	| *Optional* 	| `null` 
		 * status 	| Boolean 	| `true` to fetch fresh status. 	| *Optional* 	| `false`
		 * prod 	| Boolean 	| `true` to fetch from LIVE server 	| *Optional* 	| `true`
		 * timeout 	| Integer 	| Connection response timeout 	 	| *Optional* 	| `5000` // miliseconds
		 */
		init : function(options) {
	    	// only need to list values here that do not already have a falsy default
			options = VGS.copy(options || {}, {
				cookie : true,
				prod : true,
				status : false,
				timeout: 5000
			});
			// disable logging if told to do so, but only if the url doesnt have
			// the token to turn it on. this allows for easier debugging of third
			// party sites even if logging has been turned off.
	        if (!options.logging && window.location.toString().indexOf('vgs_debug=1') < 0) {
	        	VGS._logging = false;
	        }
			if (!window.console) {
				VGS._logging = false;
			}
			if (!options.cookie) {
				VGS.Cookie.enabled = false;
			}
			VGS.Ajax.timeoutPeriod = options.timeout;
			VGS.log('Default connection timeout set to ("'+ VGS.Ajax.timeoutPeriod +'")', 'log');
			if (typeof (options.client_id) == 'undefined') {
				VGS.log('VGS.init: client_id is missing!', 'error');
			} else {
				VGS.client_id = options.client_id;
				VGS.log('VGS.init("'+VGS.client_id+'")', 'log');
				if (VGS._prod && options.prod != false) {
					VGS.Ajax.serverUrl = VGS._domain.prod.www;
					VGS.Cookie.name = 'vgs_js_' + VGS.client_id;
				} else {
					VGS.Ajax.serverUrl = VGS._domain.test.www;
					VGS.Cookie.name = 'vgs_js_test_' + VGS.client_id;
				}
				
				var session, cookie = null;
				if (VGS.Cookie.enabled) {
					// Check cookie for client session
					cookie = VGS.Cookie.get();
				}
				if (options.session != null) {
					VGS.log('VGS.init: Session object provided! Expires in ' + options.session.expiresIn + ' seconds', 'log');
					session = options.session;
				} else if (cookie != null) {
					VGS.log('VGS.init: Cookie set! Expires in ' + cookie.expiresIn + ' seconds', 'log');
					session = cookie;
					VGS.Auth._loadState = 'loaded'; // Cookie loaded! Set state to loaded it so it can be auto-refreshed
				} else {
					VGS.log('VGS.init: No session set! Status unknown.', 'log');
				}
				if (typeof (session) == 'object' && session != null) {
					// Update clientside session expiration
					var now = parseInt(VGS.Ajax.now(), 10);
					var expiresInMilliseconds = parseInt((session.expiresIn*1000), 10);
					if (typeof (session.clientTime) != 'undefined') {
						// Updates session expiration based on client time
						var newExpiresIn = parseInt(((session.clientTime + expiresInMilliseconds) - now)/1000, 10);
						session.expiresIn = (typeof newExpiresIn == 'number' && newExpiresIn > 0) ? newExpiresIn : session.expiresIn;
						VGS.log('VGS.init: Session expiration updated to ' + session.expiresIn + ' seconds', 'log');
					}
					// set the session
					VGS.Auth.setSession(session, (typeof (session.userStatus) != 'undefined') ? session.userStatus : 'unknown');
					if (options.status == true) {
						VGS.getLoginStatus();
					}
				} else {
					// load a fresh session if requested
					if (options.status || session == null) {
						VGS.getLoginStatus();
					}
				}
			}	
		},
		processing : function(status) {
			VGS.log('VGS.processing("' + status + '")', 'log');
		},
		log : function(message, level) {
			if (VGS._logging) {
				if (level == 'warn') {
					console.warn(message);
				} else if (level == 'error') {
					console.error(message);
				} else {
					console.log(message);
				}
			}
			if (VGS.Event) {
				VGS.Event.fire('vgs.log', message);
			}
		},
		Ajax : {
			connectionId : -1,
			connections : new Array(),
			interval : null,
			intervalPeriod : 100, // strongly suggested that you increase this to 1000 if debugging!!
			pollingDebugCount : 0,
			pollingDebugFirst : true,
			pollingDebugThrottle : 100, // show a debug message after every this many polling iterations
			requestQueue : new Array(),
			scriptObject : null,
			serverUrl : '',
			timeoutPeriod : 5000, // if a connection goes on for longer than this many milliseconds, then timeout
			version : '1.0',
			
			getFragmentFromUrl : function(url) {
			    url = url || window.location.href;
			    VGS.log('VGS.Ajax.getFragmentFromUrl("' + url + '")', 'log');
			    var fragment = url.replace( /^[^#]*#?(.*)$/, '$1' );
			    VGS.log('-- complete fragment: ' + fragment + '', 'log');
			    return fragment;
			},
			buildConnectionUrl : function(query) {
				VGS.log('VGS.Ajax.buildConnectionUrl("' + query + '")', 'log');
				VGS.Ajax.connectionId = VGS.Ajax.connections.length;
				var url = VGS.Ajax.serverUrl + query + '&connectionId='	+ VGS.Ajax.connectionId + '&client_id=' + VGS.client_id + '&redirect_uri=' + (encodeURIComponent(VGS.redirect_uri));
				VGS.log('-- built url: [' + url + ']', 'log');
				VGS.Ajax.requestQueue[VGS.Ajax.requestQueue.length] = new VGS.Ajax.requestQueueNode(url);
			},
			createScriptObject : function(source) {
				VGS.log('VGS.Ajax.createScriptObject("' + source + '")', 'log');
				VGS.Ajax.scriptObject = document.createElement('SCRIPT');
				VGS.Ajax.scriptObject.src = source;
				VGS.Ajax.scriptObject.type = 'text/javascript';
				var head = document.getElementsByTagName('HEAD')[0];
				head.appendChild(VGS.Ajax.scriptObject);
			},
			failure : function(errorMsg) {
				VGS.log('VGS.Ajax.failure("' + errorMsg + '")', 'error');
				if (VGS.Event) {
					VGS.Event.fire('fail', errorMsg);
				}
			},
			flushQueue : function() {
				VGS.log('VGS.Ajax.flushQueue()', 'log');
				VGS.Ajax.requestQueue.length = 0;
			},
			makeRequest : function() {
				VGS.log('VGS.Ajax.makeRequest()', 'log');
				if (VGS.Ajax.requestQueue.length > 0) {
					VGS.processing('on');
					var connectionCode = VGS.Ajax.requestQueue[0].connectionUrl;
					parent.triggerResponse = null;
					VGS.Ajax.createScriptObject(connectionCode);
					VGS.Ajax.serverTimeoutTime = VGS.Ajax.now()	+ VGS.Ajax.timeoutPeriod;
				}
			},
			now : function() {
				VGS.log('VGS.Ajax.now()', 'log');
				return (new Date()).getTime();
			},
			poll : function() {
				VGS.log('VGS.Ajax.poll()', 'log');
				if (VGS.Ajax.pollingDebugCount == VGS.Ajax.pollingDebugThrottle) {
					VGS.log('-- poll [' + VGS.Ajax.now() + '] (x'	+ VGS.Ajax.pollingDebugCount + ')', 'log');
					VGS.Ajax.pollingDebugCount = 0;
				} else if (VGS.Ajax.pollingDebugFirst) {
					VGS.log('-- poll [' + VGS.Ajax.now() + ']', 'log');
					VGS.Ajax.pollingDebugFirst = false;
					VGS.Ajax.pollingDebugCount = 0;
				}
				VGS.Ajax.pollingDebugCount++;
				if (VGS.Ajax.serverTimeoutTime) {
					if (VGS.Ajax.serverTimeoutTime <= VGS.Ajax.now()) {
						VGS.Ajax.stopPolling();
						VGS.Ajax.failure('Server Timed Out');
					} else if (parent.triggerResponse != null) {
						parent.triggerResponse();
					}
				} else if (VGS.Ajax.requestQueue.length > 0) {
					VGS.Ajax.makeRequest();
				} else {
					VGS.Ajax.stopPolling();
				}
			},
			removeScriptObject : function() {
				VGS.log('VGS.Ajax.removeScriptObject()', 'log');
				VGS.Ajax.scriptObject.parentNode.removeChild(VGS.Ajax.scriptObject);
				VGS.Ajax.scriptObject = null;
			},
			requestQueueNode : function(url) {
				VGS.log('VGS.Ajax.requestQueueNode("' + url + '")', 'log');
				this.connectionUrl = url;
				this.requestSent = false;
			},
			responseReceived : function() {
				VGS.log('VGS.Ajax.responseReceived()', 'log');
				VGS.processing('off');
				VGS.Ajax.requestQueue.shift();
				VGS.Ajax.serverTimeoutTime = null;
				VGS.Ajax.removeScriptObject();
			},
			send : function(query) {
				VGS.log('VGS.Ajax.send("' + query + '")', 'log');
				VGS.Ajax.buildConnectionUrl(query);
				VGS.Ajax.startPolling();
			},
			startPolling : function() {
				VGS.log('VGS.Ajax.startPolling()', 'log');
				if (VGS.Ajax.interval == null) {
					VGS.log('polling (re)started');
					VGS.Ajax.interval = window.setInterval(function() {
						VGS.Ajax.connections[VGS.Ajax.connectionId];
						VGS.Ajax.poll();
					}, VGS.Ajax.intervalPeriod);
				}
			},
			stopPolling : function() {
				VGS.log('VGS.Ajax.stopPolling()', 'log');
				VGS.Ajax.serverTimeoutTime = null;
				VGS.Ajax.flushQueue();
				if (VGS.Ajax.interval) {
					window.clearInterval(VGS.Ajax.interval);
				}
				VGS.Ajax.interval = null;
			},
			success : function(response) {
				if (response.success) {
					VGS.log('SUCCESS: ' + response.success, 'log');
				} else if (response.error) {
					VGS.log('ERROR: ' + response.error, 'error');
				}
			}
		},
		Cookie : {
			enabled : true,
			name 	: '',
			domain 	: '',
			decode 	: function(value) {
				return JSON.parse(unescape(value));
			},
			encode 	: function(value) {
				return escape(JSON.stringify(value));
			},
			set 	: function(session) {
				VGS.log('VGS.Cookie.set()', 'log');
				if (session) {
					VGS.Cookie.setRaw(VGS.Cookie.encode(session), session.expiresIn, session.baseDomain, VGS.Cookie.name);
					// Set sp_id cookie
					if (session.sp_id) {
						VGS.Cookie.setRaw(session.sp_id, session.expiresIn, session.baseDomain, 'SP_ID');
					}
				} else {
					VGS.Cookie.clear();
				}
				return session;
			},
			get 	: function() {
				VGS.log('VGS.Cookie.get() -- ' + VGS.Cookie.name, 'log');
				var cookie, session, name, carray = null;
				name = VGS.Cookie.name + "=";
				carray = document.cookie.split(';');
				for ( var i = 0; i < carray.length; i++) {
					var c = carray[i];
					while (c.charAt(0) == ' ') {
						c = c.substring(1, c.length);
					}
					if (c.indexOf(name) == 0) {
						cookie = c.substring(name.length, c.length);
					}
				}
				if (cookie) {
			      // url encoded session stored as "sub-cookies"
			      session = VGS.Cookie.decode(cookie);
			      // decodes as a string, convert to a number
			      session.expiresIn  = parseInt(session.expiresIn, 10);
			      session.clientTime = parseInt(session.clientTime, 10);
			      // capture base_domain for use when we need to clear
			      VGS.Cookie.domain = session.baseDomain;
			    }
			    
			    return session;
			},
			 /**
			   * Helper function to set cookie value.
			   *
			   * @access private
			   * @param val    {String} the string value (should already be encoded)
			   * @param ts     {Number} a unix timestamp denoting expiry
			   * @param domain {String} optional domain for cookie
			   * @param name   {String} optional name for cookie
			   */
			  setRaw	: function(val, ts, domain, name) {
				VGS.log('VGS.Cookie.setRaw(val, ' + ts + ', ' + domain + ', ' + name + ')', 'log');
				if (typeof (ts) != 'undefined') {
					var date = new Date();
					date.setTime(date.getTime() + (ts * 1000));
					var expires = "; expires=" + date.toGMTString();
				} else {
					var expires = "";
				}
				if (typeof (name) == 'undefined') {
					name = VGS.Cookie.name;
				}
				document.cookie = name + "=" + val + expires + "; path=/" + (domain ? '; domain=.' + domain : '');
				
				// capture domain for use when we need to clear
			    VGS.Cookie.domain = domain;
			  },
			  clear: function() {
				  VGS.log('VGS.Cookie.clear() '+ VGS.Cookie.name, 'log');
				  VGS.Cookie.setRaw('', 0, VGS.Cookie.domain);
				  VGS.log('VGS.Cookie.clear() SP_ID', 'log');
				  VGS.Cookie.setRaw('', 0, VGS.Cookie.domain, 'SP_ID');
			  }
		},
		Auth : {
			valid : false,
			logout : function(cb) {
				VGS.log('VGS.Auth.logout', 'log');
				VGS.Auth.setSession(null, 'unknown');
				var id = '';
				if (typeof cb == 'function') {
					id = VGS.guid();
					VGS.callbacks[id] = cb;
				}
				// finally make the call to login status
				VGS.Ajax.send('ajax/logout.js?callback='+id);
			},
			validate : function(response) {
				VGS.log('VGS.Auth.validate', 'log');
				VGS.Auth.valid = false;
				if (response.result) {
					VGS.Auth.valid = response.result;
					VGS.log('SUCCESS: ' + VGS.Auth.valid, 'log');
					if (VGS.Auth.valid && typeof (response.userId) != 'undefined') {
						VGS.log('-- valid session, allow login', 'log');
						VGS.Auth.setSession(response, (typeof (response.userStatus) != 'undefined') ? response.userStatus : 'unknown');
					} else {
						VGS.log('-- invalid session, do not allow login', 'log');
						VGS.Auth.setSession(null, 'unknown');
					}
				} else if (response.error) {
					VGS.log(response.error, 'error');
					VGS.Auth.setSession(null, 'unknown');
				} else {
					VGS.log(response, 'error');
					VGS.Auth.setSession(null, 'unknown');
				}
			},
			setSession : function(session, status) {
				VGS.log('VGS.Auth.setSession (' +(typeof session)+ ' , ' +status+ ')', 'log');
				// detect special changes before changing the internal session
				var newSession = false;
				var oldSession = false;
				if (typeof (session) == 'object' && session != null) {
					newSession = true;
				}
				if (typeof (VGS._session) == 'object' && VGS._session != null) {
					oldSession = true;
				}
				
				var login 			= (!oldSession && newSession),
					logout  		= (oldSession && !newSession),
					both 			= (oldSession && newSession && VGS._session.id != session.id), 
					sessionChange 	= login || logout || (oldSession && newSession && VGS._session.sig != session.sig) || (!oldSession && !newSession),
					statusChange 	= status != VGS._userStatus;
				var response = {
					session : session,
					status : status
				};
				if (typeof (session) == 'object' && session != null) {
					session.clientTime = parseInt(VGS.Ajax.now(), 10);
				}
				
				VGS._session = session;
				VGS._userStatus = status;
				
				if (sessionChange && VGS.Cookie.enabled) {
					VGS.Cookie.set(session);
				}
				if (statusChange) {
					/**
					 * Fired when the status changes.
					 * 
					 * @event auth.statusChange
					 */
					VGS.Event.fire('auth.statusChange', response);
				}
				if (logout || both) {
					/**
					 * Fired when a logout action is performed.
					 * 
					 * @event auth.logout
					 */
					VGS.Event.fire('auth.logout', response);
				}
				if (login || both) {
					/**
					 * Fired when a login action is performed.
					 * 
					 * @event auth.login
					 */
					VGS.Event.fire('auth.login', response);
				}
				if (sessionChange) {
					/**
					 * Fired when the session changes. This includes a session
					 * being refreshed, or a login or logout action.
					 * 
					 * @event auth.sessionChange
					 */
					VGS.Event.fire('auth.sessionChange', response);
				}
				
				// re-setup a timer to refresh the session if needed. we only do this if
				// VGS.Auth._loadState exists, indicating that the application relies on the
				// JS to get and refresh session information (vs managing it themselves).
				if (VGS.Auth._refreshTimer) {
					window.clearTimeout(VGS.Auth._refreshTimer);
					delete VGS.Auth._refreshTimer;
				}
				if (VGS.Auth._loadState && session && session.expiresIn) {
					// refresh every 15 minutes. we don't rely on the expires time because
					// then we would also need to rely on the local time available in JS
					// which is often incorrect.
					VGS.log('--  refresh every 1 minute', 'log');
					VGS.Auth._refreshTimer = window.setTimeout(function() {
						VGS.getLoginStatus(null, true); // force refresh
						}, 100000); // 1 minutes
				}
				
				return response;
			}
		},
		getSession: function() {
			VGS.log('VGS.getSession', 'log');
			return VGS._session;
		},
		getLoginStatus : function(cb, force) {
			VGS.log('VGS.getLoginStatus('+cb+','+force+')', 'log');
			if (!VGS.client_id) {
				VGS.log('ERROR: VGS.getLoginStatus() called before calling VGS.init().','error');
				return;
		    }
			force = (force == true)?true:false;
			// we either invoke the callback right away if the status has already been
			// loaded, or queue it up for when the load is done.
			if (cb) {
				if (!force && VGS.Auth._loadState == 'loaded') {
					VGS.log('VGS.getLoginStatus(): status has already been loaded! '+VGS.Auth._loadState,'log');
					cb( {
						status : VGS._userStatus,
						session : VGS._session
					});
					return;
				} else {
					VGS.log('VGS.Event.subscribe(VGS.loginStatus) '+VGS.Auth._loadState,'log');
					if (typeof (cb) == 'function') {
						var id = VGS.guid();
						VGS.callbacks[id] = cb;
						VGS.Event.subscribe('VGS.loginStatus', VGS.callbacks[id]);
					} else {
						VGS.Event.subscribe('VGS.loginStatus', cb);
					}
				}
			}

			// if we're already loading, and this is not a force load, we're done
			if (!force && VGS.Auth._loadState == 'loading') {
				VGS.log('VGS.getLoginStatus() already loading, returning...'+VGS.Auth._loadState,'log');
				return;
			}

			VGS.Auth._loadState = 'loading';

			// invoke the queued sessionLoad callbacks
			var lsCb = function(response) {
				VGS.log('VGS.callbacks -- '+VGS.Auth._loadState, 'log');
				VGS.Auth._loadState = 'loaded';
				VGS.Auth.validate(response);
				VGS.Event.fire('VGS.loginStatus', response);
				VGS.Event.clear('VGS.loginStatus');
			};
			var id = VGS.guid();
			VGS.callbacks[id] = lsCb;
			// finally make the call to login status
			VGS.Ajax.send('ajax/hassession.js?callback='+id);
		},
		hasProduct : function(productId, callback) {
			VGS.log('VGS.hasProduct', 'log');
			if (!VGS.client_id) {
				VGS.log('ERROR: VGS.hasProduct() called before calling VGS.init().','error');
				return;
		    }
			var id = VGS.guid();
			VGS.callbacks[id] = callback;
			
		    VGS.Ajax.send('ajax/hasproduct.js?product_id=' + productId + '&callback='+id);
		},
		hasSubscription : function(productId, callback) {
			VGS.log('VGS.hasSubscription', 'log');
			if (!VGS.client_id) {
				VGS.log('ERROR: VGS.hasSubscription() called before calling VGS.init().','error');
				return;
		    }
			var id = VGS.guid();
			VGS.callbacks[id] = callback;
			
		    VGS.Ajax.send('ajax/hassubscription.js?product_id=' + productId + '&callback='+id);
		},
		getLoginURI : function(redirect_uri, client_id) {
			var url = VGS.Ajax.serverUrl + 'login';
			if (!client_id && VGS.client_id) {
				client_id = VGS.client_id;
			}
			if (!redirect_uri) {
				redirect_uri = window.location.toString();
			}
			if (client_id) {
				url = url + '?response_type=code&flow=signup&client_id=' + client_id + '&redirect_uri=' + (encodeURIComponent(redirect_uri));
			}
			return url;
		},
		getSignupURI : function(redirect_uri, client_id) {
			var url = VGS.Ajax.serverUrl + 'signup';
			if (!client_id && VGS.client_id) {
				client_id = VGS.client_id;
			}
			if (!redirect_uri) {
				redirect_uri = window.location.toString();
			}
			if (client_id) {
				url = url + '?response_type=code&flow=signup&client_id=' + client_id + '&redirect_uri=' + (encodeURIComponent(redirect_uri));
			}
			return url;
		},
		getLogoutURI : function(redirect_uri, client_id) {
			var url = VGS.Ajax.serverUrl + 'logout';
			if (!client_id && VGS.client_id) {
				client_id = VGS.client_id;
			}
			if (!redirect_uri) {
				redirect_uri = window.location.toString();
			}
			if (client_id) {
				url = url + '?response_type=code&client_id=' + client_id + '&redirect_uri=' + (encodeURIComponent(redirect_uri));
			}
			return url;
		},
		getAccountURI : function(redirect_uri, client_id) {
			var url = VGS.Ajax.serverUrl + 'account';
			if (!client_id && VGS.client_id) {
				client_id = VGS.client_id;
			}
			if (!redirect_uri) {
				redirect_uri = window.location.toString();
			}
			if (client_id) {
				url = url + '?response_type=code&client_id=' + client_id + '&redirect_uri=' + (encodeURIComponent(redirect_uri));
			}
			return url;
		},
		getPurchaseHistoryURI : function(redirect_uri, client_id) {
			var url = VGS.Ajax.serverUrl + 'account/purchasehistory';
			if (!client_id && VGS.client_id) {
				client_id = VGS.client_id;
			}
			if (!redirect_uri) {
				redirect_uri = window.location.toString();
			}
			if (client_id) {
				url = url + '?response_type=code&client_id=' + client_id + '&redirect_uri=' + (encodeURIComponent(redirect_uri));
			}
			return url;
		},
		getSubscriptionsURI : function(redirect_uri, client_id) {
			var url = VGS.Ajax.serverUrl + 'account/subscriptions';
			if (!client_id && VGS.client_id) {
				client_id = VGS.client_id;
			}
			if (!redirect_uri) {
				redirect_uri = window.location.toString();
			}
			if (client_id) {
				url = url + '?response_type=code&client_id=' + client_id + '&redirect_uri=' + (encodeURIComponent(redirect_uri));
			}
			return url;
		},
		getProductsURI : function(redirect_uri, client_id) {
			var url = VGS.Ajax.serverUrl + 'account/products';
			if (!client_id && VGS.client_id) {
				client_id = VGS.client_id;
			}
			if (!redirect_uri) {
				redirect_uri = window.location.toString();
			}
			if (client_id) {
				url = url + '?response_type=code&client_id=' + client_id + '&redirect_uri=' + (encodeURIComponent(redirect_uri));
			}
			return url;
		},
		getRedeemVoucherURI : function(voucher_code, redirect_uri, client_id) {
			var url = VGS.Ajax.serverUrl + 'account/redeem';
			if (!client_id && VGS.client_id) {
				client_id = VGS.client_id;
			}
			if (!redirect_uri) {
				redirect_uri = window.location.toString();
			}
			if (client_id) {
				url = url + '?response_type=code&client_id=' + client_id + '&redirect_uri=' + (encodeURIComponent(redirect_uri));
				if (voucher_code) {
					url = url + '&voucher_code='+voucher_code;
				}
			}
			return url;
		},
		getPurchaseProductURI : function(product_id, redirect_uri, client_id) {
			var url = VGS.Ajax.serverUrl + 'auth/start';
			if (!client_id && VGS.client_id) {
				client_id = VGS.client_id;
			}
			if (!redirect_uri) {
				redirect_uri = window.location.toString();
			}
			if (client_id) {
				url = url + '?response_type=code&client_id=' + client_id + '&flow=payment&redirect_uri=' + (encodeURIComponent(redirect_uri));
				if (product_id) {
					url = url + '&product_id='+product_id;
				}
			}
			return url;
		},
		getPurchaseCampaignURI : function(campaign_id, product_id, voucher_code, redirect_uri, client_id) {
			var url = VGS.Ajax.serverUrl + 'auth/start';
			if (!client_id && VGS.client_id) {
				client_id = VGS.client_id;
			}
			if (!redirect_uri) {
				redirect_uri = window.location.toString();
			}
			if (client_id) {
				url = url + '?response_type=code&client_id=' + client_id + '&flow=payment&redirect_uri=' + (encodeURIComponent(redirect_uri));
				if (campaign_id) {
					url = url + '&campaign_id='+campaign_id;
				}
				if (product_id) {
					url = url + '&product_id='+product_id;
				}
				if (voucher_code) {
					url = url + '&voucher_code='+voucher_code;
				}
			}
			return url;
		},
		/**
		 * Event handling mechanism for globally named events. Borrowed from Facebook connect js.
		 */
		Event : {
			/**
			 * Returns the internal subscriber array that can be directly manipulated by
			 * adding/removing things.
			 *
			 * @access private
			 * @return {Object}
			 */
			subscribers : function() {
				// this odd looking logic is to allow instances to lazily have a map of
				// their events. if subscribers were an object literal itself, we would
				// have issues with instances sharing the subscribers when its being used
				// in a mixin style.
				if (!this._subscribersMap) {
					this._subscribersMap = {};
				}
				return this._subscribersMap;
			},
		
			/**
			 * Subscribe to a given event name, invoking your callback function whenever
			 * the event is fired.
			 *
			 * For example, suppose you want to get notified whenever the session
			 * changes:
			 *
			 *     VGS.Event.subscribe('auth.sessionChange', function(response) {
			 *       // do something with response.session
			 *     });
			 *
			 * Global Events:
			 *
			 * - auth.login -- fired when the user logs in
			 * - auth.logout -- fired when the user logs out
			 * - auth.sessionChange -- fired when the session changes
			 * - auth.statusChange -- fired when the status changes
			 *
			 * @access public
			 * @param name {String} Name of the event.
			 * @param cb {Function} The handler function.
			 */
			subscribe : function(name, cb) {
				var subs = this.subscribers();
		
				if (!subs[name]) {
					subs[name] = [ cb ];
				} else {
					subs[name].push(cb);
				}
			},
		
			/**
			 * Removes subscribers, inverse of [VGS.Event.subscribe](VGS.Event.subscribe).
			 *
			 * Removing a subscriber is basically the same as adding one. You need to
			 * pass the same event name and function to unsubscribe that you passed into
			 * subscribe. If we use a similar example to
			 * [VGS.Event.subscribe](VGS.Event.subscribe), we get:
			 *
			 *     var onSessionChange = function(response) {
			 *       // do something with response.session
			 *     };
			 *     VGS.Event.subscribe('auth.sessionChange', onSessionChange);
			 *
			 *     // sometime later in your code you dont want to get notified anymore
			 *     VGS.Event.unsubscribe('auth.sessionChange', onSessionChange);
			 *
			 * @access public
			 * @param name {String} Name of the event.
			 * @param cb {Function} The handler function.
			 */
			unsubscribe : function(name, cb) {
				var subs = this.subscribers()[name];
		
				VGS.Array.forEach(subs, function(value, key) {
					if (value == cb) {
						subs[key] = null;
					}
				});
			},
		
			/**
			 * Repeatedly listen for an event over time. The callback is invoked
			 * immediately when monitor is called, and then every time the event
			 * fires. The subscription is canceled when the callback returns true.
			 *
			 * @access private
			 * @param {string} name Name of event.
			 * @param {function} callback A callback function. Any additional arguments
			 * to monitor() will be passed on to the callback. When the callback returns
			 * true, the monitoring will cease.
			 */
			monitor : function(name, callback) {
				if (!callback()) {
					var ctx = this, fn = function() {
						if (callback.apply(callback, arguments)) {
							ctx.unsubscribe(name, fn);
						}
					};
		
					this.subscribe(name, fn);
				}
			},
		
			/**
			 * Removes all subscribers for named event.
			 *
			 * You need to pass the same event name that was passed to VGS.Event.subscribe.
			 * This is useful if the event is no longer worth listening to and you
			 * believe that multiple subscribers have been set up.
			 *
			 * @access private
			 * @param name    {String}   name of the event
			 */
			clear : function(name) {
				delete this.subscribers()[name];
			},
		
			/**
			 * Fires a named event. The first argument is the name, the rest of the
			 * arguments are passed to the subscribers.
			 *
			 * @access private
			 * @param name {String} the event name
			 */
			fire : function() {
				var args = Array.prototype.slice.call(arguments), name = args.shift();
		
				VGS.Array.forEach(this.subscribers()[name], function(sub) {
					// this is because we sometimes null out unsubscribed rather than jiggle
					// the array
					if (sub) {
						VGS.log('VGS.Event.fire("' + name + '")', 'log');
						sub.apply(this, args);
					}
				});
			}
		},
		Array : {
			/**
			 * Get index of item inside an array. Return's -1 if element is not
			 * found.
			 * 
			 * @param arr {Array} Array to look through.
			 * @param item {Object} Item to locate.
			 * @return {Number} Index of item.
			 */
			indexOf : function(arr, item) {
				if (arr.indexOf) {
					return arr.indexOf(item);
				}
				var length = arr.length;
				if (length) {
					for ( var index = 0; index < length; index++) {
						if (arr[index] === item) {
							return index;
						}
					}
				}
				return -1;
			},

			/**
			 * Merge items from source into target, but only if they dont exist.
			 * Returns the target array back.
			 * 
			 * @param target
			 *            {Array} Target array.
			 * @param source
			 *            {Array} Source array.
			 * @return {Array} Merged array.
			 */
			merge : function(target, source) {
				for ( var i = 0; i < source.length; i++) {
					if (VGS.Array.indexOf(target, source[i]) < 0) {
						target.push(source[i]);
					}
				}
				return target;
			},

			/**
			 * Create an new array from the given array and a filter function.
			 * 
			 * @param arr
			 *            {Array} Source array.
			 * @param fn
			 *            {Function} Filter callback function.
			 * @return {Array} Filtered array.
			 */
			filter : function(arr, fn) {
				var b = [];
				for ( var i = 0; i < arr.length; i++) {
					if (fn(arr[i])) {
						b.push(arr[i]);
					}
				}
				return b;
			},

			/**
			 * Create an array from the keys in an object.
			 * 
			 * Example: keys({'x': 2, 'y': 3'}) returns ['x', 'y']
			 * 
			 * @param obj
			 *            {Object} Source object.
			 * @param proto
			 *            {Boolean} Specify true to include inherited
			 *            properties.
			 * @return {Array} The array of keys.
			 */
			keys : function(obj, proto) {
				var arr = [];
				for ( var key in obj) {
					if (proto || obj.hasOwnProperty(key)) {
						arr.push(key);
					}
				}
				return arr;
			},

			/**
			 * Create an array by performing transformation on the items in a
			 * source array.
			 * 
			 * @param arr
			 *            {Array} Source array.
			 * @param transform
			 *            {Function} Transformation function.
			 * @return {Array} The transformed array.
			 */
			map : function(arr, transform) {
				var ret = [];
				for ( var i = 0; i < arr.length; i++) {
					ret.push(transform(arr[i]));
				}
				return ret;
			},

			/**
			 * For looping through Arrays and Objects.
			 * 
			 * @param {Object}
			 *            item an Array or an Object
			 * @param {Function}
			 *            fn the callback function for iteration. The function
			 *            will be pass (value, [index/key], item) paramters
			 * @param {Bool}
			 *            proto indicate if properties from the prototype should
			 *            be included
			 * 
			 */
			forEach : function(item, fn, proto) {
				if (!item) {
					return;
				}

				if (Object.prototype.toString.apply(item) === '[object Array]'
						|| (!(item instanceof Function) && typeof item.length == 'number')) {
					if (item.forEach) {
						item.forEach(fn);
					} else {
						for ( var i = 0, l = item.length; i < l; i++) {
							fn(item[i], i, item);
						}
					}
				} else {
					for ( var key in item) {
						if (proto || item.hasOwnProperty(key)) {
							fn(item[key], key, item);
						}
					}
				}
			}
		}
	};
}
window.setTimeout(function() {
	if (window.vgsAsyncInit && !window.vgsAsyncInit.hasRun) {
		window.vgsAsyncInit.hasRun = true;
		vgsAsyncInit();
	}
}, 0);