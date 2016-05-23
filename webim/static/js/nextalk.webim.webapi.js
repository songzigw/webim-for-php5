/*!
 * nextalk.webim.webapi.js v1.0.0
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

(function(webim) {

    "use strict";

    var console    = webim.console,
        idsArray   = webim.idsArray,
        timestamp  = webim.timestamp,
        isFunction = webim.isFunction,
        isArray    = webim.isArray,
        isObject   = webim.isObject,
        trim       = webim.trim,
        makeArray  = webim.makeArray,
        extend     = webim.extend,
        each       = webim.each,
        inArray    = webim.inArray,
        grep       = webim.grep,
        map        = webim.map,
        JSON       = webim.JSON,
        ajax       = webim.ajax,
        isMobile   = webim.isMobile,
        Date       = webim.Date,
        isUrl      = webim.isUrl;

    var WebAPI = function(options) {
        this.options = extend({},
                WebAPI.DEFAULTS,
                options || {});
    };

    WebAPI.DEFAULTS = {
        callback : null,
        apiPath : "/",
        method : "POST",
        cache : false,
        dataType : "json",
        context : null
    };

    WebAPI.ROUTE = {
        online : "index.php?action=online",
        offline : "index.php?action=offline",
        deactivate : "index.php?action=refresh",
        message : "index.php?action=message",
        presence : "index.php?action=presence",
        status : "index.php?action=status",
        setting : "index.php?action=setting",
        history : "index.php?action=history",
        clear : "index.php?action=clear_history",
        download : "index.php?action=download_history",
        buddies : "index.php?action=buddies",
        // room actions
        invite : "index.php?action=invite",
        join : "index.php?action=join",
        leave : "index.php?action=leave",
        block : "index.php?action=block",
        unblock : "index.php?action=unblock",
        members : "index.php?action=members",
        // notifications
        notifications : "index.php?action=notifications",
        // asks
        asks : "index.php?action=asks",
        accept : "index.php?action=accept_ask",
        reject : "index.php?action=reject_ask",
        // upload files
        upload : "static/images/upload.php",
        conversations : "index.php?action=conversations",
        conv_new : "index.php?action=conv_new"
    };
    WebAPI.route = function(ob) {
        var options = ob;
        if (typeof ob == "string") {
            return WebAPI.route[ob];
        }
        extend(WebAPI.route, options);
    };
    WebAPI.route(WebAPI.ROUTE);

    /** 实例化WebAPI */
    WebAPI._instance = null;
    /**
     * 获取实例化的WebAPI
     */
    WebAPI.getInstance = function() {
        if (!WebAPI._instance) {
            throw new Error("WebAPI is not initialized.");
        }
        return WebAPI._instance;
    };

    // WebAPI初始化
    WebAPI.init = function(options) {
        if (!WebAPI._instance) {
            WebAPI._instance = new WebAPI(options);
        }
        return WebAPI.getInstance();
    };

    // var callback = function(ret, err) {};
    WebAPI.prototype._ajax = function(apiId, data, callback, ajaxInfo) {
        var _this = this, options = _this.options;
        var info = {
            type : options.method,
            url : options.apiPath + WebAPI.route(apiId),
            data : data,
            dataType : options.dataType,
            cache : options.cache,
            context : options.context,
            success : function(ret) {
                if (typeof callback == "function") {
                    callback(ret, undefined);
                }
                // WebAPI成功返回结果后回调
                if (typeof options.callback == "function") {
                    options.callback();
                }
            },
            error : function(err) {
                if (typeof callback == "function") {
                    callback(undefined, err);
                }
            }
        };
        extend(info, ajaxInfo || {});
        ajax(info);
    };

    var methods = {
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
        },

        conversations : function(params, callback) {
            this._ajax("conversations", params, callback);
        },

        conv_new : function(params, callback) {
            this._ajax("conv_new", params, callback);
        },

        history : function(params, callback) {
            this._ajax("history", params, callback);
        }
    };
    extend(WebAPI.prototype, methods);

    webim.WebAPI = WebAPI;

})(nextalk.webim);