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

})(nextalk.webim);
