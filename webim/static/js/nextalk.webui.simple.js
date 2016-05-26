/*!
 * nextalk.webiui.simple.js v1.0.0
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

if (!nextalk.webui) {
    nextalk.webui = {};
}

(function(webim, webui) {

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
        completion = webui.completion,
        MsgTips    = webui.MsgTips,
        ChatBox    = webui.ChatBox;

    /**
     * 简单的聊天界面
     */
    var Simple = function() {
        var _this = this;
        _this.$html = webui.$(completion(Simple.HTML,
                {logo : webim.imgs.LOGO_MIN}));
        _this.$header = $('header', _this.$html);
        _this.$title = $('.mzen-title', _this.$header);
        _this.$currUser = $('.nextalk-user', _this.$header);
        _this.$conversations = $('#nextalk_conversations', _this.$html);
        _this.$items = $('>.nextalk-wrap>.mzen-list-view', _this.$conversations);
        _this.msgTips = new MsgTips();
        _this.$html.append(_this.msgTips.$html);
        _this.handler();
        
        _this.bind('presences', function(ev, data) {
            _this._onPresences(data);
        });
    };
    webim.ClassEvent.on(Simple);
    Simple.HTML = '<div class="nextalk-page chatbox" id="nextalk_page_main">\
                        <header class="mzen-bar mzen-bar-nav mzen-bar-info">\
                                <div class="mzen-pull-right nextalk-user">\
                                <a class="mzen-img mzen-tap-active\
                                        mzen-up-hover">\
                                <img class="mzen-img-object" src="" data-toggle="head"/>\
                                </a>\
                                <ul class="dropdown-menu">\
                                <li data-show="available">在线\
                                    <i class="nextalk-show available"></i>\
                                </li>\
                                <li data-show="dnd">忙碌\
                                    <i class="nextalk-show dnd"></i>\
                                </li>\
                                <li data-show="away">离开\
                                    <i class="nextalk-show away"></i>\
                                </li>\
                                <li data-show="invisible">隐身\
                                    <i class="nextalk-show invisible"></i>\
                                </li>\
                                <li data-show="unavailable">离线\
                                    <i class="nextalk-show unavailable"></i>\
                                    <i class="mzen-iconfont mzen-icon-check"></i>\
                                </li>\
                                </ul>\
                                </div>\
                                <div class="mzen-title">???</div>\
                                <a class="mzen-pull-left mzen-img nextalk-logo">\
                                <img class="mzen-img-object" src="{{logo}}"/>\
                                </a>\
                        </header>\
                        <div class="nextalk-scroll" id="nextalk_conversations">\
                        <div class="mzen-content nextalk-wrap">\
                        <ul class="mzen-list-view"></ul>\
                        </div></div>\
                    </div>';
    Simple.CONVERSATION = '<li class="mzen-list-view-cell mzen-img mzen-tap-active mzen-up-hover">\
                                <img class="mzen-img-object mzen-pull-left" src="">\
                                <div class="mzen-img-body">\
                                    <p class="mzen-ellipsis-1">???</p>\
                                </div>\
                                <span class="mzen-badge mzen-badge-danger mzen-pull-right">???</span>\
                             </li>';
    Simple.prototype.handler = function() {
        var _this = this;
        if (webui.mobile) {
            $('.mzen-pull-left', _this.$header).attr('href', '/mobile');
        }
        _this.$currUser.click(function() {
            $('.dropdown-menu', $(this)).slideToggle();
        });
        //_this.$currUser.find('ul').css('right', 'initial');
        $('.dropdown-menu li', _this.$currUser).each(function(i, el) {
            $(el).click(function() {
                var client = webim.client;
                webui.showTask.start();
                var show = $(el).attr('data-show');
                if (show == webim.show.UNAVAILABLE) {
                    client.offline(function() {
                        _this.avatar();
                    });
                } else {
                    client.online(show, function() {
                        _this.avatar();
                    });
                }
            });
        });

        _this.$items.empty();
        _this.$conversations.css({
            'overflow' : 'auto',
            'background' : 'white'
        });
    };
    Simple.prototype.avatar = function() {
        var _this = this;
        var client = webim.client;
        var show = client.getShow();

        if (client.connStatus == webim.connStatus.CONNECTED) {
            var u = client.getCurrUser();
            $('img', _this.$currUser).attr('src', u.avatar);
            $('img', _this.$currUser).attr('alt', u.nick);
            $('a', _this.$currUser).attr('title', u.nick);
        }

        webui.showTask.stop();
        $('a', _this.$currUser).addClass(show);
        
        $('ul li', _this.$currUser).each(function(i, el) {
            var $el = $(el);
            $('.mzen-iconfont', $el).remove();
            if ($el.attr('data-show') == show) {
                $(el).append('<i class="mzen-iconfont mzen-icon-check"></i>');
            }
        });
    };
    Simple.prototype.setCurrName = function() {
        var u = webim.client.getCurrUser();
        this.$title.text(u.nick);
    };
    Simple.prototype.itemHTML = function(conv) {
        // 入参验证
        webim.validate(conv, {
            type      : {type : [webim.Conversation.CHAT,
                                 webim.Conversation.ROOM,
                                 webim.Conversation.NOTICE],
                         requisite : true},
            currUid   : {type : 'string', requisite : true},
            currNick  : {type : 'string', requisite : true},
            currAvatar: {type : 'string', requisite : false},
            objId     : {type : 'string', requisite : true},
            objName   : {type : 'string', requisite : true},
            objAvatar : {type : 'string', requisite : false},
            body      : {type : 'string', requisite : false},
            timestamp : {type : 'number', requisite : false},
            direction : {type : [webim.msgDirection.SEND,
                                 webim.msgDirection.RECEIVE],
                         requisite : false}
        });

        var $item = webui.$(Simple.CONVERSATION);
        $item.attr('data-toggle', conv.type);
        $item.attr('data-currUid', conv.currUid);
        $item.attr('data-currNick', conv.currNick);
        $item.attr('data-currAvatar', conv.currAvatar);
        $item.attr('data-objId', conv.objId);
        $item.attr('data-objName', conv.objName);
        $item.attr('data-objAvatar', conv.objAvatar);
        
        $('img', $item).attr('src', conv.objAvatar);
        $('p', $item).text(conv.objName);
        if (conv.notCount && conv.notCount != 0) {
            $('span', $item).text(conv.notCount);
        } else {
            $('span', $item).remove();
        }
        return $item;
    };
    Simple.prototype.resizable = function() {
        var _this = this, $html = this.$html;
        var mobile = webui.mobile;
        
        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();

        if (!mobile) {
            if (ww <= 320) {
                $html.css('width', '100%');
            } else {
                $html.width(220);
            }
        } else {
            $html.css('width', '100%');
        }

        var hh = _this.$header.height();
        _this.$conversations.height(wh - hh);
    };
    Simple.prototype.itemsClick = function($items) {
        if (!$items) {
            $items = this.$items;
        }

        $('>li', $items).each(function(i, el) {
            var item = $(el);
            if (item.data('events') &&
                    item.data('events')['click'])
                return;

            // 点击启动一个新的聊天盒子
            item.click(function() {
                var $this = $(this);
                var conv = {
                    type : $this.attr('data-toggle'),
                    currUid : $this.attr('data-currUid'),
                    currNick : $this.attr('data-currNick'),
                    currAvatar : $this.attr('data-currAvatar'),
                    objId : $this.attr('data-objId'),
                    objName : $this.attr('data-objName'),
                    objAvatar : $this.attr('data-objAvatar')
                };
                webui.openChatBox(conv);
            });
        });
    };
    Simple.prototype.loadItem = function(type, currUid, objId) {
        var _this = this, $items = _this.$items;

        _this.removeItem(type, currUid, objId);
        var conv = webim.convMessage.get(type,
                                {currUid : currUid,
                                 objId : objId});
        _this.itemHTML(conv).prependTo($items);

        // 设置底部的未读数据
        _this.showUnreadTotal();
        _this.itemsClick();
    };
    Simple.prototype.removeItem = function(type, currUid, objId) {
        var _this = this, $items = _this.$items;
        $('>li', $items).each(function(i, el) {
            var $el = $(el);
            if ($el.attr('data-toggle') == type
                    && $el.attr('data-currUid') == currUid
                    && $el.attr('data-objId') == objId) {
                $el.remove();
                // break
                return false;
            }
        });
    };
    Simple.prototype.loadRecently = function(convs) {
        var _this = this, $items = _this.$items.empty();
        
        if (convs && convs.length > 0) {
            for (var i = 0; i < convs.length; i++) {
                $items.append(_this.itemHTML(convs[i]));
            }
        }

        var currUser = webim.client.getCurrUser();
        if (webui.chatObjs) {
            for (var i = 0; i < webui.chatObjs.length; i++) {
                var chatObj = webui.chatObjs[i];
                _this.removeItem(chatObj.type, currUser.id, chatObj.id);
                $items.append(_this.itemHTML({
                    type : chatObj.type,
                    currUid : currUser.id,
                    currNick : currUser.nick,
                    currAvatar : currUser.avatar,
                    objId : chatObj.id,
                    objName : chatObj.name,
                    objAvatar : chatObj.avatar,
                    body : '开始聊天'
                }));
            }
        }
        if (webui.chatObj) {
            var chatObj = webui.chatObj;
            _this.removeItem(chatObj.type, currUser.id, chatObj.id);
            var conv = {
                    type : chatObj.type,
                    currUid : currUser.id,
                    currNick : currUser.nick,
                    currAvatar : currUser.avatar,
                    objId : chatObj.id,
                    objName : chatObj.name,
                    objAvatar : chatObj.avatar,
                    body : '开始聊天'
                };
            _this.itemHTML(conv).prependTo($items);
            webui.openChatBox(conv);
        }
        if ($('>li', $items).length === 0) {
            webim.webApi.agents_random(null, function(ret, err) {
                if (ret) {
                    for (var i = 0; i < ret.length; i++) {
                        var chatObj = ret[i];
                        _this.itemHTML({
                            type : webim.Conversation.CHAT,
                            currUid : currUser.id,
                            currNick : currUser.nick,
                            currAvatar : currUser.avatar,
                            objId : chatObj.user_id,
                            objName : chatObj.name,
                            objAvatar : '/images/agentphoto/' + chatObj.face,
                            body : '开始聊天'
                        }).prependTo($items);
                    }
                    _this.itemsClick();
                }
            });
        }
        _this.itemsClick();
    };
    Simple.prototype.loadBuddies = function() {
        
    };
    Simple.prototype.showUnreadTotal = function() {
        var total = webim.convMessage.unreadTotal;
        if (webui.onUnread) {
            webui.onUnread(total);
        }
    };
    Simple.prototype.showTipsTask = undefined;
    Simple.prototype.showConnecting = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTips.show('正在连接...', 'mzen-tips-info');
    };
    Simple.prototype.showConnected = function() {
        var _this = this;
        window.clearTimeout(_this.showTipsTask);
        _this.msgTips.show('连接成功...', 'mzen-tips-success');
        _this.showTipsTask = setTimeout(function() {
            _this.hideTips();
        }, 1000);
    };
    Simple.prototype.showDisconnected = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTips.show('连接断开...', 'mzen-tips-danger');
    };
    Simple.prototype.showNetwork = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTips.show('网络不可用...', 'mzen-tips-danger');
    };
    Simple.prototype.hideTips = function() {
        this.msgTips.hide();
    };
    Simple.prototype._onPresences = function(presences) {
        $('li[data-toggle="chat"]' , this.$html).each(function(i, el) {
            var $el = $(el);
            for (var i = 0; i < presences.length; i++) {
                var presence = presences[i];
                if (presence.from == $el.attr('data-objId')) {
                    $el.attr('data-objShow', presence.show);
                    //break;
                }
            }
        });
    };

    webui.Simple = Simple;
})(nextalk.webim, nextalk.webui);


