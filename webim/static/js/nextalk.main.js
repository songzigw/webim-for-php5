/*!
 * nextalk.main.js v1.0.0
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

if (!window.nextalk) {
    window.nextalk = {};
}

/**
 * 程序入口
 */
(function(nextalk) {

    "use strict";

    nextalk.v = '1.0.5';
    var main = {
        // 通信令牌 暂时不用
        // ticket : 'ticket',
        // APP_KEY 暂时不用
        // appKey : 'app_key',
        // 是否是隐藏式运行
        hidden : false,
        // 以iframe嵌入网页右下角
        iframe : false,
        // 是否是手机端
        mobile : false,
        // 简单聊天对话框
        simple : false,
        // 引入资源文件的根路径
        resPath : '/',
        // API根路径
        apiPath : '/',
        // API路由
        route : {},
        // 默认聊天对象
        chatObj : null,
        chatObjs : [],
        chatlinkIds : null,
        onChatlinks : null,
        onUnread : null,
        onLoginWin : null,
        channelType : 'WEBSOCKET',
        playSound : false,
        receive : false,
        loadHisConv : true
    };
    main.setConfig = function(ops) {
        if (ops) {
            for (var key in ops) {
                if (ops[key] !== undefined) {
                    this[key] = ops[key];
                }
            }
        }
        if (this.hidden) {
            this.iframe = false;
        }
        if (this.version) {
            nextalk.v = this.version;
        }
    };
    // 依赖包是否加载完成
    main.depFlag = false;
    main._loadDep = function() {
        var _this = this;

        if (typeof _this.hidden == 'boolean'
            && _this.hidden == true) {
            _this._loadDepHidden();
            return;
        }
        if (typeof _this.iframe == 'boolean'
            && _this.iframe == true) {
            _this._loadDepIframe();
            return;
        }

        _this._loadDepMail();
    };
    main._loadDepMail = function() {
        var _this = this;
        document.write('<link rel="stylesheet" type="text/css" href="'
                + _this.resPath + 'css/mzen.css?v=' + nextalk.v + '" />');
        document.write('<link rel="stylesheet" type="text/css" href="'
                + _this.resPath + 'css/glyphicons.css?v=' + nextalk.v + '" />');
        document.write('<link rel="stylesheet" type="text/css" href="'
                + _this.resPath + 'css/nextalk-webui.css?v=' + nextalk.v + '" />');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'script/jquery.min.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'script/dropzone.min.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.util.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.channel.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.webapi.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.model.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.conversation.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.client.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.util.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.emot.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.msgtips.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.chatbox.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.simple.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.goods.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.init.js?v=' + nextalk.v + '"></script>');
        var task = window.setInterval(function() {
            if (!window.$) {
                return;
            }
            if (!nextalk.webim || !nextalk.webim.load) {
                return;
            }
            if (!nextalk.webui || !nextalk.webui.load) {
                return;
            }
            window.clearInterval(task);
            _this.depFlag = true;
        }, 200);
    };
    main._loadDepIframe = function() {
        var _this = this;
        document.write('<link rel="stylesheet" type="text/css" href="'
                + _this.resPath + 'css/nextalk-iframe.css?v=' + nextalk.v + '" />');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.iframe.js?v=' + nextalk.v + '"></script>');
        var task = window.setInterval(function() {
            if (!nextalk.iframe) {
                return;
            }
            window.clearInterval(task);
            _this.depFlag = true;
        }, 200);
    };
    main._loadDepHidden = function() {
        var _this = this;
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.util.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.channel.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.webapi.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.model.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.conversation.js?v=' + nextalk.v + '"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.client.js?v=' + nextalk.v + '"></script>');
        var task = window.setInterval(function() {
            if (!nextalk.webim || !nextalk.webim.load) {
                return;
            }
            window.clearInterval(task);
            _this.depFlag = true;
        }, 200);
    };
    main.go = function() {
        this._loadDep();
        var _this = this;
        var task = window.setInterval(function() {
            if (_this.depFlag) {
                window.clearInterval(task);
                _this._go()
            }
        }, 200);
    };
    main._go = function() {
        var _this = this;
        if (typeof _this.iframe == 'boolean'
            && _this.iframe == true) {
            _this._goIframe();
        } else if (typeof _this.hidden == 'boolean'
            && _this.hidden == true) {
            _this._goHidden();
        } else {
            _this._goMain();
        }
    };
    main._goMain = function() {
        var _this = this;
        nextalk.webim.WebAPI.route(_this.route);
        nextalk.webui.init({
            resPath : _this.resPath,
            apiPath : _this.apiPath,
            mobile : _this.mobile,
            //simple : _this.simple,
            iframe : _this.isIframe,
            chatObj : _this.chatObj,
            chatObjs : _this.chatObjs,
            chatlinkIds : _this.chatlinkIds,
            channelType : _this.channelType,
            loadHisConv : _this.loadHisConv,
            objSuit     : _this.objSuit
        });
        nextalk.webui.onChatlinks = _this.onChatlinks;
        nextalk.webui.onUnread = _this.onUnread;
        nextalk.webui.onLoginWin = _this.onLoginWin;
        nextalk.webui.onChatboxOpen = _this.onChatboxOpen;
        nextalk.webui.onChatboxClose = _this.onChatboxClose;
        nextalk.webui.onClickCloseIframe = _this.onClickCloseIframe;
        nextalk.webui.connectServer();
    };
    main._goHidden = function() {
        var _this = this;
        var isCookie = function() {
            var currUser = nextalk.webim.client.getCurrUser();
            if (!currUser || currUser.visitor == undefined) {
                return false;
            }
            if (currUser.visitor && nextalk.webim.cookie('_webim_visitor_id')) {
                if (nextalk.webim.cookie('ECS[user_id]')) {
                    return false;
                }
                return true;
            }
            if (!currUser.visitor && nextalk.webim.cookie('ECS[user_id]')) {
                return true;
            }
            return false;
        };
        var cookieTask = {
            _task : null,
            start : function() {
                var _t = this;
                _t.stop();
                this._task = window.setInterval(function() {
                    if (!isCookie()) {
                        _t.stop();
                        nextalk.webim.client.offline(function(){});
                    }
                }, 1000);
            },
            stop : function() {
                window.clearInterval(this._task);
            }
        };
        nextalk.webim.WebAPI.route(_this.route);
        nextalk.webim.init({
            resPath : _this.resPath,
            apiPath : _this.apiPath,
            chatlinkIds : _this.chatlinkIds,
            channelType : _this.channelType,
            playSound : _this.playSound,
            receive : _this.receive
        });
        nextalk.webim.client.setLoginStatusListener({
            onLogin : function(ev, data) {
                
            },
            onLoginWin : function(ev, data) {
                
            },
            onLoginFail : function(ev, data) {
                cookieTask.stop();
                if (nextalk.webim.client.network == nextalk.webim.network.AVAILABLE
                        && nextalk.webim.client.connectedTimes > 0
                        && isCookie()) {
                    nextalk.webim.client.connectServer();
                }
            }
        });
        nextalk.webim.client.setConnStatusListener({
            onConnecting : function(ev, data) {
                
            },
            onConnected : function(ev, data) {
                cookieTask.start();
            },
            onDisconnected : function(ev, data) {
                cookieTask.stop();
                if (nextalk.webim.client.network == nextalk.webim.network.AVAILABLE
                        && nextalk.webim.client.connectedTimes > 0
                        && isCookie()) {
                    nextalk.webim.client.connectServer();
                }
            },
            onNetworkChange : function(ev, data) {
                if (data == nextalk.webim.network.AVAILABLE) {
                    if (nextalk.webim.client.connStatus == nextalk.webim.connStatus.DISCONNECTED
                            && nextalk.webim.client.connectedTimes > 0
                            && isCookie()) {
                        nextalk.webim.client.connectServer();
                    }
                }
            }
        });
        nextalk.webim.client.setReceiveMsgListener({
            onPresences : function(ev, data) {
                if (_this.onChatlinks) {
                    var presences = {};
                    for (var i = 0; i < data.length; i++) {
                        var presence = data[i];
                        presences[presence.from] = presence.show;
                    }
                    _this.onChatlinks(presences);
                }
            },
            onMessages : function(ev, data) {
                var unread = nextalk.webim.convMessage.unreadTotal;
                if (_this.onUnread) {
                    _this.onUnread(unread);
                }
            }
        });
        nextalk.webim.client.connectServer();
    };
    main._goIframe = function() {
        var _this = this;
        _this.openChatBoxUI = nextalk.iframe.openChatBoxUI;
        nextalk.iframe.config = {
            // 引入资源文件的根路径
            resPath : _this.resPath,
            // API根路径
            apiPath : _this.apiPath,
            // 简易聊天UI
            simple : _this.simple,
            isIframe : _this.iframe,
            // 默认聊天对象
            chatObj : _this.chatObj,
            chatObjs : _this.chatObjs,
            // API路由
            route : _this.route,
            chatlinkIds : _this.chatlinkIds,
            onChatlinks : _this.onChatlinks,
            channelType : _this.channelType,
            version : _this.version
        };
        nextalk.iframe.go();
        //delete nextalk.main;
    };

    var top = window.top;
    if (top != window.self) {
        // 获取父窗体中的配置
        main.setConfig(top.nextalk.iframe.config);
    }

    nextalk.main = main;
})(nextalk);

