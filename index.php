
<html>
<head> 
<meta charset="utf-8">
<title>WebIM for PHP5</title>
</head>
<body style="background:#E6E6E6;height:100%;">
<div style="background:#FFF;width:640px;margin:auto;padding:60px;"><center>
<h1>WebIM for PHP5</h1>
<a href="https://github.com/webim/webim-for-php5">https://github.com/webim/webim-for-php5</a>
<h2>最新版本: 5.4.1</h2>
<hr>
<?php 
    if(isset($_GET['uid'])) {
        session_start(); 
        $uid = $_GET['uid'];
        $_SESSION['uid'] = $uid;
        echo "<ul style=\"list-style: none outside none;\">";
        echo "<li>登录: <a class=\"webim-chatbtn\" href=\"/chat/uid{$uid}\">user$uid</a></li>";
        foreach(range(1, 10) as $id) {
            echo "<li>好友: <a class=\"webim-chatbtn\" href=\"/chat/uid{$id}\">user{$id}</a></li>";
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

<h1>开发指南</h1>
<hr>
</center>
<div>
<?php 
    $readme = htmlspecialchars(file_get_contents("README.md"));
    echo "<pre> $readme </pre>";
?>
</div>
</center></div>
<script type="text/javascript" src="webim/index.php?action=boot"></script>
</body>

</html>

