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
 * WebIM Data Model
 *
 * @package WebIM
 * @autho Ery Lee
 * @since 5.4.1
 */
class Model {

    /**
     * Configure ORM
     */
    public function __construct() {
        global $IMC;
        \ORM::configure('mysql:host=' . $IMC['dbhost']. ';port=' . $IMC['dbport'] . ';dbname=' . $IMC['dbname']);
        \ORM::configure('username', $IMC['dbuser']);
        \ORM::configure('password', $IMC['dbpassword']);
        \ORM::configure('logging', true);
        \ORM::configure('return_result_sets', true);
        \ORM::configure('driver_options', array(\PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));
    }
    
    /** 用户获取收藏房源信息 */
    public function get_user_favorite($userid) {
        $house = $this->T2('ecs_goods')
        ->tableAlias('t1')
        ->select('t1.goods_id', 'goods_id')
        ->select('t1.goods_name', 'goods_name')
        ->select('t1.shop_price', 'shop_price')
        ->select('t1.goods_img', 'goods_img')
        ->join('ecs_user_favorite', array('t2.item_id', '=', 't1.goods_id'), 't2')
        ->where('t2.user_id', $userid)
        ->findArray();
        return array_map( array($this, '_toObj'), $house);
        
    }
    
    public function getUserById($uid) {
        $user = $this->T2('ecs_users')
                    ->where('user_id', $uid)
                    ->findOne();
        if (!$user) {
            return null;
        }
        
        if ($user->user_type == 0) {
            $type = 'general';
        } elseif ($user->user_type == 1) {
            $type = 'agent';
        } elseif ($user->user_type == 2) {
            $type = 'backstage';
        } else {
            $type = 'general';
        }

        $agentObjArr = array();
        if ($type == 'backstage') {
            $agentArray = $this->T2('ecs_agent')
                        ->where('customer_id', $uid)
                        ->findArray();
            $agentObjArr = array_map(array($this, '_toUserObj'), $agentArray);
        }
        
        $agent = $this->T2('ecs_agent')
                    ->where('user_id', $uid)
                    ->findOne();
        if (!$agent) {
            return (object) array(
                'id' => $user->user_id,
                'nick' => $user->user_name,
                'group' => 'friend',
                'presence' => 'offline',
                'show' => 'unavailable',
                'status' => '#',
                'avatar' => $user->user_face,
                'type' => $type,
                'agents' => $agentObjArr
            );
        }
        
        return (object) array(
                'id' => $user->user_id,
                'nick' => $agent->name,
                'group' => 'friend',
                'presence' => 'offline',
                'show' => 'unavailable',
                'status' => '#',
                'avatar' => '/images/agentphoto/'.$agent->face,
                'type' => 'agent',
                'agents' => $agentObjArr
            );
    }
    
    public function getAgentByUid($uid) {
        $agent = $this->T2('ecs_agent')
                ->where('user_id', $uid)
                ->findOne();
        if (!$agent) {
            return null;
        }
    
        return (object) array(
                'id' => $agent->user_id,
                'nick' => $agent->name,
                'group' => 'friend',
                'presence' => 'offline',
                'show' => 'unavailable',
                'status' => '#',
                'avatar' => '/images/agentphoto/'.$agent->face,
                'type' => 'agent',
                'tel_400' => $agent->tel_400
        );
    }
    
    public function insert_conv($conversation) {
        $tConvs = $this->T('conversations');
        $conv = $tConvs->where('uid', $conversation['uid'])
                        ->where('oid', $conversation['oid'])
                        ->findOne();
        if ($conv) {
            // UPDATE
            $conv->set(array(
                    'body' => $conversation['body'],
                    'direction' => $conversation['direction'],
                    'oname' => $conversation['oname'],
                    'oavatar' => $conversation['oavatar']
                   ))
                 ->setExpr('updated', 'NOW()');
            $conv->save();
            return;
        }
        
        // ADD
        $row = $tConvs->create();
        $row->set($conversation)
            ->setExpr('created', 'NOW()')
            ->setExpr('updated', 'NOW()');
        $row->save();
    }
    
    public function query_convs($uid, $type) {
        if ($type != 'backstage') {
            $query = $this->T('conversations')
            ->where('uid', $uid)
            ->orderByDesc('updated');
            $convArray = $query->findArray();
            $convObjArr = array_map(array($this, '_toObj'), $convArray);
        } else {
            $convArray = $this->T2('webim_conversations')
            ->tableAlias('conver')
            ->select('conver.id', 'id')
            ->select('conver.uid', 'uid')
            ->select('conver.oid', 'oid')
            ->select('conver.body', 'body')
            ->select('conver.created', 'created')
            ->select('conver.updated', 'updated')
            ->select('conver.type', 'type')
            ->select('conver.direction', 'direction')
            ->select('conver.oname', 'oname')
            ->select('conver.oavatar', 'oavatar')
            ->join('ecs_agent', array('agent.user_id', '=', 'conver.uid'), 'agent')
            ->where('agent.customer_id', $uid)
            ->orderByDesc('conver.updated')
            ->findArray();
            $convObjArr = array_map(array($this, '_toObj'), $convArray);
        }
        return $convObjArr;
    }
    
