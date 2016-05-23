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
        var path = webim.resPath;
        $('img[data-toggle=logo_index]', $h).each(function() {
            $(this).attr('src', path + 'imgs/logo.png');
        });
        $('img[data-toggle=logo]', $h).each(function() {
            $(this).attr('src', path + 'imgs/webim.72x72.png');
        });
        $('img[data-toggle=head]', $h).each(function() {
            $(this).attr('src', path + 'imgs/head_def.png');
        });
        $('img', $h).each(function(i, el) {
            $(el).error(function() {
                $(this).attr('src', IM.imgs.HEAD);
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

})(nextalk.webim, nextalk.webui);

