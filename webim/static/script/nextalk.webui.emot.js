var emotData = [ {
    "name" : "default/angel.png",
    "text" : "[微笑]"
}, {
    "name" : "default/crying.png",
    "text" : "[撇嘴]"
} ];
function _transEmo(emoMsg) {
    var emoPath, transMsg;
    var reg = /\[(.*?)\]/gm;
    transMsg = emoMsg.replace(reg, function(match) {
        for (var i = 0, len = emotData.length; i < len; i++) {
            if (emotData[i].text === match) {
                emoPath = emotData[i].name + '.png';
                return '<img width="20" height="20" src="' + emoPath
                        + '" style="vertical-align:middle;" />'
            }
        }
        return match;
    });
    return transMsg;
}
