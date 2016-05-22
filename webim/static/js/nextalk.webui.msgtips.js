/*!
 * nextalk.webiui.msgtips.js v1.0.0
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
     * 各种消息提示条
     */
    var MsgTipsUI = function() {
        var _this = this;
        _this.$html = webui.$(MsgTipsUI.HTML);
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

    webui.MsgTipsUI = MsgTipsUI;
})(nextalk.webim, nextalk.webui);

