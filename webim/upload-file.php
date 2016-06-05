<?php
header ( 'Content-Type:application/json; charset=utf-8' );

error_reporting ( E_ALL | E_STRICT );
require ('UploadHandler.php');

$upload_handler = new UploadHandler ( array (
        'param_name' => 'file',
        'print_response' => false 
) );
$rsp = $upload_handler->get_response ();
$file = $rsp ['file'];

$data = array (
        'success' => false 
);
foreach ( $file as $f ) {
    $data ['success'] = true;
    $data ['path'] = $f->url;
}

echo json_encode ( $data );

?>
