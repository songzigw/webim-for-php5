/**
 * 程序入口
 */
(function() {

    "use strict";

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
        channelType : 'WEBSOCKET'
    };
    main.setConfig = function(ops) {
        if (ops) {
            for (var key in ops) {
                this[key] = ops[key];
            }
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
                + _this.resPath + 'css/mzen.css" />');
        document.write('<link rel="stylesheet" type="text/css" href="'
                + _this.resPath + 'css/glyphicons.css" />');
        document.write('<link rel="stylesheet" type="text/css" href="'
                + _this.resPath + 'css/nextalk-webui.css" />');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'script/jquery.min.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'script/dropzone.min.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.util.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.channel.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.webapi.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.conversation.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.client.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.util.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.emot.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.msgtips.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.chatbox.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.simple.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webui.init.js"></script>');
        var task = window.setInterval(function() {
            if (!window.$) {
                return;
            }
            if (!window.nextalk) {
                return;
            }
            if (!nextalk.webim) {
                return;
            }
            if (!nextalk.webui) {
                return;
            }
            window.clearInterval(task);
            _this.depFlag = true;
        }, 200);
    };
    main._loadDepIframe = function() {
        var _this = this;
        document.write('<link rel="stylesheet" type="text/css" href="'
                + _this.resPath + 'css/nextalk-iframe.css" />');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk-iframe.js"></script>');
        var task = window.setInterval(function() {
            if (!window.nextalkIframe) {
                return;
            }
            window.clearInterval(task);
            _this.depFlag = true;
        }, 200);
    };
    main._loadDepHidden = function() {
        var _this = this;
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.util.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.channel.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.webapi.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.conversation.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'js/nextalk.webim.client.js"></script>');
        var task = window.setInterval(function() {
            if (!window.nextalk) {
                return;
            }
            if (!nextalk.webim) {
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
            simple : _this.simple,
            chatObj : _this.chatObj,
            chatObjs : _this.chatObjs,
            chatlinkIds : _this.chatlinkIds,
            channelType : _this.channelType
        });
        nextalk.webui.onChatlinks = _this.onChatlinks;
        nextalk.webui.onUnread = _this.onUnread;
        nextalk.webui.onLoginWin = _this.onLoginWin;
        nextalk.webui.onChatboxOpen = _this.onChatboxOpen;
        nextalk.webui.onChatboxClose = _this.onChatboxClose;
        nextalk.webui.connectServer();
    };
    main._goHidden = function() {
        var _this = this;
        nextalk.webim.WebAPI.route(_this.route);
        nextalk.webim.init({
            resPath : _this.resPath,
            apiPath : _this.apiPath,
            chatlinkIds : _this.chatlinkIds,
            channelType : _this.channelType,
            playSound : false
        });
        nextalk.webim.client.setConnStatusListener({
            onConnected : function(ev, data) {
                if (_this.onChatlinks) {
                    var c = nextalk.webim.client;
                    _this.onChatlinks(c.presences);
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
            }
        });
        nextalk.webim.client.connectServer();
    };
    main._goIframe = function() {
        var _this = this;
        main.openChatBoxUI = nextalkIframe.openChatBoxUI;
        nextalkIframe.config = {
            // 引入资源文件的根路径
            resPath : _this.resPath,
            // API根路径
            apiPath : _this.apiPath,
            // 简易聊天UI
            simple : _this.simple,
            // 默认聊天对象
            chatObj : _this.chatObj,
            chatObjs : _this.chatObjs,
            // API路由
            route : _this.route,
            chatlinkIds : _this.chatlinkIds,
            onChatlinks : _this.onChatlinks,
            channelType : _this.channelType
        };
        nextalkIframe.go();
        //delete window.nextalkMain;
    };

    var top = window.top;
    if (top != window.self) {
        // 获取父窗体中的配置
        main.setConfig(top.nextalkIframe.config);
    }

    window.nextalkMain = main;
})();

