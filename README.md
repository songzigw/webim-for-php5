webim-for-php5
==================

Webim application for PHP5

Usage
=====

1. webim目录上传到PHP5项目目录;

2. 数据库创建install.sql中的两张表;

3. 配置webim/conf/config.php; 

4. 配置webim/index.php的WEBIM_PATH变量

5. 实现webim/WebimPlugin.class.php的项目集成接口，与项目用户、群组、通知集成

6. 项目需要显示Webim的页面，footer嵌入

```

<script type="text/javascript" src="/webim/index.php?action=boot"></script>

```

WebimPlugin.class.php
================

项目集成接口类, 用户参考示例代码，实现下述接口:

1. uid() 获取当前登录用户UID, 一般从SESSION读取

2. setUser() 初始化Webim当前的用户对象,一般从SESSION和数据库读取

3. setVisitor() 如支持访客模式，初始化访客(Visitor)对象

4. buddies() 读取当前用户的在线好友列表

5. buddiesByIds($ids , $strangers) 根据ids列表读取好友列表

6. rooms() 读取当前用户所属的群组，以支持群聊

7. roomsByIds() 根据id列表读取群组列表

8. notifications() 读取当前用户的通知信息

WebimAction.class.php
==============================

Webim应用AJAX请求处理类

Author
======

http://nextalk.im