    /**
     * Get histories 
     *
     * @params string $uid current uid
     * @params string $with the uid that talk with
     * @params 'chat'|'grpchat' $type history type
     * @params integer $limit result limit
     */
    public function histories($uid, $with, $type = 'chat',  $limit = 30) {
        if( $type === 'chat') {
            $query = $this->T('histories')->where('type', 'chat')
                ->whereRaw("(`to`= ? AND `from`= ? AND `fromdel` != 1) OR (`send` = 1 AND `from`= ? AND `to`= ? AND `todel` != 1)", array($with, $uid, $with, $uid))
                ->orderByDesc('timestamp')->limit($limit);
        } else {
            $query = $this->T('histories')->where('type', 'grpchat')
                ->where('to', $with)
                ->where('send', 1)
                ->orderByDesc('timestamp')->limit($limit);
        }
        return array_reverse( array_map( array($this, '_toObj'), $query->findArray() ) );
    }

    /**
     * Get offline histories
     *
     * @params string $uid current uid
     * @params integer $limit result limit
     */
	public function offlineHistories($uid, $limit = 50) {
        $query = $this->T('histories')->where('to', $uid)->whereNotEqual('send', 1)
            ->orderByDesc('timestamp')->limit($limit);
        return array_reverse( array_map( array($this, '_toObj'), $query->findArray() ) );
	}

    /**
     * Save history
     *
     * @params array $message message object
     */
    public function insertHistory($message) {
        $history = $this->T('histories')->create(); 
        $history->set($message)->setExpr('created', 'NOW()');
        $history->save();
    }

    /**
     * Clear histories
     *
     * @params string $uid current uid
     * @params string $with user that talked with
     */
    public function clearHistories($uid, $with) {
        $this->T('histories')->where('from', $uid)->where('to', $with)
            ->findResultSet()
            ->set(array( "fromdel" => 1, "type" => "chat" ))
            ->save();
        $this->T('histories')->where('to', $uid)->where('from', $with)
            ->findResultSet()
            ->set(array( "todel" => 1, "type" => "chat" ))
            ->save();
        $this->T('histories')->where('todel', 1)->where('fromdel', 1)
            ->deleteMany();
    }

    /**
     * Offline histories readed
     *
     * @param string $uid user id
     */
	public function offlineReaded($uid) {
        $this->T('histories')->where('to', $uid)->where('send', 0)->findResultSet()->set('send', 1)->save();
	}

    /**
     * User setting
     *
     * @param string @uid userid
     * @param string @data json 
     *
     * @return object|null
     */
    public function setting($uid, $data = null) {
        $setting = $this->T('settings')->where('uid', $uid)->findOne();
        if (func_num_args() === 1) { //get setting
           if($setting) return json_decode($setting->data); 
            return new \stdClass();
        } 
        //save setting
        if($setting) {
            if(is_string( $data )) {
                $data = stripcslashes( $data );
            } else {
                $data = json_encode( $data );
            }
            $setting->data = $data;
            $setting->save();
        } else {
            $setting = $this->T('settings')->create();
            $setting->set(array(
                'uid' => $uid,
                'data' => $data
            ))->set_expr('created', 'NOW()');
            $setting->save();
        }
    }

    /**
     * All rooms of the user
     *
     * @param string $uid user id
     * @return array rooms array
     */
    public function rooms($uid) {
        $rooms = $this->T('members')
            ->tableAlias('t1')
            ->select('t1.room', 'name')
            ->select('t2.nick', 'nick')
            ->select('t2.url', 'url')
            ->join($this->prefix('rooms'), array('t1.room', '=', 't2.name'), 't2')
            ->where('t1.uid', $uid)->findArray();
        return array_map( array($this, '_roomObj'), $rooms );
    }

    /**
     * Get rooms by ids
     *
     * @param array $ids id list
     * @return array rooms
     */
    public function roomsByIds($uid, $ids) {
        if(empty($ids)) return array();
        $rooms = $this->T('rooms')->whereIn('name', $ids)->findArray();
        return array_map( array($this, '_roomObj'), $rooms );
    }

