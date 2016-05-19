<?php
//echo date ( "Ym" );
//echo date ( "YmdHis" );

function Upload($upDir) {
    $tmp_name = $_FILES ['file'] ['tmp_name'];
    $name = $_FILES ['file'] ['name'];
    $size = $_FILES ['file'] ['size'];
    $type = $_FILES ['file'] ['type'];
    //$upDir = $upDir + date ( "Ym" );
    //@chmod ( $upDir, 0777 ); // 赋予权限
    //@is_dir ( $upDir ) or mkdir ( $upDir, 0777 );
    move_uploaded_file ( $_FILES ['file'] ['tmp_name'], $upDir . "/" . $name );
    $type = explode ( ".", $name );
    $type = @$type [1];
    $date = date ( "YmdHis" );
    $rename = @rename ( $upDir . "/" . $name, $upDir . "/" . $date . "." . $type );
    if ($rename) {
        return $upDir . "/" . $date . "." . $type;
    }
}

if ($_POST ['upload']) {
    $image = Upload ( './files' );
    echo $image;
} else {
    ?>
<form enctype="multipart/form-data"
	action="<?php echo $_SERVER['SCRIPT_NAME']?>" method="post">
	<input name="file" type="file"> <input name="upload" type="submit"
		value="Upload File">
</form>
<?php
}
?>