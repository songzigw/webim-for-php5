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
        _this.$conversations = $('#nextalk_conversations',
                _this.$html);
        _this.$items = $('>.nextalk-wrap>.mzen-list-view',
                _this.$conversations).hide();
        _this.msgTips = new MsgTips();
        _this.msgTips.$html.removeClass('nextalk-msg-tips');
        $('>.nextalk-wrap', _this.$conversations)
                    .prepend(_this.msgTips.$html);
        _this.handler();
        
        _this.bind('presences', function(ev, data) {
            _this._onPresences(data);
        });
    };
    webim.ClassEvent.on(Simple);
    Simple.HTML = '<div class="nextalk-page" id="nextalk_page_main">\
                        <header class="mzen-bar mzen-bar-nav mzen-bar-white">\
                                <div class="mzen-pull-left nextalk-user mzen-tap-active">\
                                <a class="mzen-img">\
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
                                <div class="mzen-title">微聊</div>\
                                <a class="mzen-pull-right mzen-img nextalk-logo">\
                                <img class="mzen-img-object" src="{{logo}}"/>\
                                </a>\
                                <a class="mzen-pull-right mzen-img nextalk-all-agent" href="/mobile/broker_list.php">全部经纪人</a>\
                        </header>\
                        <div class="nextalk-scroll" id="nextalk_conversations">\
                        <div class="mzen-content nextalk-wrap">\
                        <ul class="mzen-list-view"></ul>\
                        </div></div>\
                    </div>';
    Simple.CONVERSATION = '\
        <li class="mzen-list-view-cell mzen-img mzen-tap-active mzen-up-hover">\
            <img class="mzen-img-object mzen-pull-left nextalk-unavailable" src="{{objAvatar}}">\
            <div class="mzen-img-body">\
                <p class="mzen-ellipsis-1 nextalk-obj-name">{{objName}}</p>\
                <em class="mzen-pull-right nextalk-msg-time">{{msgTime}}</em>\
                <p class="mzen-ellipsis-1 nextalk-curr-nick">{{currNick}}</p>\
                <p class="mzen-ellipsis-1 nextalk-body">{{body}}</p>\
            </div>\
            <span class="mzen-badge mzen-badge-danger mzen-pull-right">0</span>\
            <i class="mzen-iconfont mzen-icon-roundclosefill"></i>\
        </li>';
    Simple.prototype.handler = function() {
        var _this = this;

        $('.nextalk-logo', _this.$header).hide();
        $('.nextalk-all-agent', _this.$header).hide();
        _this.$currUser.hide();

        _this.$currUser.click(function() {
            //$('.dropdown-menu', $(this)).slideToggle();
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

        _this.$conversations.css({
            'overflow' : 'auto',
            'background' : 'white'
        });
        if (!webui.mobile) {
            _this.$header.css('background', 'white');
            _this.$html.addClass('mzen-border-r');
            _this.$conversations.addClass('nextalk-separator-del');
        } else {
            _this.$html.addClass('nextalk-mobile');
            _this.$html.css('background', 'white');
        }
        _this.$items.empty();
    };
    Simple.prototype.avatar = function() {
        var _this = this;
        var client = webim.client;
        var show = client.getShow();

        if (client.connStatus == webim.connStatus.CONNECTED) {
            var u = client.getCurrUser();
            $('img', _this.$currUser).attr('src', u.avatar);
            //$('img', _this.$currUser).attr('alt', u.nick);
            $('a', _this.$currUser).attr('title', u.nick);
        }

        webui.showTask.stop();
        //$('a', _this.$currUser).addClass(show);
        
        $('ul li', _this.$currUser).each(function(i, el) {
            var $el = $(el);
            $('.mzen-iconfont', $el).remove();
            if ($el.attr('data-show') == show) {
                $(el).append('<i class="mzen-iconfont mzen-icon-check"></i>');
            }
        });
    };
    Simple.prototype.setTitleName = function() {
        var u = webim.client.getCurrUser();
        //this.$title.text(u.nick);
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
            objShow   : {type : [webim.show.AVAILABLE,
                                 webim.show.DND,
                                 webim.show.AWAY,
                                 webim.show.INVISIBLE,
                                 webim.show.CHAT,
                                 webim.show.UNAVAILABLE],
                         requisite : true},
            body      : {type : 'string', requisite : true},
            timestamp : {type : 'number', requisite : false},
            direction : {type : [webim.msgDirection.SEND,
                                 webim.msgDirection.RECEIVE],
                         requisite : false}
        });

        var _this = this;
        if (!conv.msgTime) {
            if (!conv.timestamp) {
                conv.timestamp = webim.nowMillis();
            }
            var time = new webim.Date(conv.timestamp);
            if (time.getDate() != (new webim.Date()).getDate()) {
                conv.msgTime = time.format('yyyy-MM-dd');
            } else {
                conv.msgTime = time.format('hh:mm:ss');
            }
        }
        try {
            var data = webim.JSON.parse(conv.body);
            if (typeof data !== 'object') {
                throw new Error();
            }
            if (data.type == 1) {
                conv.body = '[房源信息]';
            }
            if (data.type == 2) {
                conv.body = '[图片消息]';
            }
        } catch (e) {}

        var currUser = webim.client.getCurrUser();
        var $item = webui.$(webui.completion(Simple.CONVERSATION, conv));
        if (currUser.id != conv.currUid) {
            $item.addClass('nextalk-disguiser');
        }
        if (webui.mobile) {
            $item.addClass('nextalk-message');
        } else {
            $item.on('mouseover', function() {
                $('i.mzen-icon-roundclosefill', $item).show();
            });
            $item.on('mouseout', function() {
                $('i.mzen-icon-roundclosefill', $item).hide();
            });
        }
        $item.attr('data-toggle', conv.type);
        $item.attr('data-currUid', conv.currUid);
        $item.attr('data-currNick', conv.currNick);
        $item.attr('data-currAvatar', conv.currAvatar);
        $item.attr('data-objId', conv.objId);
        $item.attr('data-objName', conv.objName);
        $item.attr('data-objAvatar', conv.objAvatar);
        $item.attr('data-objShow', conv.objShow);

        if (conv.objShow != webim.show.UNAVAILABLE) {
            $item.find('.mzen-img-object')
            .removeClass('nextalk-unavailable');
        }
        if (conv.notCount && conv.notCount != 0) {
            $('span', $item).text(conv.notCount);
        } else {
            $('span', $item).remove();
        }
        $('i.mzen-icon-roundclosefill', $item).on('click', function(ev) {
            var e = window.event || ev;
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
            _this.removeItem(conv.type, conv.currUid, conv.objId);
            var cBox = webui._chatBoxs.get(conv.type,
                    {currUid : conv.currUid, objId : conv.objId});
            if (cBox) {
                cBox.hide();
            }
            webim.webApi.conv_del(conv.currUid, conv.objId);
        });
        this.$items.show();
        return $item;
    };
    Simple.prototype.resizable = function() {
        var _this = this, $html = this.$html;
        var mobile = webui.mobile;
        
        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();

        var hh = _this.$header.outerHeight();
        if (!mobile) {
            if (ww <= 320) {
                $html.css('width', '100%');
            } else {
                $html.width(220);
            }
            _this.$conversations.height(wh - hh);
        } else {
            $html.css({
                'width' : '100%'
            });
            _this.$conversations.css({
                'padding-top' : hh + 'px'
            });
            _this.$conversations.height(wh - hh);
        }
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
                    objAvatar : $this.attr('data-objAvatar'),
                    objShow : $this.attr('data-objShow')
                };
                webui.openChatBox(conv);
            });
        });
    };
    Simple.prototype.loadItem = function(type, currUid, objId) {
        var _this = this, $items = _this.$items;
        var key = {currUid : currUid, objId   : objId};

        _this.removeItem(type, currUid, objId);
        var conv = webim.convMessage.get(type, key);
        _this.itemHTML(conv).prependTo($items);

        var chatBox = webui._chatBoxs.get(conv.type, key);
        if (chatBox && chatBox.focus) {
            _this.selectActive(type, currUid, objId);
        }

        // 设置底部的未读数据
        _this.showUnreadTotal();
        _this.itemsClick();
    };
    Simple.prototype.removeItem = function(type, currUid, objId) {
        var _this = this, $items = _this.$items;
        var $remove;
        $('>li', $items).each(function(i, el) {
            var $el = $(el);
            if ($el.attr('data-toggle') == type
                    && $el.attr('data-currUid') == currUid
                    && $el.attr('data-objId') == objId) {
                $remove = $el.remove();
                // break
                return false;
            }
        });
        return $remove;
    };
    Simple.prototype.selectActive = function(type, currUid, objId) {
        var _this = this, $items = _this.$items;
        $('>li', $items).each(function(i, el) {
            var $el = $(el);
            $el.removeClass('nextalk-chatbox-active');
            if ($el.attr('data-toggle') == type
                    && $el.attr('data-currUid') == currUid
                    && $el.attr('data-objId') == objId) {
                $el.addClass('nextalk-chatbox-active');
            }
        });
    };
    Simple.prototype.loadRecently = function(convs) {
        var _this = this, //$items = _this.$items.empty();
        $items = _this.$items;

        if (convs && convs.length > 0) {
            for (var i = 0; i < convs.length; i++) {
                var conv = convs[i];
                var $rem = _this.removeItem(conv.type, conv.currUid, conv.objId);
                if ($rem) {
                    if ($('span', $rem).text()) {
                        conv.notCount = Number($('span', $rem).text());
                    }
                }
                $items.append(_this.itemHTML(conv));
            }
        }

        var currUser = webim.client.getCurrUser();
        if (webui.chatObjs) {
            for (var len = webui.chatObjs.length; len > 0; len--) {
                var chatObj = webui.chatObjs[len - 1];
                var conv = {
                    type : chatObj.type,
                    currUid : currUser.id,
                    currNick : currUser.nick,
                    currAvatar : currUser.avatar,
                    objId : chatObj.id,
                    objName : chatObj.name,
                    objAvatar : chatObj.avatar,
                    objShow : webim.show.UNAVAILABLE,
                    body : '开始聊天',
                    notCount : 0
                };
                var $rem = _this.removeItem(chatObj.type, currUser.id, chatObj.id);
                if ($rem) {
                    if ($('span', $rem).text()) {
                        conv.notCount = Number($('span', $rem).text());
                    }
                    if ($('.nextalk-msg-time', $rem).text()) {
                        conv.msgTime = $('.nextalk-msg-time', $rem).text();
                    }
                    if ($('.nextalk-body', $rem).text()) {
                        conv.body = $('.nextalk-body', $rem).text();
                    }
                }
                $items.prepend(_this.itemHTML(conv));
            }
        }
        if (webui.chatObj) {
            var chatObj = webui.chatObj;
            var conv = {
                type : chatObj.type,
                currUid : currUser.id,
                currNick : currUser.nick,
                currAvatar : currUser.avatar,
                objId : chatObj.id,
                objName : chatObj.name,
                objAvatar : chatObj.avatar,
                objShow : webim.show.UNAVAILABLE,
                body : '开始聊天',
                notCount : 0
            };
            var $rem = _this.removeItem(chatObj.type, currUser.id, chatObj.id);
            if ($rem) {
                if ($('span', $rem).text()) {
                    conv.notCount = Number($('span', $rem).text());
                }
                if ($('.nextalk-msg-time', $rem).text()) {
                    conv.msgTime = $('.nextalk-msg-time', $rem).text();
                }
                if ($('.nextalk-body', $rem).text()) {
                    conv.body = $('.nextalk-body', $rem).text();
                }
            }
            $items.prepend(_this.itemHTML(conv));
            if (webim.client.connectedTimes == 1) {
                webui.openChatBox(conv);
            }
        }
        if ($('>li', $items).length === 0
                && currUser.type == webim.userType.GENERAL) {
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
                            objShow : webim.show.UNAVAILABLE,
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
        this.msgTips.show('连接断开，请刷新网页！', 'mzen-tips-danger');
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
                    if (presence.show != webim.show.UNAVAILABLE) {
                        $el.find('.mzen-img-object')
                        .removeClass('nextalk-unavailable');
                    } else {
                        $el.find('.mzen-img-object')
                        .addClass('nextalk-unavailable');
                    }
                    //break;
                }
            }
        });
    };

    webui.Simple = Simple;
})(nextalk.webim, nextalk.webui);


