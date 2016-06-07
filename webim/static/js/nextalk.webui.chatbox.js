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
            objShow   : {type : [webim.show.AVAILABLE,
                                 webim.show.DND,
                                 webim.show.AWAY,
                                 webim.show.INVISIBLE,
                                 webim.show.CHAT,
                                 webim.show.UNAVAILABLE],
                         requisite : true},
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
        _this.objShow = conv.objShow;
        _this.focus = false;
        _this.times = 0;

        var $body = webui.$body;
        var $html = webui.$(ChatBox.HTML);
        _this.$html = $html;
        
        _this.msgTips = new MsgTips();
        _this.$html.append(_this.msgTips.$html);

        _this.emot = new Emot();
        var $input = $('footer .nextalk-form input', $html);
        $input.on('focus', function(ev) {
            _this.emot.hide();
            _this.resizable();
        });
        _this.emot.callback = function(emot) {
            $input.val($input.val() + emot);
            _this.resizable();
        };
        $('footer .mzen-form', $html)
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
                        <header class="mzen-bar mzen-bar-nav mzen-bar-white">\
                            <a class="mzen-pull-left mzen-tap-active mzen-up-hover nextalk-return">\
                            <span class="mzen-iconfont mzen-icon-left"></span></a>\
                            <div class="mzen-pull-left mzen-tap-active mzen-up-hover nextalk-user">\
                            <a class="mzen-img">\
                            <img class="mzen-img-object" src="" data-toggle="head">\
                            </a>\
                            </div>\
                            <div class="mzen-title">???</div>\
                            <a class="mzen-pull-right nextalk-close-iframe" href="#">\
                            <span class="mzen-iconfont mzen-icon-close"></span></a>\
                            <a class="mzen-pull-right nextalk-call-phone" href="#">\
                            <span class="mzen-iconfont mzen-icon-phone"></span></a>\
                        </header>\
                        <!--头部集合 END-->\
                        <div class="nextalk-scroll" id="nextalk_content_chatbox">\
                            <div class="mzen-content-padded nextalk-wrap"></div>\
                        </div>\
                        <!-- 聊天输入筐BEGIN -->\
                        <footer class="nextalk-chatbox-footer">\
                            <form class="mzen-form" method="get" action="">\
                            <div class="nextalk-form mzen-input-row">\
                                <div class="mzen-input">\
                                <input type="text" placeholder="输入消息内容..."/>\
                                </div><span class="mzen-input-addon mzen-btn mzen-btn-info">发送</span>\
                            </div>\
        <p class="nextalk-chatbox-menu"><i class="mzen-iconfont mzen-icon-emoji"></i><i class="mzen-iconfont mzen-icon-pic"></i><i class="mzen-iconfont mzen-icon-home"></i></p>\
                            </form>\
        <input type="file" accept="image/*" name="file" style="opacity: 0; filter: alpha(opacity = 0); display: none;" class="file_upload"/>\
                        </footer>\
                        <!-- 聊天输入筐END -->\
                      </div>';
    ChatBox.SEND = '<p class="mzen-text-center"><span class="time">???</span></p>\
                      <div class="mzen-chat-sender">\
                        <div class="mzen-chat-sender-avatar"><img src="" class="nextalk-avatar"/></div>\
                        <!--<div style="padding-right:60px;text-align:right;" class="nick">???</div>-->\
                        <div class="mzen-chat-sender-cont">\
                            <div class="mzen-chat-right-triangle"></div>\
                            <span class="body">???</span>\
                        </div>\
                      </div>';
    ChatBox.RECEIVE = '<p class="mzen-text-center"><span class="time">???</span></p>\
                         <div class="mzen-chat-receiver">\
                            <div class="mzen-chat-receiver-avatar"><img src="" class="nextalk-avatar"/></div>\
                            <!--<div style="padding-left:60px;text-align:left;" class="nick">???</div>-->\
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

        var hh = $('header', $html).outerHeight() ;
        var fh = $('footer', $html).outerHeight();
        var $content = $('#nextalk_content_chatbox', $html);
        $content.height(wh - hh - fh);
        if (!mobile) {
            if (ww <= 320) {
                $html.css('width', '100%');
            } else {
                $html.width(ww - $main.width());
            }
        } else {
            $html.css({
                'width' : '100%'
            });
            $content.css({
                'margin-top' : hh+'px'});
            _this.toBottom();
        }
    };
    ChatBox.prototype.toBottom = function() {
        var $html = this.$html;
        var $content = $('#nextalk_content_chatbox', $html);
        var $innerContent = $('>.nextalk-wrap', $content);
        var height = $innerContent.height();
        $content.animate({scrollTop : height}, 50);
    };
    ChatBox.prototype.show = function() {
        var _this = this;
        _this.$html.show();
        _this.focus = true;
        _this.times++;
        if (webui.onChatboxOpen) {
            webui.onChatboxOpen();
        }

        if (_this.objShow != webim.show.UNAVAILABLE) {
            _this.showOnline();
        } else {
            _this.showUnline();
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
                    $el.find('span.mzen-badge-danger').text(conv.notCount);
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

        // 先加载内存中的消息
        _this.$bBody.empty();
        for (var i = 0, len = record.length; i < len; i++) {
            var msg = record[i];
            if (msg.direction == webim.msgDirection.SEND) {
                _this.sendHTML(msg);
            } else {
                _this.receiveHTML(msg);
            }
            if (i == 0) {
                _this.before = msg.timestamp;
            }
        }

        if (webui.chatObj && webui.chatObj.id == _this.objId
                && webui.chatObj.body_type && webui.chatObj.body) {
            var body = {
                type : webui.chatObj.body_type,
                body : webui.chatObj.body
            };
            _this.houseHTML(body);
        } else {
            for (var i = 0; i < webui.chatObjs.length; i++) {
                var co = webui.chatObjs[i];
                if (co.id == _this.objId && co.body_type && co.body) {
                    var body = {
                        type : co.body_type,
                        body : co.body
                    };
                    _this.houseHTML(body);
                    break;
                }
            }
        }

        // 历史数据库中查询
        _this.history();
    };
    ChatBox.prototype.history = function() {
        var _this = this;
        if (!_this.before) {
            _this.before = webim.currTimeMillis;
        }
        webim.history.load({
            type : _this.type,
            currUid : _this.currUid,
            objId : _this.objId,
            before : _this.before
        }, function(msgs) {
            if (!msgs || msgs.length <= 0) {
                return;
            }
            for (var len = msgs.length; len > 0; len--) {
                var msg = msgs[len - 1];
                if (msg.direction == webim.msgDirection.SEND) {
                    _this.sendHTML(msg, true);
                } else {
                    if (!msg.avatar) {
                        msg.avatar = _this.objAvatar;
                    }
                    _this.receiveHTML(msg, true);
                }
                if (len == 1) {
                    _this.before = msg.timestamp;
                }
            }
        });
    };
    ChatBox.HOUSE = '\
        <ul class="mzen-list-view chatbox-house">\
        <li class="mzen-list-view-cell mzen-img">\
        <a><img class="mzen-img-object mzen-pull-left" src="{{goods_img}}">\
        <div class="mzen-img-body">房源信息\
            <p class="mzen-ellipsis-3">{{goods_name}}</p>\
        </div></a></li>\
        <li class="mzen-list-view-cell mzen-text-center">\
        <button class="mzen-btn mzen-btn-danger">发送房源给TA看看</button>\
        </li></ul>';
    ChatBox.prototype.houseHTML = function(body) {
        var _this = this;
        webim.webApi.house(
                {id : body.body},
                function(ret, err) {
                    if (ret) {
                        ret.goods_img = 'http://images.qiaoju360.com/' + ret.goods_img;
                        var $house = $(completion(ChatBox.HOUSE, ret));
                        $('button.mzen-btn', $house).on('click', function() {
                            _this.sendMsg(webim.JSON.stringify(body));
                        });
                        _this.$bBody.append($house);
                        _this.toBottom();
                    }
                });
    };
    ChatBox.prototype.hide = function() {
        var _this = this;
        _this.$html.hide();
        _this.focus = false;
        if (webui.onChatboxClose) {
            webui.onChatboxClose();
        }
    };
    ChatBox.prototype.receiveHTML = function(msg, history) {
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
        if (msg.showTimestamp) {
            $($receive[0]).show();
        } else {
            $($receive[0]).hide();
        }
        $receive.find('.nick').text(msg.nick);
        $receive.find('img.nextalk-avatar')
            .attr('src', msg.avatar)
            .attr('title', msg.nick);
        var $body = $receive.find('.body');
        if (isUrl(msg.body)) {
            $body.html('<a href="'+msg.body+'" target="_blank">'+msg.body+'</a>');
        } else {
            try {
                var data = webim.JSON.parse(msg.body);
                if (typeof data !== 'object') {
                    throw new Error();
                }
                if (data.type == 1) {
                    $body.html("正在加载中...");
                    webim.webApi.house(
                            {id : data.body},
                            function(ret, err) {
                                if (ret) {
                                    var m = webui.mobile;
                                    var a = '/mobile/house.php?id=' + ret.goods_id;
                                    if (!m) {
                                        a = '/house.php?id=' + ret.goods_id;
                                    }
                                    var html = '<a href="' + a + '" target="_blank">\
                                        <div><img width="'+ (_this.$html.width()/2) +'"\
                                        src="http://images.qiaoju360.com/'+ ret.goods_img +'"/>\
                                        <p>'+ ret.goods_name +'</p></div></a>';
                                    $body.html(html);
                                } else {
                                    $body.html("加载失败...");
                                }
                                _this.toBottom();
                            });
                } else if (data.type == 2) {
                    $body.html('<img width="'+ (_this.$html.width()/2) +'" src="'+data.body+'"/>');
                }
            } catch (e) {
                $body.html(Emot.trans(msg.body));
            }
        }
        $('img', $receive).on('load', function() { _this.toBottom() });
        if (!history) {
            _this.$bBody.append($receive);
        } else {
            _this.$bBody.prepend($receive);
        }
        _this.toBottom();
    };
    ChatBox.prototype.sendHTML = function(msg, history) {
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
        if (msg.showTimestamp) {
            $($send[0]).show();
        } else {
            $($send[0]).hide();
        }
        $send.find('.nick').text(msg.nick);
        $send.find('img.nextalk-avatar')
            .attr('src', msg.avatar)
            .attr('title', msg.nick);
        var $body = $send.find('.body');
        if (isUrl(msg.body)) {
            $body.html('<a href="'+msg.body+'" target="_blank">'+msg.body+'</a>');
        } else {
            try {
                var data = webim.JSON.parse(msg.body);
                if (typeof data !== 'object') {
                    throw new Error();
                }
                if (data.type == 1) {
                    $body.html("正在加载中...");
                    webim.webApi.house(
                            {id : data.body},
                            function(ret, err) {
                                if (ret) {
                                    var m = webui.mobile;
                                    var a = '/mobile/house.php?id=' + ret.goods_id;
                                    if (!m) {
                                        a = '/house.php?id=' + ret.goods_id;
                                    }
                                    var html = '<a href="' + a + '" target="_blank">\
                                        <div><img width="'+ (_this.$html.width()/2) +'"\
                                        src="http://images.qiaoju360.com/'+ ret.goods_img +'"/>\
                                        <p>'+ ret.goods_name +'</p></div><a>';
                                    $body.html(html);
                                } else {
                                    $body.html("加载失败...");
                                }
                                _this.toBottom();
                            });
                } else if (data.type == 2) {
                    $body.html('<img width="'+ (_this.$html.width()/2) +'" src="'+data.body+'"/>');
                }
            } catch (e) {
                $body.html(Emot.trans(msg.body));
            }
        }
        $('img', $send).on('load', function() { _this.toBottom() });
        if (!history) {
            _this.$bBody.append($send);
        } else {
            _this.$bBody.prepend($send);
        }
        _this.toBottom();
        return $send;
    };
    ChatBox.prototype.sendMsg = function(body) {
        var _this = this;
        var msg = _this.message(body);
        var $send = _this.sendHTML(msg);
        webim.client.sendMessage(msg);
        if (msg.showTimestamp) {
            $($send[0]).show();
        } else {
            $($send[0]).hide();
        }
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

        // 设置在线状态和头像
        $('>header .nextalk-return', $html).hide().click(function() {
            _this.hide();
        });
        $('>header .nextalk-user img', $html).attr('src', _this.objAvatar);
        $('>header .nextalk-user', $html).hide();
        $('>header .nextalk-close-iframe', $html).hide();
        $('>header .nextalk-close-iframe', $html).on('click', function() {
            if (webui.onClickCloseIframe) {
                webui.onClickCloseIframe();
            }
        });
        $('>header .nextalk-call-phone', $html).hide();
        var currUser = webim.client.getCurrUser();
        if (webui.mobile) {
            $html.addClass('nextalk-mobile');
            $('>header .nextalk-return', $html).show();
            if (currUser.type == webim.userType.GENERAL) {
                webim.webApi.agent(_this.objId, function(res, err) {
                    if (res) {
                        $('>header .nextalk-call-phone', $html).show()
                        .on('click', function() { webui.phonePage.show(res.tel_400) });
                        $('.nextalk-call-phone span', $html)
                        .css({'color': 'green', 'font-size': '26px'});
                    }
                });
            }
        }
        var $content = $('#nextalk_content_chatbox', $html);
        $content.css('overflow', 'auto');

        $('footer .mzen-btn', $html).on('click', function() {
            _this.submit();
        });
        $('footer form.mzen-form', $html).on('submit', function() {
            _this.submit();
            return false;
        });
        $('footer .mzen-icon-emoji', $html).on('click', function() {
            _this.emot.toggle();
            _this.resizable();
        });
        if (webui.goods) {
            $('footer .mzen-icon-home', $html).on('click', function() {
                webui.goods.open({
                    type : _this.type,
                    currUid : _this.currUid,
                    objId : _this.objId
                });
            });
        } else {
            $('footer .mzen-icon-home', $html).remove();
        }
//        $('footer .mzen-icon-pic', $html).dropzone({
//            url: webim.apiPath + "upload-file.php",
//            paramName: 'file',
//            maxFiles: 5,
//            maxFilesize: 10,
//            acceptedFiles: "image/*",
//            //forceFallback: true,
//            addedfile: function(file) {
//                window.file = file;
//                var data = {
//                        type : 2,
//                        body : webim.resPath + 'imgs/loading_more.gif',
//                };
//                var msg = _this.message(webim.JSON.stringify(data));
//                file.sendHtml = _this.sendHTML(msg);
//            },
//            
//            uploadprogress: function(file, progress, bytesSent) {
//                
//            },
//            
//            success: function(file, ret) {
//                if (ret && ret.success) {
//                    var data = {
//                            type : 2,
//                            body : ret.path,
//                    };
//                    var msg = _this.message(webim.JSON.stringify(data));
//                    webim.client.sendMessage(msg);
//                    // 处理会话列表
//                    webui.main.loadItem(msg.type, _this.currUid, msg.to);
//                    file.sendHtml.find('.body img').attr('src', ret.path);
//                }
//            },
//            
//            error: function(file) {
//                file.sendHtml.find('.body').html("图片发送失败");
//            }
//        });

        $('footer .mzen-icon-pic', $html).on('click', function() {
            if (!window.FormData) {
                alert('抱歉，您的浏览器不支持图片上传！');
                return;
            }
            $('footer input[type="file"]', $html).click();
        });
        $('footer input[type="file"]', $html).on('change', function() {
            var $inputFile = $(this);
            if (!($inputFile.val())) {
                return;
            }

            var data = {
                type : 2,
                body : webim.resPath + 'imgs/loading_more.gif'
            };
            var msg = _this.message(webim.JSON.stringify(data));
            var $sendHtml = _this.sendHTML(msg);

            var fData = new FormData();
            $.each($inputFile[0].files, function(i, file) {
                fData.append('file', file);
            });
            $.ajax({
                url : webim.apiPath + 'upload-file.php',
                type : 'POST',
                data : fData,
                cache : false,
                contentType : false,
                processData : false,
                success : function(ret) {
                    $inputFile.val('');
                    if (ret.success) {
                        var data = {
                            type : 2,
                            body : ret.path
                        };
                        var msg = _this.message(webim.JSON.stringify(data));
                        webim.client.sendMessage(msg);
                        $sendHtml.find('.body img').attr('src', ret.path);
                        // 处理会话列表
                        webui.main.loadItem(_this.type, _this.currUid, _this.objId);
                    } else {
                        $sendHtml.find('.body').html('Fail: ' + ret.error);
                    }
                },
                error : function() {
                    $inputFile.val('');
                    $sendHtml.find('.body').html("图片发送失败");
                }
            });
        });
    };
    ChatBox.prototype.submit = function() {
        var _this = this;
        var $input = $('.mzen-form input', _this.$html);
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
        //_this.msgTips.show('对方在线...', 'mzen-tips-success');
        //_this.showTipsTask = setTimeout(function() {
            _this.hideTips();
        //}, 900);
    };
    ChatBox.prototype.showUnline = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTips.show('对方离线...', 'mzen-tips-danger');
    };
    ChatBox.prototype.hideTips = function() {
        this.msgTips.hide();
    };
    ChatBox.prototype._onPresence = function(show) {
        this.objShow = show;
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

        clear : function() {
            for (var key in this[webim.Conversation.NOTICE]) {
                var cBox = this[webim.Conversation.NOTICE][key];
                cBox.hide();
                cBox.times = 0;
                cBox.before = null;
            }
            for (var key in this[webim.Conversation.ROOM]) {
                var cBox = this[webim.Conversation.ROOM][key];
                cBox.hide();
                cBox.times = 0;
                cBox.before = null;
            }
            for (var key in this[webim.Conversation.CHAT]) {
                var cBox = this[webim.Conversation.CHAT][key];
                cBox.hide();
                cBox.times = 0;
                cBox.before = null;
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
        webui.main.selectActive(conv.type, conv.currUid, conv.objId);
        webui.goods.close();
        chatBox.show();
    };

    webui.ChatBox = ChatBox;
})(nextalk.webim, nextalk.webui);

