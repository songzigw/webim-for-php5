/*!
 * nextalk.webiui.emot.js v1.0.0
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

    var EmotUI = function() {
        var webui = UI.getInstance();
        var _this = this;
        _this.$html = $(EmotUI.HTML);
        _this.hide();
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
    EmotUI.H_IMG = '<li><img src="{{path}}imgs/emot/{{image}}"\
        title="{{title}}" data-text="{{text}}"/></li>';
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

    webui.EmotUI = EmotUI;
})(nextalk.webim, nextalk.webui);

