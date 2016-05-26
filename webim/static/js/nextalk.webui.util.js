/*!
 * nextalk.webiui.util.js v1.0.0
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

    webui.$ = function(html) {
        var $h = $(html);
        $('img[data-toggle=logo_index]', $h).each(function() {
            $(this).attr('src', webim.imgs.LOGO_INDEX);
        });
        $('img[data-toggle=logo]', $h).each(function() {
            $(this).attr('src', webim.imgs.LOGO);
        });
        $('img[data-toggle=head]', $h).each(function() {
            $(this).attr('src', webim.imgs.HEAD);
        });
        $('img', $h).each(function(i, el) {
            $(el).error(function() {
                //$(this).attr('src', webim.imgs.HEAD);
            });
        });
        return $h;
    };

    var completion = function(str, data) {
        var reg = /\{{2}(.*?)\}{2}/gm;
        var trim = /^\{{2}\s*|\s*\}{2}$/g;
        var newStr = str.replace(reg, function(match) {
            var key = match.replace(trim, "");
            return data[key];
        });
        return newStr;
    };

    $.extend(webui, {
        completion : completion
    });
})(nextalk.webim, nextalk.webui);

