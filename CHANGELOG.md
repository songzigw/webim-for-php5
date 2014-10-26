CHANGELOG
==================

v5.7.2 (2014/10/25)
-------------------
* fix Router.php invite
* rewrite index.php
* rewrite README.md

v5.7.1 (2014/09/02)
-------------------
* 升级static静态文件到5.7


v5.7 (2014/09/01)
-------------------
* src/Router.php: fix invisible bug
* config.php: add 'dbport' config
* src/Model.java: support 'dbport' config


v5.6 (2014/07/18)
-------------------
* 升级lib, static到5.6版本
* 修复群成员IE浏览器下无法区分在线、离线
* 修复聊天窗口名稱顯示不完整
* 群組成员（在线、离线、进组、退组）区分开，并以消息记录的形式提示
* 创建组，选择人员时加所属组，按照组排序
* 修复隐身功能实现有问题
* 修复IE打开聊天窗口，直接选择表情。会同时把，“请输入……”一起发送出去
* 修复chatbtn app响应presence变化事件

5.5 (2014-07-17)
------------------
* mobile chatbox support


5.5 (2014-06-17)
------------------

* Router.php: return presences to browser used by 'chatbtn'
* upgrade static file to 5.5 and support detach window
* webim server cluster support

5.4.2 (2014-04-21)
------------------

* merge webim-for-php4 api
* endpoint to user
* fix array_map, array_filter
* WEBIM_MESSAGE_DECODE

5.4.1 (2014-04-12)
------------------

* first release
