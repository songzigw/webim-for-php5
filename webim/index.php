<?php

/*
 * WebIM应用的入口文件
 */ 

define('WEBIM_DEBUG', true);

if(WEBIM_DEBUG) {
    session_start();
	error_reporting( E_ALL );
} else {
	error_reporting( E_ALL & ~E_NOTICE & ~E_STRICT );
}

define('WEBIM_VERSION', '5.4');

define('WEBIM_PRODUCT', 'php5');

function WEBIM_PATH() {
	global $_SERVER;
    $name = htmlspecialchars($_SERVER['SCRIPT_NAME'] ? $_SERVER['SCRIPT_NAME'] : $_SERVER['PHP_SELF']); 
    return substr( $name, 0, strrpos( $name, '/' ) ) . "/";
}

function WEBIM_IMAGE($img) {
    return WEBIM_PATH() . "static/images/{$img}";
}

/**
 * 全局配置
 */
$IMC = require('config.php');

if( !$IMC['isopen'] ) exit();

/**
 * WebIM客户库，消息服务器通信
 *
 * 详见: https://github.com/webim/webim-php
 */
require './vendor/autoload.php';

/**
 * 数据库模型
 */
require './src/Model.php';

/**
 * 插件Plugin类, 集成站点用户
 */
require './src/Plugin.php';

/**
 * 路由类，处理WebIM请求
 */
require './src/Router.php';

/**
 * 路由分发
 */
$router = new \WebIM\Router();

$router->model( new \WebIM\Model() );

$router->plugin( new \WebIM\Plugin() );

$router->route();


