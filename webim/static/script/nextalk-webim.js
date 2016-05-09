/*!
 * nextalk-webim.js v0.0.1
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

(function(window, undefined) {

    // "use strict";
    
    var JSON = window.JSON
            || (function() {
                var chars = {
                    '\b' : '\\b',
                    '\t' : '\\t',
                    '\n' : '\\n',
                    '\f' : '\\f',
                    '\r' : '\\r',
                    '"' : '\\"',
                    '\\' : '\\\\'
                };

                function rChars(chr) {
                    return chars[chr] || '\\u00'
                            + Math.floor(chr.charCodeAt() / 16).toString(16)
                            + (chr.charCodeAt() % 16).toString(16);
                }

                function encode(obj) {
                    switch (Object.prototype.toString.call(obj)) {
                    case '[object String]':
                        return '"' + obj.replace(/[\x00-\x1f\\"]/g, rChars)
                                + '"';
                    case '[object Array]':
                        var string = [], l = obj.length;
                        for (var i = 0; i < l; i++) {
                            string.push(encode(obj[i]));
                        }
                        return '[' + string.join(",") + ']';
                    case '[object Object]':
                        var string = [];
                        for ( var key in obj) {
                            var json = encode(obj[key]);
                            if (json)
                                string.push(encode(key) + ':' + json);
                        }
                        return '{' + string + '}';
                    case '[object Number]':
                    case '[object Boolean]':
                        return String(obj);
                    case false:
                        return 'null';
                    }
                    return null;
                }

                return {
                    stringify : encode,
                    parse : function(str) {
                        str = str.toString();
                        if (!str || !str.length)
                            return null;
                        return (new Function("return " + str))();
                        // if (secure && !(/^[,:{}\[\]0-9.\-+Eaeflnr-u
                        // \n\r\t]*$/).test(string.replace(/\\./g,
                        // '@').replace(/"[^"\\\n\r]*"/g, ''))) return null;
                    }
                }
            })();

    function nowStamp() {
        return (new Date).getTime();
    }

    var _toString = Object.prototype.toString;
    function isFunction(obj) {
        return _toString.call(obj) === "[object Function]";
    }

    function isArray(obj) {
        return _toString.call(obj) === "[object Array]";
    }

    function isObject(obj) {
        return obj && _toString.call(obj) === "[object Object]";
    }

    function trim(text) {
        return (text || "").replace(/^\s+|\s+$/g, "");
    }

    function checkUpdate(old, add) {
        var added = false;
        if (isObject(add)) {
            old = old || {};
            for ( var key in add) {
                var val = add[key];
                if (old[key] != val) {
                    added = added || {};
                    added[key] = val;
                }
            }
        }
        return added;
    }

    function makeArray(array) {
        var ret = [];
        if (array != null) {
            var i = array.length;
            // The window, strings (and functions) also have 'length'
            if (i == null || typeof array === "string" || isFunction(array)
                    || array.setInterval)
                ret[0] = array;
            else
                while (i)
                    ret[--i] = array[i];
        }
        return ret;
    }

    function extend() {
        // copy reference to target object
        var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep
        // copy)
        if (typeof target !== "object" && !isFunction(target))
            target = {};
        for (; i < length; i++)
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null)
                // Extend the base object
                for ( var name in options) {
                    var src = target[name], copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy)
                        continue;

                    // Recurse if we're merging object values
                    if (deep && copy && typeof copy === "object"
                            && !copy.nodeType)
                        target[name] = extend(deep,
                        // Never move original objects, clone them
                        src || (copy.length != null ? [] : {}), copy);

                    // Don't bring in undefined values
                    else if (copy !== undefined)
                        target[name] = copy;

                }

        // Return the modified object
        return target;
    }

    function each(object, callback, args) {
        var name, i = 0, length = object.length, isObj = length === undefined
                || isFunction(object);

        if (args) {
            if (isObj) {
                for (name in object) {
                    if (callback.apply(object[name], args) === false) {
                        break;
                    }
                }
            } else {
                for (; i < length;) {
                    if (callback.apply(object[i++], args) === false) {
                        break;
                    }
                }
            }

            // A special, fast, case for the most common use of each
        } else {
            if (isObj) {
                for (name in object) {
                    if (callback.call(object[name], name, object[name]) === false) {
                        break;
                    }
                }
            } else {
                for (var value = object[0]; i < length
                        && callback.call(value, i, value) !== false; value = object[++i]) {
                }
            }
        }

        return object;
    }

    function inArray(elem, array) {
        for (var i = 0, length = array.length; i < length; i++) {
            if (array[i] === elem) {
                return i;
            }
        }

        return -1;
    }

    function grep(elems, callback, inv) {
        var ret = [];

        // Go through the array, only saving the items
        // that pass the validator function
        for (var i = 0, length = elems.length; i < length; i++) {
            if (!inv !== !callback(elems[i], i)) {
                ret.push(elems[i]);
            }
        }

        return ret;
    }

    function map(elems, callback) {
        var ret = [], value;

        // Go through the array, translating each of the items to their
        // new value (or values).
        for (var i = 0, length = elems.length; i < length; i++) {
            value = callback(elems[i], i);

            if (value != null) {
                ret[ret.length] = value;
            }
        }

        return ret.concat.apply([], ret);
    }

    function ClassEvent(type) {
        this.type = type;
        this.timeStamp = (new Date()).getTime();
    }

    ClassEvent.on = function() {
        var proto, helper = ClassEvent.on.prototype;
        for (var i = 0, l = arguments.length; i < l; i++) {
            proto = arguments[i].prototype;
            proto.bind = proto.addEventListener = helper.addEventListener;
            proto.unbind = proto.removeEventListener = helper.removeEventListener;
            proto.trigger = proto.dispatchEvent = helper.dispatchEvent;
        }
    };

    ClassEvent.on.prototype = {
        addEventListener : function(type, listener) {
            var self = this, ls = self.__listeners = self.__listeners || {};
            ls[type] = ls[type] || [];
            ls[type].push(listener);
            return self;
        },
        dispatchEvent : function(event, extraParameters) {
            var self = this, ls = self.__listeners = self.__listeners || {};
            event = event.type ? event : new ClassEvent(event);
            ls = ls[event.type];
            if (Object.prototype.toString.call(extraParameters) === "[object Array]") {
                extraParameters.unshift(event);
            } else {
                extraParameters = [ event, extraParameters ];
            }
            if (ls) {
                for (var i = 0, l = ls.length; i < l; i++) {
                    ls[i].apply(self, extraParameters);
                }
            }
            return self;
        },
        removeEventListener : function(type, listener) {
            var self = this, ls = self.__listeners = self.__listeners || {};
            if (ls[type]) {
                if (listener) {
                    var _e = ls[type];
                    for (var i = _e.length; i--; i) {
                        if (_e[i] === listener)
                            _e.splice(i, 1);
                    }
                } else {
                    delete ls[type];
                }
            }
            return self;
        }
    };

    function cookie(name, value, options) {
        if (typeof value != 'undefined') {// name and value given, set cookie
            options = options || {};
            if (value === null) {
                value = '';
                // options = extend({}, options); // clone object since it's
                // unexpected behavior if the expired property were changed
                options.expires = -1;
            }
            var expires = '';
            if (options.expires
                    && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime()
                            + (options.expires * 24 * 60 * 60 * 1000));
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString();
                // use expires attribute, max-age is not supported by IE
            }
            // NOTE Needed to parenthesize options.path and options.domain
            // in the following expressions, otherwise they evaluate to
            // undefined
            // in the packed version for some reason...
            var path = options.path ? '; path=' + (options.path) : '';
            var domain = options.domain ? '; domain=' + (options.domain) : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [ name, '=', encodeURIComponent(value), expires,
                    path, domain, secure ].join('');
        } else {// only name given, get cookie
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie
                                .substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    }

    function log() {
        var d = new Date(), time = [ '[', d.getHours(), ':', d.getMinutes(),
                ':', d.getSeconds(), '-', d.getMilliseconds(), ']' ].join("");
        if (window && window.console) {
            window.console.log.apply(null, arguments);
        } else if (window && window.runtime && window.air
                && window.air.Introspector) {
            window.air.Introspector.Console.log.apply(null, arguments);
        }
    }

    var console = window.console || (function() {
        return {
            log : function(str) {
                //alert(str);
            }
        }
    })();

    /**
     * Detect mobile code from http://detectmobilebrowsers.com/
     */
    function isMobile() {
        return (function(a) {
            return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i
                    .test(a)
                    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
                            .test(a.substr(0, 4));
        })(navigator.userAgent || navigator.vendor || window.opera);
    }

    /*
     * ! ajax.js v0.1
     * 
     * http://github.com/webim/ajax.js
     * 
     * Copyright (c) 2010 Hidden Released under the MIT, BSD, and GPL Licenses.
     * 
     */
    var ajax = (function() {
        var jsc = (new Date()).getTime(),
        // Firefox 3.6 and chrome 6 support script async attribute.
        scriptAsync = typeof (document.createElement("script").async) === "boolean", rnoContent = /^(?:GET|HEAD|DELETE)$/, rnotwhite = /\S/, rbracket = /\[\]$/, jsre = /\=\?(&|$)/, rquery = /\?/, rts = /([?&])_=[^&]*/, rurl = /^(\w+:)?\/\/([^\/?#]+)/, r20 = /%20/g, rhash = /#.*$/;

        // IE can async load script in fragment.
        window._fragmentProxy = false;
        // Check fragment proxy
        var frag = document.createDocumentFragment(), script = document
                .createElement('script'), text = "window._fragmentProxy = true";
        try {
            script.appendChild(document.createTextNode(text));
        } catch (e) {
            script.text = text;
        }
        frag.appendChild(script);
        frag = script = null;

        function ajax(origSettings) {
            var s = {};

            for ( var key in ajax.settings) {
                s[key] = ajax.settings[key];
            }

            if (origSettings) {
                for ( var key in origSettings) {
                    s[key] = origSettings[key];
                }
            }

            // Only GET when jsonp
            if (s.dataType === "jsonp") {
                s.type = "GET";
            }

            var jsonp, status, data, type = s.type.toUpperCase(), noContent = rnoContent
                    .test(type), head, proxy, win = window, script;

            s.url = s.url.replace(rhash, "");

            // Use original (not extended) context object if it was provided
            s.context = origSettings && origSettings.context != null ? origSettings.context
                    : s;

            // convert data if not already a string
            if (s.data && s.processData && typeof s.data !== "string") {
                s.data = param(s.data, s.traditional);
            }

            // Matches an absolute URL, and saves the domain
            var parts = rurl.exec(s.url), location = window.location, remote = parts
                    && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);

            if (!/https?:/i.test(location.protocol)) {
                // The protocol is "app:" in air.
                remote = false;
            }
            remote = s.forceRemote ? true : remote;
            if (s.dataType === "jsonp" && !remote) {
                s.dataType = "json";
            }

            // Handle JSONP Parameter Callbacks
            if (s.dataType === "jsonp") {
                if (type === "GET") {
                    if (!jsre.test(s.url)) {
                        s.url += (rquery.test(s.url) ? "&" : "?")
                                + (s.jsonp || "callback") + "=?";
                    }
                } else if (!s.data || !jsre.test(s.data)) {
                    s.data = (s.data ? s.data + "&" : "")
                            + (s.jsonp || "callback") + "=?";
                }
                s.dataType = "json";
            }

            // Build temporary JSONP function
            if (s.dataType === "json"
                    && (s.data && jsre.test(s.data) || jsre.test(s.url))) {
                jsonp = s.jsonpCallback || ("jsonp" + jsc++);

                // Replace the =? sequence both in the query string and the data
                if (s.data) {
                    s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
                }

                s.url = s.url.replace(jsre, "=" + jsonp + "$1");

                // We need to make sure
                // that a JSONP style response is executed properly
                s.dataType = "script";

                // Handle JSONP-style loading
                var customJsonp = window[jsonp], jsonpDone = false;

                window[jsonp] = function(tmp) {
                    if (!jsonpDone) {
                        jsonpDone = true;
                        if (Object.prototype.toString.call(customJsonp) === "[object Function]") {
                            customJsonp(tmp);

                        } else {
                            // Garbage collect
                            window[jsonp] = undefined;

                            try {
                                delete window[jsonp];
                            } catch (jsonpError) {
                            }
                        }

                        data = tmp;
                        helper.handleSuccess(s, xhr, status, data);
                        helper.handleComplete(s, xhr, status, data);

                        if (head) {
                            head.removeChild(script);
                        }
                        proxy && proxy.parentNode
                                && proxy.parentNode.removeChild(proxy);
                    }
                }
            }

            if (s.dataType === "script" && s.cache === null) {
                s.cache = false;
            }

            if (s.cache === false && type === "GET") {
                var ts = (new Date()).getTime();

                // try replacing _= if it is there
                var ret = s.url.replace(rts, "$1_=" + ts);

                // if nothing was replaced, add timestamp to the end
                s.url = ret
                        + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?")
                                + "_=" + ts : "");
            }

            // If data is available, append data to url for get requests
            if (s.data && type === "GET") {
                s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
            }

            // Watch for a new set of requests
            if (s.global && helper.active++ === 0) {
                // jQuery.event.trigger( "ajaxStart" );
            }

            // If we're requesting a remote document
            // and trying to load JSON or Script with a GET
            if (s.dataType === "script" && type === "GET" && remote) {
                var inFrame = false;
                if (jsonp && s.async && !scriptAsync) {
                    if (window._fragmentProxy) {
                        proxy = document.createDocumentFragment();
                        head = proxy;
                    } else {
                        inFrame = true;
                        // Opera need url path in iframe
                        if (s.url.slice(0, 1) == "/") {
                            s.url = location.protocol
                                    + "//"
                                    + location.host
                                    + (location.port ? (":" + location.port)
                                            : "") + s.url;
                        } else if (!/^https?:\/\//i.test(s.url)) {
                            var href = location.href, ex = /([^?#]+)\//
                                    .exec(href);
                            s.url = (ex ? ex[1] : href) + "/" + s.url;
                        }
                        s.url = s.url.replace("=" + jsonp, "=parent." + jsonp);
                        proxy = document.createElement("iframe");
                        proxy.style.position = "absolute";
                        proxy.style.left = "-100px";
                        proxy.style.top = "-100px";
                        proxy.style.height = "1px";
                        proxy.style.width = "1px";
                        proxy.style.visibility = "hidden";
                        document.body.insertBefore(proxy,
                                document.body.firstChild);
                        win = proxy.contentWindow;
                    }
                }
                function create() {
                    var doc;
                    try {
                        // “Access is denied” when set `document.domain=""`
                        // http://stackoverflow.com/questions/1886547/access-is-denied-javascript-error-when-trying-to-access-the-document-object-of
                        doc = win.document
                    } catch (e) {
                        doc = window.document
                    }
                    ;
                    head = head || doc.getElementsByTagName("head")[0]
                            || doc.documentElement;
                    script = doc.createElement("script");
                    if (s.scriptCharset) {
                        script.charset = s.scriptCharset;
                    }
                    script.src = s.url;

                    if (scriptAsync)
                        script.async = s.async;

                    // Handle Script loading
                    if (jsonp) {
                        // Attach handlers for all browsers
                        script.onload = script.onerror = script.onreadystatechange = function(
                                e) {
                            if (!jsonpDone
                                    && (!this.readyState
                                            || this.readyState === "loaded" || this.readyState === "complete")) {
                                // error
                                jsonpDone = true;
                                helper.handleError(s, xhr, "error",
                                        "load error");
                                if (head && script.parentNode) {
                                    head.removeChild(script);
                                }
                                proxy && proxy.parentNode
                                        && proxy.parentNode.removeChild(proxy);
                            }
                        };
                    } else {
                        var done = false;

                        // Attach handlers for all browsers
                        script.onload = script.onreadystatechange = function() {
                            if (!done
                                    && (!this.readyState
                                            || this.readyState === "loaded" || this.readyState === "complete")) {
                                done = true;
                                helper.handleSuccess(s, xhr, status, data);
                                helper.handleComplete(s, xhr, status, data);

                                // Handle memory leak in IE
                                script.onload = script.onreadystatechange = null;
                                if (head && script.parentNode) {
                                    head.removeChild(script);
                                }
                            }
                        };
                    }

                    // Use insertBefore instead of appendChild to circumvent an
                    // IE6 bug.
                    // This arises when a base node is used (#2709 and #4378).
                    head.insertBefore(script, head.firstChild);
                }

                inFrame ? setTimeout(function() {
                    create()
                }, 0) : create();

                // We handle everything using the script element injection
                return undefined;
            }

            var requestDone = false;

            // Create the request object
            var xhr = s.xhr();

            if (!xhr) {
                return;
            }

            // Open the socket
            // Passing null username, generates a login popup on Opera (#2865)
            if (s.username) {
                xhr.open(type, s.url, s.async, s.username, s.password);
            } else {
                xhr.open(type, s.url, s.async);
            }

            // Need an extra try/catch for cross domain requests in Firefox 3
            try {
                // Set content-type if data specified and content-body is valid
                // for this type
                if ((s.data != null && !noContent)
                        || (origSettings && origSettings.contentType)) {
                    xhr.setRequestHeader("Content-Type", s.contentType);
                }

                // Set the If-Modified-Since and/or If-None-Match header, if in
                // ifModified mode.
                if (s.ifModified) {
                    if (helper.lastModified[s.url]) {
                        xhr.setRequestHeader("If-Modified-Since",
                                helper.lastModified[s.url]);
                    }

                    if (helper.etag[s.url]) {
                        xhr.setRequestHeader("If-None-Match",
                                helper.etag[s.url]);
                    }
                }

                // Set header so the called script knows that it's an
                // XMLHttpRequest
                // Only send the header if it's not a remote XHR
                if (!remote) {
                    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                }

                // Set the Accepts header for the server, depending on the
                // dataType
                xhr.setRequestHeader("Accept", s.dataType
                        && s.accepts[s.dataType] ? s.accepts[s.dataType]
                        + ", */*; q=0.01" : s.accepts._default);
            } catch (headerError) {
            }

            // Allow custom headers/mimetypes and early abort
            if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
                // Handle the global AJAX counter
                if (s.global && helper.active-- === 1) {
                    // jQuery.event.trigger( "ajaxStop" );
                }

                // close opended socket
                xhr.abort();
                return false;
            }

            if (s.global) {
                helper.triggerGlobal(s, "ajaxSend", [ xhr, s ]);
            }

            // Wait for a response to come back
            var onreadystatechange = xhr.onreadystatechange = function(
                    isTimeout) {
                // The request was aborted
                if (!xhr || xhr.readyState === 0 || isTimeout === "abort") {
                    // Opera doesn't call onreadystatechange before this point
                    // so we simulate the call
                    if (!requestDone) {
                        helper.handleComplete(s, xhr, status, data);
                    }

                    requestDone = true;
                    if (xhr) {
                        xhr.onreadystatechange = helper.noop;
                    }

                    // The transfer is complete and the data is available, or
                    // the request timed out
                } else if (!requestDone && xhr
                        && (xhr.readyState === 4 || isTimeout === "timeout")) {
                    requestDone = true;
                    xhr.onreadystatechange = helper.noop;

                    status = isTimeout === "timeout" ? "timeout"
                            : !helper.httpSuccess(xhr) ? "error"
                                    : s.ifModified
                                            && helper.httpNotModified(xhr,
                                                    s.url) ? "notmodified"
                                            : "success";

                    var errMsg;

                    if (status === "success") {
                        // Watch for, and catch, XML document parse errors
                        try {
                            // process the data (runs the xml through httpData
                            // regardless of callback)
                            data = helper.httpData(xhr, s.dataType, s);
                        } catch (parserError) {
                            status = "parsererror";
                            errMsg = parserError;
                        }
                    }

                    // Make sure that the request was successful or notmodified
                    if (status === "success" || status === "notmodified") {
                        // JSONP handles its own success callback
                        if (!jsonp) {
                            helper.handleSuccess(s, xhr, status, data);
                        }
                    } else {
                        helper.handleError(s, xhr, status, errMsg);
                    }

                    // Fire the complete handlers
                    if (!jsonp) {
                        helper.handleComplete(s, xhr, status, data);
                    }

                    if (isTimeout === "timeout") {
                        xhr.abort();
                    }

                    // Stop memory leaks
                    if (s.async) {
                        xhr = null;
                    }
                }
            };

            // Override the abort handler, if we can (IE 6 doesn't allow it, but
            // that's OK)
            // Opera doesn't fire onreadystatechange at all on abort
            try {
                var oldAbort = xhr.abort;
                xhr.abort = function() {
                    // xhr.abort in IE7 is not a native JS function
                    // and does not have a call property
                    if (xhr && oldAbort.call) {
                        oldAbort.call(xhr);
                    }

                    onreadystatechange("abort");
                };
            } catch (abortError) {
            }

            // Timeout checker
            if (s.async && s.timeout > 0) {
                setTimeout(function() {
                    // Check to see if the request is still happening
                    if (xhr && !requestDone) {
                        onreadystatechange("timeout");
                    }
                }, s.timeout);
            }

            // Send the data
            try {
                xhr.send(noContent || s.data == null ? null : s.data);

            } catch (sendError) {
                helper.handleError(s, xhr, null, sendError);

                // Fire the complete handlers
                helper.handleComplete(s, xhr, status, data);
            }

            // firefox 1.5 doesn't fire statechange for sync requests
            if (!s.async) {
                onreadystatechange();
            }

            // return XMLHttpRequest to allow aborting the request etc.
            return xhr;
        }

        function param(a) {
            var s = [];
            if (typeof a == "object") {
                for ( var key in a) {
                    s[s.length] = encodeURIComponent(key) + '='
                            + encodeURIComponent(a[key]);
                }
                // Return the resulting serialization
                return s.join("&").replace(r20, "+");
            }
            return a;
        }

        ajax.param = param;

        var helper = {
            noop : function() {
            },
            // Counter for holding the number of active queries
            active : 0,

            // Last-Modified header cache for next request
            lastModified : {},
            etag : {},

            handleError : function(s, xhr, status, e) {
                // If a local callback was specified, fire it
                if (s.error) {
                    s.error.call(s.context, xhr, status, e);
                }

                // Fire the global callback
                if (s.global) {
                    helper.triggerGlobal(s, "ajaxError", [ xhr, s, e ]);
                }
            },

            handleSuccess : function(s, xhr, status, data) {
                // If a local callback was specified, fire it and pass it the
                // data
                if (s.success) {
                    s.success.call(s.context, data, status, xhr);
                }

                // Fire the global callback
                if (s.global) {
                    helper.triggerGlobal(s, "ajaxSuccess", [ xhr, s ]);
                }
            },

            handleComplete : function(s, xhr, status) {
                // Process result
                if (s.complete) {
                    s.complete.call(s.context, xhr, status);
                }

                // The request was completed
                if (s.global) {
                    helper.triggerGlobal(s, "ajaxComplete", [ xhr, s ]);
                }

                // Handle the global AJAX counter
                if (s.global && helper.active-- === 1) {
                    // jQuery.event.trigger( "ajaxStop" );
                }
            },

            triggerGlobal : function(s, type, args) {
                // (s.context && s.context.url == null ? jQuery(s.context) :
                // jQuery.event).trigger(type, args);
            },

            // Determines if an XMLHttpRequest was successful or not
            httpSuccess : function(xhr) {
                try {
                    // IE error sometimes returns 1223 when it should be 204 so
                    // treat it as success, see #1450
                    return !xhr.status && location.protocol === "file:"
                            || xhr.status >= 200 && xhr.status < 300
                            || xhr.status === 304 || xhr.status === 1223;
                } catch (e) {
                }

                return false;
            },

            // Determines if an XMLHttpRequest returns NotModified
            httpNotModified : function(xhr, url) {
                var lastModified = xhr.getResponseHeader("Last-Modified"), etag = xhr
                        .getResponseHeader("Etag");

                if (lastModified) {
                    helper.lastModified[url] = lastModified;
                }

                if (etag) {
                    helper.etag[url] = etag;
                }

                return xhr.status === 304;
            },

            httpData : function(xhr, type, s) {
                var ct = xhr.getResponseHeader("content-type") || "", xml = type === "xml"
                        || !type && ct.indexOf("xml") >= 0, data = xml ? xhr.responseXML
                        : xhr.responseText;

                if (xml && data.documentElement.nodeName === "parsererror") {
                    helper.error("parsererror");
                }

                // Allow a pre-filtering function to sanitize the response
                // s is checked to keep backwards compatibility
                if (s && s.dataFilter) {
                    data = s.dataFilter(data, type);
                }

                // The filter can actually parse the response
                if (typeof data === "string") {
                    // Get the JavaScript object, if JSON is used.
                    if (type === "json" || !type && ct.indexOf("json") >= 0) {
                        data = data ? (window.JSON && window.JSON.parse ? window.JSON
                                .parse(data)
                                : (new Function("return " + data))())
                                : data;

                        // If the type is "script", eval it in global context
                    } else if (type === "script" || !type
                            && ct.indexOf("javascript") >= 0) {
                        // jQuery.globalEval( data );
                        if (data && rnotwhite.test(data)) {
                            // Inspired by code by Andrea Giammarchi
                            // http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
                            var head = document.getElementsByTagName("head")[0]
                                    || document.documentElement, script = document
                                    .createElement("script");
                            script.type = "text/javascript";
                            try {
                                script.appendChild(document
                                        .createTextNode(data));
                            } catch (e) {
                                script.text = data;
                            }

                            // Use insertBefore instead of appendChild to
                            // circumvent an IE6 bug.
                            // This arises when a base node is used (#2709).
                            head.insertBefore(script, head.firstChild);
                            head.removeChild(script);
                        }
                    }
                }

                return data;
            }
        };

        ajax.settings = {
            url : location.href,
            global : true,
            type : "GET",
            contentType : "application/x-www-form-urlencoded",
            processData : true,
            async : true,
            /*
             * timeout: 0, data: null, username: null, password: null,
             * traditional: false,
             */
            // This function can be overriden by calling ajax.setup
            xhr : function() {
                return new window.XMLHttpRequest();
            },
            accepts : {
                xml : "application/xml, text/xml",
                html : "text/html",
                script : "text/javascript, application/javascript",
                json : "application/json, text/javascript",
                text : "text/plain",
                _default : "*/*"
            }
        };

        ajax.setup = function(settings) {
            if (settings) {
                for ( var key in settings) {
                    ajax.settings[key] = settings[key];
                }
            }
        }
        /*
         * Create the request object; Microsoft failed to properly implement the
         * XMLHttpRequest in IE7 (can't request local files), so we use the
         * ActiveXObject when it is available Additionally XMLHttpRequest can be
         * disabled in IE7/IE8 so we need a fallback.
         */
        if (window.ActiveXObject) {
            ajax.settings.xhr = function() {
                if (window.location.protocol !== "file:") {
                    try {
                        return new window.XMLHttpRequest();
                    } catch (xhrError) {
                    }
                }

                try {
                    return new window.ActiveXObject("Microsoft.XMLHTTP");
                } catch (activeError) {
                }
            };
        }
        return ajax;
    })();

    function idsArray(ids) {
        return ids && ids.split ? ids.split(",") : (isArray(ids) ? ids
                : (parseInt(ids) ? [ parseInt(ids) ] : []));
    }

    /**
     * XMLHttpRequest轮询
     */
    function Comet(url) {
        var _this = this;
        _this.URL = url;
        _this._setting();
    }

    // The connection has not yet been established.
    Comet.CONNECTING = 0;
    // The connection is established and communication is possible.
    Comet.OPEN = 1;
    // The connection has been closed or could not be opened.
    Comet.CLOSED = 2;
    // Make the class work with custom events

    Comet.prototype = {
        readyState : Comet.CLOSED,
        send : function(msg) {
        },
        _setting : function() {
            var _this = this;
            _this.readyState = Comet.CLOSED;
            // 是否已连接 只读属性
            _this._connecting = false;
            // 设置连接开关避免重复连接
            _this._onPolling = false;
            // 避免重复polling
            _this._pollTimer = null;
            _this._pollingTimes = 0;
            // polling次数 第一次成功后 connected = true;
            _this._failTimes = 0;
            // polling失败累加2次判定服务器关闭连接
        },
        connect : function() {
            // 连接
            var _this = this;
            if (_this._connecting)
                return _this;
            _this.readyState = Comet.CONNECTING;
            _this._connecting = true;
            if (!_this._onPolling) {
                window.setTimeout(function() {
                    _this._startPolling();
                }, 300);
            }
            return _this;
        },
        close : function() {
            var _this = this;
            if (_this._pollTimer)
                clearTimeout(_this._pollTimer);
            _this._setting();
            return _this;
        },
        _onConnect : function() {
            var _this = this;
            _this.readyState = Comet.OPEN;
            _this.trigger('open', 'success');
        },
        _onClose : function(m) {
            var _this = this;
            _this._setting();
            // Delay trigger event when reflesh web site
            setTimeout(function() {
                _this.trigger('close', [ m ]);
            }, 1000);
        },
        _onData : function(data) {
            var _this = this;
            _this.trigger('message', [ data ]);
        },
        _onError : function(text) {
            var _this = this;
            _this._setting();
            // Delay trigger event when reflesh web site
            setTimeout(function() {
                _this.trigger('error', [ text ]);
            }, 1000);
        },
        _startPolling : function() {
            var _this = this;
            if (!_this._connecting)
                return;
            _this._onPolling = true;
            _this._pollingTimes++;
            ajax({
                url : _this.URL,
                dataType : 'jsonp',
                cache : false,
                context : _this,
                success : _this._onPollSuccess,
                error : _this._onPollError
            });
        },
        _onPollSuccess : function(d) {
            var _this = this;
            _this._onPolling = false;
            if (_this._connecting) {
                if (!d) {
                    return _this._onError('error data');
                } else {
                    if (_this._pollingTimes == 1) {
                        _this._onConnect();
                    }
                    _this._onData(d);
                    _this._failTimes = 0;
                    // 连接成功 失败累加清零
                    _this._pollTimer = window.setTimeout(function() {
                        _this._startPolling();
                    }, 200);
                }
            }
        },
        _onPollError : function(m) {
            var _this = this;
            _this._onPolling = false;
            if (!_this._connecting)
                return;
            // 已断开连接
            _this._failTimes++;
            if (_this._pollingTimes == 1)
                _this._onError('can not connect.');
            else {
                if (_this._failTimes > 1) {
                    // 服务器关闭连接
                    _this._onClose(m);
                } else {
                    _this._pollTimer = window.setTimeout(function() {
                        _this._startPolling();
                    }, 200);
                }
            }
        }
    };
    ClassEvent.on(Comet);

    /**
     * 管道连接
     */
    function Channel(options) {
        var _this = this;

        _this._init(options);

        // 当连接成功时触发
        _this.onConnected = null;
        // 当断开时候触发
        _this.onDisconnected = null;
        // 当连接异常时触发
        _this.onError = null;
        // 当有消息时触发
        _this.onMessage = null;

        _this.bind("connected", function(ev, data) {
            _this.status = Channel.CONNECTED;
            if (_this.onConnected) {
                _this.onConnected(ev, data);
            }
        });
        _this.bind("disconnected", function(ev, data) {
            _this.status = Channel.DISCONNECTED;
            if (_this.onDisconnected) {
                _this.onDisconnected(ev, data);
            }
        });
        _this.bind("error", function(ev, data) {
            _this.status = Channel.DISCONNECTED;
            if (_this.onError) {
                _this.onError(ev, data);
            }
        });
        _this.bind("message", function(ev, data) {
            _this.status = Channel.CONNECTED;
            if (_this.onMessage) {
                _this.onMessage(ev, data);
            }
        });
    }

    Channel.CONNECTING = 0;
    Channel.CONNECTED = 1;
    Channel.DISCONNECTED = 2;

    /** 管道类型 */
    Channel.type = {};
    (function(type) {
        type.XHR_POLLING = "XHR_POLLING";
        type.WEBSOCKET = "WEBSOCKET";
    })(Channel.type);

    Channel.DEFAULTS = {
        type : Channel.type.WEBSOCKET
    };

    Channel.prototype = {
        type : Channel.DEFAULTS.type,
        status : Channel.DISCONNECTED,

        _init : function(options) {
            this.options = extend({}, Channel.DEFAULTS, options || {});
            this.type = this.options.type;
        },

        _newSocket : function() {
            var _this = this;
            var ops = _this.options;
            var ws = _this.ws = new WebSocket(ops.websocket);

            ws.onopen = function(ev) {
                _this.trigger("connected", [ ev.data ]);
                ws.send("subscribe " + ops.domain + " " + ops.ticket);
            };
            ws.onclose = function(ev) {
                _this.trigger('disconnected', [ ev.data ]);
            };
            ws.onmessage = function(ev) {
                var data = ev.data;
                try {
                    data = data ? (window.JSON && window.JSON.parse ? window.JSON
                            .parse(data) : (new Function("return " + data))())
                            : data;
                } catch (e) {
                }
                _this.trigger('message', [ data ]);
            };
            ws.onerror = function(ev) {
                _this.trigger("error", [ ev ]);
            };
            return ws;
        },

        _newComet : function() {
            var _this = this;
            var ops = _this.options;

            var comet = _this.comet = new Comet(ops.server
                    + (/\?/.test(ops.server) ? "&" : "?") + ajax.param({
                        ticket : ops.ticket,
                        domain : ops.domain
                    }));
            // 注册长连接的事件监听器
            comet.bind("open", function(ev, data) {
                _this.trigger("connected", [ data ]);
            });
            comet.bind("close", function(ev, data) {
                _this.trigger('disconnected', [ data ]);
            });
            comet.bind("message", function(ev, data) {
                _this.trigger('message', [ data ]);
            });
            comet.bind("error", function(ev, data) {
                _this.trigger('error', [ data ]);
            });
            // 发起连接
            comet.connect();
            return comet;
        },

        /** 发起连接 */
        connect : function() {
            var _this = this;
            var ops = _this.options;
            _this.status = Channel.CONNECTING;

            if (ops.type == Channel.type.WEBSOCKET) {
                if (window.WebSocket) {
                    _this.type = Channel.type.WEBSOCKET;
                    _this._newSocket();
                    return;
                }
            }

            _this.type = Channel.type.XHR_POLLING;
            this._newComet();
        },

        /** 关闭连接 */
        disconnect : function() {
            var _this = this;

            if (_this.type == Channel.type.WEBSOCKET) {
                _this.ws.close();
            }
            if (_this.type == Channel.type.XHR_POLLING) {
                _this.comet.close();
            }
        },

        /** 发送消息 */
        sendMessage : function(msg) {
            var _this = this;

            if (_this.type == Channel.type.WEBSOCKET) {
                _this.ws.send(msg);
            }
            if (_this.type == Channel.type.XHR_POLLING) {
                _this.comet.send(msg);
            }
        }
    };
    ClassEvent.on(Channel);

    var NexTalkWebIM = function() {};
    var IM = NexTalkWebIM;
    ClassEvent.on(IM);
    
    extend(IM, {
        log : log,
        idsArray : idsArray,
        nowStamp : nowStamp,
        isFunction : isFunction,
        isArray : isArray,
        isObject : isObject,
        trim : trim,
        makeArray : makeArray,
        extend : extend,
        each : each,
        inArray : inArray,
        grep : grep,
        map : map,
        JSON : JSON,
        ajax : ajax,
        Channel : Channel,
        ClassEvent : ClassEvent,
        isMobile : isMobile
    });

    // 全局性的定义-----------------

    /** 版本号 */
    IM.VERSION = IM.version = IM.v = "0.0.1";

    /** 连接状态 */
    IM.connStatus = {};
    (function(connStatus) {
        /** 网络不可用。 */
        connStatus[connStatus["NETWORK_UNAVAILABLE"] = -1] = "NETWORK_UNAVAILABLE";
        /** 连接中。 */
        connStatus[connStatus["CONNECTING"] = 0] = "CONNECTING";
        /** 连接成功。 */
        connStatus[connStatus["CONNECTED"] = 1] = "CONNECTED";
        /** 断开连接。 */
        connStatus[connStatus["DISCONNECTED"] = 2] = "DISCONNECTED";
    })(IM.connStatus);

    /** 消息类型 */
    IM.msgType = {
        /** 私聊 */
        CHAT : 'chat',
        /** 聊天室 */
        ROOM : 'room',
        /** 通知 */
        NOTIFICATION : 'notification'
    };

    /** 消息放向 */
    IM.msgDirection = {
        SEND : 'send',
        RECEIVE : 'receive'
    };

    IM.name = {
        NOTIFICATION : '系统通知',
        STRANGER : '陌生人'
    };
    IM.imgs = {};

    /** 错误码 */
    IM.errCode = {};
    (function(errCode) {
        /** 未知原因失败 */
        errCode[errCode["UNKNOWN"] = -1] = "UNKNOWN";
        /** 请求超时 */
        errCode[errCode["TIMEOUT"] = 0] = "TIMEOUT";
    })(IM.errCode);

    /** 现场状态 */
    IM.show = {};
    (function(show) {
        /** 在线 */
        show[show["AVAILABLE"] = "available"] = "AVAILABLE";
        /** 忙碌 */
        show[show["DND"] = "dnd"] = "DND";
        /** 离开 */
        show[show["AWAY"] = "away"] = "AWAY";
        /** 隐身 */
        show[show["INVISIBLE"] = "invisible"] = "INVISIBLE";
        /** 聊天中 */
        show[show["CHAT"] = "chat"] = "CHAT";
        /** 离线 */
        show[show["UNAVAILABLE"] = "unavailable"] = "UNAVAILABLE";
    })(IM.show);

    /** 默认配置信息 */
    IM.DEFAULTS = {
        // 消息管道类型
        // 默认为Websocket->XMLHttpRequest(XHR)Polling层层降级方式.
        channelType : Channel.type.WEBSOCKET,
        // 是否支持跨域访问
        isJsonp : false,
        // 通信令牌 暂时不用
        // ticket : 'ticket',
        // APP_KEY 暂时不用
        // appKey : 'app_key',
        // 资源文件根路径
        resPath : '/src',
        // API接口根路径
        apiPath : "/",
        // 聊天热线，多个ID逗号","分割
        chatlinkIds : null
    };

    // 实例化NexTalkWebIM类对象----------------

    /** 实例化一个客户端 */
    IM._instance = undefined;
    /**
     * 获取实例化的客户端
     */
    IM.getInstance = function() {
        if (!IM._instance) {
            throw new Error("NexTalkWebIM is not initialized.");
        }
        return IM._instance;
    };

    /**
     * 初始化NexTalkWebIM
     */
    IM.init = function(options) {
        if (!IM._instance) {
            IM._instance = new IM();
        }
        IM.getInstance()._init(options);
        return IM.getInstance();
    };

    IM.prototype.version = IM.VERSION;

    extend(IM.prototype, {
        /**
         * 数据存储， 
         * serverTime 服务器运行时间戳 
         * connection 连接信息 
         * currUser 当前登入用户信息 
         * buddies 联系人列表 
         * rooms 房间列表
         */
        _dataAccess : {},

        /** 连接状态 */
        connStatus : IM.connStatus.DISCONNECTED,
        presences : {},

        _serverTime : function(time) {
            this._dataAccess.serverTime = time;
        },

        _connection : function(connInfo) {
            this._dataAccess.connection = this._dataAccess.connection || {};
            extend(this._dataAccess.connection, connInfo);
        },

        _currUser : function(user) {
            this._dataAccess.currUser = this._dataAccess.currUser || {};
            //var path = this.options.apiPath;
            //user.avatar = path + user.avatar;
            extend(this._dataAccess.currUser, user);
        },
        
        _show : function(show) {
            var user = this.getCurrUser();
            extend(user, {show : show});
        },

        _buddies : function(buddies) {
            //var path = this.options.apiPath;
            //for (var i = 0; i < buddies.length; i++) {
            //    buddies[i].avatar = path + buddies[i].avatar;
            //}
            this._dataAccess.buddies = this._dataAccess.buddies || [];
            extend(this._dataAccess.buddies, buddies);
        },

        _rooms : function(rooms) {
            this._dataAccess.rooms = this._dataAccess.rooms || [];
            extend(this._dataAccess.rooms, rooms);
        },

        getServerTime : function() {
            return this._dataAccess.serverTime;
        },

        getConnection : function() {
            this._dataAccess.connection = this._dataAccess.connection || {};
            return this._dataAccess.connection;
        },

        getCurrUser : function() {
            this._dataAccess.currUser = this._dataAccess.currUser || {};
            return this._dataAccess.currUser;
        },

        getShow : function() {
            var currUser = this.getCurrUser();
            if (!currUser.show) {
                currUser.show = IM.show.UNAVAILABLE;
            }
            return currUser.show;
        },

        getBuddies : function() {
            return this._dataAccess.buddies;
        },
        
        getBuddy : function(uid) {
            if (!this.getBuddies()) {
                return undefined;
            }
            var bs = this.getBuddies();
            for (var i = 0; i < bs.length; i++) {
                var b = bs[i];
                if (b.id == uid) {
                    return b;
                }
            }
            return undefined;
        },

        getRooms : function() {
            return this._dataAccess.rooms;
        }
    });

    /**
     * 消息数据
     */
    IM.prototype._msgData = {
        // 私聊消息
        chat : {
            
        },
        // 聊天室消息
        room : {
            
        },
        // 系统通知
        nocification : undefined,
        // 未读消息总数
        unreadTotal : 0,

        get : function(msgType, key) {
            if (msgType == IM.msgType.NOTIFICATION)
                return this[msgType];
            return this[msgType][key];
        },

        set : function(msgType, key, value) {
            var _this = this;
            if (msgType == IM.msgType.NOTIFICATION) {
                _this[msgType] = value;
                return;
            }
            _this[msgType][key] = value;
        }
    };
    /**
     * 保存通话记录
     */
    IM.prototype._saveMsg = function(msgType, msgDirection, msg) {
        var _this = this;
        var other = undefined;
        switch (msgType) {
            case IM.msgType.CHAT:
                if (msgDirection == IM.msgDirection.SEND) {
                    other = msg.to;
                } else if (msgDirection == IM.msgDirection.RECEIVE) {
                    other = msg.from;
                }
                break;
            case IM.msgType.ROOM:
                other = msg.to;
                break;
            case IM.msgType.NOTIFICATION:
                other = IM.msgType.NOTIFICATION;
                break;
            default:
                throw new Error('NexTalkWebIM.msgType out of Bounds.');
                break;
        }
        // 获取对话消息
        var dInfo = _this._msgData.get(msgType, other);
        if (!dInfo) {
            dInfo = new DialogInfo(msgType, msgDirection, msg);
            _this._msgData.set(msgType, other, dInfo);
        }
        dInfo.add(msgDirection, msg);
    };
    IM.prototype.setRead = function(msgType, other, msg) {
        var _this = this;
        if (typeof msg.read == 'boolean' && !msg.read) {
            msg.read = true;
            _this.getDialogInfo(msgType, other)._setRead();
        }
    };
    IM.prototype.readAll = function(msgType, other) {
        var dInfo = this.getDialogInfo(msgType, other);
        if (!dInfo) {
            return [];
        }
        return dInfo._readAll();
    };
    IM.prototype.getDialogInfo = function(msgType, other) {
        var _this = this;
        // 获取对话消息
        var dInfo = _this._msgData.get(msgType, other);
        if (!dInfo)
            return undefined;

        return dInfo;
    };
    IM.prototype.getUnreadTotal = function() {
        return this._msgData.unreadTotal;
    };

    /**
     * 和对方的对话信息
     */
    var DialogInfo = function(msgType, msgDirection, msg) {
        // 入参验证
        if (msgDirection == IM.msgDirection.SEND) {
            if (!msg.nick) {
                throw new Error('msg.nick not settings.');
            }
            if (!msg.avatar) {
                throw new Error('msg.avatar not settings.');
            }
            if (!msg.to_nick) {
                throw new Error('msg.to_nick not settings.');
            }
            if (!msg.to_avatar) {
                throw new Error('msg.to_avatar not settings.');
            }
        }

        var _this = this;
        _this.webim = IM.getInstance();
        _this.msgType = msgType;
        // 未读消息数
        _this.notCount = 0;
        // 对话的对象（唯一标示）
        _this.other = null;
        // 对话对象的名称
        _this.name = null;
        // 对话对象的头像
        _this.avatar = null;
        // 最近一次对话时间
        _this.timestamp = null;

        switch (msgType) {
            case IM.msgType.CHAT:
                if (msgDirection == IM.msgDirection.SEND) {
                    _this.other = msg.to;
                    _this.name = msg.to_nick;
                    _this.avatar = msg.to_avatar;
                } else if (msgDirection == IM.msgDirection.RECEIVE) {
                    _this.other = msg.from;
                    _this.name = msg.nick;
                    var buddy = _this.webim.getBuddy(_this.other);
                    if (buddy) {
                        _this.avatar = buddy.avatar;
                    } else {
                        _this.avatar = IM.imgs.HEAD;
                    }
                }
                break;
            case IM.msgType.ROOM:
                _this.other = msg.to;
                _this.name = msg.to;
                if (msgDirection == IM.msgDirection.SEND) {
                    _this.name = msg.to_nick;
                    _this.avatar = msg.to_avatar;
                } else if (msgDirection == IM.msgDirection.RECEIVE) {
                    var room = _this.webim.getRoom(_this.other);
                    if (room) {
                        _this.name = room.name;
                        _this.avatar = room.avatar;
                    } else {
                        _this.avatar = IM.imgs.GROUP;
                    }
                }
                break;
            case IM.msgType.NOTIFICATION:
                _this.other = IM.msgType.NOTIFICATION;
                _this.name = IM.name.NOTIFICATION;
                _this.avatar = IM.imgs.NOTICE;
                break;
            default:
                throw new Error('NexTalkWebIM.msgType out of Bounds.');
                break;
        }

        // 对话的记录
        _this.record = [];
    }
    /**
     * 保存通话记录
     */
    DialogInfo.prototype.add = function(msgDirection, msg) {
        var _this = this;
        if (msgDirection == IM.msgDirection.RECEIVE) {
            if (typeof msg.read == 'boolean' && !msg.read) {
                _this.notCount++;
                _this.webim._msgData.unreadTotal++;
            }
            switch (msg.type) {
                case IM.msgType.CHAT:
                    msg.avatar = _this.avatar;
                    break;
                case IM.msgType.ROOM:
                    var buddy = _this.webim.getBuddy(msg.from);
                    if (buddy) {
                        msg.avatar = buddy.avatar;
                    } else {
                        msg.avatar = IM.imgs.HEAD;
                    }
                    break;
                case IM.msgType.NOTIFICATION:
                    msg.avatar = IM.imgs.NOTICE;
                    break;
                default:
                    throw new Error('NexTalkWebIM.msgType out of Bounds.');
                    break;
            }
        }
        msg.direction = msgDirection;
        _this.timestamp = msg.timestamp;
        _this.record[_this.record.length] = msg;
    };
    /**
     * 获取所有的往来通话，将未读标识去掉，未读数清零
     */
    DialogInfo.prototype._readAll = function() {
        var _this = this;
        for (var i = 0, len = _this.record.length; i < len; i++) {
            var msg = _this.record[i];
            if (typeof msg.read == 'boolean' && !msg.read) {
                msg.read = true;
                _this.webim._msgData.unreadTotal--;
            }
        }
        this.notCount = 0;
        return this.record;
    };
    /**
     * 获取最后一条通话记录
     */
    DialogInfo.prototype.getLast = function() {
        if (this.record.length <= 0)
            return undefined;

        return this.record[this.record.length - 1];
    };
    DialogInfo.prototype._setRead = function() {
        if (this.notCount > 0) {
            this.notCount--;
            this.webim._msgData.unreadTotal--;
        }
    };

    /**
     * 初始化NexTalkWebIM
     */
    IM.prototype._init = function(options) {
        var _this = this;
        options = _this.options = extend({}, IM.DEFAULTS, options || {});

        if (!options.resPath) {
            throw new Error('options.resPath is empty');
        }

        ajax.setup({
            dataType : options.isJsonp ? "jsonp" : "json"
        });

        // 初始化Web业务服务API
        IM.WebAPI.init({
            apiPath : options.apiPath,
            dataType : ajax.settings.dataType
        });
        
        _this.loginTimes = 0;
        _this.connectedTimes = 0;
        _this.status = new IM.Status();
        _this.setting = new IM.Setting();
        //_this.presence = new IM.Presence();
        _this.buddy = new IM.Buddy();
        _this.room = new IM.Room();
        _this.history = new IM.History();
        
        _this._initListener();
        _this._initTimerTask();
        _this._initResource();
        return _this;
    };

    /** 初始化默认图片 */
    IM.prototype._initResource = function() {
        var path = this.options.resPath;
        IM.imgs.HEAD = path + 'imgs/head_def.png';
        IM.imgs.GROUP = path + 'imgs/group.gif';
        IM.imgs.NOTICE = path + 'imgs/messagescenter_notice.png';
        IM.imgs.LOGO_INDEX = path + 'imgs/logo.png';
        IM.imgs.LOGO = path + 'imgs/webim.72x72.png';
        sound.init({msg : path + 'sound/msg.mp3'});
    }

    var sound = (function() {
        var playSound = true;
        var webimAudio;
        var play = function(url) {
            if (window.Audio) {
                if (!webimAudio) {
                    var webimAudio = new Audio();
                }
                webimAudio.src = url;
                webimAudio.play();
            } else if (navigator.userAgent.indexOf('MSIE') >= 0) {
                try {
                    document.getElementById('webim-bgsound').src = url;
                } catch (e) {}
            }
        };
        var _urls = {
            lib : "sound.swf",
            msg : "sound/msg.mp3"
        };
        return {
            enable : function() {
                playSound = true;
            },
            disable : function() {
                playSound = false;
            },
            init : function(urls) {
                extend(_urls, urls);
                if (!window.Audio && navigator.userAgent.indexOf('MSIE') >= 0) {
                    var soundEl = document.createElement('bgsound');
                    soundEl.id = 'webim-bgsound';
                    soundEl.src = '#';
                    soundEl.autostart = 'true';
                    soundEl.loop = '1';
                    var welcome = document.getElementById('nextalk_page_welcome');
                    if (welcome) {
                        welcome.appendChild(soundEl);
                    }
                }
            },
            play : function(type) {
                var url = isUrl(type) ? type : _urls[type];
                playSound && play(url);
            }
        }
    })();

    function HTMLEnCode(str) {
        var s = "";
        if (str.length == 0)
            return "";
        s = str.replace(/&/g, "&amp;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/    /g, "&nbsp;");
        s = s.replace(/\'/g, "&#39;");
        s = s.replace(/\"/g, "&quot;");
        s = s.replace(/\n/g, "<br />");
        return s;
    }
    function isUrl(str) {
        return /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"])*$/.test(str);
    }
    function stripHTML(str) {
        return str ? str.replace(/<(?:.|\s)*?>/g, "") : "";
    }

    /** 绑定WebIM客户端存在的各种事件监听 */
    IM.prototype._initListener = function() {
        var _this = this;
        // 登入状态监听器
        _this.loginStatusListener = {
            onLogin : function(ev, data) {},
            onLoginFail : function(ev, data) {},
            onLoginWin : function(ev, data) {}
        };
        // 连接状态监听器
        _this.connStatusListener = {
             onConnecting : function(ev, data) {},
             onConnected : function(ev, data) {},
             onDisconnected : function(ev, data) {},
             onNetworkUnavailable : function(ev, data) {}
        };
        // 消息接收监听器
        _this.receiveMsgListener = {
            onMessage : function(ev, data) {},
            onStatus : function(ev, data) {},
            onPresences : function(ev, data) {}
        };

        // 正在登入中
        _this.bind("login", function(ev, data) {
            console.log("login: " + JSON.stringify(data));
            _this.loginStatusListener.onLogin(ev, data);
        });
        _this.bind("login.win", function(ev, data) {
            console.log("login.win: " + JSON.stringify(data));
            _this.loginTimes++;
            _this.loginStatusListener.onLoginWin(ev, data);
        });
        _this.bind("login.fail", function(ev, data) {
            console.log("login.fail: " + JSON.stringify(data));
            _this.loginStatusListener.onLoginFail(ev, data);
        });

        // 正在连接
        _this.bind("connecting", function(ev, data) {
            console.log("connecting: " + JSON.stringify(data));
            if (_this.connStatus != IM.connStatus.CONNECTING) {
                _this.connStatus = IM.connStatus.CONNECTING;
                _this.connStatusListener.onConnecting(ev, data);
            }
        });
        // 连接成功
        _this.bind("connected", function(ev, data) {
            console.log("connected: " + JSON.stringify(data));
            _this.connectedTimes++;
            if (_this.connStatus != IM.connStatus.CONNECTED) {
                _this.connStatus = IM.connStatus.CONNECTED;
                if (_this.status.get("s") == IM.show.UNAVAILABLE) {
                    _this.status.set("s", IM.show.AVAILALE);
                }
                _this._show(_this.status.get("s"));
                _this.connStatusListener.onConnected(ev, data);
            }
        });
        // 断开连接
        _this.bind("disconnected", function(ev, data) {
            console.log("disconnected: " + JSON.stringify(data));
            if (_this.connStatus != IM.connStatus.DISCONNECTED) {
                _this.connStatus = IM.connStatus.DISCONNECTED;
                _this._show(IM.show.UNAVAILABLE);
                _this.connStatusListener.onDisconnected(ev, data);
            }
        });
        // 网络不可用
        _this.bind("network.unavailable", function(ev, data) {
            console.log("network.unavailable: " + JSON.stringify(data));
            if (_this.connStatus != IM.connStatus.NETWORK_UNAVAILABLE) {
                _this.connStatus = IM.connStatus.NETWORK_UNAVAILABLE;
                _this._show(IM.show.UNAVAILABLE);
                _this.connStatusListener.onNetworkUnavailable(ev, data);
            }
        });

        _this.bind("event", function(ev, data) {
            console.log("event: " + JSON.stringify(date));
        });

        // 接收消息
        _this.bind("messages", function(ev, data) {
            console.log("messages: " + JSON.stringify(data));
            var u = _this.getCurrUser();
            for (var i = 0; i < data.length; i++) {
                var msg = data[i];
                var direction = IM.msgDirection.RECEIVE;
                msg.read = false;
                msg.direction = direction;
                // 如果是自己发送出去的
                if (msg.from == u.id) {
                    direction = IM.msgDirection.SEND;
                    msg.read = true;
                    msg.direction = direction;
                    msg.avatar = u.avatar;
                    switch (msg.type) {
                        case IM.msgType.CHAT:
                            var buddy = _this.getBuddy(msg.to);
                            if (buddy) {
                                msg.to_nick = buddy.nick;
                                msg.to_avatar = buddy.avatar;
                            } else {
                                msg.to_nick = IM.name.STRANGER + msg.to;
                                msg.to_avatar = IM.imgs.HEAD;
                            }
                            break;
                        case IM.msgType.ROOM:
                            var room = _this.getRoom(msg.to);
                            if (room) {
                                msg.to_nick = room.name;
                                msg.to_avatar = room.avatar;
                            } else {
                                msg.to_nick = msg.to;
                                msg.to_avatar = IM.imgs.GROUP;
                            }
                            break;
                        default:
                            throw new Error('NexTalkWebIM.msgType out of Bounds.');
                            break;
                    }
                }
                _this._saveMsg(msg.type, direction, msg);
            }
            _this.receiveMsgListener.onMessage(ev, data);
            sound.play('msg');
        });
        // 输入状态
        _this.bind("status", function(ev, data) {
            console.log("status: " + JSON.stringify(data));
            _this.receiveMsgListener.onStatus(ev, data);
        });
        // 现场变更
        _this.bind("presences", function(ev, data) {
            console.log("presences: " + JSON.stringify(data));
            _this.presences = data;
            _this.receiveMsgListener.onPresences(ev, data);
        });
    };

    /**
     * 定义或开启部分定时任务
     */
    IM.prototype._initTimerTask = function() {
        //var _this = this;
        // 设置网络是否可用实时检测
        // ???
        //_this.trigger("network.unavailable", [ data ]);
    };

    /**
     * 设置登入状态监听器
     */
    IM.prototype.setLoginStatusListener = function(listener) {
        extend(this.loginStatusListener, listener || {});
    };

    /**
     * 设置连接状态监听器
     */
    IM.prototype.setConnStatusListener = function(listener) {
        extend(this.connStatusListener, listener || {});
    };

    /**
     * 设置消息接收监听器
     */
    IM.prototype.setReceiveMsgListener = function(listener) {
        extend(this.receiveMsgListener, listener || {});
    };

    /**
     * 连接服务器
     */
    IM.prototype.connectServer = function() {
        var _this = this, options = _this.options;
        // 如果服务器已经连上
        if (_this.connStatus == IM.connStatus.CONNECTED ||
                _this.connStatus == IM.connStatus.CONNECTING) {
            return;
        }

        var params = {};
        if (options.chatlinkIds) {
            params.chatlinkIds = options.chatlinkIds;
        }
        // 连接前请先登入成功
        _this.login(params, function() {
            // 登入成功，开始连接
            _this._connectServer();
        });
    }

    IM.prototype._connectServer = function() {
        var _this = this, options = _this.options;
        var conn = _this.getConnection();

        _this.trigger("connecting", [ _this._dataAccess ]);
        // 创建通信管道
        var ops = extend({type: options.channelType}, conn);
        _this.channel = new Channel(ops);

        // 给管道注册事件监听器
        _this.channel.onConnected = function(ev, data) {
            _this.trigger("connected", [ data ]);
        };
        _this.channel.onDisconnected = function(ev, data) {
            _this.trigger("disconnected", [ data ]);
        }
        _this.channel.onError = function(ev, data) {
            // 可能是网络不可用，或者其他原因???
            _this.trigger("network.unavailable", [ data ]);
        };
        _this.channel.onMessage = function(ev, data) {
            _this.handle(data);
        };

        // 发起管道连接
        _this.channel.connect();
        // options.channelType = _this.channel.type;
    };

    IM.prototype._disconnectServer = function() {
        var _this = this;
        _this.channel.disconnect();
    };

    IM.prototype.handle = function(data) {
        var self = this;
        if (data.messages && data.messages.length) {
            var origin = data.messages, msgs = [], events = [];
            for (var i = 0; i < origin.length; i++) {
                var msg = origin[i];
                if (msg.body && msg.body.indexOf("webim-event:") == 0) {
                    msg.event = msg.body.replace("webim-event:", "").split(
                            "|,|");
                    events.push(msg);
                } else {
                    msgs.push(msg);
                }
            }
            msgs.length && self.trigger("messages", [ msgs ]);
            events.length && self.trigger("event", [ events ]);
        }
        data.presences && data.presences.length
                && self.trigger("presences", [ data.presences ]);
        data.statuses && data.statuses.length
                && self.trigger("status", [ data.statuses ]);
    };

    IM.prototype.online = function(show, callback) {
        var self = this;
        if (show == IM.show.UNAVAILABLE) {
            return new Error("IM.show.UNAVAILABLE is error.");
        }
        if (show == self.getShow()) {
            callback();
            return;
        }

        // 检查一下管道连接
        if (self.connStatus == IM.connStatus.CONNECTING) {
            callback();
            return;
        }
        if (self.connStatus != IM.connStatus.CONNECTED) {
            self.status.set("s", show);
            self.connectServer();
        } else {
            self._sendPresence({show : show}, callback);
        }
    },

    IM.prototype.offline = function(callback) {
        var self = this, connection = self.getConnection();
        if (self.connStatus == IM.connStatus.DISCONNECTED) {
            callback();
            return;
        }

        var api = IM.WebAPI.getInstance();
        var params = {
            ticket : connection.ticket
        };
        api.offline(params, function(ret, err) {
            if (ret == "ok") {
                // 断开连接
                self._disconnectServer();
                callback();
            } else {
                callback();
            }
        });
    };

    extend(IM.prototype,
            {
                login : function(params, callback) {
                    var _this = this, status = _this.status;

                    var buddy_ids = [], room_ids = [], tabs = status
                            .get("tabs"), tabIds = status.get("tabIds");
                    if (tabIds && tabIds.length && tabs) {
                        each(tabs, function(k, v) {
                            if (k[0] == "b")
                                buddy_ids.push(k.slice(2));
                            if (k[0] == "r")
                                room_ids.push(k.slice(2));
                        });
                    }
                    if (status.get("s") == IM.show.UNAVAILABLE) {
                        status.set("s", IM.show.AVAILABLE);
                    } 
                    params = extend({
                        buddy_ids : buddy_ids.join(","),
                        room_ids : room_ids.join(","),
                        show : status.get("s") || IM.show.AVAILABLE
                    }, params);
                    // set auto open true
                    status.set("o", false);
                    status.set("s", params.show);

                    // 触发正在登入事件
                    _this.trigger("login", [ params ]);
                    var api = IM.WebAPI.getInstance();
                    api.online(params, function(ret, err) {
                        window.setTimeout(function() {
                            if (ret) {
                                if (ret.success) {
                                    _this._serverTime(ret.server_time);
                                    _this._connection(ret.connection);
                                    _this._currUser(ret.user);
                                    _this._buddies(ret.buddies);
                                    _this._rooms(ret.rooms);
                                    _this.presences = ret.presences;
                                    // 触发登入成功事件
                                    _this.trigger("login.win", [ ret ]);
                                    if (typeof callback == "function") {
                                        callback();
                                    }
                                } else {
                                    // 触发登入失败事件
                                    _this.trigger("login.fail", [ ret.error_msg ]);
                                }
                            } else {
                                // 触发登入失败事件
                                // 可能是网络不可用，或者其他原因???
                                _this.trigger("login.fail", [ err ]);
                            } 
                        }, 1100);
                    });
                },

                _sendPresence : function(msg, callback) {
                    var _this = this;
                    msg.ticket = _this.getConnection().ticket;

                    var api = IM.WebAPI.getInstance();
                    var params = extend({}, msg);
                    api.presence(params, function(ret, err) {
                        if (ret == "ok") {
                            // save show status
                            //_this._currUser({show : msg.show});
                            _this.getCurrUser().show = msg.show;
                            _this.status.set("s", msg.show);
                            callback();
                        } else {
                            callback();
                        }
                    });
                },

                sendMessage : function(msg, callback) {
                    var _this = this;
                    var direction = IM.msgDirection.SEND;
                    msg.direction = direction;
                    _this._saveMsg(msg.type, direction, msg);

                    var api = IM.WebAPI.getInstance();
                    var params = extend({
                        ticket : _this.getConnection().ticket
                    }, msg);
                    api.message(params, callback);
                },

                sendStatus : function(msg, callback) {
                    var _this = this;
                    msg.ticket = _this.getConnection().ticket;

                    var api = IM.WebAPI.getInstance();
                    var params = extend({}, msg);
                    api.status(params, callback);
                },

                _deactivate : function() {
                    var _this = this;
                    if (!_this.getConnection()
                            || !_this.getConnection().ticket)
                        return;

                    var api = IM.WebAPI.getInstance();
                    var params = {
                        ticket : _this.getConnection().ticket
                    };
                    api.deactivate(params, null, {
                        method : "get"
                    });
                }
            });

    function model(name, defaults, proto) {
        function M(data, options) {
            var self = this;
            self.data = data;
            self.options = extend({}, M.DEFAULTS, options);
            isFunction(self._init) && self._init();
        }
        M.DEFAULTS = defaults;

        ClassEvent.on(M);
        extend(M.prototype, proto);
        IM[name] = M;
    }

    /**
     * 配置(数据库永久存储)
     */
    model("Setting", {
        data : {
            play_sound : true,
            buddy_sticky : true,
            minimize_layout : true,
            msg_auto_pop : true
        }
    }, {
        _init : function() {
            var self = this;
            self.data = extend({}, self.options.data, self.data);
        },
        get : function(key) {
            return this.data[key];
        },
        set : function(key, value) {
            var self = this, options = key;
            if (!key)
                return;
            if (typeof key == "string") {
                options = {};
                options[key] = value;
            }
            var _old = self.data, up = checkUpdate(_old, options);
            if (up) {
                each(up, function(key, val) {
                    self.trigger("update", [ key, val ]);
                });
                var _new = extend({}, _old, options);
                self.data = _new;
                IM.WebAPI.getInstance().setting({
                    data : JSON.stringify(_new)
                });
            }
        }
    });

    /**
     * 状态(cookie临时存储[刷新页面有效])
     */
    model(
            "Status",
            {
                key : "_webim",
                storage : "local",
                domain : document.domain
            },
            {
                _init : function() {
                    var self = this, data = self.data, key = self.options.key;
                    var store = (self.options.storage == "local")
                            && window.localStorage;
                    if (store) {
                        // 无痕浏览模式
                        try {
                            var testKey = '__store_webim__'
                            store.setItem(testKey, testKey)
                            if (store.getItem(testKey) == testKey) {
                                self.store = store;
                            }
                            store.removeItem(testKey);
                        } catch (e) {
                            self.store = undefined;
                        }
                    }
                    if (!data) {
                        var c = self.store ? self.store.getItem(key)
                                : cookie(key);
                        self.data = c ? JSON.parse(c) : {};
                    } else {
                        self._save(data);
                    }
                },
                set : function(key, value) {
                    var options = key, self = this;
                    if (typeof key == "string") {
                        options = {};
                        options[key] = value;
                    }
                    var old = self.data;
                    if (checkUpdate(old, options)) {
                        var _new = extend({}, old, options);
                        self._save(_new);
                    }
                },
                get : function(key) {
                    return this.data[key];
                },
                clear : function() {
                    this._save({});
                },
                _save : function(data) {
                    var self = this, key = self.options.key, domain = self.options.domain;
                    self.data = data;
                    data = JSON.stringify(data);
                    self.store ? self.store.setItem(key, data) : cookie(key,
                            data, {
                                path : '/',
                                domain : domain
                            });
                }
            });

    model(
            "Buddy",
            {
                active : true
            },
            {
                _init : function() {
                    var self = this;
                    self.data = self.data || [];
                    self.dataHash = {};
                    self.set(self.data);
                },
                remove : function(id) {
                    var self = this;
                    var v = self.get(id);
                    if (!v)
                        return;

                    var api = IM.WebAPI.getInstance();
                    api.remove_buddy({
                        id : id
                    }, function(ret, err) {
                    });
                    self.trigger("unsubscribe", [ [ v ] ]);
                    delete self.dataHash[id];
                },
                clear : function() {
                    var self = this;
                    self.data = [];
                    self.dataHash = {};
                },
                count : function(conditions) {
                    var data = this.dataHash, count = 0, t;
                    for ( var key in data) {
                        if (isObject(conditions)) {
                            t = true;
                            for ( var k in conditions) {
                                if (conditions[k] != data[key][k])
                                    t = false;
                            }
                            if (t)
                                count++;
                        } else {
                            count++;
                        }
                    }
                    return count;
                },
                get : function(id) {
                    return this.dataHash[id];
                },
                all : function(onlyVisible) {
                    if (onlyVisible)
                        return grep(this.data, function(a) {
                            return a.show != "invisible"
                                    && a.presence == "online"
                        });
                    else
                        return this.data;
                },
                complete : function() {
                    var self = this, data = self.dataHash, ids = [], v;
                    for ( var key in data) {
                        v = data[key];
                        // Will load offline info for show unavailable buddy.
                        // if( v.incomplete && v.presence == 'online' ) {
                        if (v.incomplete) {
                            // Don't load repeat.
                            v.incomplete = false;
                            ids.push(key);
                        }
                    }
                    self.load(ids);
                },
                update : function(ids) {
                    this.load(ids);
                },
                presence : function(data) {
                    var self = this, dataHash = self.dataHash;
                    data = isArray(data) ? data : [ data ];
                    // Complete presence info.
                    for ( var i in data) {
                        var v = data[i];
                        // Presence in [show,offline,online]
                        v.presence = v.presence == "offline" ? "offline"
                                : "online";
                        v.incomplete = !dataHash[v.id];
                        if (!v.group && v.id) {
                            v.group = v.id.indexOf("vid:") == 0 ? "visitor"
                                    : v.group;
                        }
                    }
                    self.set(data);
                },
                load : function(ids) {
                    ids = idsArray(ids);
                    if (ids.length) {
                        var self = this;
                        var api = IM.WebAPI.getInstance();
                        var params = {
                            ids : ids.join(",")
                        };
                        api.buddies(params, function(ret, err) {
                            if (ret) {
                                self.set(ret);
                            }
                        }, {
                            method : "get",
                            context : self
                        });
                    }
                },
                search : function(val, callback) {
                    var self = this;

                    var api = IM.WebAPI.getInstance();
                    var params = {
                        nick : val
                    };
                    api.search(params, function(ret, err) {
                        if (ret) {
                            self.set(ret);
                            setTimeout(callback, 500);
                        }
                    }, {
                        context : self
                    });
                },
                set : function(addData) {
                    var self = this, data = self.data, dataHash = self.dataHash, status = {};
                    addData = addData || [];
                    var l = addData.length, v, type, add, id;
                    for (var i = 0; i < l; i++) {
                        // for(var i in addData){
                        v = addData[i], id = v.id;
                        if (id) {
                            if (!dataHash[id]) {
                                v.presence = v.presence || "online";
                                v.show = v.show ? v.show
                                        : (v.presence == "offline" ? "unavailable"
                                                : "available");
                                dataHash[id] = {};
                                data.push(dataHash[id]);
                            }
                            v.incomplete = !!v.incomplete;
                            add = checkUpdate(dataHash[id], v);
                            if (add) {
                                type = add.presence || "update";
                                status[type] = status[type] || [];
                                extend(dataHash[id], add);
                                status[type].push(dataHash[id]);
                            }
                        }
                    }
                    for ( var key in status) {
                        self.trigger(key, [ status[key] ]);
                    }
                    self.options.active && self.complete();
                }
            });

    model(
            "Room",
            {},
            {
                _init : function() {
                    var self = this;
                    self.data = self.data || [];
                    self.dataHash = {};
                },
                get : function(id) {
                    return this.dataHash[id];
                },
                all : function(onlyTemporary) {
                    if (onlyTemporary)
                        return grep(this.data, function(a) {
                            return a.temporary
                        });
                    else
                        return this.data;
                },
                // Invite members to create a temporary room
                invite : function(id, nick, members, callback) {
                    var self = this;

                    var api = IM.WebAPI.getInstance();
                    var params = {
                        ticket : IM.getInstance().getConnection().ticket,
                        id : id,
                        nick : nick || "",
                        members : members.join(",")
                    };
                    api.invite(params, function(ret, err) {
                        if (ret) {
                            self.set([ data ]);
                            self.loadMember(id);
                            callback && callback(ret);
                        }
                    });

                },
                join : function(id, nick, callback) {
                    var self = this, d = self.dataHash[id];

                    var api = IM.WebAPI.getInstance();
                    var params = {
                        ticket : IM.getInstance().getConnection().ticket,
                        id : id,
                        nick : nick || ""
                    };
                    api.join(params, function(ret, err) {
                        if (ret) {
                            self.set([ data ]);
                            self.loadMember(id);
                            callback && callback(ret);
                        }
                    });
                },
                leave : function(id) {
                    var self = this, d = self.dataHash[id],
                    user = IM.getInstance().getCurrUser();
                    
                    if (d) {
                        var api = IM.WebAPI.getInstance();
                        var params = {
                            ticket : IM.getInstance().getConnection().ticket,
                            id : id,
                            nick : user.nick,
                            temporary : d.temporary
                        };
                        api.leave(params, function(ret, err) {
                            if (ret) {
                                delete self.dataHash[id];
                                self.trigger("leaved", [ id ]);
                            }
                        });
                    }
                },
                block : function(id) {
                    var self = this, d = self.dataHash[id];
                    if (d && !d.blocked) {
                        d.blocked = true;
                        var list = [];
                        each(self.dataHash, function(n, v) {
                            if (!v.temporary && v.blocked)
                                list.push(v.id);
                        });

                        var api = IM.WebAPI.getInstance();
                        var params = {
                            ticket : IM.getInstance().getConnection().ticket,
                            id : id
                        };
                        api.block(params, function(ret, err) {
                            if (ret) {
                                self.trigger("blocked", [ id, list ]);
                            }
                        });
                    }
                },
                unblock : function(id) {
                    var self = this, d = self.dataHash[id];
                    if (d && d.blocked) {
                        d.blocked = false;
                        var list = [];
                        each(self.dataHash, function(n, v) {
                            if (!v.temporary && v.blocked)
                                list.push(v.id);
                        });

                        var api = IM.WebAPI.getInstance();
                        var params = {
                            ticket : IM.getInstance().getConnection().ticket,
                            id : id
                        };
                        api.unblock(params, function(ret, err) {
                            if (ret) {
                                self.trigger("unblocked", [ id, list ]);
                            }
                        });
                    }
                },
                set : function(d) {
                    var self = this, data = self.data, dataHash = self.dataHash, status = {};
                    each(d, function(k, v) {
                        var id = v.id;
                        if (!id)
                            return;

                        v.members = v.members || [];
                        v.all_count = v.members.length;
                        v.count = 0;
                        each(v.members, function(k, m) {
                            if (m.presence == "online") {
                                v.count += 1;
                            }
                        });
                        if (!dataHash[id]) {
                            dataHash[id] = v;
                            data.push(v);
                        } else {
                            extend(dataHash[id], v);
                            // TODO: compare and trigger
                        }
                        self.trigger("updated", dataHash[id]);
                    });
                },
                loadMember : function(id) {
                    var self = this;

                    var api = IM.WebAPI.getInstance();
                    var params = {
                        ticket : IM.getInstance().getConnection().ticket,
                        id : id
                    };
                    api.members(params, function(ret, err) {
                        if (ret) {
                            self.updateMember(id, ret);
                        }
                    });
                },

                updateMember : function(room_id, data) {
                    var room = this.dataHash[room_id];
                    if (room) {
                        room.memberLoaded = true;
                        room.members = data;
                        this.set([ room ]);
                    }
                },

                onPresence : function(presence) {
                    var self = this, tp = presence.type;
                    if (presence.to && self.dataHash[presence.to]) {
                        var roomId = presence.to;
                        var oneRoom = this.dataHash[roomId];
                        if (oneRoom && oneRoom.memberLoaded) {
                            // alert("reloading " + roomId);
                            self.loadMember(roomId);
                        }
                        if (tp == "join") {
                            self.trigger("memberJoined", [ roomId, presence ]);
                        } else if (tp == "leave") {
                            self.trigger("memberLeaved", [ roomId, presence ]);
                        } else if (tp == "grponline") {
                            self.trigger("memberOnline", [ roomId, presence ]);
                        } else if (tp == "grpoffline") {
                            self.trigger("memberOffline", [ roomId, presence ]);
                        } else {
                            // do nothing
                        }
                    }
                },

                clear : function() {
                    var self = this;
                    self.data = [];
                    self.dataHash = {};
                }
            });

    /**
     * history // 消息历史记录 Support chat and grpchat
     */
    model(
            "History",
            {},
            {
                _init : function() {
                    var self = this;
                    self.data = self.data || {};
                    self.data.chat = self.data.chat || {};
                    self.data.grpchat = self.data.grpchat || {};
                },
                clean : function() {
                    var self = this;
                    self.data.chat = {};
                    self.data.grpchat = {};
                },
                get : function(type, id) {
                    return this.data[type][id];
                },
                set : function(addData) {
                    var self = this, data = self.data, cache = {
                        "chat" : {},
                        "grpchat" : {}
                    };
                    addData = makeArray(addData);
                    var l = addData.length, v, id,
                    userId = IM.getInstance().getCurrUser().id;
                    
                    if (!l)
                        return;
                    for (var i = 0; i < l; i++) {
                        // for(var i in addData){
                        v = addData[i];
                        type = v.type;
                        id = type == "chat" ? (v.to == userId ? v.from : v.to)
                                : v.to;
                        if (id && type) {
                            cache[type][id] = cache[type][id] || [];
                            cache[type][id].push(v);
                        }
                    }
                    for ( var type in cache) {
                        for ( var id in cache[type]) {
                            var v = cache[type][id];
                            if (data[type][id]) {
                                // data[type][id] = data[type][id].concat(v);
                                data[type][id] = [].concat(data[type][id])
                                        .concat(v);
                                // Fix memory released in ie9
                                self._triggerMsg(type, id, v);
                            } else {
                                self.load(type, id);
                            }
                        }
                    }
                },
                _triggerMsg : function(type, id, data) {
                    // this.trigger("message." + id, [data]);
                    this.trigger(type, [ id, data ]);
                },
                clear : function(type, id) {
                    var self = this;
                    self.data[type][id] = [];
                    self.trigger("clear", [ type, id ]);

                    var api = IM.WebAPI.getInstance();
                    var params = {
                        ticket : IM.getInstance().getConnection().ticket,
                        type : type,
                        id : id
                    };
                    api.clear(params, function(ret, err) {

                    });
                },
                download : function(type, id) {
                    var self = this, url = route("download"), f = document
                            .createElement('iframe'), d = new Date(), ar = [], data = {
                        id : id,
                        type : type,
                        time : (new Date()).getTime(),
                        date : d.getFullYear() + "-" + (d.getMonth() + 1) + "-"
                                + d.getDate()
                    };
                    for ( var key in data) {
                        ar[ar.length] = encodeURIComponent(key) + '='
                                + encodeURIComponent(data[key]);
                    }
                    url += (/\?/.test(url) ? "&" : "?") + ar.join("&");
                    f.setAttribute("src", url);
                    f.style.display = 'none';
                    document.body.appendChild(f);
                },
                init : function(type, id, data) {
                    var self = this;
                    if (isArray(data)) {
                        self.data[type][id] = data;
                        self._triggerMsg(type, id, data);
                    }
                },
                load : function(type, id) {
                    var self = this;
                    self.data[type][id] = [];

                    var api = IM.WebAPI.getInstance();
                    var params = {
                        ticket : IM.getInstance().getConnection().ticket,
                        type : type,
                        id : id
                    };
                    api.history(params, function(ret, err) {
                        if (ret) {
                            self.init(type, id, ret);
                        }
                    });
                }
            });

    /**
     * Web业务服务API (IM.WebAPI)
     */
    (function(IM, undefined) {

        IM.WebAPI = function(options) {
            this.options = extend({},
                    IM.WebAPI.DEFAULTS,
                    options || {});
        };

        var API = IM.WebAPI;
        API.DEFAULTS = {
            callback : null,
            apiPath : "/",
            method : "POST",
            cache : false,
            dataType : "json",
            context : null
        };

        API.ROUTE = {
            online : "online.do",
            offline : "offline.do",
            buddies : "buddies.do",
            remove_buddy : "remove_buddy.do",
            deactivate : "refresh.do",
            message : "message.do",
            presence : "presence.do",
            status : "status.do",
            setting : "setting.do",
            history : "history.do",
            clear : "clear_history.do",
            download : "download_history.do",
            // room actions
            invite : "invite.do",
            join : "join.do",
            leave : "leave.do",
            block : "block.do",
            unblock : "unblock.do",
            members : "members.do",
            // notifications
            notifications : "notifications.do",
            // upload files
            upload : "upload.do"
        };
        API.route = function(ob) {
            var options = ob;
            if (typeof ob == "string") {
                return API.route[ob];
            }
            extend(API.route, options);
        };
        API.route(API.ROUTE);

        /** 实例化API */
        API._instance = undefined;
        /**
         * 获取实例化的API
         */
        API.getInstance = function() {
            if (!API._instance) {
                throw new Error("NexTalkWebIM.WebAPI is not initialized.");
            }
            return API._instance;
        };

        // API初始化
        API.init = function(options) {
            if (!API._instance) {
                API._instance = new API(options);
            }
            return API.getInstance();
        };

        var methods = {
            // var callback = function(ret, err) {};
            _ajax : function(apiId, data, callback, ajaxInfo) {
                var _this = this, options = _this.options;
                var info = {
                    type : options.method,
                    url : options.apiPath + API.route(apiId),
                    data : data,
                    dataType : options.dataType,
                    cache : options.cache,
                    context : options.context,
                    success : function(ret) {
                        if (typeof callback == "function") {
                            callback(ret, undefined);
                        }
                        // API成功返回结果后回调
                        if (typeof options.callback == "function") {
                            options.callback();
                        }
                    },
                    error : function(err) {
                        callback(undefined, err);
                    }
                };
                extend(info, ajaxInfo || {});
                ajax(info);
            },

            online : function(params, callback) {
                this._ajax("online", params, callback);
            },
            
            offline : function(params, callback) {
                this._ajax("offline", params, callback);
            },
            
            message : function(params, callback) {
                this._ajax("message", params, callback);
            },
            
            presence : function(params, callback) {
                this._ajax("presence", params, callback);
            }
        };
        extend(API.prototype, methods);

    })(IM);

    window.NexTalkWebIM = IM;
})(window);