    /**
     * room object
     */
    private function _roomObj($room) {
        return (object)array(
            'id' => $room['name'],
            'name' => $room['name'],
            'nick' => $room['nick'],
            "url" => $room['url'],
            "avatar" => WEBIM_IMAGE("room.png"),
            "status" => "",
            "temporary" => true,
            "blocked" => false);
    }

    /**
     * Members of room
     *
     * @param string $room room id
     * @return array members array
     */
    public function members($room) {
        $members = $this->T('members')
            ->select('uid', 'id')
            ->select('nick')
            ->where('room', $room)->findArray();
        return array_map( array($this, '_toObj'), $members );
    }

    /**
     * Create room
     *
     * @param array $data room data
     * @return Room as array
     */
    public function createRoom($data) {
        $name = $data['name'];
        $room = $this->T('rooms')->where('name', $name)->findOne();
        if($room) return $room;
        $room = $this->T('rooms')->create();
        $room->set($data)->set_expr('created', 'NOW()')->set_expr('updated', 'NOW()');
        $room->save();
        return $room;
    }

    /**
     * Invite members to join room
     *
     * $param string $room room id
     * $param array $members member array
     */
    public function inviteRoom($room, $members) {
        foreach($members as $member) {
            $this->joinRoom($room, $member->id, $member->nick);
        }
    }

    /**
     * Join room
     *
     * $param string $room room id
     * $param string $uid user id
     * $param string $nick user nick
     */
    public function joinRoom($room, $uid, $nick) {
        $member = $this->T('members')
            ->where('room', $room)
            ->where('uid', $uid)
            ->findOne();
        if($member == null) {
            $member = $this->T('members')->create();
            $member->set(array(
                'uid' => $uid,
                'nick' => $nick,
                'room' => $room
            ))->set_expr('joined', 'NOW()');
            $member->save();
        }
    }

    /**
     * Leave room
     *
     * $param string $room room id
     * $param string $uid user id
     */
    public function leaveRoom($room, $uid) {
        $this->T('members')->where('room', $room)->where('uid', $uid)->deleteMany();
        //if no members, room deleted...
        $data = $this->T("members")->selectExpr('count(id)', 'total')->where('room', $room)->findOne();
        if($data && $data->total === 0) {
            $this->T('rooms')->where('name', $room)->deleteMany();
        }
    }

    /**
     * Block room
     *
     * $param string $room room id
     * $param string $uid user id
     */
    public function blockRoom($room, $uid) {
        $block = $this->T('blocked')->select('id')
            ->where('room', $room)
            ->where('uid', $uid)->findOne();
        if($block == null) {
            $this->T('blocked')->create()
                ->set('room', $room)
                ->set('uid', $uid)
                ->setExpr('blocked', 'NOW()')
                ->save();
        }
    }

    /**
     * Is room blocked
     *
     * $param string $room room id
     * $param string $uid user id
     *
     * @return true|false
     */
    public function isRoomBlocked($room, $uid) {
        $block = $this->T('blocked')->select('id')->where('uid', $uid)->where('room', $room)->findOne();
        return !(null == $block);
    }

    /**
     * Unblock room
     *
     * @param string $room room id
     * @param string $uid user id
     */
    public function unblockRoom($room, $uid) {
        $this->T('blocked')->where('uid', $uid)->where('room', $room)->deleteMany();
    }

    /**
     * Get visitor
     */
    function visitor() {
        global $_COOKIE, $_SERVER;
        if (isset($_COOKIE['_webim_visitor_id'])) {
            $id = $_COOKIE['_webim_visitor_id'];
        } else {
            $id = substr(uniqid(), 6);
            setcookie('_webim_visitor_id', $id, time() + 3600 * 24 * 30, "/", "");
        }
        $vid = 'vid:'. $id;
        $visitor = $this->T('visitors')->where('name', $vid)->findOne();
        if( !$visitor ) {
            $ipaddr = isset($_SERVER['X-Forwarded-For']) ? $_SERVER['X-Forwarded-For'] : $_SERVER["REMOTE_ADDR"];
            require_once dirname(__FILE__) . '/../vendor/webim/geoip-php/IP.class.php';
            $loc = \IP::find($ipaddr);
            if(is_array($loc)) $loc = implode('',  $loc);
            $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
            $visitor = $this->T('visitors')->create();
            $visitor->set(array(
                "name" => $vid,
                "ipaddr" => $ipaddr,
                "url" => $_SERVER['REQUEST_URI'],
                "referer" => $referer,
                "location" => $loc,
            ))->setExpr('created', 'NOW()');
            $visitor->save();
        }
        return (object) array(
            'id' => $vid,
            'nick' => "v".$id,
            'group' => "visitor",
            'presence' => 'online',
            'show' => "available",
            'avatar' => WEBIM_IMAGE('visitor.png'),
            'role' => 'visitor',
            'url' => "#",
            'status' => "",
            'type' => 'general',
        );
    }
    
