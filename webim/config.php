<?php return array (

  //Database
  'dbhost' => "127.0.0.1",
  'dbport' => "3306",
  'dbuser' => "root",
  'dbpassword' => "123456",
  'dbname' => "webim5",
  'dbprefix' => "webim_",
    
  //WebIM Config
  'version' => '5.8',
  'isopen' => true,
  'debug' => true,
  'domain' => 'localhost',
  'apikey' => 'public',
  //Single Node
  'server' => 't.nextalk.im:8000',
  //Cluster Nodes
  //'server' => array('t1.nextalk.im:8080', 't2.nextalk.im:8080'),
  'emot' => 'default',
  'theme' => 'blitzer',
  'opacity' => '80',
  'local' => 'zh-CN',
  'show_realname' => false,
  'discussion' => false,
  'enable_room' => true,
  'enable_chatlink' => true,
  //5.8 add
  'enable_chatbtn' => true,
  'enable_shortcut' => true,
  'enable_menu' => false,
  'enable_login' => false,
  'enable_ask' => false,
  'enable_noti' => true,
  'admin_uids' => '0',
  'visitor' => true,
  'show_unavailable' => true,
  'upload' => true,
  'censor' => false,
  'robot' => false,
);
