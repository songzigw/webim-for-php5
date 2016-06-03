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

    var Goods = function() {
        var _this = this;
        _this.$html = $(Goods.HTML);
        _this.$header = $('header', _this.$html);
        _this.$content = $('#nextalk_content_goods', _this.$html);
        _this.$items = $('.mzen-list-view', _this.$content);
        
        _this.handleHTML();
        _this.close();
        _this.$html.appendTo(webui.$body);
        $(window).resize(function() {
            _this.resizable();
        });
    };
    Goods.HTML = '<div class="nextalk-page nextalk-screen-right" id="nextalk_page_goods">\
        <!--头部集合 BEGIN-->\
        <header class="mzen-bar mzen-bar-nav mzen-bar-white">\
            <a class="mzen-pull-left">\
            <span class="mzen-iconfont mzen-icon-left"></span></a>\
            <div class="mzen-title">房源收藏</div>\
        </header>\
        <div class="nextalk-scroll" id="nextalk_content_goods">\
        <div class="mzen-content nextalk-wrap">\
            <ul class="mzen-list-view"></ul>\
        </div></div>\
        </div>';
    Goods.ITEM = '<li class="mzen-list-view-cell mzen-img">\
        <a><img class="mzen-img-object mzen-pull-left" src="{{goods_img}}">\
        <div class="mzen-img-body">房源信息\
            <p class="mzen-ellipsis-3">{{goods_name}}</p>\
            <p><button class="mzen-btn mzen-btn-danger" data-goodsid="{{goods_id}}">发送房源</button></p>\
        </div></a></li>';
    Goods.prototype.resizable = function() {
        var _this = this, $html = _this.$html;
        var mobile = webui.mobile;
        var $main = webui.main.$html;

        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();

        var hh = $('header', $html).outerHeight();
        var $content = $('#nextalk_content_goods', $html);
        $content.height(wh - hh);

        if (!mobile) {
            if (ww <= 320) {
                $html.css('width', '100%');
            } else {
                $html.width(ww - $main.width());
            }
        } else {
            $html.css({
                'width' : '100%'
            });
            $content.css({
                'margin-top' : hh+'px'});
        }
    };
    Goods.prototype.handleHTML = function() {
        var _this = this;
        if (webui.mobile) {
            _this.$html.addClass('nextalk-mobile');
        }
        _this.$content.css('overflow', 'auto');
        $('.mzen-pull-left', _this.$header)
                .click(function() {
                    _this.close();
                });
        webim.webApi.house_fav(
                function(ret, err) {
                    if (ret) {
                        for (var i = 0; i < ret.length; i++) {
                            var h = ret[i];
                            h.goods_img = 'http://images.qiaoju360.com/' + h.goods_img;
                            var $house = $(webui.completion(Goods.ITEM, h));
                            $('button.mzen-btn', $house).on('click', function() {
                                var goodsId = $(this).attr('data-goodsid');
                                if (_this.conv) {
                                    var conv = _this.conv;
                                    var key = {
                                            currUid : conv.currUid,
                                            objId   : conv.objId
                                        };
                                    var chatBox = webui._chatBoxs.get(conv.type, key);
                                    chatBox.sendMsg(webim.JSON.stringify({
                                        type : '1',
                                        body : goodsId
                                    }));
                                }
                                _this.close();
                            });
                            _this.$items.append($house);
                        }
                        if (ret.length <= 0) {
                            _this.$items.append('<li class="mzen-list-view-cell mzen-img"><p>当前没有收藏房源</p></li>');
                        }
                    }
                });
    };
    Goods.prototype.open = function(conv) {
        var _this = this;
        _this.conv = conv;
        _this.$html.css('z-index', '7');
        _this.$html.show();
        _this.resizable();
    };
    Goods.prototype.close = function() {
        var _this = this;
        _this.$html.hide();
    };

    $.extend(webui, {
        Goods : Goods
    });
})(nextalk.webim, nextalk.webui);

