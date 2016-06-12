/*!
 * nextalk.webim.channel.js v1.0.0
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
        ClassEvent = webim.ClassEvent;

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
            _this._onClose();
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
                _this.timertask = window.setInterval(function() {
                    ws.send('heartbeat');
                }, 3 * 60000);
            };
            ws.onclose = function(ev) {
                window.clearInterval(_this.timertask);
                _this.trigger('disconnected', [ ev.data ]);
            };
            ws.onmessage = function(ev) {
                var data = ev.data;
                try {
                    data = data ? (window.JSON && window.JSON.parse ? window.JSON
                            .parse(data)
                            : (new Function("return " + data))())
                            : data;
                } catch (e) {
                }
                _this.trigger('message', [ data ]);
            };
            ws.onerror = function(ev) {
                window.clearInterval(_this.timertask);
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

    extend(webim, {
        Channel    : Channel,
        ClassEvent : ClassEvent
    });

})(nextalk.webim);
