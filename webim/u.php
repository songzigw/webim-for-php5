<?php
error_reporting ( E_ALL | E_STRICT );
require ('UploadHandler.php');

if ($_POST ['upload']) {

    $upload_handler = new UploadHandler (array(
            'param_name' => 'file',
            'print_response' => false
    ));
    $rsp = $upload_handler->get_response();
    $file = $rsp['file'];
    
    $data = array(
            'success' => true
    );
    foreach ($file as $f) {
        $data['path'] = $f->url;
    }
    
    echo json_encode($data);

} else {
    
?>

<form enctype="multipart/form-data" method="post"
	action="<?php echo $_SERVER['SCRIPT_NAME']?>">
	<input name="file" type="file">
	<input name="upload" type="submit" value="Upload File">
</form>

<?php

}
?>