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
			$this->logined = true;
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
     *	presence: online | offline
	 *	show: available | unavailable
	 *  url: 好友主页URL
	 *  status: 状态信息 
	 *  group: 所属组
	 *
	 */
	public function buddies($uid) {
		//根据当前用户id获取好友列表
        $buddies = array();
        $ids = range(1, 10);
        foreach ($ids  as $id) {
            $buddies[] = array(
                'id' => 'uid' . $id,
                'uid' => 'uid' . $id,
                'group' => 'friend',
                'nick' => 'user'.$id,
                'presence' => 'offline',
                'show' => 'unavailable',
                'status' => '#',
                'pic_url' => WEBIM_IMAGE('male.png'),
            ); 
        }
        return $buddies;
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
        if( empty($ids) ) return array();
        foreach($ids as $id) {
            $buddies[] = array(
                'id' => $id,
                'uid' => $id,
                'group' => 'friend',
                'nick' => preg_replace('/uid/', 'user', $id),
                'presence' => 'offline',
                'show' => 'unavailable',
                'status' => '#',
                'pic_url' => WEBIM_IMAGE('male.png'),
            ); 
        }
		return $buddies;	
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
		$demoRoom = array(
			'id' => '1',
            'name' => 'room1',
			'nick' => 'Persist Room',
			'url' => "#",
			'pic_url' => WEBIM_IMAGE('room.png'),
			'status' => "Persist Room",
			'blocked' => false,
            'temporary' => false
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

    /**
     * 读取persist群组成员
     */
    function members($room) {
        $members = array();
        foreach (range(1, 10)  as $id) {
            $members[] = array(
                'id' => 'uid' . $id,
                'uid' => 'uid' . $id,
                'nick' => 'user'.$id
            ); 
        }
        return $members;
    }

    /**
     * Persist Room
     */
    function room($id) {
        if($id == '1') {
            return array(
                'id' => '1',
                'name' => 'room1',
                'nick' => 'Persist Room',
                'url' => "#",
                'pic_url' => WEBIM_IMAGE('room.png'),
                'status' => "Demo Room",
                'blocked' => false,
                'temporary' => false
            );
        }
        return null;
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
        $demo = array('text' => '通知演示', 'link' => '#');
		return array($demo);
	}

	/*
	 * 接口函数: 集成项目的uid
	 */
	protected function uid() {
        global $_SESSION;
		return isset($_SESSION['uid']) ? $_SESSION['uid'] : null;
	}

	/*
	 * 接口函数: 初始化当前用户对象，与站点用户集成.
	 */
	protected function loadUser() {
		$uid = $_SESSION['uid'];
		//NOTICE: This user should be read from database.
		$this->endpoint = array(
            'uid' => 'uid'.$uid,
            'id' => 'uid'.$uid,
            'nick' => "user".$uid, 
            'presence' => 'online',
            'show' => "available",
            'pic_url' => WEBIM_IMAGE('male.png'),
            'url' => "#",
            'role' => 'user',
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
        $this->endpoint = array(
            'uid' => 'vid:' . $id,
            'id' => 'vid:' . $id,
            'nick' => "v".$id,
            'presence' => 'online',
            'show' => "available",
            'pic_url' => WEBIM_IMAGE('male.png'),
            'role' => 'visitor',
            'url' => "#",
            'status' => "",
        );
	}

}

