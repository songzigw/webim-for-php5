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

    /**
     * 简单的聊天界面
     */
    var SimpleUI = function() {
        var _this = this;
        _this.$html = webui.$(SimpleUI.HTML);
        _this.$header = $('header', _this.$html);
        _this.$title = $('.mzen-title', _this.$header);
        _this.$currUser = $('.nextalk-user', _this.$header);
        _this.$conversations = $('#nextalk_conversations', _this.$html);
        _this.$items = $('>.nextalk-wrap>.mzen-list-view', _this.$conversations);
        _this.msgTipsUI = new MsgTipsUI();
        _this.$html.append(_this.msgTipsUI.$html);
        _this.handler();
        
        _this.bind('presences', function(ev, data) {
            _this._onPresences(data);
        });
    };
    webim.ClassEvent.on(SimpleUI);
    SimpleUI.HTML = '<div class="nextalk-page chatbox" id="nextalk_page_main">\
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
                                <img class="mzen-img-object" src="" data-toggle="logo"/>\
                                </a>\
                        </header>\
                        <div class="nextalk-scroll" id="nextalk_conversations">\
                        <div class="nextalk-wrap">\
                        <ul class="mzen-list-view"></ul>\
                        </div></div>\
                    </div>';
    SimpleUI.CONVERSATION = '<li class="mzen-list-view-cell mzen-img mzen-tap-active mzen-up-hover">\
                                <img class="mzen-img-object mzen-pull-left" src="">\
                                <div class="mzen-img-body">\
                                    <p class="mzen-ellipsis-1">???</p>\
                                </div>\
                                <span class="mzen-badge mzen-badge-danger mzen-pull-right">???</span>\
                             </li>';
    SimpleUI.prototype.handler = function() {
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
    SimpleUI.prototype.avatar = function() {
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
    SimpleUI.prototype.setCurrName = function() {
        var u = webim.client.getCurrUser();
        this.$title.text(u.nick);
    };
    SimpleUI.prototype.itemHTML = function() {
        var $item = webui.$(SimpleUI.CONVERSATION);
        if (arguments.length == 1) {
            var conv = arguments[0];
            $item.attr('data-toggle', conv.type);
            $item.attr('data-id', conv.oid);
            $item.attr('data-name', conv.name);
            $('img', $item).attr('src', conv.avatar);
            $('p', $item).text(conv.name);
            $('span', $item).remove();
        } else if (arguments.length == 2) {
            var conv = arguments[0];
            var body = arguments[1];
            $item.attr('data-toggle', conv.type);
            $item.attr('data-id', conv.objId);
            $item.attr('data-name', conv.objName);
            $('img', $item).attr('src', conv.objAvatar);
            $('p', $item).text(conv.objName);
            if (conv.notCount != 0) {
                $('span', $item).text(conv.notCount);
            } else {
                $('span', $item).remove();
            }
        }
        return $item;
    };
    SimpleUI.prototype.resizable = function() {
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
    SimpleUI.prototype.itemsClick = function($items) {
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
                var imgSrc = item.find('img').attr('src');
                if (item.attr('data-toggle') == ChatBoxUI.NOTICE) {
                    webui.openChatBoxUI(ChatBoxUI.NOTICE,
                            ChatBoxUI.NOTICE,
                            webim.name.NOTICE, imgSrc);
                    return;
                }

                var dataId = item.attr('data-id');
                if (!dataId || dataId == '') {
                    return;
                }

                var name = item.attr('data-name');
                if (item.attr('data-toggle') == ChatBoxUI.ROOM) {
                    webui.openChatBoxUI(ChatBoxUI.ROOM,
                            dataId, name, imgSrc);
                    return;
                }
                if (item.attr('data-toggle') == ChatBoxUI.CHAT) {
                    webui.openChatBoxUI(ChatBoxUI.CHAT,
                            dataId, name, imgSrc);
                    return;
                }
            });
        });
    };
    SimpleUI.prototype.loadItem = function(type, other, msg) {
        var _this = this, $items = _this.$items;

        $('>li', $items).each(function(i, el) {
            var $el = $(el);
            if ($el.attr('data-toggle') == type
                    && $el.attr('data-id') == other) {
                $el.remove();
                // break
                return false;
            }
        });
        var currU = webim.client.getCurrUser();
        var conv = webim.convList.get(type,
                                {currUid : currU.id
                                 objId : other});
        _this.itemHTML(conv, msg.body).prependTo($items);

        // 设置底部的未读数据
        _this.showUnreadTotal();
        _this.itemsClick();
    };
    SimpleUI.prototype.loadRecently = function(conversations) {
        var _this = this, $items = _this.$items.empty();
        
        if (conversations && conversations.length > 0) {
            for (var i = 0; i < conversations.length; i++) {
                $items.append(_this.itemHTML(conversations[i]));
            }
        }
        if (webui.chatObjs) {
            for (var i = 0; i < webui.chatObjs.length; i++) {
                var chatObj = webui.chatObjs[i];
                $('>li', $items).each(function(i, el) {
                    var $el = $(el);
                    if ($el.attr('data-toggle') == webim.Conversation.CHAT
                            && $el.attr('data-id') == chatObj.id) {
                        $el.remove();
                        // break
                        return false;
                    }
                });
                _this.itemHTML({
                    type : ChatBoxUI.CHAT,
                    oid : chatObj.id,
                    name : chatObj.name,
                    avatar : chatObj.avatar,
                    body : '开始聊天'
                }).prependTo($items);
            }
        }
        if (webui.chatObj) {
            $('>li', $items).each(function(i, el) {
                var $el = $(el);
                if ($el.attr('data-toggle') == webim.Conversation.CHAT
                        && $el.attr('data-id') == webui.chatObj.id) {
                    $el.remove();
                    // break
                    return false;
                }
            });
            _this.itemHTML({
                type : ChatBoxUI.CHAT,
                oid : webui.chatObj.id,
                name : webui.chatObj.name,
                avatar : webui.chatObj.avatar,
                body : '开始聊天'
            }).prependTo($items);
            webui.openChatBoxUI(ChatBoxUI.CHAT, webui.chatObj.id,
                    webui.chatObj.name, webui.chatObj.avatar);
        }
        if ($('>li', $items).length === 0) {
            webim.webApi.agents_random(null, function(ret, err) {
                if (ret) {
                    for (var i = 0; i < ret.length; i++) {
                        var chatObj = ret[i];
                        _this.itemHTML({
                            type : ChatBoxUI.CHAT,
                            oid : chatObj.user_id,
                            name : chatObj.name,
                            avatar : '/images/agentphoto/' + chatObj.face,
                            body : '开始聊天'
                        }).prependTo($items);
                    }
                    _this.itemsClick();
                }
            });
        }
        _this.itemsClick();
    };
    SimpleUI.prototype.loadBuddies = function() {
        
    };
    SimpleUI.prototype.showUnreadTotal = function() {
        var total = webim.convList.unreadTotal;
        if (webui.onUnread) {
            webui.onUnread(total);
        }
    };
    SimpleUI.prototype.showTipsTask = undefined;
    SimpleUI.prototype.showConnecting = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTipsUI.show('正在连接...', 'mzen-tips-info');
    };
    SimpleUI.prototype.showConnected = function() {
        var _this = this;
        window.clearTimeout(_this.showTipsTask);
        _this.msgTipsUI.show('连接成功...', 'mzen-tips-success');
        _this.showTipsTask = setTimeout(function() {
            _this.hideTips();
        }, 1000);
    };
    SimpleUI.prototype.showDisconnected = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTipsUI.show('连接断开...', 'mzen-tips-danger');
    };
    SimpleUI.prototype.showNetwork = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTipsUI.show('网络不可用...', 'mzen-tips-danger');
    };
    SimpleUI.prototype.hideTips = function() {
        this.msgTipsUI.hide();
    };
    SimpleUI.prototype._onPresences = function(presences) {
        $('li[data-toggle="chat"]' , this.$html).each(function(i, el) {
            var $el = $(el);
            for (var i = 0; i < presences.length; i++) {
                var presence = presences[i];
                if (presence.from == $el.attr('data-id')) {
                    $el.attr('data-show', presence.show);
                    break;
                }
            }
        });
    };

    webui.SimpleUI = SimpleUI;
})(nextalk.webim, nextalk.webui);


