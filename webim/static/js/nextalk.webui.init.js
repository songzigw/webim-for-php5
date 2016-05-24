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
        Channel    = webim.Channel,
        validate   = webim.validate,
        format     = webim.format,
        completion = webui.completion,
        Simple     = webui.Simple,
        ChatBox    = webui.ChatBox;

    /** 版本号 */
    webui.VERSION = webui.version = webui.v = "1.0.0";

    webui.mobile = false;
    webui.chatObj = null;
    webui.chatObjs = [];
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
        if (options.chatObj) {
            _this.chatObj = options.chatObj;
        }
        if (options.chatObjs) {
            _this.chatObjs = options.chatObjs;
        }
        delete options.mobile;
        delete options.chatObj;
        delete options.chatObjs;

        // 初始化webim
        webim.init(options);

        // 界面元素根节点body
        _this.$body = $('body');

        _this.welcomeUI = {
            HTML : '<div class="nextalk-page nextalk-screen-full nextalk-page-login"\
                            id="nextalk_page_init">\
                            <div class="mzen-content\
                                mzen-flex-col mzen-flex-center">\
                            <img alt="logo" src="" data-toggle="logo_index"/>\
                            <p>一起来聊聊</p></div>\
                    </div>',
            init : function() {
                var _ui = this;
                _ui.$html = webui.$(_ui.HTML).hide();
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
                            <img alt="logo" src="" data-toggle="logo_index"/>\
                            <p>正在登入中...</p>\
                            <button class="mzen-btn mzen-btn-danger">重新登入</button>\
                            </div>\
                    </div>',
            init : function() {
                var _ui = this;
                _ui.$html = webui.$(_ui.HTML).hide();
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
            onNetworkUnavailable : function(ev, data) {
                _this._onNetworkUnavailable(ev, data);
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
        };

        // 正在登入的动画效果
        _this.loginTask = {
            _interval : null,

            start : function() {
                window.clearInterval(this._interval);

                var $p = _this.loginUI.$p;
                var tit = '正在登入中...';
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
                window.clearInterval(this._interval);
                
                var $avatar = $('a', main.$currUser);
                var colors = this.colors;
                var num = colors.length;
                for (var k = 0; k < num; k++) {
                    $avatar.removeClass(colors[k]);
                }
                
                var i = 0;
                this._interval = window.setInterval(function() {
                    for (var k = 0; k < num; k++) {
                        $avatar.removeClass(colors[k]);
                    }
                    $avatar.addClass(colors[i]);
                    i++;
                    if (i == num) {
                        i = 0;
                    }
                }, 500);
            },

            stop : function() {
                window.clearInterval(this._interval);
                
                var $avatar = $('a', main.$currUser);
                var colors = this.colors;
                for (var k = 0; k < colors.length; k++) {
                    $avatar.removeClass(colors[k]);
                }
            }
        };
        // 启动现场状态切换动画
        _this.showTask.start();
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

    webui.connectServer = function() {
        var _this = this;
        window.setTimeout(function() {
            _this._connectServer();
        }, 0);
    };

    webui._connectServer = function() {
        var _this = this;
        _this.welcomeUI.hide();
        webim.client.connectServer();
    };

    $.extend(webui, {
        _onLogin : function(ev, data) {
            var _this = this;
            var main = _this.main;
            main.hideTips();

            if (webim.client.loginTimes > 0) {
                main.showConnecting();
                return;
            }

            _this.loginTask.start();
            _this.loginUI.$btn.hide();
            _this.loginUI.show();
        },
        _onLoginWin : function(ev, data) {
            if (this.onLoginWin) {
                this.onLoginWin();
            }
            var _this = this;
            _this.main.setCurrName();
            _this.loginTask.stop();
            _this.loginUI.hide();
        },
        _onLoginFail : function(ev, data) {
            var _this = this, main = _this.main;
            _this.stopAllTask();
            _this.loginUI.$p.text('登入失败');
            _this.loginUI.show();
            // 界面上出现重新登入按钮
            _this.loginUI.$btn.show();
        },
        _onConnecting : function(ev, data) {
            var _this = this, main = _this.main;
            main.showConnecting();
        },
        _onConnected : function(ev, data) {
            var _this = this;
            var main = _this.main;
            main.showConnected();
            main.setCurrName();
            main.avatar();
            // 加载最近会话列表
            webim.convMessage.list(function(convs) {
                main.loadRecently(convs);
            });
            // 加载联系人列表
            main.loadBuddies();
            // 触发状态事件
            if (_this.onChatlinks) {
                _this.onChatlinks(webim.client.presences);
            }
        },
        _onDisconnected : function(ev, data) {
            var _this = this, main = _this.main;
            main.showDisconnected();
            _this.stopAllTask();
            main.avatar();
        },
        _onNetworkUnavailable : function(ev, data) {
            var _this = this, main = _this.main;
            main.showNetwork();
            _this.stopAllTask();
            main.avatar();
        },
        _onMessages : function(ev, data) {
            var _this = this, chatBoxs = _this._chatBoxs;
            for (var i = 0; i < data.length; i++) {
                var msg = data[i];
                var chatBox;
                // 如果是自己发送出去的
                if (msg.direction == webim.msgDirection.SEND) {
                    chatBox = chatBoxs.get(msg.type, msg.to);
                    if (chatBox) {
                        chatBox.sendHTML(msg);
                        if (chatBox.focus == true) {
                            // 设置为已读
                            webim.convMessage.read(msg);
                        }
                    }
                    // 处理会话列表
                    _this.main.loadItem(msg.type, msg.to, msg);
                } else {
                    chatBox = chatBoxs.get(msg.type, msg.from);
                    if (chatBox) {
                        chatBox.receiveHTML(msg);
                        if (chatBox.focus == true) {
                            // 设置为已读
                            webim.convMessage.read(msg);
                        }
                    }
                    // 处理会话列表
                    _this.main.loadItem(msg.type, msg.from, msg);
                }
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

})(nextalk.webim, nextalk.webui);
