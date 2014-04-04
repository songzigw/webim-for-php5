
<html>
<head> 
<meta charset="utf-8">
<title>WebIM for PHP5</title>
</head>
<body style="background:#E6E6E6">
<div style="background:#FFF;height:100%;width:640px;margin:auto;padding:60px;"><center>
<h1>WebIM for PHP5</h1>
<a href="https://github.com/webim/webim-for-php5">https://github.com/webim/webim-for-php5</a>
<h2>5.4.1</h2>
<hr>
<?php 
    if(isset($_GET['uid'])) {
        session_start(); 
        $uid = $_GET['uid'];
        $_SESSION['uid'] = $uid;
        $p = <<<EOL
<p>登录UID: <a class="webim-chatbtn" href="/chat/uid{$uid}">uid$uid</a></p>
EOL;
        echo $p;
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
</center></div>
<script type="text/javascript" src="webim/index.php?action=boot"></script>
</body>

</html>

