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
                + '<iframe src="' + this.config.resPath
                + 'html/iframe.html" name="nextalk_iframe" frameborder="no" scrolling="no"/>'
                + '</div></div>';
        return ifrHTML;
    };

    function slideUp($el, offset) {
        $el.css({
            bottom : offset + 'px'
        });
        $el.show();
        var timerTask = window.setTimeout(function() {
            $el.css({
                bottom : '0px'
            });
            window.clearTimeout(timerTask);
        }, 5);
    }
    function toggleHTML() {
        iframe.$('#nextalk_unread', document).hide();
        var nkMain = iframe.$('#nextalk_main', document);
        var nkIframe = iframe.$('#nextalk_iframe', document);

        var nkMainHeight = -42;
        var nkIframeHeight = -(iframe.panel.height);
        slideUp(nkMain, nkMainHeight);

        nkMain.find('a').click(function() {
            nkMain.hide();
            slideUp(nkIframe, nkIframeHeight);
        });
        nkIframe.find('a').click(function() {
            nkIframe.hide();
            slideUp(nkMain, nkMainHeight);
        });
    }

    iframe.go = function() {
        var _this = this;
        _this.config.onUnread = function(total) {
            if (total > 0) {
                _this.$('#nextalk_unread', document).show().text(total);
            } else {
                _this.$('#nextalk_unread', document).hide().text(total);
            }
        };
        _this.config.onLoginWin = function() {
            
        };
        _this.config.onChatboxOpen = function() {
            
        };
        _this.config.onChatboxClose = function() {
            
        };
        _this.config.onClickCloseIframe = function() {
            iframe.$('#nextalk_unread', document).hide();
            var nkMain = iframe.$('#nextalk_main', document);
            var nkIframe = iframe.$('#nextalk_iframe', document);
            nkIframe.hide();
            slideUp(nkMain, -42);
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
                toggleHTML();
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
            ifw.nextalk.webui.openChatBox({
                type : 'chat',
                objId : id,
                objName : name,
                objAvatar : avatar
            });
        }
    };

    nextalk.iframe = iframe;
})(nextalk);
