/*!
 * nextalk.webiui.chatbox.js v1.0.0
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
     * 聊天盒子类
     */
    var ChatBoxUI = function(type, id, name, avatar) {
        var _this = this;
        _this.type = type;
        _this.id = id;
        _this.name = name;
        _this.avatar = avatar;
        _this.focus = false;
        _this.times = 0;

        var $body = webui.$body;
        var $html = webui.$(ChatBoxUI.HTML);
        _this.$html = $html;
        
        _this.msgTipsUI = new MsgTipsUI();
        _this.$html.append(_this.msgTipsUI.$html);

        _this.emotUI = new EmotUI();
        var $textarea = $('footer .nextalk-form textarea', $html);
        _this.emotUI.callback = function(emot) {
            $textarea.val($textarea.val() + emot);
        };
        $('footer .nextalk-form .mzen-input', $html)
                .append(_this.emotUI.$html);

        _this.$bBody = $('.nextalk-wrap', $html);
        _this.$bBody.empty();

        _this.handleHTML();
        $html.appendTo($body);

        _this.bind('presence', function(ev, data) {
            _this._onPresence(data);
        });
        $(window).resize(function() {
            _this.resizable();
        });
    };
    webim.ClassEvent.on(ChatBoxUI);

    // 聊天盒子类型
    ChatBoxUI.NOTICE = webim.Conversation.NOTICE;
    ChatBoxUI.CHAT = webim.Conversation.CHAT;
    ChatBoxUI.ROOM = webim.Conversation.ROOM;
    // 聊天盒子模板
    ChatBoxUI.HTML = '<div class="nextalk-page nextalk-screen-right chatbox"\
                            id="nextalk_page_chatbox" style="display: none;">\
                        <!--头部集合 BEGIN-->\
                        <header class="mzen-bar mzen-bar-nav mzen-bar-info">\
                            <a class="mzen-pull-left">\
                            <span class="mzen-iconfont mzen-icon-left"></span></a>\
                            <div class="mzen-pull-right mzen-tap-active nextalk-user">\
                            <a class="mzen-img">\
                            <img class="mzen-img-object" src="" data-toggle="head">\
                            </a>\
                            </div>\
                            <div class="mzen-title">???</div>\
                        </header>\
                        <!--头部集合 END-->\
                        <div class="nextalk-scroll" id="nextalk_content_chatbox">\
                            <div class="mzen-content-padded nextalk-wrap"></div>\
                        </div>\
                        <!-- 聊天输入筐BEGIN -->\
                        <footer>\
                            <div class="mzen-form">\
                            <div class="nextalk-form mzen-input-row">\
                                <div class="mzen-input">\
                                <p><i class="mzen-iconfont mzen-icon-emoji"></i><i class="mzen-iconfont mzen-icon-pic"></i></p>\
                                <textarea placeholder="输入消息内容..."></textarea>\
                                </div><span class="mzen-input-addon mzen-btn mzen-btn-info">发送</span>\
                            </div>\
                            </div>\
                        </footer>\
                        <!-- 聊天输入筐END -->\
                      </div>';
    ChatBoxUI.SEND = '<p class="mzen-text-center"><span class="time">???</span></p>\
                      <div class="mzen-chat-sender">\
                        <div class="mzen-chat-sender-avatar"><img src=""></div>\
                        <div style="padding-right:60px;text-align:right;" class="nick">???</div>\
                        <div class="mzen-chat-sender-cont">\
                            <div class="mzen-chat-right-triangle"></div>\
                            <span class="body">???</span>\
                        </div>\
                      </div>';
    ChatBoxUI.RECEIVE = '<p class="mzen-text-center"><span class="time">???</span></p>\
                         <div class="mzen-chat-receiver">\
                            <div class="mzen-chat-receiver-avatar"><img src=""></div>\
                            <div style="padding-left:60px;text-align:left;" class="nick">???</div>\
                            <div class="mzen-chat-receiver-cont">\
                                <div class="mzen-chat-left-triangle"></div>\
                                <span class="body">???</span>\
                            </div>\
                         </div>';

    ChatBoxUI.prototype.resizable = function() {
        var _this = this, $html = _this.$html;
        var mobile = webui.mobile;
        var simple = webui.simple;

        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();

        if (!mobile) {
            if (ww <= 320) {
                $html.css('width', '100%');
            } else {
                if (!simple) {
                    $html.width(ww - 240);
                } else {
                    $html.width(ww - 220);
                }
            }
        } else {
            $html.css('width', '100%');
        }

        var hh = $('header', $html).height();
        var fh = $('footer', $html).height();
        var $content = $('#nextalk_content_chatbox', $html);
        $content.height(wh - hh - fh);
    };
    ChatBoxUI.prototype.toBottom = function() {
        var $html = this.$html;
        var $content = $('#nextalk_content_chatbox', $html);
        var $innerContent = $('>.nextalk-wrap', $content);
        var height = $innerContent.height();
        $content.animate({scrollTop : height}, 50);
    };
    ChatBoxUI.prototype.show = function(show) {
        var _this = this;
        _this.$html.show();
        _this.focus = true;
        _this.times++;
        if (webui.onChatboxOpen) {
            webui.onChatboxOpen();
        }
        
        if (show) {
            if (show != webim.show.UNAVAILABLE) {
                _this.showOnline();
            } else {
                _this.showUnline();
            }
        }

        _this.resizable();
        _this.toBottom();

        var key = {currUid : webim.client.getCurrUser().id,
                objId   : _this.id};
        var conv = webim.convList.get(_this.type, key);
        // 去除红色的未读数据
        var record = [];
        if (conv) {
            record = conv.readAll();
        }
        var $items = webui.mainUI.$items;
        $('>li', $items).each(function(i, el) {
            var $el = $(el);
            if ($el.attr('data-toggle') == _this.type
                    && $el.attr('data-id') == _this.id) {
                if (conv && conv.notCount > 0) {
                    $el.find('span.mzen-badge-danger').text(
                            conv.notCount);
                } else {
                    $el.find('span.mzen-badge-danger').remove();
                }
                // break
                return false;
            }
        });
        // 设置底部的未读数据
        webui.mainUI.showUnreadTotal();

        // 如果聊天盒子第一次显示，加载内存对话记录和历史对话记录
        if (_this.times > 1) {
            return;
        }

        // 历史数据库中查询
        var currUser = webim.client.getCurrUser();
        var history = webim.history;
        history.load(_this.type, _this.id, function(ret, err) {
            if (ret) {
                for (var i = 0; i < ret.length; i++) {
                    var msg = ret[i];
                    if (msg.from == currUser.id) {
                        msg.direction = webim.msgDirection.SEND;
                        msg.avatar = currUser.avatar;
                    } else {
                        msg.direction = webim.msgDirection.RECEIVE;
                        msg.avatar = _this.avatar;
                    }
                }
                if (ret.length == 0) {
                    for (var i = 0, len = record.length; i < len; i++) {
                        var msg = record[i];
                        if (msg.direction == webim.msgDirection.SEND) {
                            _this.sendHTML(msg);
                        } else {
                            _this.receiveHTML(msg);
                        }
                    }
                } else {
                    for (var i = 0, len = ret.length; i < len; i++) {
                        var msg = ret[i];
                        if (msg.direction == webim.msgDirection.SEND) {
                            _this.sendHTML(msg);
                        } else {
                            _this.receiveHTML(msg);
                        }
                    }
                }
            }
            // 发送默认消息
            if (webui.chatObj 
                    && webui.chatObj.id == _this.id
                    && webui.chatObj.body) {
                if (!webui.chatObj.body_type) {
                    _this.sendMsg(webui.chatObj.body);
                } else {
                    var body = {
                        type : webui.chatObj.body_type,
                        body : webui.chatObj.body
                    };
                    _this.sendMsg(webim.JSON.stringify(body));
                }
            }
        });
    };
    ChatBoxUI.prototype.hide = function() {
        var _this = this;
        _this.$html.hide();
        _this.focus = false;
        if (webui.onChatboxClose) {
            webui.onChatboxClose();
        }
    };
    ChatBoxUI.prototype.receiveHTML = function(msg) {
        var _this = this;
        var $receive = webui.$(ChatBoxUI.RECEIVE);
        var time = new webim.Date();
        time.setTime(msg.timestamp);
        var tStr = null;
        if (time.getDate() != (new webim.Date()).getDate()) {
            tStr = time.format('yyyy-MM-dd');
        } else {
            tStr = time.format('hh:mm:ss');
        }
        $receive.find('.time').text(tStr);
        $receive.find('.nick').text(msg.nick);
        $receive.find('img').attr('src', msg.avatar);
        if (isUrl(msg.body)) {
            $receive.find('.body').html('<a href="'+msg.body+'" target="_blank">'+msg.body+'</a>');
        } else {
            try {
                var data = webim.JSON.parse(msg.body);
                if (typeof data !== 'object') {
                    throw new Error();
                }
                if (data.type == 1) {
                    $receive.find('.body').html("正在加载中...");
                    webim.webApi.house(
                            {id : data.body},
                            function(ret, err) {
                                if (ret) {
                                    var m = webui.mobile;
                                    var a = '/mobile/house.php?id=' + ret.goods_id;
                                    if (!m) {
                                        a = '/house.php?id=' + ret.goods_id;
                                    }
                                    var html = '<a href="' + a + '" target="_blank"><div><img width="90%"\
                                        src="http://images.qiaoju360.com/'+ ret.goods_img +'"/>\
                                        <p>'+ ret.goods_name +'</p></div></a>';
                                    $receive.find('.body').html(html);
                                } else {
                                    $receive.find('.body').html("加载失败...");
                                }
                            });
                } else if (data.type == 2) {
                    $receive.find('.body').html('<img width="90%" src="'+data.body+'"/>');
                }
            } catch (e) {
                $receive.find('.body').html(EmotUI.trans(msg.body));
            }
        }
        _this.$bBody.append($receive);
        _this.toBottom();
    };
    ChatBoxUI.prototype.sendHTML = function(msg) {
        var _this = this;
        var $send = webui.$(ChatBoxUI.SEND);
        var time = new webim.Date();
        time.setTime(msg.timestamp);
        var tStr = null;
        if (time.getDate() != (new webim.Date()).getDate()) {
            tStr = time.format('yyyy-MM-dd');
        } else {
            tStr = time.format('hh:mm:ss');
        }
        $send.find('.time').text(tStr);
        $send.find('.nick').text(msg.nick);
        $send.find('img').attr('src', msg.avatar);
        if (isUrl(msg.body)) {
            $send.find('.body').html('<a href="'+msg.body+'" target="_blank">'+msg.body+'</a>');
        } else {
            try {
                var data = webim.JSON.parse(msg.body);
                if (typeof data !== 'object') {
                    throw new Error();
                }
                if (data.type == 1) {
                    $send.find('.body').html("正在加载中...");
                    webim.webApi.house(
                            {id : data.body},
                            function(ret, err) {
                                if (ret) {
                                    var m = webui.mobile;
                                    var a = '/mobile/house.php?id=' + ret.goods_id;
                                    if (!m) {
                                        a = '/house.php?id=' + ret.goods_id;
                                    }
                                    var html = '<a href="' + a + '" target="_blank"><div><img width="90%"\
                                        src="http://images.qiaoju360.com/'+ ret.goods_img +'"/>\
                                        <p>'+ ret.goods_name +'</p></div><a>';
                                    $send.find('.body').html(html);
                                } else {
                                    $send.find('.body').html("加载失败...");
                                }
                            });
                } else if (data.type == 2) {
                    $send.find('.body').html('<img width="90%" src="'+data.body+'"/>');
                }
            } catch (e) {
                $send.find('.body').html(EmotUI.trans(msg.body));
            }
        }
        _this.$bBody.append($send);
        _this.toBottom();
        return $send;
    };
    ChatBoxUI.prototype.sendMsg = function(body) {
        var _this = this;
        var msg = _this.message(body);
        _this.sendHTML(msg);
        webim.client.sendMessage(msg);
        // 处理会话列表
        webui.mainUI.loadItem(msg.type, msg.to, msg);
    };
    ChatBoxUI.prototype.message = function(body) {
        var _this = this;
        var currUser = webim.client.getCurrUser();

        var msg = {
            type : _this.type,
            from : currUser.id,
            nick : currUser.nick,
            avatar : currUser.avatar,
            to : _this.id,
            to_nick : _this.name,
            to_avatar : _this.avatar,
            body : body,
            timestamp : webim.nowStamp()
        };
        return msg;
    }
    ChatBoxUI.prototype.handleHTML = function() {
        var _this = this, $html = _this.$html;

        if (_this.type == ChatBoxUI.NOTICE) {
            $('footer', $html).hide();
        }
        $html.attr('data-type', _this.type);
        $html.attr('data-id', _this.id);
        $html.attr('data-name', _this.name);
        $('header>.mzen-title', $html).text(_this.name);
        var $content = $('#nextalk_content_chatbox', $html);
        $content.css('overflow', 'auto');

        $('>header .mzen-pull-left', $html).click(
                function() {
                    _this.hide();
                });
        // 设置在线状态和头像
        $('>header .mzen-pull-right img', $html)
            .attr('src', _this.avatar);

        $('footer .mzen-btn', $html).click(function() {
            _this.submit();
        });

        $('footer textarea', $html).on('keydown', function(ev) {
            if (ev.keyCode == 13) {
                _this.submit();
            }
        });

        $('footer .mzen-icon-emoji', $html).click(function() {
            _this.emotUI.$html.toggle();
        });
        $('footer .mzen-icon-pic', $html).dropzone({
            url: webim.apiPath + "upload-file.php",
            paramName: 'file',
            maxFiles: 5,
            maxFilesize: 10,
            acceptedFiles: "image/*",
            addedfile: function(file) {
                window.file = file;
                var data = {
                        type : 2,
                        body : webim.resPath + 'imgs/loading_more.gif',
                };
                var msg = _this.message(webim.JSON.stringify(data));
                file.sendHtml = _this.sendHTML(msg);
            },
            
            uploadprogress: function(file, progress, bytesSent) {
                
            },
            
            success: function(file, ret) {
                if (ret && ret.success) {
                    var data = {
                            type : 2,
                            body : ret.path,
                    };
                    var msg = _this.message(webim.JSON.stringify(data));
                    webim.client.sendMessage(msg);
                    // 处理会话列表
                    webui.mainUI.loadItem(msg.type, msg.to, msg);
                    file.sendHtml.find('.body img').attr('src', ret.path);
                }
            },
            
            error: function(file) {
                file.sendHtml.find('.body').html("图片发送失败");
            }
        });
    };
    ChatBoxUI.prototype.submit = function() {
        var _this = this;
        var $input = $('.mzen-form textarea', _this.$html);
        if ($.trim($input.val()) != '') {
            _this.sendMsg($input.val());
        }
        $input.val('');
        $input.focus();
    };
    ChatBoxUI.prototype.showTipsTask = undefined;
    ChatBoxUI.prototype.showOnline = function() {
        var _this = this;
        window.clearTimeout(_this.showTipsTask);
        _this.msgTipsUI.show('用户在线，可以聊天...', 'mzen-tips-success');
        _this.showTipsTask = setTimeout(function() {
            _this.hideTips();
        }, 2000);
    };
    ChatBoxUI.prototype.showUnline = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTipsUI.show('用户已经下线...', 'mzen-tips-danger');
    };
    ChatBoxUI.prototype.hideTips = function() {
        this.msgTipsUI.hide();
    };
    ChatBoxUI.prototype._onPresence = function(show) {
        if (show != webim.show.UNAVAILABLE) {
            this.showOnline();
        } else {
            this.showUnline();
        }
    };

    webui.ChatBoxUI = ChatBoxUI;
})(nextalk.webim, nextalk.webui);

