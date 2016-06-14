/*!
 * nextalk.iframe.js v1.0.0
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

if (!window.nextalk) {
    window.nextalk = {};
}

(function(nextalk) {

    "use strict";

    var iframe = {
        config : {
            // 通信令牌 暂时不用
            //ticket : 'ticket',
            // APP_KEY 暂时不用
            //appKey : 'app_key',
            // 引入资源文件的根路径
            resPath : '/src/',
            // API根路径
            apiPath : '/',
            // API路由
            route : {}
        },
        // Iframe 宽高
        panel : {
            width : 690,
            height : 450
        },
        $ : undefined
    };

    iframe._getBtnHTML = function() {
        var btnHTML = '<div class="nextalk-main" id="nextalk_main">'
                + '<a class="nextalk-btn">' + '<img class="nextalk-ico" src="'
                + this.config.resPath + 'imgs/chat.png" />' + '<span>微聊</span></a>'
                + '<span class="nextalk-alert" id="nextalk_unread">0</span></div>';
        return btnHTML;
    };

    iframe._getIfrHTML = function() {
        var ifrHTML = '<div class="nextalk-iframe" id="nextalk_iframe" '
                + 'style="width:'+ this.panel.width + 'px;height:' + this.panel.height + 'px;">'
                + '<div style="width:100%;height:' + (this.panel.height) + 'px;">'
                + '<iframe src="' + this.config.resPath + 'html/iframe.html?v='
                + nextalk.v +'" name="nextalk_iframe" frameborder="no" scrolling="no"/>'
                + '</div></div>';
        return ifrHTML;
    };

    iframe.slideUp = function($el, offset) {
        $el.css({
            bottom : offset + 'px'
        });
        $el.show();
        window.setTimeout(function() {
            $el.css({
                bottom : '0px'
            });
        }, 5);
    };

    iframe.toggleHTML = function() {
        var _this = this;
        _this.$unread = iframe.$('#nextalk_unread', document).hide();
        _this.$nkMain = iframe.$('#nextalk_main', document);
        _this.$nkIframe = iframe.$('#nextalk_iframe', document);

        var nkMainHeight = -42;
        _this.slideUp(this.$nkMain, nkMainHeight);

        _this.$nkMain.find('a').click(function() {
            _this.openIframe();
        });
    };
    iframe.openIframe = function() {
        var _this = this;
        _this.$nkMain.hide();
        //_this.slideUp(_this.$nkIframe, -(_this.panel.height));
        // 居中
        _this.$nkIframe.css({
            left : iframe.$(window).width() + 'px',
            top : iframe.$(window).height() + 'px'
        });
        _this.$nkIframe.show();
        window.setTimeout(function() {
            var l = (iframe.$(window).width() - _this.panel.width)/2;
            var t = (iframe.$(window).height() - _this.panel.height)/2;
            if (l <= 0) {
                l = 1;
            }
            if (t <= 0) {
                t = 1;
            }
            _this.$nkIframe.css({
                'left' : l + 'px',
                'top' : t + 'px'
            });
        }, 5);
    };

    iframe.go = function() {
        var _this = this;
        _this.config.onUnread = function(total) {
            if (total > 0) {
                _this.$unread.show().text(total);
            } else {
                _this.$unread.hide().text(total);
            }
        };
        _this.config.onLoginWin = function() {
            
        };
        _this.config.onChatboxOpen = function() {
            
        };
        _this.config.onChatboxClose = function() {
            
        };
        _this.config.onClickCloseIframe = function() {
            _this.$nkIframe.hide();
            _this.slideUp(_this.$nkMain, -42);
        };

        var div = document.createElement('div');
        div.innerHTML = this._getBtnHTML() + this._getIfrHTML();
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(div);

        var task = window.setInterval(function() {
            var ifw = window['nextalk_iframe'].window;
            if (ifw && ifw.$) {
                window.clearInterval(task);
                _this.$ = ifw.$;
                _this.toggleHTML();
            }
        }, 200);
    };
    iframe.openChatBoxUI = function(chatObj) {
        var id = chatObj.id;
        var name = chatObj.name;
        var avatar = chatObj.avatar;
        if (!id || !name || !avatar) {
            throw new Error('args: id, name, avatar.');
        }
        var ifw = window['nextalk_iframe'].window;
        if (ifw || ifw.nextalk) {
            iframe.openIframe();
            ifw.nextalk.webui.openChatBox({
                type : 'chat',
                objId : id,
                objName : name,
                objAvatar : avatar,
                objShow : chatObj.show
            });
        }
    };

    nextalk.iframe = iframe;
})(nextalk);
