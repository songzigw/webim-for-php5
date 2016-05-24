/*!
 * nextalk.webim.conversation.js v1.0.0
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
        format     = webim.format;

    /**
     * 当前主体与另外一个对象的会话信息
     * @param {Object} 会话信息
     */
    var Conversation = function(msg) {
        var _this = this;
        _this.notCount = 0;
        // 当前主体ID
        _this.currUid = null;
        _this.currNick = null;
        _this.currAvatar = null;
        // 会话对象ID（对方）
        _this.objId = null;
        _this.objName = null;
        _this.objAvatar = null;
        _this.type = msg.type;
        // 最近一次会话时间
        _this.timestamp = webim.currTimeMillis;
        // 最近一次会话消息
        _this.message = msg;
        // 会话历史记录
        _this.record = [];

        extend(_this, Conversation.parser(msg));
    }
    // 私聊
    Conversation.CHAT   = 'chat';
    // 群组聊天
    Conversation.ROOM   = 'room';
    // 通知
    Conversation.NOTICE = 'notice';
    Conversation.parser = function(msg) {
        // 入参验证
        validate(msg, {
            type      : {type : [Conversation.CHAT,
                                 Conversation.ROOM,
                                 Conversation.notice],
                         requisite : true},
            from      : {type : 'string', requisite : true},
            nick      : {type : 'string', requisite : false},
            avatar    : {type : 'string', requisite : false},
            to        : {type : 'string', requisite : true},
            to_name   : {type : 'string', requisite : false},
            to_avatar : {type : 'string', requisite : false},
            body      : {type : 'string', requisite : true},
            timestamp : {type : 'number', requisite : true},
            direction : {type : [webim.msgDirection.SEND,
                                 webim.msgDirection.RECEIVE],
                         requisite : true},
            read      : {type : 'boolean', requisite : false}
        });

        var conv = {
            type      : msg.type,
            timestamp : msg.timestamp,
            direction : msg.direction,
            body      : msg.body
        }, currUser = webim.client.getCurrUser();
        if (currUser.type == webim.userType.GENERAL) {
            conv.currUid = currUser.id;
            conv.currNick = currUser.nick;
            conv.currAvatar = currUser.avatar;

            if (msg.direction == webim.msgDirection.SEND) {
                if (msg.from != conv.currUid) {
                    throw new Error('Send message from error.');
                }
            }

            switch (msg.type) {
                case webim.Conversation.NOTICE:
                    // 通知消息方向都应该是收取
                    conv.objId = webim.Conversation.NOTICE;
                    conv.objName = webim.name.NOTICE;
                    conv.objAvatar = webim.imgs.NOTICE;
                    msg.nick = conv.objName;
                    msg.avatar = conv.objAvatar;
                    msg.to_name = conv.currNick;
                    msg.to_avatar = conv.currAvatar;
                    break;
                case webim.Conversation.ROOM:
                    if (!msg.avatar) {
                        msg.avatar = webim.imgs.HEAD;
                    }
                    conv.objId = msg.to;
                    if (msg.to_name) {
                        conv.objName = msg.to_name;
                    } else {
                        conv.objName = msg.to + 'room';
                        msg.to_name = conv.objName;
                    }
                    if (msg.to_avatar) {
                        conv.objAvatar = msg.to_avatar;
                    } else {
                        conv.objAvatar = webim.imgs.GROUP;
                        msg.to_avatar = conv.objAvatar;
                    }
                    break;
                case webim.Conversation.CHAT:
                    if (msg.direction == webim.msgDirection.SEND) {
                        if (!msg.nick) {
                            msg.nick = conv.currNick;
                        }
                        if (!msg.avatar) {
                            msg.avatar = conv.currAvatar;
                        }
                        conv.objId = msg.to;
                        if (msg.to_name) {
                            conv.objName = msg.to_name;
                        }
                        if (msg.to_avatar) {
                            conv.objAvatar = msg.to_avatar;
                        }
                    } else if (msg.direction == webim.msgDirection.RECEIVE) {
                        if (!msg.to_name) {
                            msg.to_name = conv.currNick;
                        }
                        if (!msg.to_avatar) {
                            msg.to_avatar = conv.currAvatar;
                        }
                        conv.objId = msg.from;
                        conv.objName = msg.nick;
                        if (msg.avatar) {
                            conv.objAvatar = msg.avatar;
                        } else {
                            conv.objAvatar = webim.imgs.HEAD;
                            msg.avatar = conv.objAvatar;
                        }
                    }
                    break;
            }
        } else if (currUser.type == webim.userType.SUPERVISOR) {
            if (msg.type != webim.Conversation.CHAT) {
                throw new Error('Supervisor message type error.');
            }
            if (msg.direction == webim.msgDirection.SEND) {
                if (msg.from == currUser.id) {
                    throw new Error('Message from error.');
                }
                conv.currUid = msg.from;
                conv.currNick = msg.nick;
                conv.currAvatar = msg.avatar;
                conv.objId = msg.to;
                conv.objName = msg.to_name;
                conv.objAvatar = msg.to_avatar;
            } else if (msg.direction == webim.msgDirection.RECEIVE) {
                
                conv.objId = msg.from;
                conv.objName = msg.nick;
                conv.objAvatar = msg.avatar;
            }
        }
        return conv;
    };
    /**
     * 保存会话记录
     */
    Conversation.prototype.add = function(msg) {
        var _this = this;
        extend(_this, Conversation.parser(msg));
        if (msg.direction == webim.msgDirection.RECEIVE) {
            if (typeof msg.read === 'boolean' && !msg.read) {
                _this.notCount++;
                webim.convMessage.unreadTotal++;
            }
        }
        _this.message = msg;
        _this.record[_this.record.length] = msg;

        webim.webApi.conv_new({
            type : _this.type,
            uid : _this.currUid,
            oid : _this.objId,
            name : _this.objName,
            avatar : _this.objAvatar,
            body : msg.body,
            direction : msg.direction
        });
    };
    /**
     * 获取所有的往来会话，将未读标识去掉，未读数清零
     */
    Conversation.prototype.readAll = function() {
        var _this = this;
        for (var i = 0, len = _this.record.length; i < len; i++) {
            var msg = _this.record[i];
            if (typeof msg.read === 'boolean' && !msg.read) {
                msg.read = true;
                webim.convMessage.unreadTotal--;
            }
        }
        _this.notCount = 0;
        return _this.record;
    };

    /** 会话消息存储 */
    webim.convMessage = {
        // 私聊消息
        chat : {},
        // 聊天室消息
        room : {},
        // 系统通知
        notice : {},
        // 未读消息总数
        unreadTotal : 0,

        get : function(type, key) {
            // 入参验证
            validate(key, {
                currUid : {type : 'string', requisite : true},
                objId   : {type : 'string', requisite : true}
            });
            var _this = this;
            key = _this._key(key.currUid, key.objId);
            return _this[type][key];
        },

        set : function(type, key, value) {
            // 入参验证
            validate(key, {
                currUid : {type : 'string', requisite : true},
                objId   : {type : 'string', requisite : true}
            });
            var _this = this;
            key = _this._key(key.currUid, key.objId);
            _this[type][key] = value;
        },
        
        _key : function(currUid, objId) {
            return [currUid, objId].join('_');
        },
        
        read : function(msg) {
            var _this = this;
            if (typeof msg.read == 'boolean' && !msg.read) {
                msg.read = true;
                var cData = Conversation.parser(msg);
                var conv = _this.get(cData.type, {
                        currUid : cData.currUid,
                        objId : cData.objId})._setRead();
                if (conv.notCount > 0) {
                    conv.notCount--;
                    webim.convMessage.unreadTotal--;
                }
            }
        },
        
        list : function(callback) {
            var client = webim.client,
                webApi = webim.webApi;

            var params = {
                ticket : client.getConnection().ticket
            };
            webApi.conv_list(params, function(ret, err) {
                var convs = [];
                if (ret) {
                    for (var i = 0; i < ret.length; i++) {
                        var c = ret[i];
                        var msg = {
                            type      : c.type,
                            from      : c.uid,
                            //nick    : c.???,
                            //avatar  : c.???,
                            to        : c.oid,
                            to_name   : c.name,
                            to_avatar : c.avatar,
                            body      : c.body,
                            timestamp : new Date(c.updated).getTime(),
                            // 方便编程假设所有会话消息方向为发送
                            // 可能与实际不符，但这种假设，无影响
                            direction : webim.msDirection.SEND
                        };
                        convs.push(Conversation.parser(msg));
                    }
                }
                callback(convs);
            });
        }
    };
    webim.Conversation = Conversation;
})(nextalk.webim);
