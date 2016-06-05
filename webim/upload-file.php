<?php
header ( 'Content-Type:application/json; charset=utf-8' );

error_reporting ( E_ALL | E_STRICT );
require ('UploadHandler.php');

$upload_handler = new UploadHandler ( array (
        'param_name' => 'file',
        'print_response' => false,
        'max_file_size' => 5 * 1024 * 1024,
        'accept_file_types' => '/\.(gif|jpe?g|png)$/i'
) );
$rsp = $upload_handler->get_response ();
$file = $rsp ['file'];

$data = array (
        'success' => false 
);
foreach ( $file as $f ) {
    if ($f->url && !$f->error) {
        $data ['success'] = true;
        $data ['path'] = $f->url;
    } else {
        $data ['success'] = false;
        $data ['error'] = $f->error;
    }
}

echo json_encode ( $data );

?>
