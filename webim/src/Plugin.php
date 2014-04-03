<?php

namespace WebIM;

/**
 * Web应用集成类
 */
class Plugin {

	/*
	 * 当前用户或者访客, WebIM统一定义为端点
	 */
	public $endpoint = NULL;

	/*
	 * 是否登录
	 */
	public $logined = false; 

	/*
	 * 初始化当前用户信息
	 */
    public function __construct() {
        global $IMC;
		if($this->uid()) {
			$this->loadUser();
			$this->logined = true;
		} else if($IMC['visitor']) {
            //支持访客模式
			$this->loadVisitor();
			$this->login = true;
		}
	}

	/*
	 * 接口函数: 读取当前用户的好友在线好友列表
     *
     * @param string $uid 当前用户uid
	 *
     * @return array buddies
     *
	 * Buddy对象属性:
	 *
	 * 	uid: 好友uid
	 * 	id:  同uid
	 *	nick: 好友昵称
	 *	pic_url: 头像图片
	 *	show: available | unavailable
	 *  url: 好友主页URL
	 *  status: 状态信息 
	 *  group: 所属组
	 *
	 */
	public function buddies($uid) {
		//根据当前用户id获取好友列表
		return array(clone $this->user);
	}

	/*
	 * 接口函数: 根据好友id列表读取用户
	 *
     * @param array $ids 用户id数组
     *
     * @return array buddies
     *
	 * Buddy属性同上
	 */
	public function buddiesByIds($ids) {
		//根据id列表获取好友列表
		return array();	
	}
	
	/*
	 * 接口函数：读取当前用户的Room列表
     * 
     * @param string $uid 
     *
     * @return array rooms
     *
	 * Room对象属性:
	 *
	 *	id:		Room ID,
	 *	nick:	显示名称
	 *	url:	Room主页地址
	 *	pic_url: Room图片
	 *	status: Room状态信息
	 *	count:  0
	 *	all_count: 成员总计
	 *	blocked: true | false 是否block
	 */
	public function rooms($uid) {
		//根据当前用户id获取群组列表
		$demoRoom = (object)array(
			"id" => '1',
			"nick" => 'demoroom',
			"url" => "#",
			"pic_url" => WEBIM_PATH . "static/images/chat.png",
			"status" => "demo room",
			"blocked" => false,
		);
		return array( $demoRoom );	
	}

	/*
	 * 接口函数: 根据id数组读取rooms
     *
     * @param array id数组
     *
     * @return array rooms
	 *
	 * Room对象属性同上
     *
	 */
	function roomsByIds($ids) {
		return array();	
	}

	/*
	 * 接口函数: 当前用户通知列表
	 *
	 * Notification对象属性:
	 *
	 * 	text: 文本
	 * 	link: 链接
	 */	
	function notifications($uid) {
		return array();
	}

	/*
	 * 接口函数: 集成项目的uid
	 */
	protected function uid() {
		return $_SESSION['uid'];
	}

	/*
	 * 接口函数: 初始化当前用户对象，与站点用户集成.
	 */
	protected function loadUser() {
		$uid = $_SESSION['uid'];
		//NOTICE: This user should be read from database.
		$this->endpoint = (object)array(
            'uid' => $uid,
            'id' => $uid,
            'nick' => "user-".$uid, 
            'presence' => 'online',
            'show' => "available",
            'pic_url' => WEBIM_PATH . "/static/images/male.png",
            'url' => "#",
            'status' => "",
        );
	}
	
	/*
	 * 接口函数: 创建访客对象，可根据实际需求修改.
	 */
	private function loadVisitor() {
		if ( isset($_COOKIE['_webim_visitor_id']) ) {
			$id = $_COOKIE['_webim_visitor_id'];
		} else {
			$id = substr(uniqid(), 6);
			setcookie('_webim_visitor_id', $id, time() + 3600 * 24 * 30, "/", "");
		}
        $this->endpoint = (object)array(
            'uid' => $id,
            'id' => 'vid:' . $id,
            'nick' => "v".$id,
            'presence' => 'online',
            'show' => "available",
            'pic_url' => WEBIM_PATH . "/static/images/male.png",
            'url' => "#",
        );
	}

}

