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
	<div class="textarea" contenteditable="true" id="textarea"></div>
	<script type="text/javascript">
	var tArea = document.getElementById('textarea');
	tArea.focus();
	tArea.onkeydown = function(ev) {
	    var e = window.event || ev;
		alert(e.keyCode);
		e.returnValue = false;
	    if (tArea.innerText.length > 10) {
	        //ev.returnValue = false;
	    }
	    if (ev.keyCode == 13) {
	        //ev.preventDefault();
            //ev.returnValue = false;
        }
	};
	tArea.onchange = function() {
		alert()};
	</script>
</body>
</html>