    /**
     * visitors by vids
     */
    function visitors($vids) {
        if( count($vids)  == 0 ) return array();
        $vids = implode("','", $vids);
        $rows = $this->T('visitors')
            ->select('name')
            ->select('ipaddr')
            ->select('location')
            ->whereIn('name', $vids)
            ->findMany();
        $visitors = array();
        foreach($rows as $v) {
            $status = $v->location;
            if( $v->ipaddr ) $status = $status . '(' . $v->ipaddr .')';
            $visitors[] = (object)array(
                "id" => $v->name,
                "nick" => "v".substr($v->name, 4), //remove vid:
                "group" => "visitor",
                "url" => "#",
                "avatar" => WEBIM_IMAGE('visitor.png'),
                "status" => $status,
                'type' => 'general',
            );
        }
        return $visitors;
    }

    /**
     * Asks
     */
    public function asks($uid) {
        $rows = $this->T('asks')->whereRaw("(to_id = ? and answer = 0) or (from_id = ? and answer >0)", array($uid, $uid))
            ->orderByDesc('id')->limit(10)->findMany();
        $asks = array();
        foreach($rows as $v) { 
            
            if($v->answer == 0) {
                $ask = array(
                    'from' => $v->from_id,
                    'nick' => $v->from_nick,
                    'to' => $v->to_id,
                    'time' => $this->_format($v->initiated)
                );
            } else {
                $ask = array(
                    'from' => $v->to_id,
                    'nick' => $v->to_nick,
                    'to' => $v->from_id,
                    'time' => $this->_format($v->answered)
                );
            }
            $ask['id'] = $v->id;
            $ask['answer'] = $v->answer;
            $asks[] = (object)$ask; 
        }
        return array_reverse($asks);
    }

    public function accept_ask($uid, $askid) {
        /* select * from webim_asks where id = $askid and to_id = '$uid' */
        $ask = $this->T('asks')->where('id', $askid)->where('to_id', $uid)->findOne();
        if( $ask ) {
            /* update webim_asks set answer = 2, answered = NOW() where id = $askid; */
            $ask->set(array('answer' => 1, 'answered' => date( 'Y-m-d H:i:s' )));
            $ask->save();
        }
    }

    public function reject_ask($uid, $askid) {
        /* select * from webim_asks where id = $askid and to_id = '$uid' */
        $ask = $this->T('asks')->where('id', $askid)->where('to_id', $uid)->findOne();
        if( $ask ) {
            /* update webim_asks set answer = 1, updated = NOW() where id = $askid; */
            /* update webim_asks set answer = 2, answered = NOW() where id = $askid; */
            $ask->set(array('answer' => 2, 'answered' => date( 'Y-m-d H:i:s' )));
            $ask->save();
        }
    }
 
    public function get_random_agent() {
        $query = $this->T2('ecs_agent')
                    ->whereRaw("(`is_default` = 1)")
                    ->limit(5);
        $convArray = $query->findArray();
        $convObjArr = array_map(array($this, '_toObj'), $convArray);
        return $convObjArr;
    }
  
    public function get_house($houseId) {
         $house = $this->T2('ecs_goods')
                    ->where('goods_id', $houseId)
                    ->findOne();
         if(!$house){
            return null;
         }
         
         return (object) array(
                 'goods_id' => $house->goods_id,
                 'goods_name' => $house->goods_name,
                 'shop_price' => $house->shop_price,
                 'goods_img' => $house->goods_img,
         );
    } 

    private function _format($time) {
        $date = new \DateTime($time);
        return $date->format('m-d');
    }

    private function T2($table) {
        return \ORM::forTable($table);
    }

    /**
     * Table query
     *
     * @param string $table table name
     * @return Query 
     */
    private function T($table) {
        return \ORM::forTable($this->prefix($table)); 
    }

    /**
     * Table name with prefix
     *
     * @param string $table table name
     * @return string table name with prefix
     */
    private function prefix($table) { 
        global $IMC; return $IMC['dbprefix'] . $table;
    }

    private function _toObj($v) {
        return (object)$v;
    }

    private function _toUserObj($agent) {
        return (object) array(
                'id' => $agent['user_id'],
                'nick' => $agent['name'],
                'group' => 'friend',
                'presence' => 'offline',
                'show' => 'unavailable',
                'status' => '#',
                'avatar' => '/images/agentphoto/'.$agent['face'],
                'type' => 'agent'
        );
    }
}

?>
