<?php
?>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>FormData</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Language" content="zh-CN" />
<script type="text/javascript" src="static/script/jquery.min.js"></script>
<style type="text/css">
#feedback {
	width: 1200px;
	margin: 0 auto;
}

#feedback img {
	float: left;
	width: 300px;
	height: 300px;
}
</style>
</head>
<body>
	<div>
		<a id="upload_file">Upload</a> 
		<input type="file" name="file" accept="image/*"
			style="opacity: 0; filter: alpha(opacity = 0); display: none;" />
	</div>

	<script type="text/javascript">
    $('#upload_file').on('click', function() {
        if (!window.FormData) {
    		alert('抱歉，您的浏览器不支持图片上传！');
    		return;
        }
        $('input[type="file"]').click();
    });
    $('input[type="file"]').on('change', function() {
        var $file = $(this);
        if (!$file.val()) {
            return;
        }
        var fData = new FormData();
        $.each($file[0].files, function(i, file) {
            fData.append('file', file);
        });
        $.ajax({
            url   : 'upload-file.php',
            type  : 'POST',
            data  : fData,
            cache : false,
            contentType : false,
            processData : false,
            success : function(ret) {
                alert(JSON.stringify(ret));
                $file.val('');
            },
            error : function() {
                alert('shibai');
                $file.val('');
            }
        });
    });
	</script>
</body>
</html>