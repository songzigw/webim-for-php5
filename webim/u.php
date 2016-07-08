<?php
?>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<meta charset="UTF-8"/>
	<title>textarea</title>
	<style>
	.textarea {
        white-space: pre-wrap;
        word-wrap: break-word;
        box-sizing: border-box;
        font-size: 14px;
        line-height: 1;
        width: 99%;
        min-height: 36px;
        padding: 10px;
        margin: 0 0 0 0;
        cursor: text;
        border: 1px solid #3498db;
        border-radius: 4px;
        resize: none;
        overflow: hidden;
        float: left;
        -webkit-appearance: none;
        -webkit-user-select: text;
        background-color: #fff;
        outline: none;
    }
	</style>
</head>
<body>
	<div class="textarea" contenteditable="true" id="textarea">&#128567;</div>
	<script type="text/javascript">
	var tArea = document.getElementById('textarea');
	tArea.focus();
	tArea.onkeydown = function(ev) {
	    var e = window.event || ev;
	    //alert(ev.keyCode);
	  	//ev.preventDefault();
        //ev.returnValue = false;
	};
	tArea.onkeyup = function(ev) {
	    var e = window.event || ev;
	    tArea.innerHTML = Emot.trans(tArea.innerHTML);
	};

	function utf16toEmpty(str) {
	    // 检测utf16字符正则
	    var patt = /[\ud800-\udbff][\udc00-\udfff]/g;
	    return str.replace(patt, "");
	}

	/**
	 * 
	 * 用于把用utf16编码的字符转换成实体字符，以供后台存储
	 *
	 * @param {string} str 将要转换的字符串，其中含有utf16字符将被自动检出
	 * @return {string} 转换后的字符串，utf16字符将被转换成&#xxxx;形式的实体字符
	 * 
	 */
	function utf16toEntities(str) {
	    // 检测utf16字符正则
	    var patt = /[\ud800-\udbff][\udc00-\udfff]/g;
	    str = str.replace(patt, function(char) {
	        var H, L, code;
	        if (char.length === 2) {
	            // 取出高位
	            H = char.charCodeAt(0);
	            // 取出低位
	            L = char.charCodeAt(1);
	            // 转换算法
	            code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00;
	            return "&#" + code + ";";
	        } else {
	            return char;
	        }
	    });
	    return str;
	}

	var Emot = {};
	Emot.ICON2 = [ {
            "image" : "default/smile.png",
            "text" : "&#128567;"
        }, {
            "image" : "default/smile-big.png",
            "text" : "[smile_big]"
        } ];
    Emot.trans = function(body) {
        var path = '/webim/';
        var reg = /\[(.*?)\]/gm;
        var str = body.replace(reg, function(match) {
            for (var i = 0; i < Emot.ICON.length; i++) {
                var icon = Emot.ICON[i];
                if (icon.text === match) {
                    return '<img width="24" height="24" ' 
                        + 'src="' + path + 'imgs/emot/'
                        + icon.image + '" />';
                }
            }
            return match;
        });
        reg = /\&(.*?);/gm;
        str = body.replace(reg, function(match) {
            alert(match);
            for (var i = 0; i < Emot.ICON2.length; i++) {
                var icon = Emot.ICON2[i];
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
	</script>
</body>
</html>