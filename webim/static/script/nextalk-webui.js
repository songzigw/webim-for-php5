/*!
 * nextalk-webui.js v0.0.1
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

(function(IM, undefined) {

    "use strict";

    var NexTalkWebUI = function() {};
    var UI = NexTalkWebUI;
    IM.ClassEvent.on(UI);

    // ---------------------------------------

    /** 版本号 */
    UI.VERSION = UI.version = UI.v = "0.0.1";

    /** 默认配置信息 */
    UI.DEFAULTS = $.extend({}, IM.DEFAULTS, {
        // 是否是手机端
        mobile : false,
        // 简单聊天对话框
        simple : false,
        // 默认聊天对象
        chatObj : null,
        chatObjs : []
    });

    // 实例化NexTalkWebUI类对象----------------

    /** 实例化一个客户端 */
    UI._instance = undefined;
    /**
     * 获取实例化的客户端
     */
    UI.getInstance = function() {
        if (!UI._instance) {
            throw new Error("NexTalkWebUI is not initialized.");
        }
        return UI._instance;
    };

    /**
     * 初始化NexTalkWebUI
     */
    UI.init = function(options) {
        if (!UI._instance) {
            UI._instance = new UI();
        }
        UI.getInstance()._init(options);
        return UI.getInstance();
    };

    UI.$ = function(html) {
        var $h = $(html);
        var path = UI.getInstance().options.resPath;
        $('img[data-toggle=logo_index]', $h).each(function() {
            $(this).attr('src', path + 'imgs/logo.png');
        });
        $('img[data-toggle=logo]', $h).each(function() {
            $(this).attr('src', path + 'imgs/webim.72x72.png');
        });
        $('img[data-toggle=head]', $h).each(function() {
            $(this).attr('src', path + 'imgs/head_def.png');
        });
        $('img', $h).each(function(i, el) {
            $(el).error(function() {
                $(this).attr('src', IM.imgs.HEAD);
            });
        });
        return $h;
    };

    UI.prototype.version = UI.VERSION;

    UI.prototype._init = function(options) {
        var _this = this;
        options = _this.options = $.extend({}, UI.DEFAULTS, options || {});

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
                _ui.$html = UI.$(_ui.HTML).hide();
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
//      _this.welcomeUI.show();

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
                _ui.$html = UI.$(_ui.HTML).hide();
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
        
        // 定义主要的界面
        if (typeof options.simple == 'boolean'
                && options.simple) {
            _this.mainUI = new SimpleUI();
        } else {
            _this.mainUI = new MainUI();
        }
        _this.$body.append(_this.mainUI.$html);
        _this.mainUI.resizable();

        // 界面渲染完成
        // -----------------------------------------------------

        // 初始化监听器
        _this._initListeners();
        _this._initTimerTask();

        // 初始化NexTalkWebIM
        _this.webim = IM.init(options);
        _this.webim.setLoginStatusListener({
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
        _this.webim.setConnStatusListener({
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
        _this.webim.setReceiveMsgListener({
            onMessage : function(ev, data) {
                _this._onMessage(ev, data);
            },
            onPresences : function(ev, data) {
                _this._onPresences(ev, data);
            },
            onStatus : function(ev, data) {
                _this._onStatus(ev, data);
            }
        });
        
        return _this;
    };

    /**
     * 定义或开启部分定时任务
     */
    UI.prototype._initTimerTask = function() {
        var _this = this, mainUI = _this.mainUI;
        
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
                
                var $avatar = $('a', mainUI.$currUser);
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
                
                var $avatar = $('a', mainUI.$currUser);
                var colors = this.colors;
                for (var k = 0; k < colors.length; k++) {
                    $avatar.removeClass(colors[k]);
                }
            }
        };
        // 启动现场状态切换动画
        _this.showTask.start();
    };

    UI.prototype._initListeners = function() {
        var _this = this;

        _this.onChatlinks = function(data) {};
        _this.onUnread = function(data) {};
        _this.onLogin = function() {};

        _this.bind('nextalk.resizable', function(ev, data) {
            _this.mainUI.resizable();
        });
        $(window).resize(function() {
            _this.trigger('nextalk.resizable', []);
        });
    };

    UI.prototype.connectServer = function() {
        var _this = this;
        window.setTimeout(function() {
            _this._connectServer();
        }, 0);
    };

    UI.prototype._connectServer = function() {
        var _this = this;
        _this.welcomeUI.hide();
        _this.webim.connectServer();
    }

    /** 定义聊天盒子存储空间 */
    UI.prototype._chatBoxUIs = {
        // 系统通知盒子
        notification : undefined,
        // 房间聊天盒子
        room : {},
        // 私信聊天盒子
        chat : {},

        get : function(boxType, key) {
            if (boxType == ChatBoxUI.NOTIFICATION)
                return this[boxType];
            return this[boxType][key];
        },

        set : function(boxType, key, value) {
            var _this = this;
            if (boxType == ChatBoxUI.NOTIFICATION) {
                _this[boxType] = value;
                return;
            }
            _this[boxType][key] = value;
        },

        hideAll : function() {
            if (this[ChatBoxUI.NOTIFICATION]) {
                this[ChatBoxUI.NOTIFICATION].hide();
            }
            for (var key in this[ChatBoxUI.ROOM]) {
                this[ChatBoxUI.ROOM][key].hide();
            }
            for (var key in this[ChatBoxUI.CHAT]) {
                this[ChatBoxUI.CHAT][key].hide();
            }
        },
        
        onPresences : function(presences) {
            for (var key in this[ChatBoxUI.CHAT]) {
                var box = this[ChatBoxUI.CHAT][key];
                for (var i = 0; i < presences.length; i++) {
                    var presence = presences[i];
                    if (presence.from == box.id) {
                        box.trigger('presence', [ presence.show ]);
                    }
                }
            }
        }
    };

    UI.prototype.openChatBoxUI = function(boxType, id, name, avatar) {
        var _this = this;
        // 隐藏所有的盒子
        _this._chatBoxUIs.hideAll();
        var boxUI = _this._chatBoxUIs.get(boxType, id);
        if (!boxUI) {
            boxUI = new ChatBoxUI(boxType, id, name, avatar);
            _this._chatBoxUIs.set(boxType, id, boxUI);
        }
        boxUI.show();
    };

    $.extend(UI.prototype, {
        _onLogin : function(ev, data) {
            var _this = this;
            var mainUI = _this.mainUI;
            mainUI.hideTips();

            if (_this.webim.loginTimes > 0) {
                mainUI.showConnecting();
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
            _this.mainUI.setCurrName();
            _this.loginTask.stop();
            _this.loginUI.hide();
        },
        _onLoginFail : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            _this.stopAllTask();
            _this.loginUI.$p.text('登入失败');
            _this.loginUI.show();
            // 界面上出现重新登入按钮
            _this.loginUI.$btn.show();
        },
        _onConnecting : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            mainUI.showConnecting();
        },
        _onConnected : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            mainUI.showConnected();
            mainUI.setCurrName();
            mainUI.avatar();
            // 加载最近会话列表
            IM.getInstance().conversations(function(ret, err) {
                if (ret) {
                    mainUI.loadRecently(ret);
                }
            });
            // 加载联系人列表
            mainUI.loadBuddies();
            // 触发状态事件
            if (_this.onChatlinks) {
                _this.onChatlinks(_this.webim.presences);
            }
        },
        _onDisconnected : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            mainUI.showDisconnected();
            _this.stopAllTask();
            mainUI.avatar();
        },
        _onNetworkUnavailable : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            mainUI.showNetwork();
            _this.stopAllTask();
            mainUI.avatar();
        },
        _onMessage : function(ev, data) {
            var _this = this, boxUIs = _this._chatBoxUIs;
            for (var i = 0; i < data.length; i++) {
                var msg = data[i];
                var chatBoxUI;
                // 如果是自己发送出去的
                if (msg.direction == IM.msgDirection.SEND) {
                    chatBoxUI = boxUIs.get(msg.type, msg.to);
                    if (chatBoxUI) {
                        chatBoxUI.sendHTML(msg);
                        if (chatBoxUI.focus == true) {
                            // 设置为已读
                            _this.webim.setRead(msg.type, msg.to, msg);
                        }
                    }
                    // 处理会话列表
                    _this.mainUI.loadItem(msg.type, msg.to, msg);
                } else {
                    chatBoxUI = boxUIs.get(msg.type, msg.from);
                    if (chatBoxUI) {
                        chatBoxUI.receiveHTML(msg);
                        if (chatBoxUI.focus == true) {
                            // 设置为已读
                            _this.webim.setRead(msg.type, msg.from, msg);
                        }
                    }
                    // 处理会话列表
                    _this.mainUI.loadItem(msg.type, msg.from, msg);
                }
            }
        },
        _onStatus : function(ev, data) {
            
        },
        _onPresences : function(ev, data) {
            var _this = this;
            _this.mainUI.trigger('presences', [ data ]);
            _this._chatBoxUIs.onPresences(data);
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
    
    /**
     * 完整的聊天界面
     */
    var MainUI = function() {
        var _this = this;
        _this.$html = UI.$(MainUI.HTML);
        _this.$header = $('header', _this.$html);
        _this.$title = $('.mzen-title', _this.$header);
        _this.$currUser = $('.nextalk-user', _this.$header);
        _this.$contentMain = $('#nextalk_content_main', _this.$html);
        _this.$frameMessage = $('#message_wrap', _this.$html);
        _this.$frameBuddies = $('#buddies_wrap', _this.$html);
        _this.$frameSettings = $('#settings_wrap', _this.$html);

        _this.msgTipsUI = new MsgTipsUI();
        _this.$html.append(_this.msgTipsUI.$html);
        _this.$footer = $('footer', _this.$html);
        _this.handler();
        
        _this.bind('presences', function(ev, data) {
            _this._onPresences(data);
        });
    };
    IM.ClassEvent.on(MainUI);
    MainUI.HTML =  '<div class="nextalk-page" id="nextalk_page_main">\
                    <!--头部集合 BEGIN-->\
                    <header class="mzen-bar mzen-bar-nav mzen-bar-white">\
                        <a class="mzen-pull-left mzen-img nextalk-logo">\
                        <img class="mzen-img-object" src="" data-toggle="logo"/>\
                        </a>\
                        <div class="mzen-title">消息</div>\
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
                    </header>\
                    <!--头部集合 END-->\
                    <div class="nextalk-scroll" id="nextalk_content_main">\
                    <div class="mzen-content nextalk-wrap message" id="message_wrap">\
                        <ul class="mzen-list-view nextalk-message-items"></ul>\
                    </div>\
                    <div class="mzen-content nextalk-wrap buddies" id="buddies_wrap" style="display: none;">\
                        <div class="mzen-searchbar-wrap" id="nextalk_search">\
                            <div class="mzen-searchbar mzen-border-radius">\
                                <i class="mzen-iconfont mzen-icon-search"></i>\
                                <div class="mzen-searchbar-text">请输入搜索内容</div>\
                                <div class="mzen-searchbar-input">\
                                    <form>\
                                    <input type="text" placeholder="请输入搜索内容" />\
                                    </form>\
                                </div>\
                                <i class="mzen-iconfont mzen-icon-roundclosefill"></i>\
                            </div>\
                            <div class="mzen-searchbar-cancel mzen-text-info">取消</div>\
                        </div>\
                        <ul class="mzen-user-view"></ul>\
                    </div>\
                    <div class="mzen-content nextalk-wrap" id="settings_wrap" style="display: none;">\
                        <ul class="mzen-list-view">\
                            <li class="mzen-list-view-cell mzen-switch-body mzen-tap-active">\
                                <div class="mzen-switch-title">\
                                    <label>收到新消息时播放提示音</label>\
                                </div>\
                                <input type="checkbox" class="mzen-switch mzen-switch-danger mzen-pull-right" checked>\
                            </li>\
                            <li class="mzen-list-view-cell mzen-switch-body mzen-tap-active">\
                                <div class="mzen-switch-title">\
                                    <label>新消息时自动弹出聊天窗口</label>\
                                </div>\
                                <input type="checkbox" class="mzen-switch mzen-pull-right" checked>\
                            </li>\
                        </ul>\
                        <ul class="mzen-list-view">\
                            <li class="mzen-list-view-cell tap-active">\
                                <div class="mzen-arrow-right">\
                                    <p>Powered by <a href="http://nextalk.im" target="_blank">NexTalk</a> <span id="set_version">5.5</span></p>\
                                </div>\
                            </li>\
                        </ul>\
                    </div>\
                    </div>\
                    <!--底部导航 BEGIN-->\
                    <footer class="mzen-nav">\
                        <ul class="mzen-bar-tab">\
                            <li data-toggle="message" class="active">\
                                <span class="mzen-badge mzen-badge-danger"\
                                data-toggle="unreadTotal" style="display:none;"></span>\
                                <span class="mzen-iconfont mzen-icon-message"></span>\
                                <p>消息</p>\
                            </li>\
                            <li data-toggle="buddies">\
                                <span class="mzen-iconfont mzen-icon-friend"></span>\
                                <p>联系人</p>\
                            </li>\
                            <li data-toggle="settings">\
                                <span class="mzen-iconfont mzen-icon-settings"></span>\
                                <p>设置</p>\
                            </li>\
                        </ul>\
                    </footer>\
                    <!--底部导航 END-->\
                    </div>';
    MainUI.CONVERSATION = '<li class="mzen-list-view-cell mzen-img mzen-tap-active mzen-up-hover">\
                           <img class="mzen-img-object mzen-pull-left" src="">\
                           <div class="mzen-img-body mzen-arrow-right">\
                           <label data-toggle="name"></label>\
                           <em class="mzen-pull-right msg-time" data-toggle="timestamp"></em>\
                           <span class="mzen-badge mzen-badge-danger" data-toggle="notCount"></span>\
                           <p class="mzen-ellipsis-1" data-toggle="body"></p></div></li>';
    MainUI.BUDDY = '<li class="mzen-user-view-cell mzen-img mzen-up-hover">\
                    <img class="mzen-img-object mzen-pull-left" src="" />\
                    <div class="mzen-img-body mzen-arrow-right">\
                    <span data-toggle="nick"></span>\
                    <i class="nextalk-show unavailable"></i></div></li>';
    MainUI.prototype.handler = function() {
        var _this = this, ops = UI.getInstance().options;
        if (ops.mobile) {
            $('.mzen-pull-left', _this.$header).attr('href', '/mobile');
        }
        _this.$currUser.click(function() {
            $('.dropdown-menu', $(this)).slideToggle();
        });
        $('.dropdown-menu li', _this.$currUser).each(function(i, el) {
            $(el).click(function() {
                var webim = IM.getInstance();
                UI.getInstance().showTask.start();
                var show = $(el).attr('data-show');
                if (show == IM.show.UNAVAILABLE) {
                    webim.offline(function() {
                        _this.avatar();
                    });
                } else {
                    webim.online(show, function() {
                        _this.avatar();
                    });
                }
            });
        });

        $('ul.mzen-bar-tab>li', _this.$footer).each(function(i, el) {
            $(el).css({
                cursor : 'pointer'
            }).click(function() {
                _this.$frameMessage.hide();
                _this.$frameBuddies.hide();
                _this.$frameSettings.hide();
                $('ul.mzen-bar-tab>li', _this.$footer).each(function() {
                    $(this).removeClass('active');
                });

                var tit = $('.mzen-title', _this.$header);
                var tog = $(this).attr('data-toggle');
                if (tog == 'message') {
                    $(this).addClass('active');
                    tit.text('消息');
                    _this.$frameMessage.show();
                } else if (tog == 'buddies') {
                    $(this).addClass('active');
                    tit.text('联系人');
                    _this.$frameBuddies.show();
                } else if (tog == 'settings') {
                    $(this).addClass('active');
                    tit.text('设置');
                    _this.$frameSettings.show();
                }
            });
        });

        _this.$items = $('.nextalk-message-items',
                _this.$frameMessage).empty();
        _this.$contentMain.css({
            'background-color' : 'white',
            'overflow' : 'auto'
        });

        //$('.nextalk-buddies-items',
        //        _this.$frameBuddies).empty();
        $('#set_version', _this.$frameSettings).text(UI.v);
    };
    MainUI.prototype.avatar = function() {
        var _this = this;
        var webim = IM.getInstance();
        var webui = UI.getInstance();
        var show = webim.getShow();

        if (webim.connStatus == IM.connStatus.CONNECTED) {
            var u = webim.getCurrUser();
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
    MainUI.prototype.setCurrName = function() {
        var webim = IM.getInstance();
        var u = webim.getCurrUser();
        this.$title.text(u.nick);
    };
    MainUI.prototype.itemHTML = function() {
        var $item = UI.$(MainUI.CONVERSATION);
        if (arguments.length == 1) {
            var conv = arguments[0];
            $item.attr('data-toggle', conv.type);
            $item.attr('data-id', conv.oid);
            $item.attr('data-name', conv.name);
            $('img', $item).attr('src', conv.avatar);
            $('[data-toggle=name]', $item).text(conv.name);
            $('[data-toggle=body]', $item).text(conv.body);
            if (conv.updated) {
                var time = new IM.Date(conv.updated);
                var tStr = null;
                if (time.getDate() != (new IM.Date()).getDate()) {
                    tStr = time.format('yyyy-MM-dd');
                } else {
                    tStr = time.format('hh:mm:ss');
                }
                $('[data-toggle=timestamp]', $item).text(tStr);
            }
            $('[data-toggle=notCount]', $item).remove();
        } else if (arguments.length == 2) {
            var dInfo = arguments[0];
            var body = arguments[1];
            $item.attr('data-toggle', dInfo.msgType);
            $item.attr('data-id', dInfo.other);
            $item.attr('data-name', dInfo.name);
            $('img', $item).attr('src', dInfo.avatar);
            $('[data-toggle=name]', $item).text(dInfo.name);
            $('[data-toggle=body]', $item).text(body);
            var time = new Date();
            time.setTime(dInfo.timestamp);
            var tStr = time.format('hh:mm:ss');
            $('[data-toggle=timestamp]', $item).text(tStr);
            if (dInfo.notCount != 0) {
                $('[data-toggle=notCount]', $item).text(dInfo.notCount);
            } else {
                $('[data-toggle=notCount]', $item).remove();
            }
        }
        return $item;
    };
    MainUI.prototype.resizable = function() {
        var _this = this, $html = this.$html;
        var webui = UI.getInstance();
        var mobile = webui.options.mobile;

        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();

        if (!mobile) {
            if (ww <= 320) {
                $html.css('width', '100%');
            } else {
                $html.width(240);
            }
        } else {
            $html.css('width', '100%');
        }

        var hh = _this.$header.height();
        var fh = _this.$footer.height();
        _this.$contentMain.height(wh - hh - fh);
    };
    MainUI.prototype.itemsClick = function($items) {
        var webui = UI.getInstance();
        if (!$items) {
            $items = this.$items;
        }

        $('>li', $items).each(function(i, el) {
            var item = $(el);
            if (item.data('events')
                    && item.data('events')['click'])
                return;

            // 点击启动一个新的聊天盒子
            item.click(function() {
                    var imgSrc = item.find('img').attr(
                            'src');
                    if (item.attr('data-toggle') == ChatBoxUI.NOTIFICATION) {
                        webui.openChatBoxUI(
                                ChatBoxUI.NOTIFICATION,
                                ChatBoxUI.NOTIFICATION,
                                IM.name.NOTIFICATION,
                                imgSrc);
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
    MainUI.prototype.loadItem = function(msgType, other, msg) {
        var _this = this, webim = IM.getInstance();
        var $items = _this.$items;

        $('>li', $items).each(
                function(i, el) {
                    var $el = $(el);
                    if ($el.attr('data-toggle') == msgType
                            && $el.attr('data-id') == other) {
                        $el.remove();
                        // break
                        return false;
                    }
                });
        var dInfo = webim.getDialogInfo(msgType, other);
        _this.itemHTML(dInfo, msg.body).prependTo($items);

        // 设置底部的未读数据
        _this.showUnreadTotal();
        _this.itemsClick();
    };
    MainUI.prototype.loadRecently = function(conversations) {
        var _this = this, webim = IM.getInstance();
        var webui = UI.getInstance();
        var ops = webui.options;
        var $items = _this.$items.empty();

        if (conversations && conversations.length > 0) {
            for (var i = 0; i < conversations.length; i++) {
                $items.append(_this.itemHTML(conversations[i]));
            }
        }
        if (webim.connectedTimes == 1 && ops.chatObj) {
            $('>li', $items).each(
                    function(i, el) {
                        var $el = $(el);
                        if ($el.attr('data-toggle') == IM.msgType.CHAT
                                && $el.attr('data-id') == ops.chatObj.id) {
                            $el.remove();
                            // break
                            return false;
                        }
                    });
            _this.itemHTML({
                type : ChatBoxUI.CHAT,
                oid : ops.chatObj.id,
                name : ops.chatObj.name,
                avatar : ops.chatObj.avatar,
                body : '开始聊天'
            }).prependTo($items);
            webui.openChatBoxUI(ChatBoxUI.CHAT, ops.chatObj.id,
                    ops.chatObj.name, ops.chatObj.avatar);
        }
        _this.itemsClick();
    };
    MainUI.prototype.loadBuddies = function() {
        var _this = this, webim = IM.getInstance();
        var $items = _this.$frameBuddies
            .find('.mzen-user-view').empty();

        var buddies = webim.getBuddies();
        if (buddies && buddies.length > 0) {
            for (var i = 0; i < buddies.length; i++) {
                $items.append(_this.buddyHTML(buddies[i]));
            }
        }
        _this.itemsClick($items);
    };
    MainUI.prototype.buddyHTML = function(user) {
        var $item = UI.$(MainUI.BUDDY);
        $item.attr('data-toggle', ChatBoxUI.CHAT);
        $item.attr('data-id', user.id);
        $item.attr('data-name', user.nick);
        $('img', $item).attr('src', user.avatar);
        $('[data-toggle=nick]', $item).text(user.nick);
        $('i', $item).removeClass('unavailable');
        if (user.show == IM.show.AVAILABLE) {
            $('i', $item).addClass('available');
        }
        if (user.show == IM.show.DND) {
            $('i', $item).addClass('dnd');
        }
        if (user.show == IM.show.AWAY) {
            $('i', $item).addClass('away');
        }
        if (user.show == IM.show.INVISIBLE) {
            $('i', $item).addClass('invisible');
        }
        if (user.show == IM.show.CHAT) {
            $('i', $item).addClass('chat');
        }
        if (user.show == IM.show.UNAVAILABLE) {
            $('i', $item).addClass('unavailable');
        }
        return $item;
    };
    MainUI.prototype.showUnreadTotal = function() {
        var webui = UI.getInstance();
        var webim = IM.getInstance();
        var total = webim.getUnreadTotal();
        var $not = $('[data-toggle=unreadTotal]', this.$footer);
        if (total == 0) {
            $not.hide();
        } else {
            $not.show().text(total);
        }
        if (webui.onUnread) {
            webui.onUnread(total);
        }
    };
    MainUI.prototype.showTipsTask = undefined;
    MainUI.prototype.showConnecting = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTipsUI.show('正在连接...', 'mzen-tips-info');
    };
    MainUI.prototype.showConnected = function() {
        var _this = this;
        window.clearTimeout(_this.showTipsTask);
        _this.msgTipsUI.show('连接成功...', 'mzen-tips-success');
        _this.showTipsTask = setTimeout(function() {
            _this.hideTips();
        }, 5000);
    };
    MainUI.prototype.showDisconnected = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTipsUI.show('连接断开...', 'mzen-tips-danger');
    };
    MainUI.prototype.showNetwork = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTipsUI.show('网络不可用...', 'mzen-tips-danger');
    };
    MainUI.prototype.hideTips = function() {
        this.msgTipsUI.hide();
    };
    MainUI.prototype._onPresences = function(presences) {
        $('li[data-toggle="chat"]' , this.$html).each(function(i, el) {
            var $el = $(el);
            for (var i = 0; i < presences.length; i++) {
                var presence = presences[i];
                if (presence.from == $el.attr('data-id')) {
                    $el.attr('data-show', presence.show);
                    var colors = ['available', 'dnd', 'away',
                              'invisible', 'chat', 'unavailable'];
                    var $show = $('i.nextalk-show', $el);
                    for (var k = 0; k < colors.length; k++) {
                        $show.removeClass(colors[k]);
                    }
                    $show.addClass(presence.show);
                    break;
                }
            }
        });
    };

    /**
     * 简单的聊天界面
     */
    var SimpleUI = function() {
        var _this = this;
        _this.$html = UI.$(SimpleUI.HTML);
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
    IM.ClassEvent.on(SimpleUI);
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
        var _this = this, ops = UI.getInstance().options;
        if (ops.mobile) {
            $('.mzen-pull-left', _this.$header).attr('href', '/mobile');
        }
        _this.$currUser.click(function() {
            $('.dropdown-menu', $(this)).slideToggle();
        });
        //_this.$currUser.find('ul').css('right', 'initial');
        $('.dropdown-menu li', _this.$currUser).each(function(i, el) {
            $(el).click(function() {
                var webim = IM.getInstance();
                UI.getInstance().showTask.start();
                var show = $(el).attr('data-show');
                if (show == IM.show.UNAVAILABLE) {
                    webim.offline(function() {
                        _this.avatar();
                    });
                } else {
                    webim.online(show, function() {
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
        var webim = IM.getInstance();
        var webui = UI.getInstance();
        var show = webim.getShow();

        if (webim.connStatus == IM.connStatus.CONNECTED) {
            var u = webim.getCurrUser();
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
        var webim = IM.getInstance();
        var u = webim.getCurrUser();
        this.$title.text(u.nick);
    };
    SimpleUI.prototype.itemHTML = function() {
        var $item = UI.$(SimpleUI.CONVERSATION);
        if (arguments.length == 1) {
            var conv = arguments[0];
            $item.attr('data-toggle', conv.type);
            $item.attr('data-id', conv.oid);
            $item.attr('data-name', conv.name);
            $('img', $item).attr('src', conv.avatar);
            $('p', $item).text(conv.name);
            $('span', $item).remove();
        } else if (arguments.length == 2) {
            var dInfo = arguments[0];
            var body = arguments[1];
            $item.attr('data-toggle', dInfo.msgType);
            $item.attr('data-id', dInfo.other);
            $item.attr('data-name', dInfo.name);
            $('img', $item).attr('src', dInfo.avatar);
            $('p', $item).text(dInfo.name);
            if (dInfo.notCount != 0) {
                $('span', $item).text(dInfo.notCount);
            } else {
                $('span', $item).remove();
            }
        }
        return $item;
    };
    SimpleUI.prototype.resizable = function() {
        var _this = this, $html = this.$html;
        var webui = UI.getInstance();
        var mobile = webui.options.mobile;
        
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
        var webui = UI.getInstance();
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
                if (item.attr('data-toggle') == ChatBoxUI.NOTIFICATION) {
                    webui.openChatBoxUI(ChatBoxUI.NOTIFICATION,
                            ChatBoxUI.NOTIFICATION,
                            IM.name.NOTIFICATION, imgSrc);
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
    SimpleUI.prototype.loadItem = function(msgType, other, msg) {
        var _this = this, webim = IM.getInstance();
        var $items = _this.$items;

        $('>li', $items).each(function(i, el) {
            var $el = $(el);
            if ($el.attr('data-toggle') == msgType
                    && $el.attr('data-id') == other) {
                $el.remove();
                // break
                return false;
            }
        });
        var dInfo = webim.getDialogInfo(msgType, other);
        _this.itemHTML(dInfo, msg.body).prependTo($items);

        // 设置底部的未读数据
        _this.showUnreadTotal();
        _this.itemsClick();
    };
    SimpleUI.prototype.loadRecently = function(conversations) {
        var _this = this, webim = IM.getInstance();
        var webui = UI.getInstance();
        var ops = webui.options;
        var $items = _this.$items.empty();
        
        if (conversations && conversations.length > 0) {
            for (var i = 0; i < conversations.length; i++) {
                $items.append(_this.itemHTML(conversations[i]));
            }
        }
        if (webim.connectedTimes == 1 && ops.chatObjs) {
            for (var i = 0; i < ops.chatObjs.length; i++) {
                var chatObj = ops.chatObjs[i];
                $('>li', $items).each(function(i, el) {
                    var $el = $(el);
                    if ($el.attr('data-toggle') == IM.msgType.CHAT
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
        if (webim.connectedTimes == 1 && ops.chatObj) {
            $('>li', $items).each(function(i, el) {
                var $el = $(el);
                if ($el.attr('data-toggle') == IM.msgType.CHAT
                        && $el.attr('data-id') == ops.chatObj.id) {
                    $el.remove();
                    // break
                    return false;
                }
            });
            _this.itemHTML({
                type : ChatBoxUI.CHAT,
                oid : ops.chatObj.id,
                name : ops.chatObj.name,
                avatar : ops.chatObj.avatar,
                body : '开始聊天'
            }).prependTo($items);
            webui.openChatBoxUI(ChatBoxUI.CHAT, ops.chatObj.id,
                    ops.chatObj.name, ops.chatObj.avatar);
        }
        if ($('>li', $items).length === 0) {
            IM.WebAPI.getInstance().agents_random(null, function(ret, err) {
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
        var webui = UI.getInstance();
        var webim = IM.getInstance();
        var total = webim.getUnreadTotal();
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

    /**
     * 各种消息提示条
     */
    var MsgTipsUI = function() {
        var _this = this;
        _this.$html = UI.$(MsgTipsUI.HTML);
        _this.$html.hide();
    };
    MsgTipsUI.HTML = '<div class="mzen-tips mzen-tips-info nextalk-msg-tips">\
                        <div class="mzen-tips-content mzen-ellipsis-1">\
                            <i class="mzen-iconfont mzen-icon-warnfill"></i>\
                            <span>???</span>\
                        </div>\
                      </div>';
    MsgTipsUI.CLASSES = ['mzen-tips-danger',
                         'mzen-tips-info',
                         'mzen-tips-success'];
    MsgTipsUI.prototype.show = function(title, cla) {
        var _this = this, $html = _this.$html;
        var claes = MsgTipsUI.CLASSES;
        
        for (var i = 0; i < claes.length; i++) {
            $html.removeClass(claes[i]);
        }
        
        $('span', $html).text(title);
        $html.addClass(cla);
        $html.show();
    };
    MsgTipsUI.prototype.hide = function() {
        this.$html.hide();
    };

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

        var $body = UI.getInstance().$body;
        var $html = UI.$(ChatBoxUI.HTML);
        _this.$html = $html;
        
        _this.msgTipsUI = new MsgTipsUI();
        _this.$html.append(_this.msgTipsUI.$html);

        _this.emotUI = new EmotUI();
        var $textarea = $('footer .nextalk-form textarea', $html);
        $textarea.on('focus', function(ev) {
            _this.emotUI.hide();
        });
        _this.emotUI.callback = function(emot) {
            $textarea.val($textarea.val() + emot);
            $textarea.focus();
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
        UI.getInstance().bind('nextalk.resizable',
                function(ev, data) {
                    _this.resizable();
        });
    };
    IM.ClassEvent.on(ChatBoxUI);

    // 聊天盒子类型
    ChatBoxUI.NOTIFICATION = IM.msgType.NOTIFICATION;
    ChatBoxUI.CHAT = IM.msgType.CHAT;
    ChatBoxUI.ROOM = IM.msgType.ROOM;
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
        var webui = UI.getInstance();
        var mobile = webui.options.mobile;
        var simple = webui.options.simple;

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
        var webui = UI.getInstance();
        if (webui.onChatboxOpen) {
            webui.onChatboxOpen();
        }
        
        if (show) {
            if (show != IM.show.UNAVAILABLE) {
                _this.showOnline();
            } else {
                _this.showUnline();
            }
        }

        _this.resizable();
        _this.toBottom();

        var webim = IM.getInstance();
        var webui = UI.getInstance();
        var dInfo = webim.getDialogInfo(_this.type, _this.id);
        if (!dInfo) {
            //return;
        }
        // 去除红色的未读数据
        var record = webim.readAll(_this.type, _this.id);
        var $items = webui.mainUI.$items;
        $('>li', $items).each(function(i, el) {
            var $el = $(el);
            if ($el.attr('data-toggle') == _this.type
                    && $el.attr('data-id') == _this.id) {
                if (dInfo && dInfo.notCount > 0) {
                    $el.find('span.mzen-badge-danger').text(dInfo.notCount);
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
        var currUser = webim.getCurrUser();
        var history = webim.history;
        history.load(_this.type, _this.id, function(ret, err) {
            if (ret) {
                for (var i = 0; i < ret.length; i++) {
                    var msg = ret[i];
                    if (msg.from == currUser.id) {
                        msg.direction = IM.msgDirection.SEND;
                        msg.avatar = currUser.avatar;
                    } else {
                        msg.direction = IM.msgDirection.RECEIVE;
                        msg.avatar = _this.avatar;
                    }
                }
                if (ret.length == 0) {
                    for (var i = 0, len = record.length; i < len; i++) {
                        var msg = record[i];
                        if (msg.direction == IM.msgDirection.SEND) {
                            _this.sendHTML(msg);
                        } else {
                            _this.receiveHTML(msg);
                        }
                    }
                } else {
                    for (var i = 0, len = ret.length; i < len; i++) {
                        var msg = ret[i];
                        if (msg.direction == IM.msgDirection.SEND) {
                            _this.sendHTML(msg);
                        } else {
                            _this.receiveHTML(msg);
                        }
                    }
                }
            }
            // 发送默认消息
            var ops = webui.options;
            if (ops.chatObj 
                    && ops.chatObj.id == _this.id
                    && ops.chatObj.body) {
                if (!ops.chatObj.body_type) {
                    _this.sendMsg(ops.chatObj.body);
                } else {
                    var body = {
                        type : ops.chatObj.body_type,
                        body : ops.chatObj.body
                    };
                    _this.sendMsg(IM.JSON.stringify(body));
                }
            }
        });
    };
    ChatBoxUI.prototype.hide = function() {
        var _this = this;
        _this.$html.hide();
        _this.focus = false;
        var webui = UI.getInstance();
        if (webui.onChatboxClose) {
            webui.onChatboxClose();
        }
    };
    ChatBoxUI.prototype.receiveHTML = function(msg) {
        var _this = this;
        var $receive = UI.$(ChatBoxUI.RECEIVE);
        var time = new IM.Date();
        time.setTime(msg.timestamp);
        var tStr = null;
        if (time.getDate() != (new IM.Date()).getDate()) {
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
                var data = IM.JSON.parse(msg.body);
                if (typeof data !== 'object') {
                    throw new Error();
                }
                if (data.type == 1) {
                    $receive.find('.body').html("正在加载中...");
                    IM.WebAPI.getInstance().house(
                            {id : data.body},
                            function(ret, err) {
                                if (ret) {
                                    var m = UI.getInstance().options.mobile;
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
        var $send = UI.$(ChatBoxUI.SEND);
        var time = new IM.Date();
        time.setTime(msg.timestamp);
        var tStr = null;
        if (time.getDate() != (new IM.Date()).getDate()) {
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
                var data = IM.JSON.parse(msg.body);
                if (typeof data !== 'object') {
                    throw new Error();
                }
                if (data.type == 1) {
                    $send.find('.body').html("正在加载中...");
                    IM.WebAPI.getInstance().house(
                            {id : data.body},
                            function(ret, err) {
                                if (ret) {
                                    var m = UI.getInstance().options.mobile;
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
        var _this = this, webim = IM.getInstance();
        var webui = UI.getInstance();
        
        var msg = _this.message(body);
        _this.sendHTML(msg);
        webim.sendMessage(msg);
        // 处理会话列表
        webui.mainUI.loadItem(msg.type, msg.to, msg);
    };
    ChatBoxUI.prototype.message = function(body) {
        var _this = this, webim = IM.getInstance();
        var currUser = webim.getCurrUser();

        var msg = {
            type : _this.type,
            from : currUser.id,
            nick : currUser.nick,
            avatar : currUser.avatar,
            to : _this.id,
            to_nick : _this.name,
            to_avatar : _this.avatar,
            body : body,
            timestamp : IM.nowStamp()
        };
        return msg;
    }
    ChatBoxUI.prototype.handleHTML = function() {
        var _this = this, $html = _this.$html;
        var ops = UI.getInstance().options;

        if (_this.type == ChatBoxUI.NOTIFICATION) {
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
            url: ops.apiPath + "upload-file.php",
            paramName: 'file',
            maxFiles: 5,
            maxFilesize: 10,
            acceptedFiles: "image/*",
            addedfile: function(file) {
                window.file = file;
                var data = {
                        type : 2,
                        body : ops.resPath + 'imgs/loading_more.gif',
                };
                var msg = _this.message(IM.JSON.stringify(data));
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
                    var msg = _this.message(IM.JSON.stringify(data));
                    IM.getInstance().sendMessage(msg);
                    // 处理会话列表
                    UI.getInstance().mainUI.loadItem(msg.type, msg.to, msg);
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
        if (show != IM.show.UNAVAILABLE) {
            this.showOnline();
        } else {
            this.showUnline();
        }
    };

    function isUrl(str) {
        return /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"])*$/.test(str);
    }

    var EmotUI = function() {
        var webui = UI.getInstance();
        var _this = this;
        this.$html = $(EmotUI.HTML);
        this.hide();
        var $hUl = $('<ul></ul>');
        for (var i = 0; i < EmotUI.ICON.length; i++) {
            var icon = EmotUI.ICON[i];
            icon.path = webui.options.resPath;
            var $hLi = $(completion(EmotUI.H_IMG, icon));
            $('img', $hLi).on('click', function(ev) {
                ev.preventDefault();
                _this.callback($(this).attr('data-text'));
                _this.hide();
            });
            $hUl.append($hLi);
        }
        this.$html.append($hUl);
    };
    EmotUI.HTML = '<div class="nextalk-emot"></div>';
    EmotUI.H_IMG = '<li><img src="{{path}}imgs/emot/{{image}}" title="{{title}}" data-text="{{text}}"/></li>';
    EmotUI.ICON = [ {
        "image" : "default/smile.png",
        "title" : "smile",
        "text" : "[smile]"
    }, {
        "image" : "default/smile-big.png",
        "title" : "smile_big",
        "text" : "[smile_big]"
    }, {
        "image" : "default/sad.png",
        "title" : "wink",
        "text" : "[wink]"
    }, {
        "image" : "default/wink.png",
        "title" : "wink",
        "text" : "[wink]"
    }, {
        "image" : "default/tongue.png",
        "title" : "tongue",
        "text" : "[tongue]"
    }, {
        "image" : "default/shock.png",
        "title" : "shock",
        "text" : "[shock]"
    }, {
        "image" : "default/kiss.png",
        "title" : "kiss",
        "text" : "[kiss]"
    }, {
        "image" : "default/glasses-cool.png",
        "title" : "glasses_cool",
        "text" : "[glasses-cool]"
    }, {
        "image" : "default/embarrassed.png",
        "title" : "embarrassed",
        "text" : "[embarrassed]"
    }, {
        "image" : "default/crying.png",
        "title" : "crying",
        "text" : "[crying]"
    }, {
        "image" : "default/thinking.png",
        "title" : "thinking",
        "text" : "[thinking]"
    }, {
        "image" : "default/angel.png",
        "title" : "angel",
        "text" : "[angel]"
    }, {
        "image" : "default/shut-mouth.png",
        "title" : "shut_mouth",
        "text" : "[shut-mouth]"
    }, {
        "image" : "default/moneymouth.png",
        "title" : "moneymouth",
        "text" : "[moneymouth]"
    }, {
        "image" : "default/foot-in-mouth.png",
        "title" : "foot_in_mouth",
        "text" : "[foot-in-mouth]"
    }, {
        "image" : "default/shout.png",
        "title" : "shout",
        "text" : "[shout]"
    } ];
    EmotUI.trans = function(body) {
        var path = UI.getInstance().options.resPath;;
        var reg = /\[(.*?)\]/gm;
        var str = body.replace(reg, function(match) {
            for (var i = 0; i < EmotUI.ICON.length; i++) {
                var icon = EmotUI.ICON[i];
                if (icon.text === match) {
                    return '<img width="24" height="24" ' 
                        + 'src="' + path + 'imgs/emot/'
                        + icon.image + '" />';
                }
            }
            return match;
        });
        return str;
    };
    EmotUI.prototype.show = function() {
        this.$html.show();
    };
    EmotUI.prototype.hide = function() {
        this.$html.hide();
    };

    var completion = function(str, data) {
        var reg = /\{{2}(.*?)\}{2}/gm;
        var trim = /^\{{2}\s*|\s*\}{2}$/g;
        var newStr = str.replace(reg, function(match) {
            var key = match.replace(trim, "");
            return data[key];
        });
        return newStr;
    }
    window.NexTalkWebUI = UI;
})(NexTalkWebIM);
