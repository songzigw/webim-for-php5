var openChatBoxWin = function(chatObj) {
    var url = "index.php?action=chatbox"
        + "&uid=" + chatObj.id;
    if (chatObj.body_type) {
        url += "&body_type=" + chatObj.body_type;
    }
    if (chatObj.body) {
        url += "&body=" + chatObj.body;
    }
    this.openWindow(
            _IMC.apiPath + url,
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
var getElementsByToggle = function(toggle) {
    var eles = document.getElementsByTagName('*');
    var targets = [];
    for (var i in eles) {
        if (eles[i].nodeType == 1
                && eles[i].getAttribute('data-toggle') == toggle) {
            targets.push(eles[i]);
        }
    }
    return targets;
};

nextalk.main.setConfig({
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
    mobile : _IMC.mobile,
    playSound : _IMC.playSound,
    receive : _IMC.receive
});
if (_IMC.channelType) {
    nextalk.main.channelType = _IMC.channelType;
}
if (_IMC.chatObj) {
    nextalk.main.chatObj = _IMC.chatObj;
    nextalk.main.iframe = false;
}
if (_IMC.chatObjs) {
    nextalk.main.chatObjs = _IMC.chatObjs;
}
nextalk.main.onUnread = function(unread) {
    var elements = getElementsByToggle('nextalk-bubble');
    if (elements && elements.length > 0) {
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (unread == 0) {
                el.style.display = 'none';
            } else {
                el.innerText = unread;
                el.style.display = 'block';
            }
        }
    }
};

// 给聊天按钮设置单击事件
// 注意传递参数 uid nick avatar
var chatBtns = getElementsByToggle('webim-chatbtn');
if (chatBtns && chatBtns.length > 0) {
    var n = 0;
    for (var i = 0; i < chatBtns.length; i++) {
        var btn = chatBtns[i];
        var id = btn.getAttribute('data-id');
        var name = btn.getAttribute('data-name');
        var avatar = btn.getAttribute('data-avatar');
        if (!id) {
            continue;
        }
        var chatObj = {
            type : 'chat',
            id : id,
            name : name,
            avatar : avatar
        };
        if (n == 0) {
            nextalk.main.chatlinkIds = id;
        } else {
            nextalk.main.chatlinkIds += ',' + id;
        }
        n++;
        nextalk.main.chatObjs.push(chatObj);
        btn.onclick = function() {
            var id = this.getAttribute('data-id');
            if (!id) {
                return;
            }
            var name = this.getAttribute('data-name');
            var avatar = this.getAttribute('data-avatar');
            var win = this.getAttribute('data-win');
            var bodytype = this.getAttribute('data-bodytype');
            var body = this.getAttribute('data-body');
            var chatObj = {
                type : 'chat',
                id : id,
                name : name,
                avatar : avatar,
                body_type : bodytype,
                body : body
            };
            if (win == 'win') {
                openChatBoxWin(chatObj);
            } else {
                nextalk.main.openChatBoxUI(chatObj);
            }
        };
    }
    nextalk.main.onChatlinks = function(data) {
        if (data) {
            for (var i = 0; i < chatBtns.length; i++) {
                var btn = chatBtns[i];
                for (var key in data) {
                    if (btn.getAttribute('data-id') == key) {
                        if (data[key] != 'unavailable') {
                            // 在线
                            btn.style.background = 'red';
                            btn.style.color = 'white';
                            btn.innerHTML = '在线咨询(<strong>在线</strong>)';
                        } else {
                            // 下线
                            btn.style.background = '#ddd';
                            btn.style.color = '#333';
                            btn.innerHTML = '在线咨询(<strong>离线</strong>)';
                        }
                    }
                }
            }
        }
    };
}

nextalk.main.go();