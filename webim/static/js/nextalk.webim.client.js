/*!
 * nextalk.webim.client.js v1.0.0
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
        Channel    = webim.Channel,
        ClassEvent = webim.ClassEvent,
        validate   = webim.validate,
        format     = webim.format,
        Status     = webim.Status;

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
                    var dodys = document.getElementsByTagName('body');
                    if (dodys && dodys.length > 0) {
                        dodys[0].appendChild(soundEl);
                    }
                }
            },
            play : function(type) {
                var url = isUrl(type) ? type : _urls[type];
                playSound && play(url);
            }
        }
    })();

    /** 版本号 */
    webim.VERSION = webim.version = webim.v = "1.0.0";

    /** 两次消息最长间隔 */
    webim.MSG_INTERVAL = 1000 * 20;
    /** 错误码 */
    webim.error = {
        // 未知原因失败
        UNKNOWN      : {code :-1, text : "Unknown."},
        // 请求超时
        TIMEOUT      : {code : 1, text : "Timed out."}
    };

    /** 连接状态 */
    webim.connStatus = {
        // 连接中
        CONNECTING          :  0,
        // 连接成功
        CONNECTED           :  1,
        // 断开连接
        DISCONNECTED        :  2,
        // 正在登入中
        LOGIN               :  3
    };
    /** 网络状态 */
    webim.network = {
        // 不可用
        UNAVAILABLE : 0,
        // 可用
        AVAILABLE   : 1
    };

    /** 消息方向 */
    webim.msgDirection = {
        SEND    : 'send',
        RECEIVE : 'receive'
    };

    webim.name = {
        NOTICE   : '系统通知',
        STRANGER : '陌生人'
    };

    /** 现场状态 */
    webim.show = {
        // 在线
        AVAILABLE   : "available",
        // 忙碌
        DND         : "dnd",
        // 离开
        AWAY        : "away",
        // 隐身
        INVISIBLE   : "invisible",
        // 聊天中
        CHAT        : "chat",
        // 离线
        UNAVAILABLE : "unavailable"
    };

    /** 聊天用户类型 */
    webim.userType = {
        // 伪装者
        //DISGUISER  : 'disguiser',
        // 幕后用户
        BACKSTAGE  : 'backstage',
        // 坐席用户
        AGENT   : 'agent',
        // 普通用户
        GENERAL : 'general'
    };

    // 资源文件根路径
    webim.resPath = '/src';
    // WebAPI接口根路径
    webim.appPath = '/';
    // WebAPI服务器API
    webim.webApi = null;
    webim.status = null;
    webim.history = null;
    webim.client = null;

    webim.init = function(options) {
        // 入参验证
        validate(options, {
            resPath     : {type : 'string', requisite : true},
            apiPath     : {type : 'string', requisite : true},
            channelType : {type : [Channel.type.XHR_POLLING,
                                   Channel.type.WEBSOCKET],
                           requisite : false},
            isJsonp     : {type : 'boolean', requisite : false},
            chatlinkIds : {type : 'string', requisite : false},
            playSound   : {type : 'boolean', requisite : false},
            receive     : {type : 'boolean', requisite : false}
        });

        var _this = this;
        _this.resPath = options.resPath;
        _this.apiPath = options.apiPath;
        delete options.resPath;
        delete options.apiPath;

        // 初始化Web业务服务API
        _this.webApi = _this.WebAPI.init({
            apiPath : _this.apiPath,
            dataType : ajax.settings.dataType
        });
        _this.status = new webim.Status();
        _this.history = new webim.History();
        _this.client = Client.init(options);
        sound.init({msg : _this.resPath + 'sound/msg.mp3'});
        _this.imgs = {
            HEAD       : _this.resPath + 'imgs/head_def.png',
            GROUP      : _this.resPath + 'imgs/group.gif',
            NOTICE     : _this.resPath + 'imgs/message_notice.png',
            LOGO_INDEX : _this.resPath + 'imgs/logo.png',
            LOGO_MIN   : _this.resPath + 'imgs/webim.72x72.png',
            HEAD_DIS   : _this.resPath + 'imgs/head_dis.png'
        };
    };

    var Client = function(options) {
        var _this = this;
        _this.options = extend({},
                Client.DEFAULTS,
                options || {});
        // 用户登入成功次数
        _this.loginTimes = 0;
        // 客户端连接成功次数
        _this.connectedTimes = 0;
        _this.network = webim.network.AVAILABLE;

        // 初始化
        _this._init();
    };
    ClassEvent.on(Client);
    /** 默认配置信息 */
    Client.DEFAULTS = {
        // 通信令牌 暂时不用
        // ticket : 'ticket',
        // APP_KEY 暂时不用
        // appKey : 'app_key',
        
        // 管道类型，默认为Websocket
        // Websocket->(XHR)Polling降级方式
        channelType : Channel.type.WEBSOCKET,
        // 是否支持跨域访问
        isJsonp : false,
        // 聊天热线，多个ID逗号","分割
        chatlinkIds : null,
        // 消息提示音
        playSound : true,
        receive : true
    };
    /** 登入动画延时 */
    Client.LOGIN_DELAY = 0;
    /** 实例化一个Client */
    Client._instance = null;
    /**
     * 获取实例化的Client
     */
    Client.getInstance = function() {
        if (!Client._instance) {
            throw new Error("Client is not initialized.");
        }
        return Client._instance;
    };
    /**
     * 初始化Client
     */
    Client.init = function(options) {
        if (!Client._instance) {
            Client._instance = new Client(options);
        }
        return Client.getInstance();
    };
    /**
     * 初始化Client
     */
    Client.prototype._init = function() {
        var _this = this, options = _this.options;

        ajax.setup({
            dataType : options.isJsonp ? "jsonp" : "json"
        });

        _this._initListeners();
        _this._initTimerTask();
        return _this;
    };
    /** 绑定客户端存在的各种事件监听 */
    Client.prototype._initListeners = function() {
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
             onNetworkChange : function(ev, data) {}
        };
        // 消息接收监听器
        _this.receiveMsgListener = {
            onMessages : function(ev, data) {},
            onStatus : function(ev, data) {},
            onPresences : function(ev, data) {}
        };

        // 正在登入中
        _this.bind("login", function(ev, data) {
            console.log("login: " + JSON.stringify(data));
            if (_this.connStatus != webim.connStatus.LOGIN) {
                _this.connStatus = webim.connStatus.LOGIN;
                _this.loginStatusListener.onLogin(ev, data);
            }
        });
        _this.bind("login.win", function(ev, data) {
            console.log("login.win: " + JSON.stringify(data));
            _this.loginTimes++;
            _this.loginStatusListener.onLoginWin(ev, data);
            // 登入成功，开始连接
            _this._connectServer();
        });
        _this.bind("login.fail", function(ev, data) {
            console.log("login.fail: " + JSON.stringify(data));
            _this.connStatus = webim.connStatus.DISCONNECTED;
            _this.loginStatusListener.onLoginFail(ev, data);
        });

        // 正在连接
        _this.bind("connecting", function(ev, data) {
            console.log("connecting: " + JSON.stringify(data));
            if (_this.connStatus != webim.connStatus.CONNECTING) {
                _this.connStatus = webim.connStatus.CONNECTING;
                _this.connStatusListener.onConnecting(ev, data);
            }
        });
        // 连接成功
        _this.bind("connected", function(ev, data) {
            console.log("connected: " + JSON.stringify(data));
            _this.connectedTimes++;
            if (_this.connStatus != webim.connStatus.CONNECTED) {
                _this.connStatus = webim.connStatus.CONNECTED;
                if (webim.status.get("s") == webim.show.UNAVAILABLE) {
                    webim.status.set("s", webim.show.AVAILALE);
                }
                _this._show(webim.status.get("s"));
                webim.convMessage.list(function(convs, presences) {
                    _this.connStatusListener.onConnected(ev, convs);
                    if (_this.messages) {
                        _this.trigger("messages", [ _this.messages ]);
                    }
                    if (_this.presences) {
                        var ps = [];
                        for (var k in _this.presences) {
                            ps.push({from : k, show : _this.presences[k]});
                        }
                        _this.trigger("presences", [ ps ]);
                    }
                    if (presences) {
                        var ps = [];
                        for (var k in presences) {
                            ps.push({from : k, show : presences[k]});
                        }
                        _this.trigger("presences", [ ps ]);
                    }
                });
            }
        });
        // 断开连接
        _this.bind("disconnected", function(ev, data) {
            console.log("disconnected: " + JSON.stringify(data));
            if (_this.connStatus != webim.connStatus.DISCONNECTED) {
                _this.connStatus = webim.connStatus.DISCONNECTED;
                _this._show(webim.show.UNAVAILABLE);
                _this.connStatusListener.onDisconnected(ev, data);
                webim.convMessage.clear();
            }
        });
        // 网络状态改变
        _this.bind("network.change", function(ev, data) {
            console.log("network.change: " + JSON.stringify(data));
            _this.network = data;
            _this.connStatusListener.onNetworkChange(ev, data);
        });

        // 接收消息
        _this.bind("messages", function(ev, data) {
            console.log("messages: " + JSON.stringify(data));
            if(!_this.options.receive) {
                return;
            }
            var cu = _this.getCurrUser();
            for (var i = 0; i < data.length; i++) {
                var msg = data[i];
                var direction = webim.msgDirection.RECEIVE;
                msg.direction = direction;
                msg.timestamp = Number(msg.timestamp);
                msg.read = false;
                // 如果是自己发送出去的
                var agent = _this.getAgent(msg.from);
                if (msg.from == cu.id || agent) {
                    direction = webim.msgDirection.SEND;
                    msg.direction = direction;
                    //msg.read = true;
                }
                _this._saveMsg(msg);
            }
            _this.receiveMsgListener.onMessages(ev, data);
        });
        // 输入状态
        _this.bind("status", function(ev, data) {
            console.log("status: " + JSON.stringify(data));
            _this.receiveMsgListener.onStatus(ev, data);
        });
        // 现场变更
        _this.bind("presences", function(ev, data) {
            console.log("presences: " + JSON.stringify(data));
            webim.convMessage.onPresences(data);
            _this.receiveMsgListener.onPresences(ev, data);
        });
    };

    // 数据存储
    extend(Client.prototype, {

        /** 连接状态 */
        connStatus : webim.connStatus.DISCONNECTED,
        /** 登入服务时间戳 */
        serverTime : null,
        /** 连接信息 */
        connection : null,
        /** 当前登入用户 */
        currUser : null,
        /** 联系人列表 */
        buddies : [],
        /** 房间列表 */
        rooms : [],
        /** 现场状态 */
        presences : {},
        /** 被监管的用户 */
        agents : [],

        getAgent : function(uid) {
            for (var i = 0; i < this.agents.length; i++) {
                var agent = this.agents[i];
                if (agent.id == uid) {
                    return agent;
                }
            }
            return null;
        },

        _serverTime : function(time) {
            this.serverTime = Number(time);
        },

        _connection : function(connInfo) {
            this.connection = this.connection || {};
            extend(this.connection, connInfo);
        },

        _currUser : function(user) {
            this.currUser = this.currUser || {};
            extend(this.currUser, user);
        },
        
        _show : function(show) {
            var user = this.getCurrUser();
            extend(user, {show : show});
        },

        _buddies : function(buddies) {
            this.buddies = this.buddies || [];
            extend(this.buddies, buddies);
        },

        _rooms : function(rooms) {
            this.rooms = this.rooms || [];
            extend(this.rooms, rooms);
        },

        getServerTime : function() {
            return this.serverTime;
        },

        getConnection : function() {
            this.connection = this.connection || {};
            return this.connection;
        },

        getCurrUser : function() {
            this.currUser = this.currUser || {};
            return this.currUser;
        },

        getShow : function() {
            var currUser = this.getCurrUser();
            if (!currUser.show) {
                currUser.show = webim.show.UNAVAILABLE;
            }
            return currUser.show;
        },

        getBuddies : function() {
            return this.buddies;
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
            return this.rooms;
        }
    });

    /**
     * 定义或开启部分定时任务
     */
    Client.prototype._initTimerTask = function() {
        var _this = this;
        // 设置网络是否可用实时检测
        // ???
        //_this.trigger("network.change", [ data ]);
        
    };

    /**
     * 设置登入状态监听器
     */
    Client.prototype.setLoginStatusListener = function(listener) {
        extend(this.loginStatusListener, listener || {});
    };

    /**
     * 设置连接状态监听器
     */
    Client.prototype.setConnStatusListener = function(listener) {
        extend(this.connStatusListener, listener || {});
    };

    /**
     * 设置消息接收监听器
     */
    Client.prototype.setReceiveMsgListener = function(listener) {
        extend(this.receiveMsgListener, listener || {});
    };

    /**
     * 连接服务器
     */
    Client.prototype.connectServer = function() {
        var _this = this, options = _this.options;
        // 如果正在登入中
        if (_this.connStatus == webim.connStatus.LOGIN) {
            return;
        }
        // 如果服务器已经连上
        if (_this.connStatus == webim.connStatus.CONNECTED ||
                _this.connStatus == webim.connStatus.CONNECTING) {
            return;
        }

        var params = {};
        if (options.chatlinkIds) {
            params.chatlink_ids = options.chatlinkIds;
        }
        // 连接前请先登入成功
        _this.login(params);
    }

    Client.prototype._connectServer = function() {
        var _this = this, options = _this.options;
        var conn = _this.getConnection();

        // 如果服务器已经连上
        if (_this.connStatus == webim.connStatus.CONNECTED ||
                _this.connStatus == webim.connStatus.CONNECTING) {
            return;
        }
        _this.trigger("connecting", [ _this._dataAccess ]);
        // 创建通信管道
        var ops = extend({type: options.channelType}, conn);
        _this.channel = new Channel(ops);

        // 给管道注册事件监听器
        _this.channel.onConnected = function(ev, data) {
            _this.trigger("connected", [ data ]);
            _this._onlineAgent();
        };
        _this.channel.onDisconnected = function(ev, data) {
            _this.trigger("disconnected", [ data ]);
        };
        _this.channel.onError = function(ev, data) {
            console.log("on.error: " + JSON.stringify(data));
            //_this._disconnectServer();
            //_this.trigger("disconnected", [ data ]);
        };
        _this.channel.onMessage = function(ev, data) {
            _this.handle(data);
        };

        // 发起管道连接
        _this.channel.connect();
    };

    Client.prototype._onlineAgent = function() {
        var _this = this, options = _this.options;
        var currUser = _this.getCurrUser();

        if (currUser.type != webim.userType.BACKSTAGE
                || !_this.agents) {
            return;
        }
        for (var i = 0; i < _this.agents.length; i++) {
            var agt = _this.agents[i];
            var conn = agt.connection;
            if (!conn) {
                continue;
            }
            // 创建通信管道
            var ops = extend({type: options.channelType}, conn);
            _this['channel_' + agt.id] = new Channel(ops);
            // 给管道注册事件监听器
            _this['channel_' + agt.id].onConnected = function(ev, data) {
            };
            _this['channel_' + agt.id].onDisconnected = function(ev, data) {
            };
            _this['channel_' + agt.id].onError = function(ev, data) {
            };
            _this['channel_' + agt.id].onMessage = function(ev, data) {
            };
            // 发起管道连接
            _this['channel_' + agt.id].connect();
        }
    };
    Client.prototype._offlineAgent = function() {
        var _this = this, options = _this.options;
        var currUser = _this.getCurrUser();

        if (!_this.agents) {
            return;
        }
        for (var i = 0; i < _this.agents.length; i++) {
            var agt = _this.agents[i];
            if (_this['channel_' + agt.id]) {
                _this['channel_' + agt.id].disconnect();
            }
        }
    };

    Client.prototype._disconnectServer = function() {
        var _this = this;
        _this.channel.disconnect();
        _this._offlineAgent();
    };

    Client.prototype.handle = function(data) {
        var _this = this;
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
            msgs.length && _this.trigger("messages", [ msgs ]);
            events.length && _this.trigger("event", [ events ]);
        }
        data.presences && data.presences.length
                && _this.trigger("presences", [ data.presences ]);
        data.statuses && data.statuses.length
                && _this.trigger("status", [ data.statuses ]);
    };

    Client.prototype.online = function(show, callback) {
        var _this = this;
        if (show == webim.show.UNAVAILABLE) {
            return new Error("webim.show.UNAVAILABLE is error.");
        }
        if (show == _this.getShow()) {
            callback();
            return;
        }

        // 检查一下管道连接
        if (_this.connStatus == webim.connStatus.CONNECTING) {
            callback();
            return;
        }
        if (_this.connStatus != webim.connStatus.CONNECTED) {
            webim.status.set("s", show);
            _this.connectServer();
        } else {
            _this._sendPresence({show : show}, callback);
        }
    },

    Client.prototype.offline = function(callback) {
        var _this = this, connection = _this.getConnection();
        if (_this.connStatus == webim.connStatus.DISCONNECTED) {
            callback();
            return;
        }

        var params = {
            ticket : connection.ticket
        };
        webim.webApi.offline(params, function(ret, err) {
            if (ret == "ok") { }
        });
        // 断开连接
        _this._disconnectServer();
        callback();
    };

    extend(Client.prototype, {
        login : function(params) {
            var _this = this, status = webim.status;

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
            if (status.get("s") == webim.show.UNAVAILABLE) {
                status.set("s", webim.show.AVAILABLE);
            } 
            params = extend({
                buddy_ids : buddy_ids.join(","),
                room_ids : room_ids.join(","),
                show : status.get("s") || webim.show.AVAILABLE
            }, params);
            // set auto open true
            status.set("o", false);
            status.set("s", params.show);

            // 触发正在登入事件
            _this.trigger("login", [ params ]);
            webim.webApi.online(params, function(ret, err) {
                window.setTimeout(function() {
                    if (ret) {
                        if (ret.success) {
                            _this._serverTime(ret.server_time);
                            _this._connection(ret.connection);
                            if (!ret.user.avatar) {
                                ret.user.avatar = webim.imgs.HEAD_DIS;
                            }
                            if (!_this.currUser || _this.currUser.id != ret.user.id) {
                                _this.isNewUser = true;
                            } else {
                                _this.isNewUser = false;
                            }
                            _this._currUser(ret.user);
                            _this._buddies(ret.buddies);
                            _this._rooms(ret.rooms);
                            _this.presences = ret.presences;
                            _this.messages = ret.new_messages;
                            // 如果是幕后用户，就查询出他所有被被监管对象
                            _this.agents = ret.user.agents;
                            if (!_this.agents || !_this.agents.length) {
                                _this.agents = [];
                            } else {
                                var auids = '';
                                for (var i = 0; i < _this.agents.length; i++) {
                                    if (i == 0) {
                                        auids = _this.agents[i].id;
                                    } else {
                                        auids += ',' + _this.agents[i].id;
                                    }
                                }
                                webim.webApi.disguise({
                                    auids : auids,
                                    ticket : _this.getConnection().ticket
                                });
                            }
                            // 触发登入成功事件
                            _this.trigger("login.win", [ ret ]);
                        } else {
                            // 触发登入失败事件
                            _this.trigger("login.fail", [ ret.error_msg ]);
                        }
                    } else {
                        // 触发登入失败事件
                        _this.trigger("login.fail", [ err ]);
                    }
                }, Client.LOGIN_DELAY);
            });
        },

        _sendPresence : function(msg, callback) {
            var _this = this;
            msg.ticket = _this.getConnection().ticket;

            var params = extend({}, msg);
            webim.webApi.presence(params, function(ret, err) {
                if (ret == "ok") {
                    // save show status
                    //_this._currUser({show : msg.show});
                    _this.getCurrUser().show = msg.show;
                    webim.status.set("s", msg.show);
                    callback();
                } else {
                    callback();
                }
            });
        },

        sendMessage : function(msg, callback) {
            var _this = this;
            msg.direction = webim.msgDirection.SEND;
            _this._saveMsg(msg);

            var params = extend({
                ticket : _this.getConnection().ticket
            }, msg);
            webim.webApi.message(params, callback);
        },

        sendStatus : function(msg, callback) {
            var _this = this;
            msg.ticket = _this.getConnection().ticket;

            var params = extend({}, msg);
            webim.webApi.status(params, callback);
        }
    });

    Client.prototype._saveMsg = function(msg) {
        var _this = this;
        if (msg.direction == webim.msgDirection.RECEIVE) {
            if (_this.options.playSound) {
                sound.play('msg');
            }
        }
        var convData = webim.Conversation.parser(msg);
        var key = {currUid : convData.currUid,
                   objId   : convData.objId};
        // 获取会话消息
        var conversation = webim.convMessage.get(
                    convData.type, key);
        if (!conversation) {
            conversation = new webim.Conversation(msg);
            webim.convMessage.set(
                    convData.type, key, conversation);
        }
        conversation.add(msg);
    };

    // webim.Client = Client;

    webim.load = true;
})(nextalk.webim);
