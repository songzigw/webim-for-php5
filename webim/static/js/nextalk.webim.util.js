/*!
 * nextalk.webim.util.js v1.0.0
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

if (!window.nextalk) {
    window.nextalk = {};
}
if (!nextalk.webim) {
    nextalk.webim = {};
}

(function(webim) {

    // "use strict";

    var Date = window.Date;
    Date.prototype.format = function(format) {
        var o = {
            // month
            "M+" : this.getMonth() + 1,
            // day
            "d+" : this.getDate(),
            // hour
            "h+" : this.getHours(),
            // minute
            "m+" : this.getMinutes(),
            // second
            "s+" : this.getSeconds(),
            // quarter
            "q+" : Math.floor((this.getMonth() + 3) / 3),
            // millisecond
            "S" : this.getMilliseconds()
        }

        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "")
                    .substr(4 - RegExp.$1.length));
        }

        for ( var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                        : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };

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

    var nowMillis = function() {
        return (new Date).getTime();
    };

    var trim = function(text) {
        return (text || "").replace(/^\s+|\s+$/g, "");
    };

    var _toStr = Object.prototype.toString;
    function isFunction(obj) {
        return obj && _toStr.call(obj) === "[object Function]";
    }

    function isArray(obj) {
        return obj && _toStr.call(obj) === "[object Array]";
    }

    function isObject(obj) {
        return obj && _toStr.call(obj) === "[object Object]";
    }

    var checkUpdate = function(old, add) {
        var added = false;
        if (typeof add === 'object') {
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
    };

    var makeArray = function(array) {
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
    };

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

    var ClassEvent = function(type) {
        this.type = type;
        this.timeStamp = (new Date()).getTime();
    };

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
                // alert(str);
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

    /**
     * Validate an object's parameter names to ensure they match a list of
     * expected variables name for this option type. Used to ensure option
     * object passed into the API don't contain erroneous parameters.
     * 
     * @param {Object}
     *                obj - User options object
     * @param {Object}
     *                keys - valid keys and types that may exist in obj.
     * @throws {Error}
     *                 Invalid option parameter found.
     * @private
     */
    var validate = function(obj, keys) {
        for ( var key in obj) {
            if (!obj[key]) {
                continue;
            }
            if (obj.hasOwnProperty(key)) {
                if (keys.hasOwnProperty(key)) {
                    var dataType = keys[key].type;
                    if (!_isSameType(obj[key], dataType)) {
                        throw new Error(
                                format({text : "Invalid type {0} for {1}."},
                                       [typeof obj[key], key]));
                    }
                }
//                else {
//                    var errStr = "Unknown property, " + key
//                            + ". Valid properties are:";
//                    for ( var key in keys)
//                        if (keys.hasOwnProperty(key))
//                            errStr = errStr + " " + key;
//                    throw new Error(errStr);
//                }
            }
        }
        for (var key in keys) {
            if (keys[key].requisite) {
                if (!obj.hasOwnProperty(key) || !obj[key]) {
                    throw new Error(
                            format({text : "Parameter empty for {0}."},
                                   [key]));
                }
            }
        }
    };
    
    var _isSameType = function(data, dataType) {
        if (typeof dataType === 'string') {
            if (dataType === 'array'
                    && isArray(data)) {
                return true;
            }
            if (typeof data === dataType) {
                return true;
            }
        }

        if (isArray(dataType)) {
            for (var i = 0; i < dataType.length; i++) {
                if (data == dataType[i]) {
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * Format an error message text.
     * 
     * @private
     * @param {error}
     *                ERROR.KEY value above.
     * @param {substitutions}
     *                [array] substituted into the text.
     * @return the text with the substitutions made.
     */
    var format = function(error, substitutions) {
        var text = error.text;
        if (substitutions) {
            var field, start;
            for (var i = 0; i < substitutions.length; i++) {
                field = "{" + i + "}";
                start = text.indexOf(field);
                if (start > 0) {
                    var part1 = text.substring(0, start);
                    var part2 = text.substring(start + field.length);
                    text = part1 + substitutions[i] + part2;
                }
            }
        }
        return text;
    };
    
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
        webim[name] = M;
    }
    
    extend(webim, {
        console    : console,
        idsArray   : idsArray,
        nowMillis  : nowMillis,
        isFunction : isFunction,
        isArray    : isArray,
        isObject   : isObject,
        trim       : trim,
        makeArray  : makeArray,
        extend     : extend,
        each       : each,
        inArray    : inArray,
        grep       : grep,
        map        : map,
        JSON       : JSON,
        ajax       : ajax,
        isMobile   : isMobile,
        Date       : Date,
        isUrl      : isUrl,
        validate   : validate,
        format     : format,
        ClassEvent : ClassEvent,
        model      : model,
        checkUpdate: checkUpdate,
        cookie     : cookie
    });

})(nextalk.webim);
