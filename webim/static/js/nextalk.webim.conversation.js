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
        Date       = webim.Date;

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

        _this.add(msg);
    }
    // 私聊
    Conversation.CHAT   = 'chat';
    // 群组聊天
    Conversation.ROOM   = 'room';
    // 通知
    Conversation.NOTICE = 'notice';
    Conversation.list = function(callback) {
        var client = webim.client,
            webApi = webim.webApi;

        var params = {
            ticket : client.getConnection().ticket
        };
        webApi.convList(params, callback);
    };
    Conversation.parser = function(msg) {
        // 入参验证
        validate(msg, {
            type      : {type : [Conversation.CHAT,
                                 Conversation.ROOM,
                                 Conversation.notice],
                         requisite : true},
            from      : {type : 'string', requisite : true},
            nick      : {type : 'string', requisite : true},
            avatar    : {type : 'string', requisite : false},
            to        : {type : 'string', requisite : true},
            to_nick   : {type : 'string', requisite : true},
            to_avatar : {type : 'string', requisite : false},
            body      : {type : 'string', requisite : true},
            timestamp : {type : 'number', requisite : true},
            direction : {type : [webim.msgDirection.SEND,
                                 webim.msgDirection.RECEIVE],
                         requisite : true},
            read      : {type : 'boolean', requisite : false}
        });

        var conv = {}, currUser = webim.client.getCurrUser();
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
                    conv.objId = webim.Conversation.NOTICE;
                    conv.objName = webim.name.NOTICE;
                    conv.objAvatar = webim.imgs.NOTICE;
                    break;
                case webim.Conversation.ROOM:
                    conv.objId = msg.to;
                    conv.objName = msg.to_nick;
                    conv.objAvatar = msg.to_avatar;
                    break;
                case webim.Conversation.CHAT:
                    if (msg.direction == webim.msgDirection.SEND) {
                        conv.objId = msg.to;
                        conv.objName = msg.to_nick;
                        conv.objAvatar = msg.to_avatar;
                    } else if (msg.direction == webim.msgDirection.RECEIVE) {
                        conv.objId = msg.from;
                        conv.objName = msg.nick;
                        conv.objAvatar = msg.avatar;
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
                conv.objName = msg.to_nick;
                conv.objAvatar = msg.to_avatar;
            } else if (msg.direction == webim.msgDirection.RECEIVE) {
                
                conv.objId = msg.from;
                conv.objName = msg.nick;
                conv.objAvatar = msg.avatar;
            }
        }
        conv.type = msg.type;
        conv.timestamp = msg.timestamp;
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
                webim.convList.unreadTotal++;
            }
        }
        _this.timestamp = msg.timestamp;
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
                webim.convList.unreadTotal--;
            }
        }
        _this.notCount = 0;
        return _this.record;
    };

    // 会话消息列表
    webim.convList = {
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
                    webim.convList.unreadTotal--;
                }
            }
        }
    };
    webim.Conversation = Conversation;
})(nextalk.webim);
