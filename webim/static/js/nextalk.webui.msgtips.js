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
        completion = webui.completion;

    /**
     * 各种消息提示条
     */
    var MsgTips = function() {
        var _this = this;
        _this.$html = webui.$(MsgTips.HTML);
        _this.$html.hide();
    };
    MsgTips.HTML = '<div class="mzen-tips mzen-tips-info nextalk-msg-tips">\
                        <div class="mzen-tips-content mzen-ellipsis-1">\
                            <i class="mzen-iconfont mzen-icon-warnfill"></i>\
                            <span>???</span>\
                        </div>\
                      </div>';
    MsgTips.CLASSES = ['mzen-tips-danger',
                         'mzen-tips-info',
                         'mzen-tips-success'];
    MsgTips.prototype.show = function(title, cla) {
        var _this = this, $html = _this.$html;
        var claes = MsgTips.CLASSES;
        
        for (var i = 0; i < claes.length; i++) {
            $html.removeClass(claes[i]);
        }
        
        $('span', $html).text(title);
        $html.addClass(cla);
        $html.show();
    };
    MsgTips.prototype.hide = function() {
        this.$html.hide();
    };

    webui.MsgTips = MsgTips;
})(nextalk.webim, nextalk.webui);

