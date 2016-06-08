/*!
 * nextalk.webim.status.js v1.0.0
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
        isUrl      = webim.isUrl,
        validate   = webim.validate,
        format     = webim.format,
        model      = webim.model,
        checkUpdate= webim.checkUpdate;

    // 状态(cookie临时存储[刷新页面有效])
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
                                : webim.cookie(key);
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
                    self.store ? self.store.setItem(key, data) : webim.cookie(key,
                            data, {
                                path : '/',
                                domain : domain
                            });
                }
            });

    // 消息历史记录 Support chat and grpchat
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
                    userId = webim.client.getCurrUser().id;
                    
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

                    var params = {
                        ticket : webim.client.getConnection().ticket,
                        type : type,
                        id : id
                    };
                    webim.webApi.clear(params, function(ret, err) {

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
                load : function(conv, callback) {
                    var self = this;
                    conv.ticket = webim.client.getConnection().ticket;
                    webim.webApi.history(conv, function(ret, err) {
                        var currUser = webim.client.getCurrUser();
                        var lastTime;
                        var messages = [];
                        if (ret) {
                            for (var i = 0; i < ret.length; i++) {
                                var msg = ret[i];
                                var agent = webim.client.getAgent(msg.from);
                                if (msg.from == currUser.id || agent) {
                                    msg.direction = webim.msgDirection.SEND;
                                    if (!msg.avatar) {
                                        if (agent) {
                                            msg.avatar = agent.avatar;
                                        } else {
                                            msg.avatar = currUser.avatar;
                                        }
                                    }
                                } else {
                                    msg.direction = webim.msgDirection.RECEIVE;
                                }
                                msg.timestamp = Number(msg.timestamp);
                                if (lastTime && (msg.timestamp - lastTime) < webim.MSG_INTERVAL) {
                                    msg.showTimestamp = false;
                                } else {
                                    msg.showTimestamp = true;
                                }
                                lastTime = msg.timestamp;
                                messages.push(msg);
                            }
                        }
                        callback(messages);
                    });
                }
            });
})(nextalk.webim);
