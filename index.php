<!DOCTYPE html>
<html>
<head> 
    <title>WebIM for PHP5</title>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<style>

	body {
		margin: 0;
		color: #555555;
		background-color: #fafafa;
	}

	.header {
		padding: 20px;
		border-bottom: 1px solid #e5e5e5;
		text-align: center;
	}

	.wrapper {
		background: #FFF;
		box-shadow: #D0D0D0 0 0 60px;
		margin: 0 auto;
		width: 540px;
	}

	.content {
		padding: 20px;
	}

	.content p {
		line-height: 1.5em;
	}

	.content ul {
		list-style: none outside none;
		padding: 0px;
	}

	.content ul li {
		line-height: 1.5em;
	}

	.footer {
		padding: 0px 0px 20px;
		margin-top: 40px;
		color: #777;
		border-top: 1px solid #e5e5e5;
		text-align: center;
	}	

	</style>
</head>
<body>

	<div class="wrapper">
		<div class="header">
			<h1>WebIM for PHP5</h1>
			<p>版本: 5.8 (2014/12/20)</p>
		</div>
		<div class="content">
			<h2>简介</h2>
			<p>
				<a href="http://nextalk.im" target="_blank">NexTalk</a>为PHP5开发项目提供的快速WebIM集成包。WebIM集成包以代码接口方式，与PHP项目的用户体系、好友关系、数据库集成。<br>
			</p>
			<h2>项目演示</h2>
<?php 
	error_reporting( E_ALL & ~E_NOTICE & ~E_STRICT & ~E_WARNING );
    if(isset($_GET['uid'])) {
        session_start();
        $uid = $_GET['uid'];
        $_SESSION['uid'] = $uid;
        echo "<ul>";
        echo "<li>当前用户: <a class=\"webim-chatbtn\" href=\"webim/index.php?action=chatbox&uid={$uid}\">user$uid</a></li>";
        foreach(range(1, 10) as $id) {
            echo "<li><a class=\"webim-chatbtn\" href=\"webim/index.php?action=chatbox&uid={$id}\">聊天按钮{$id}</a></li>";
        }
        echo "</ul>";
    } else {
$form = <<<EOL
<form method="GET" action="index.php" >
<label>请输入1~10的UID:</label>
<input type="text" name="uid"></input>
<button type="submit">登录</button>
</form>
EOL;
    echo $form;
    }
?>
			
			<h2>前端界面</h2>
			WebIM的前端界面，见本页面右下角...

			<h2>环境要求</h2>
			<ul>
				<li>PHP5.3.10+</li>
				<li>PDO support</li>
				<li>cURL support</li>
			</ul>

			<h2>功能列表</h2>
			<ul>
				<li>集成在浏览器右下⾓前端界⾯</li>
				<li>一对一聊天 (站点访客、⽤户、管理员间即时聊天)</li>
				<li>群组聊天(聊天室)，临时讨论组聊天</li>
				<li>⺴站在线客服，访客与客服聊天</li>
				<li>⺴站⻚⾯嵌⼊聊天按钮，例如"在线客服"</li>
				<li>离线好友显⽰，发送离线消息</li>
				<li>⽤户现场状态设置</li>
				<li>⽤户间发送表情</li>
				<li>用户间传送图⽚、⽂件</li>
				<li>消息拦截、过滤、敏感词处理</li>
				<li>简单的聊天机器人支持</li>
				<li>可移动聊天窗口支持</li>
				<li>手机版独立聊天窗口</li>
				<li>界⾯菜单隐藏或定制，界⾯透明背景、缩放⽀持</li>
				<li>⽤户界⾯提⽰⾳、收缩⼯具条、弹出窗⼝设置</li>
				<li>简单的开源桌⾯客户端</li>
				<li>Android手机客户端SDK</li>
				<li>iOS手机客户端SDK</li>
			</ul>
			<h2>技术架构</h2>
			<p>
				<a href="http://nextalk.im" target="_blank">NexTalk</a>是基于WEB标准协议设计的，主要应用于WEB站点的，简单开放的即时消息系统。可快速为社区微博、电子商务、企业应用集成即时消息服务。<br>
				<br> NexTalk架构上分解为：WebIM业务服务器 + 消息路由服务器 两个独立部分，遵循Open
				Close的架构设计原则。WebIM插件方式与第三方的站点或应用的用户体系开放集成，独立的消息服务器负责稳定的连接管理、消息路由和消息推送。<br>
				<br> <img
					src="http://nextalk.im/static/img/design/WebimForPHP5.png"></img><br>
			</p>
			<h2>开发指南</h2>
			<a
				href="https://github.com/webim/webim-for-php5/blob/master/README.md">README.md</a><br>

			<h2>开发者</h2>
			<p>
				公司: http://nextalk.im<br> 作者: <a href="mailto:feng.lee@nextalk.im">Feng Lee</a><br>
			</p>
		</div>
		<div class="footer">
			<p>&copy; Powered by NexTalk 2014</p>
		</div>

	</div>

	<script type="text/javascript" src="webim/index.php?action=boot&chatlinkIds=1,2,3,4,5,6,7,8,9"></script>

</body>

</html>
