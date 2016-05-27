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
        ClassEvent = webim.ClassEvent,
        completion = webui.completion,
        MsgTips    = webui.MsgTips,
        Emot       = webui.Emot;

    /**
     * 聊天盒子类
     */
    var ChatBox = function(conv) {
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

        var _this = this;
        _this.type = conv.type;
        _this.currUid = conv.currUid;
        _this.currNick = conv.currNick;
        _this.currAvatar = conv.currAvatar;
        _this.objId = conv.objId;
        _this.objName = conv.objName;
        _this.objAvatar = conv.objAvatar;
        _this.focus = false;
        _this.times = 0;

        var $body = webui.$body;
        var $html = webui.$(ChatBox.HTML);
        _this.$html = $html;
        
        _this.msgTips = new MsgTips();
        _this.$html.append(_this.msgTips.$html);

        _this.emot = new Emot();
        var $textarea = $('footer .nextalk-form textarea', $html);
        $textarea.on('focus', function(ev) {
            _this.emot.hide();
        });
        _this.emot.callback = function(emot) {
            $textarea.val($textarea.val() + emot);
            $textarea.focus();
        };
        $('footer .nextalk-form .mzen-input', $html)
                .append(_this.emot.$html);

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
    webim.ClassEvent.on(ChatBox);

    // 聊天盒子模板
    ChatBox.HTML = '<div class="nextalk-page nextalk-screen-right"\
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
    ChatBox.SEND = '<p class="mzen-text-center"><span class="time">???</span></p>\
                      <div class="mzen-chat-sender">\
                        <div class="mzen-chat-sender-avatar"><img src=""></div>\
                        <div style="padding-right:60px;text-align:right;" class="nick">???</div>\
                        <div class="mzen-chat-sender-cont">\
                            <div class="mzen-chat-right-triangle"></div>\
                            <span class="body">???</span>\
                        </div>\
                      </div>';
    ChatBox.RECEIVE = '<p class="mzen-text-center"><span class="time">???</span></p>\
                         <div class="mzen-chat-receiver">\
                            <div class="mzen-chat-receiver-avatar"><img src=""></div>\
                            <div style="padding-left:60px;text-align:left;" class="nick">???</div>\
                            <div class="mzen-chat-receiver-cont">\
                                <div class="mzen-chat-left-triangle"></div>\
                                <span class="body">???</span>\
                            </div>\
                         </div>';

    ChatBox.prototype.resizable = function() {
        var _this = this, $html = _this.$html;
        var mobile = webui.mobile;
        var $main = webui.main.$html;

        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();

        if (!mobile) {
            if (ww <= 320) {
                $html.css('width', '100%');
            } else {
                $html.width(ww - $main.width());
            }
        } else {
            $html.css('width', '100%');
        }

        var hh = $('header', $html).height();
        var fh = $('footer', $html).height();
        var $content = $('#nextalk_content_chatbox', $html);
        $content.height(wh - hh - fh);
    };
    ChatBox.prototype.toBottom = function() {
        var $html = this.$html;
        var $content = $('#nextalk_content_chatbox', $html);
        var $innerContent = $('>.nextalk-wrap', $content);
        var height = $innerContent.height();
        $content.animate({scrollTop : height}, 50);
    };
    ChatBox.prototype.show = function(show) {
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

        var key = {currUid : _this.currUid,
                   objId   : _this.objId};
        var conv = webim.convMessage.get(_this.type, key);
        // 去除红色的未读数据
        var record = [];
        if (conv) {
            record = conv.readAll();
        }
        var $items = webui.main.$items;
        $('>li', $items).each(function(i, el) {
            var $el = $(el);
            if ($el.attr('data-toggle') == _this.type
                    && $el.attr('data-currUid') == _this.currUid
                    && $el.attr('data-objId') == _this.objId) {
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
        webui.main.showUnreadTotal();

        // 如果聊天盒子第一次显示，加载内存对话记录和历史对话记录
        if (_this.times > 1) {
            return;
        }

        // 历史数据库中查询
        var history = webim.history;
        history.load({type : _this.type,
                      currUid : _this.currUid,
                      objId : _this.objId}, function(msgs) {
            if (msgs.length == 0) {
                for (var i = 0, len = record.length; i < len; i++) {
                    var msg = record[i];
                    if (msg.direction == webim.msgDirection.SEND) {
                        _this.sendHTML(msg);
                    } else {
                        _this.receiveHTML(msg);
                    }
                }
            } else {
                for (var i = 0, len = msgs.length; i < len; i++) {
                    var msg = msgs[i];
                    if (msg.direction == webim.msgDirection.SEND) {
                        _this.sendHTML(msg);
                    } else {
                        if (!msg.avatar) {
                            msg.avatar = _this.objAvatar;
                        }
                        _this.receiveHTML(msg);
                    }
                }
            }

            // 发送默认消息
            if (webui.chatObj
                    && webui.chatObj.id == _this.objId
                    && webui.chatObj.body) {
//                if (!webui.chatObj.body_type) {
//                    _this.sendMsg(webui.chatObj.body);
//                } else {
//                    var body = {
//                        type : webui.chatObj.body_type,
//                        body : webui.chatObj.body
//                    };
//                    _this.sendMsg(webim.JSON.stringify(body));
//                }
                _this.insertHTML();
            }
            _this.insertHTML();
        });
    };
    ChatBox.INSERT = '\
        <ul class="mzen-list-view chatbox-insert">\
        <li class="mzen-list-view-cell mzen-img">\
        <img class="mzen-img-object mzen-pull-left" src="http://www.qiaoju360.com/data/city/%E5%9C%A3%E6%8B%89%E8%92%99.jpg">\
        <div class="mzen-img-body">图文列表\
            <p class="mzen-ellipsis-2">图文列表缩略图在左边的样式，默认大小为80PX，文字介绍内容可以为一行也可以为两行，超出部分自动省略</p>\
        </div></li>\
        <li class="mzen-list-view-cell mzen-text-center">\
        <button class="mzen-btn mzen-btn-danger">发送房源给TA看看</button>\
        </li></ul>';
    ChatBox.prototype.insertHTML = function() {
        var _this = this;
        var $insert = $(ChatBox.INSERT);
        _this.$bBody.append($insert);
        _this.toBottom();
    };
    ChatBox.prototype.hide = function() {
        var _this = this;
        _this.$html.hide();
        _this.focus = false;
        if (webui.onChatboxClose) {
            webui.onChatboxClose();
        }
    };
    ChatBox.prototype.receiveHTML = function(msg) {
        var _this = this;
        var $receive = webui.$(ChatBox.RECEIVE);
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
                $receive.find('.body').html(Emot.trans(msg.body));
            }
        }
        _this.$bBody.append($receive);
        _this.toBottom();
    };
    ChatBox.prototype.sendHTML = function(msg) {
        var _this = this;
        var $send = webui.$(ChatBox.SEND);
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
                $send.find('.body').html(Emot.trans(msg.body));
            }
        }
        _this.$bBody.append($send);
        _this.toBottom();
        return $send;
    };
    ChatBox.prototype.sendMsg = function(body) {
        var _this = this;
        var msg = _this.message(body);
        _this.sendHTML(msg);
        webim.client.sendMessage(msg);
        // 处理会话列表
        webui.main.loadItem(msg.type, _this.currUid, msg.to);
    };
    ChatBox.prototype.message = function(body) {
        var _this = this;
        var msg = {
            type      : _this.type,
            from      : _this.currUid,
            nick      : _this.currNick,
            avatar    : _this.currAvatar,
            to        : _this.objId,
            to_name   : _this.objName,
            to_avatar : _this.objAvatar,
            body      : body,
            timestamp : webim.currTimeMillis
        };
        return msg;
    }
    ChatBox.prototype.handleHTML = function() {
        var _this = this, $html = _this.$html;

        if (_this.type == webim.Conversation.NOTICE) {
            $('footer', $html).hide();
        }
        $html.attr('data-type', _this.type);
        $html.attr('data-currUid', _this.currUid);
        $html.attr('data-currNick', _this.currNick);
        $html.attr('data-currAvatar', _this.currAvatar);
        $html.attr('data-objId', _this.objId);
        $html.attr('data-objName', _this.objName);
        $html.attr('data-objAvatar', _this.objAvatar);
        $('header>.mzen-title', $html).text(_this.objName);
        var $content = $('#nextalk_content_chatbox', $html);
        $content.css('overflow', 'auto');

        $('>header .mzen-pull-left', $html).click(
                function() {
                    _this.hide();
                });
        // 设置在线状态和头像
        $('>header .mzen-pull-right img', $html)
            .attr('src', _this.objAvatar);

        $('footer .mzen-btn', $html).click(function() {
            _this.submit();
        });

        $('footer textarea', $html).on('keydown', function(ev) {
            if (ev.keyCode == 13) {
                _this.submit();
            }
        });

        $('footer .mzen-icon-emoji', $html).click(function() {
            _this.emot.$html.toggle();
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
                    webui.main.loadItem(msg.type, _this.currUid, msg.to);
                    file.sendHtml.find('.body img').attr('src', ret.path);
                }
            },
            
            error: function(file) {
                file.sendHtml.find('.body').html("图片发送失败");
            }
        });
    };
    ChatBox.prototype.submit = function() {
        var _this = this;
        var $input = $('.mzen-form textarea', _this.$html);
        if ($.trim($input.val()) != '') {
            _this.sendMsg($input.val());
        }
        $input.val('');
        $input.focus();
    };
    ChatBox.prototype.showTipsTask = undefined;
    ChatBox.prototype.showOnline = function() {
        var _this = this;
        window.clearTimeout(_this.showTipsTask);
        _this.msgTips.show('对方当前在线...', 'mzen-tips-success');
        _this.showTipsTask = setTimeout(function() {
            _this.hideTips();
        }, 2000);
    };
    ChatBox.prototype.showUnline = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTips.show('对方已经离线...', 'mzen-tips-danger');
    };
    ChatBox.prototype.hideTips = function() {
        this.msgTips.hide();
    };
    ChatBox.prototype._onPresence = function(show) {
        if (show != webim.show.UNAVAILABLE) {
            this.showOnline();
        } else {
            this.showUnline();
        }
    };

    /** 定义聊天盒子存储空间 */
    webui._chatBoxs = {
        // 系统通知盒子
        notice : {},
        // 房间聊天盒子
        room : {},
        // 私信聊天盒子
        chat : {},

        get : function(type, key) {
            // 入参验证
            webim.validate(key, {
                currUid : {type : 'string', requisite : true},
                objId   : {type : 'string', requisite : true}
            });
            var _this = this;
            key = _this._key(key.currUid, key.objId);
            return _this[type][key];
        },

        set : function(type, key, value) {
            // 入参验证
            webim.validate(key, {
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

        hideAll : function() {
            for (var key in this[webim.Conversation.NOTICE]) {
                this[webim.Conversation.NOTICE][key].hide();
            }
            for (var key in this[webim.Conversation.ROOM]) {
                this[webim.Conversation.ROOM][key].hide();
            }
            for (var key in this[webim.Conversation.CHAT]) {
                this[webim.Conversation.CHAT][key].hide();
            }
        },
        
        onPresences : function(presences) {
            for (var key in this[webim.Conversation.CHAT]) {
                var box = this[webim.Conversation.CHAT][key];
                for (var i = 0; i < presences.length; i++) {
                    var presence = presences[i];
                    if (presence.from == box.objId) {
                        box.trigger('presence', [ presence.show ]);
                    }
                }
            }
        }
    };

    webui.openChatBox = function(conv) {
        var _this = this;
        // 隐藏所有的盒子
        _this._chatBoxs.hideAll();
        if (!conv.currUid) {
            var cUser = webim.client.getCurrUser();
            conv.currUid = cUser.id;
            conv.currNick = cUser.nick;
            conv.currAvatar = cUser.avatar;
        }
        var key = {
            currUid : conv.currUid,
            objId   : conv.objId
        };
        var chatBox = _this._chatBoxs.get(conv.type, key);
        if (!chatBox) {
            chatBox = new ChatBox(conv);
            _this._chatBoxs.set(conv.type, key, chatBox);
        }
        chatBox.show();
    };

    webui.ChatBox = ChatBox;
})(nextalk.webim, nextalk.webui);

