/*!
 * nextalk.webiui.goods.js
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

    var Alert = function() {
        var _this = this;
        _this.$htmlBack = $(Alert.HTML_BACK).hide();
        _this.$htmlWind = $(Alert.HTML_WIND).hide();
        _this._handler();
    };
    Alert.HTML_BACK = '<div class="mzen-mask"></div>';
    Alert.HTML_WIND = '\
        <div class="mzen-dialog mzen-hidden">\
        <div class="mzen-dialog-header">{{title}}</div>\
        <div class="mzen-dialog-body mzen-text-left">{{body}}</div>\
        <div class="mzen-dialog-footer">\
            <div class="mzen-dialog-btn mzen-text-danger" tapmode onclick="cancel()">取消</div>\
            <div class="mzen-dialog-btn mzen-text-info" tapmode onclick="confirm()">确定</div>\
        </div></div>';
    Alert.prototype.handleHTML = function() {
        var _this = this;
        _this.$htmlBack.appendTo(webui.$body);
        _this.$htmlWind.appendTo(webui.$body);
    };

    $.extend(webui, {
        Alert : Alert
    });
})(nextalk.webim, nextalk.webui);

