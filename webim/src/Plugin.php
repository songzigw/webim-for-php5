<?php

/**
 * WebIM-for-PHP5 
 *
 * @author      Ery Lee <ery.lee@gmail.com>
 * @copyright   2014 NexTalk.IM
 * @link        http://github.com/webim/webim-for-php5
 * @license     MIT LICENSE
 * @version     5.4.1
 * @package     WebIM
 *
 * MIT LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

namespace WebIM;

/**
 * WebIM Plugin
 *
 * @package WebIM
 * @autho Ery Lee
 * @since 5.4.1
 */
class Plugin {

    private $model;
    
    public function model($model = null) {
        if (func_num_args() === 0) {
            return $model;
        }
        $this->model = $model;
    }
    
	/*
	 * Init User
	 */
    public function __construct() { 
    }

    public function getUserById($uid, $isAgent = false) {
        return $this->_buddy($uid);
//         if ($isAgent) {
//             return $this->model->getAgentById($uid);
//         }
//         return $this->model->getUserById($uid);
    }

    /**
     * API: current user
     *
     * @return object current user
     */
    public function user() {
        global $_SESSION;
		$uid = isset($_SESSION['uid']) ? $_SESSION['uid'] : null;
        if( !$uid ) return null;

		return (object)array(
            'id' => $uid,
            'nick' => 'user' . $uid,
            'presence' => 'online',
            'show' => "available",
            'avatar' => WEBIM_IMAGE('head_b.jpg'),
            'url' => "#",
            'role' => 'user',
            'status' => "",
        );
    }

//     public function user() {
//         global $_SESSION;
//         $uid = isset($_COOKIE['ECS']['user_id']) ? $_COOKIE['ECS']['user_id'] : null;
//         if( !$uid ) return null;
    
//         return $this->getUserById($uid);
//     }
    
	/*
	 * API: Buddies of current user.
     *
     * @param string $uid current uid
	 *
     * @return array Buddy list
     *
	 * Buddy:
	 *
	 * 	id:         uid
	 *	nick:       nick
	 *	avatar:     url of photo
     *	presence:   online | offline
	 *	show:       available | unavailable | away | busy | hidden
	 *  url:        url of home page of buddy 
	 *  status:     buddy status information
	 *  group:      group of buddy
	 *
	 */
	public function buddies($uid) {
        //TODO: DEMO Code
        return array_map( array($this, '_buddy'), range(1, 10) );
        //return array();
	}

	/*
	 * API: buddies by ids
	 *
     * @param array $ids buddy id array
     *
     * @return array Buddy list
     *
	 * Buddy
	 */
	public function buddiesByIds($uid, $ids) {
        return array_map( array($this, '_buddy'), $ids );
	    //return array();
	}

    /**
     * Demo Buddy
     */
    private function _buddy($id) {
        return (object) array(
            'id' => $id,
            'nick' => 'user'.$id,
            'group' => 'friend',
            'presence' => 'offline',
            'show' => 'unavailable',
            'status' => '#',
            'avatar' => WEBIM_IMAGE('head_a.jpg')
        );
    }

	/*
	 * API：rooms of current user
     * 
     * @param string $uid 
     *
     * @return array rooms
     *
	 * Room:
	 *
	 *	id:		    Room ID,
	 *	nick:	    Room Nick
	 *	url:	    Home page of room
	 *	status:     Room status 
	 *	count:      count of online members
	 *	all_count:  count of all members
	 *	blocked:    true | false
	 */
	public function rooms($uid) {
        //TODO: DEMO CODE
		$room = (object)array(
			'id' => 'room',
            'name' => 'room',
			'nick' => 'Room',
			'url' => "#",
			'avatar' => WEBIM_IMAGE('room.png'),
			'status' => "Room",
			'blocked' => false,
            'temporary' => false
		);
		return array( $room );	
		//return array();
	}

	/*
	 * API: rooms by ids
     *
     * @param array id array
     *
     * @return array rooms
	 *
	 * Room
     *
	 */
	public function roomsByIds($uid, $ids) {
        $rooms = array();
        foreach($ids as $id) {
            if($id === 'room') { 
                $rooms[] = (object)array(
                    'id' => $id,
                    'name' => $id,
                    'nick' => 'room'.$id,
                    'url' => "#",
                    'avatar' => WEBIM_IMAGE('room.png')
                );
            }
        }
		return $rooms;
        //return array();
	}

    /**
     * API: members of room
     *
     * $param $room string roomid
     * 
     */
    public function members($room) {
        //TODO: DEMO CODE
        return array_map( array($this, '_member'), range(1, 10) );
    }

    /**
     * Demo member
     */
    private function _member($id) {
        return (object)array(
            'id' => $id,
            'nick' => 'user'.$id
        ); 
    }

	/*
	 * API: notifications of current user
	 *
     * @return array  notification list
     *
	 * Notification:
	 *
	 * 	text: text
	 * 	link: link
	 */	
	public function notifications($uid) {
        $noti = (object)array('text' => 'Notification', 'link' => '#');
		return array($noti);
	}

    /**
     * API: menu
     *
     * @return array menu list
     *
     * Menu:
     *
     * icon
     * text
     * link
     */
    public function menu($uid) {
        return array();
    }

    /**
     * API: 敏感词检查
     *
     * @return true if pass
     */
    public function censor($msg) {
        $file = dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'censor.txt';
        $words = explode("\r\n", file_get_contents($file));
        foreach ($words as $word) {
            if( !empty( $word ) && stripos($msg, $word) !== false  ) return false;
        }
        return true;
    }

}


