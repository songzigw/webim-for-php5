/*!
 * nextalk.webiui.init.js v1.0.0
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
        Channel    = webim.Channel,
        validate   = webim.validate,
        format     = webim.format,
        completion = webui.completion,
        Simple     = webui.Simple,
        ChatBox    = webui.ChatBox;

    /** 版本号 */
    webui.VERSION = webui.version = webui.v = "1.0.0";

    webui.mobile = false;
    webui.iframe = false;
    webui.chatObj = null;
    webui.chatObjs = [];
    webui.loadHisConv = true;
    webui.objSuit = webim.userType.GENERAL;
    webui.init = function(options) {
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
            mobile      : {type : 'boolean', requisite : false},
            chatObj     : {type : 'object', requisite : false},
            chatObjs    : {type : 'array', requisite : false}
        });

        var _this = this;
        if (options.mobile) {
            _this.mobile = options.mobile;
        }
        if (options.iframe) {
            _this.iframe = options.iframe;
        }
        if (options.chatObj) {
            if (options.chatlinkIds) {
                options.chatlinkIds += ',' + options.chatObj.id;
            } else {
                options.chatlinkIds = options.chatObj.id;
            }
            _this.chatObj = options.chatObj;
        }
        if (options.chatObjs) {
            if (options.chatlinkIds) {
                for (var i = 0; i < options.chatObjs.length; i++) {
                    options.chatlinkIds += ',' + options.chatObjs[i].id;
                }
            } else {
                for (var i = 0; i < options.chatObjs.length; i++) {
                    if (i == 0) {
                        options.chatlinkIds = options.chatObjs[i].id;
                    } else {
                        options.chatlinkIds += ',' + options.chatObjs[i].id;
                    }
                }
            }
            _this.chatObjs = options.chatObjs;
        }
        if (options.loadHisConv === false) {
            _this.loadHisConv = false;
        }
        if (options.objSuit) {
            _this.objSuit = options.objSuit;
        }

        // 初始化webim
        webim.init(options);

        // 界面元素根节点body
        _this.$body = $('body');
        _this.$btnClose = {
            HTML : '\
                 <div class="nextalk-btn-close">\
                 <span class="mzen-iconfont"></span>\
                 </div>',
            init : function() {
                var _ui = this;
                _ui.$html = $(_ui.HTML);
                $('span', _ui.$html).on('click', function() {
                    if (webui.onClickCloseIframe) {
                        webui.onClickCloseIframe(
                            webui._chatBoxs.hideAll());
                    }
                });
                _ui.$html.appendTo(_this.$body);
            }
        };
        if (webui.iframe) {
            _this.$btnClose.init();
        }

        _this.welcomeUI = {
            HTML : '<div class="nextalk-page nextalk-screen-full nextalk-page-login"\
                            id="nextalk_page_init">\
                            <div class="mzen-content\
                                mzen-flex-col mzen-flex-center">\
                            <img alt="logo" src="{{logo}}"/>\
                            <p>一起来聊聊</p></div>\
                    </div>',
            init : function() {
                var _ui = this;
                _ui.$html = $(completion(_ui.HTML,
                        {logo : webim.imgs.LOGO_INDEX})).hide();
                _ui.$html.appendTo(_this.$body);
            },
            show : function() {
                this.$html.show();
            },
            hide : function() {
                this.$html.hide();
            }
        };
        _this.welcomeUI.init();
        //_this.welcomeUI.show();

        _this.loginUI = {
            HTML : '<div class="nextalk-page nextalk-screen-full nextalk-page-login"\
                            id="nextalk_page_login">\
                            <div class="mzen-content mzen-flex-col mzen-flex-center">\
                            <img alt="logo" src="{{logo}}"/>\
                            <p>正在连接中...</p>\
                            <button class="mzen-btn mzen-btn-danger">重新连接</button>\
                            </div>\
                    </div>',
            init : function() {
                var _ui = this;
                _ui.$html = $(completion(_ui.HTML,
                        {logo : webim.imgs.LOGO_INDEX})).hide();
                _ui.$btn = $('button', _ui.$html).hide();
                _ui.$p = $('p', _ui.$html);
                _ui._handler();
                _ui.$html.appendTo(_this.$body);
            },
            show : function() {
                this.$html.show();
            },
            hide : function() {
                this.$html.hide();
            },
            _handler : function() {
                var _ui = this;
                _ui.$btn.click(function() {
                    _this._connectServer();
                });
            }
        };
        _this.loginUI.init();

        _this.imagePage = {
            HTML : '\
                <div class="nextalk-page nextalk-screen-full"\
                style="background:#2c2e2f;"><img src=""/></div>',

            init : function() {
                var _ui = this;
                _ui.$html = $(_ui.HTML).hide();
                _ui._handler();
                _ui.$html.appendTo(_this.$body);
            },
            show : function(src) {
                var _ui = this;
                _ui.$html.empty();
                var $img = $('<img src="' + src + '" />');
                $img.on('load', function() {
                    var w = _ui.$html.outerWidth();
                    var h = _ui.$html.outerHeight();
                    if ($img.width() > w || $img.height() > h) {
                        _ui.$html.css('padding-top', '0px');
                        if ($img.width() > $img.height()) {
                            $img.width(w);
                        } else {
                            $img.height(h);
                        }
                    }
                    if ($img.height() < h) {
                        _ui.$html.css('padding-top', (h-$img.height())/2 + 'px');
                    }
                });
                _ui.$html.css('text-align', 'center');
                _ui.$html.html($img);
                _ui.$html.show();
            },
            hide : function() {
                this.$html.hide();
            },
            _handler : function() {
                var _ui = this;
                _ui.$html.click(function() {
                    _ui.hide();
                });
            }
        };
        _this.imagePage.init();

        _this.phonePage = {
            HTML1 : '<div class="nextalk-page nextalk-screen-full nextalk-page-phone"></div>',
            HTML2 : '<div class="nextalk-page nextalk-page-phone2 mzen-flex-col mzen-flex-center">\
                <p>接通后需要手机拨打分机号：</p><strong style="color:red;">{{phoneNum}}</strong>\
                <a class="mzen-btn mzen-btn-danger" href="tel:400-850-3637">现在拨打</a></div>',
            init : function() {
                var _ui = this;
                _ui.$html1 = $(_ui.HTML1).hide();
                _ui.$html2 = $(_ui.HTML2).hide();
                _ui._handler();
                _ui.$html1.appendTo(_this.$body);
                _ui.$html2.appendTo(_this.$body);
            },
            show : function(num) {
                this.$html1.show();
                this.$html2.find('strong').text(num);
                this.$html2.show();
            },
            hide : function() {
                this.$html1.hide();
                this.$html2.hide();
            },
            _handler : function() {
                var _ui = this;
                _ui.$html1.click(function() {
                    _ui.hide();
                });
            }
        };
        _this.phonePage.init();

        _this.main = new Simple();
        _this.$body.append(_this.main.$html);
        _this.main.resizable();

        // 界面渲染完成
        // -----------------------------------------------------

        // 初始化监听器
        _this._initListeners();
        _this._initTimerTask();

        webim.client.setLoginStatusListener({
            onLogin : function(ev, data) {
                _this._onLogin(ev, data);
            },
            onLoginWin : function(ev, data) {
                _this._onLoginWin(ev, data);
            },
            onLoginFail : function(ev, data) {
                _this._onLoginFail(ev, data);
            }
        });
        webim.client.setConnStatusListener({
            onConnecting : function(ev, data) {
                _this._onConnecting(ev, data);
            },
            onConnected : function(ev, data) {
                _this._onConnected(ev, data);
            },
            onDisconnected : function(ev, data) {
                _this._onDisconnected(ev, data);
            },
            onNetworkChange : function(ev, data) {
                _this._onNetworkChange(ev, data);
            }
        });
        webim.client.setReceiveMsgListener({
            onMessages : function(ev, data) {
                _this._onMessages(ev, data);
            },
            onPresences : function(ev, data) {
                _this._onPresences(ev, data);
            },
            onStatus : function(ev, data) {
                _this._onStatus(ev, data);
            }
        });
    };
    
    /**
     * 定义或开启部分定时任务
     */
    webui._initTimerTask = function() {
        var _this = this, main = _this.main;
        
        // 关闭所有定时任务
        _this.stopAllTask = function() {
            _this.loginTask.stop();
            _this.showTask.stop();
            _this.cookieTask.stop();
        };

        // 正在连接的动画效果
        _this.loginTask = {
            _interval : null,

            start : function() {
                window.clearInterval(this._interval);

                var $p = _this.loginUI.$p;
                var tit = '正在连接中...';
                var point = '...';
                $p.text(tit);

                var i = 0;
                var n = point.length + 1;
                var index = tit.indexOf(point);
                this._interval = window.setInterval(function() {
                    $p.text(tit.substring(0, index + i));
                    i++;
                    if (i == n) {
                        i = 0;
                    }
                }, 600);
            },

            stop : function() {
                window.clearInterval(this._interval);
            }
        };

        // 现场状态切换动画
        _this.showTask = {
            _interval : null,
            colors : ['available', 'dnd', 'away',
                      'invisible', 'chat', 'unavailable'],

            start : function() {
//                window.clearInterval(this._interval);
//                
//                var $avatar = $('a', main.$currUser);
//                var colors = this.colors;
//                var num = colors.length;
//                for (var k = 0; k < num; k++) {
//                    $avatar.removeClass(colors[k]);
//                }
//                
//                var i = 0;
//                this._interval = window.setInterval(function() {
//                    for (var k = 0; k < num; k++) {
//                        $avatar.removeClass(colors[k]);
//                    }
//                    $avatar.addClass(colors[i]);
//                    i++;
//                    if (i == num) {
//                        i = 0;
//                    }
//                }, 500);
            },

            stop : function() {
//                window.clearInterval(this._interval);
//                
//                var $avatar = $('a', main.$currUser);
//                var colors = this.colors;
//                for (var k = 0; k < colors.length; k++) {
//                    $avatar.removeClass(colors[k]);
//                }
            }
        };
        // 启动现场状态切换动画
        _this.showTask.start();

        _this.cookieTask = {
            _task : null,

            start : function() {
                var _t = this;
                _t.stop();
                this._task = window.setInterval(function() {
                    if (!_this.isCookie()) {
                        _t.stop();
                        webim.client.offline(function() {});
                    }
                }, 1000);
            },

            stop : function() {
                window.clearInterval(this._task);
            }
        };

        _this.isCookie = function() {
            var currUser = webim.client.getCurrUser();
            if (!currUser || currUser.visitor == undefined) {
                return false;
            }
            if (currUser.visitor && webim.cookie('_webim_visitor_id')) {
                if (webim.cookie('ECS[user_id]')) {
                    return false;
                }
                return true;
            }
            if (!currUser.visitor && webim.cookie('ECS[user_id]')) {
                return true;
            }
            return false;
        };
    };

    webui._initListeners = function() {
        var _this = this;

        _this.onChatlinks = function(data) {};
        _this.onUnread = function(data) {};
        _this.onLogin = function() {};

        $(window).resize(function() {
            _this.main.resizable();
        });
    };

    webui.CONNECT_DELAY = 0;
    webui.connectServer = function() {
        var _this = this;
        window.setTimeout(function() {
            _this._connectServer();
        }, _this.CONNECT_DELAY);
    };

    webui._connectServer = function() {
        var _this = this;
        _this.welcomeUI.hide();
        webim.client.connectServer();
    };

    $.extend(webui, {
        _onLogin : function(ev, data) {
            var _this = this;
            _this.main.hideTips();
            _this.loginTask.start();
            _this.loginUI.$btn.hide();
            _this.loginUI.show();
        },
        _onLoginWin : function(ev, data) {
            if (this.onLoginWin) {
                this.onLoginWin();
            }
            var _this = this;
            if (webim.client.isNewUser && data != 'conn') {
                _this._chatBoxs.clear(true);
            }
            _this.main.setTitleName();
            _this.loginTask.stop();
            _this.loginUI.hide();
            var currUser = webim.client.getCurrUser();
            if (webui.mobile) {
                $('.nextalk-logo', webui.main.$header).attr('href', '/mobile');
                if (currUser.type == 'general') {
                    $('.nextalk-all-agent', webui.main.$header).show();
                }
            }
            if (currUser.type != 'general') {
                webui.main.$currUser.show();
            }
        },
        _onLoginFail : function(ev, data) {
            var _this = this, main = _this.main;
            _this.stopAllTask();
            _this.loginUI.$p.text('连接失败');
            _this.loginUI.show();
            // 界面上出现重新连接按钮
            _this.loginUI.$btn.show();
        },
        _onConnecting : function(ev, data) {
            var _this = this, main = _this.main;
            main.showConnecting();
            _this._onLogin();
        },
        _onConnected : function(ev, data) {
            var _this = this;
            var u = webim.client.getCurrUser();
            if (_this.objSuit != 'all'
                && u.type != _this.objSuit) {
                _this.chatObj = null;
            }
            if (u.type != webim.userType.GENERAL) {
                _this.chatObjs = [];
            }
            if (!_this.goods) {
                _this.goods = new webui.Goods();
            }
            _this.main.showConnected();
            _this.main.avatar();
            // 加载最近会话列表
            _this.main.loadRecently(data);
            // 加载联系人列表
            _this.main.loadBuddies();
            _this._chatBoxs.onConnected();
            _this._onLoginWin(null, 'conn');
            // 判断cookie里面是否在线
            _this.cookieTask.start();
        },
        _onDisconnected : function(ev, data) {
            var _this = this, main = _this.main;
            main.showDisconnected();
            _this.stopAllTask();
            main.avatar();
            _this._chatBoxs.clear();
            _this._onLoginFail();
            // 断开了发起重新链接
            if (webim.client.network == webim.network.AVAILABLE
                    && webim.client.connectedTimes > 0
                    && _this.isCookie()) {
                _this._connectServer();
            }
        },
        _onNetworkChange : function(ev, data) {
            var _this = this;
            if (data == webim.network.UNAVAILABLE) {
                _this.main.showNetwork();
            } else if (data == webim.network.AVAILABLE) {
                if (webim.client.connStatus == webim.connStatus.DISCONNECTED
                        && webim.client.connectedTimes > 0
                        && _this.isCookie()) {
                    _this._connectServer();
                }
            }
        },
        _onMessages : function(ev, data) {
            var _this = this, chatBoxs = _this._chatBoxs;
            for (var i = 0; i < data.length; i++) {
                var msg = data[i];
                var conv = webim.Conversation.parser(msg);
                var chatBox = chatBoxs.get(conv.type,
                                          {currUid : conv.currUid,
                                           objId   : conv.objId});
                if (chatBox) {
                    if (!chatBox.before) {
                        chatBox.before = msg.timestamp
                    }
                    if (msg.direction == webim.msgDirection.SEND) {
                        chatBox.sendHTML(msg);
                        if (chatBox.focus == true) {
                            // 设置为已读
                            webim.convMessage.read(msg);
                        }
                    } else {
                        chatBox.objName = conv.objName;
                        chatBox.objAvatar = conv.objAvatar;
                        chatBox.receiveHTML(msg);
                        if (chatBox.focus == true) {
                            // 设置为已读
                            webim.convMessage.read(msg);
                        }
                    }
                }
                // 处理会话列表
                _this.main.loadItem(conv.type, conv.currUid, conv.objId);
            }
        },
        _onStatus : function(ev, data) {
            
        },
        _onPresences : function(ev, data) {
            var _this = this;
            _this.main.trigger('presences', [ data ]);
            _this._chatBoxs.onPresences(data);
            if (_this.onChatlinks) {
                var presences = {};
                for (var i = 0; i < data.length; i++) {
                    var presence = data[i];
                    presences[presence.from] = presence.show;
                }
                _this.onChatlinks(presences);
            }
        }
    });

    webui.load = true;
})(nextalk.webim, nextalk.webui);
