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
        nowMillis  = webim.nowMillis,
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
        conv_list : "index.php?action=conversations",
        //conv_new : "index.php?action=conv_new",
        agents_random : "index.php?action=agents_random",
        house : "index.php?action=house",
        house_fav : "index.php?action=get_user_favorite",
        disguise : "index.php?action=disguise",
        agent : "index.php?action=agent",
        presences : "index.php?action=presences",
        message_read : "index.php?action=message_read",
        conv_del : "index.php?action=conv_del"
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
            data : extend(data, {'_' : webim.nowMillis()}),
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

        conv_list : function(params, callback) {
            this._ajax("conv_list", params, callback);
        },

//        conv_new : function(params, callback) {
//            this._ajax("conv_new", params, callback);
//        },

        history : function(params, callback) {
            this._ajax("history", params, callback);
        },
        agents_random : function(params, callback) {
            this._ajax("agents_random", params, callback);
        },
        house : function(params, callback) {
            this._ajax("house", params, callback);
        },
        house_fav : function(callback) {
            this._ajax("house_fav", null, callback);
        },
        disguise : function(params, callback) {
            this._ajax("disguise", params, callback);
        },
        agent : function(uid, callback) {
            this._ajax("agent", {uid : uid}, callback);
        },
        presences : function(params, callback) {
            this._ajax("presences", params, callback);
        },
        message_read : function(type, currUid, objId) {
            this._ajax("message_read", {
                type : type,
                to : currUid,
                from : objId
            }, null);
        },
        conv_del : function(currUid, objId) {
            this._ajax("conv_del", {
                uid : currUid,
                oid : objId
            }, null);
        }
    };
    extend(WebAPI.prototype, methods);

    webim.WebAPI = WebAPI;

})(nextalk.webim);
