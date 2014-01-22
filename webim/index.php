<?php

/*
 * Webim应用的入口文件
 *
 * @author ery lee <ery.lee at gmail.com>
 * @version 5.2
 */ 
define('WEBIM_VERSION', '5.2');
define('WEBIM_PRODUCTION_NAME', 'php5');
define('WEBIM_DEBUG', false);
define('WEBIMDB_CHARSET', 'utf8');
define('WEBIM_PATH', '/webim/');

if(WEBIM_DEBUG) {
	error_reporting( E_ALL );
} else {
	error_reporting( E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED );
}

$IMC = require_once('conf/config.php');

//Libraries
require_once('./lib/HttpClient.class.php');
require_once('./lib/WebimClient.class.php');
require_once('./lib/WebimDB.class.php');

//Models
require_once('./model/HistoryModel.class.php');
require_once('./model/SettingModel.class.php');

//Plugin
require_once('./WebimPlugin.class.php');

//Actions
require_once('./WebimAction.class.php');

//Dispatch actions
$mod = new WebimAction();

$act = $mod->input('action');

if($act) {
	call_user_func(array($mod, $act));
} else {
	header( "HTTP/1.0 400 Bad Request" );
	exit("No 'action' input parameter!");
}

