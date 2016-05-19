<?php
header ( 'Content-Type:application/json; charset=utf-8' );

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
        return  $date . "." . $type;
    }
}

$image = '/webim/files/' . Upload ( './files' );

$data = (object) array(
       'success' => true,
       'path' => $image
);
echo json_encode($data);
?>
