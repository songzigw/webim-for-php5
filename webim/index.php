<?php

/*
 * WebIM应用的入口文件
 */ 

require 'env.php'; 

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


