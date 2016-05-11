var openChatBoxWin = function(id, name, avatar) {
    this.openWindow(
            _IMC.apiPath + "index.php?action=chatbox"
            + "&uid=" + id
            + "&name=" + name
            + "&avatar=" + avatar,
            "window_chat", 790, 500);
};
var openWindow = function(url, name, iWidth, iHeight) {
    // 获得窗口的水平位置
    var iLeft = (window.screen.width - 10 - iWidth) / 2;
    // 获得窗口的垂直位置
    var iTop = (window.screen.height - 30 - iHeight) / 2;
    window.open(url, name, 'height='
                        + iHeight
                        + ',innerHeight='
                        + iHeight
                        + ',width='
                        + iWidth
                        + ',innerWidth='
                        + iWidth
                        + ',top='
                        + iTop
                        + ',left='
                        + iLeft
                        + ',toolbar=no,menubar=no,scrollbars=no,resizeable=no,location=no,status=no');
};
var getElementsByClass = function(className) {
    var eles = document.getElementsByTagName('*');
    var targets = [];
    for (var i in eles) {
        if (eles[i].className == className) {
            targets.push(eles[i]);
        }
    }
    return targets;
};

nextalkMain.setConfig({
    // 引入资源文件的根路径
    resPath : _IMC.resPath,
    // API根路径
    apiPath : _IMC.apiPath,
    // API路由
    route : {
        online : "index.php?action=online",
        offline : "index.php?action=offline",
        deactivate : "index.php?action=refresh",
        message : "index.php?action=message",
        presence : "index.php?action=presence",
        status : "index.php?action=status",
        setting : "index.php?action=setting",
        history : "index.php?action=history",
        clear : "index.php?action=clear_history",
        download : "index.php?action=download_history",
        buddies : "index.php?action=buddies",
        // room actions
        invite : "index.php?action=invite",
        join : "index.php?action=join",
        leave : "index.php?action=leave",
        block : "index.php?action=block",
        unblock : "index.php?action=unblock",
        members : "index.php?action=members",
        // notifications
        notifications : "index.php?action=notifications",
        // asks
        asks : "index.php?action=asks",
        accept : "index.php?action=accept_ask",
        reject : "index.php?action=reject_ask",
        // upload files
        upload : "static/images/upload.php"
    },
    // 嵌入窗口右下角
    iframe : _IMC.iframe,
    // 简易版本
    simple : _IMC.simple,
    hidden : _IMC.hidden,
    mobile : _IMC.mobile
});
if (_IMC.channelType) {
    nextalkMain.channelType = _IMC.channelType
}
if (_IMC.chatObj) {
    nextalkMain.chatObj = _IMC.chatObj;
    nextalkMain.iframe = false;
}

// 给聊天按钮设置单击事件
// 注意传递参数 uid nick avatar
var chatBtns = getElementsByClass('webim-chatbtn');
if (chatBtns && chatBtns.length > 0) {
    var count = 0;
    for (var i = 0; i < chatBtns.length; i++) {
        var btn = chatBtns[i];
        btn.onclick = function() {
            var uid = this.getAttribute('data-id');
            if (!uid) {
                return;
            }
            if (count == 0) {
                nextalkMain.chatlinkIds = uid;
            } else {
                nextalkMain.chatlinkIds += ',' + uid;
            }
            count++;
            var nick = this.getAttribute('data-name');
            var avatar = this.getAttribute('data-avatar');
            var win = this.getAttribute('data-win');
            if (win) {
                openChatBoxWin(uid, nick, avatar);
            } else {
                nextalkMain.openChatBoxUI(uid, nick, avatar);
            }
        };
    }
    nextalkMain.onChatlinks = function(data) {
        if (data) {
            for (var i = 0; i < chatBtns.length; i++) {
                var btn = chatBtns[i];
                for (var key in data) {
                    if (btn.getAttribute('data-id') == key) {
                        if (data[key] != 'unavailable') {
                            // 在线
                            //if (btn.nextElementSibling) {
                            //    btn.nextElementSibling.innerText = '在线';
                            //}
                        } else {
                            // 下线
                            //if (btn.nextElementSibling) {
                            //    btn.nextElementSibling.innerText = '下线';
                            //}
                        }
                    }
                }
            }
        }
    };
}

nextalkMain.go();