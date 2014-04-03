<?php

namespace WebIM;

class Router {

    /**
     * WebIM Endpoint
     */
    private endpoint;

	/*
	 * WebIM Ticket
	 */
	private $ticket;

	/*
	 * WebIM Client
	 */
	private $client;

	/*
	 * WebIM Plugin
	 */
	private $plugin;

	/*
	 * WebIM Model
	 */
	private $model;

	public function __construct() { }

    public function route() {
		//IM Ticket
		$ticket = $this->input('ticket');
		if($ticket) $ticket = stripslashes($ticket);	
		$this->ticket = $ticket;
		//IM Client
        $this->client = new \WebIM\WebIM(
            $this->plugin->endpoint, 
            $IMC['domain'], 
            $IMC['apikey'], 
            $IMC['server'], 
            $this->ticket,
            );
        $method = $this->input('action');
        if($method) {
            call_user_func(array($this, $method));
        } else {
            header( "HTTP/1.0 400 Bad Request" );
            exit("No 'action' parameter");
        }
    }

    /**
     * 设置Plugin
     */
    public function plugin($plugin = null) {
        if (func_num_args() === 0) {
            return $this->plugin;
        }
        $this->plugin = $plugin; 
    }

    /**
     * 设置Model
     */
    public function model($model = null) {
        if (func_num_args() === 0) {
            return $model;
        }
        $this->model = $model;
    }

    /**
     * Boot Javascript
     */
	public function boot() {

        /**
         * 用户是否登录
         */
		if( !$this->plugin->logined() ) exit();

        $this->endpoint = $this->plugin->endpoint();

        //FIX offline bug
        $endpoint->show = "unavailable";

		$fields = array(
			'theme', 
			'local', 
			'emot',
			'opacity',
			'enable_room', 
			'enable_chatlink', 
			'enable_shortcut',
			'enable_noti',
			'enable_menu',
			'show_unavailable',
			'upload');

		$scriptVar = array(
            'version' => WEBIM_VERSION,
			'product_name' => WEBIM_PRODUCT,
			'path' => WEBIM_PATH,
			'is_login' => '1',
            'is_visitor' => $this->endpoint->role === 'visitor',
			'login_options' => '',
			'user' => $this->endpoint,
			'setting' => $this->model->setting($this->endpoint->uid),
			'min' => WEBIM_DEBUG ? "" : ".min"
		);

		foreach($fields as $f) {
			$scriptVar[$f] = $IMC[$f];	
		}

		header("Content-type: application/javascript");
		header("Cache-Control: no-cache");
		echo "var _IMC = " . json_encode($scriptVar) . ";" . PHP_EOL;

		$script = <<<EOF
_IMC.script = window.webim ? '' : ('<link href="' + _IMC.path + '/static/webim' + _IMC.min + '.css?' + _IMC.version + '" media="all" type="text/css" rel="stylesheet"/><link href="' + _IMC.path + '/static/themes/' + _IMC.theme + '/jquery.ui.theme.css?' + _IMC.version + '" media="all" type="text/css" rel="stylesheet"/><script src="' + _IMC.path + '/static/webim' + _IMC.min + '.js?' + _IMC.version + '" type="text/javascript"></script><script src="' + _IMC.path + '/static/i18n/webim-' + _IMC.local + '.js?' + _IMC.version + '" type="text/javascript"></script>');
_IMC.script += '<script src="' + _IMC.path + '/webim.' + _IMC.product_name + '.js?vsn=' + _IMC.version + '" type="text/javascript"></script>';
document.write( _IMC.script );

EOF;
		exit($script);
	}

    /**
     * Endpoint Online
     */
	public function online() {
		if ( !$this->plugin->logined() ) {
			$this->jsonReturn(array( 
				"success" => false, 
				"error_msg" => "Forbidden" ));
		}
		$uid = $this->endpoint->uid;
		$im_buddies = array(); //For online.
		$im_rooms = array(); //For online.
		$strangers = $this->idsArray( $this->input('stranger_ids') );
		$cache_buddies = array();//For find.
		$cache_rooms = array();//For find.

		$active_buddies = $this->idsArray( $this->input('buddy_ids') );
		$active_rooms = $this->idsArray( $this->input('room_ids') );

		$new_messages = $this->model->offlineHistories($uid);
		$online_buddies = $this->plugin->buddies($uid);
		
		$buddies_with_info = array();
		//Active buddy who send a new message.
		foreach($new_messages as $msg) {
			if(!in_array($msg['from'], $active_buddies)) {
				$active_buddies[] = $msg['from'];
			}
		}

		//Find im_buddies
		$all_buddies = array();
		foreach($online_buddies as $k => $v){
			$id = $v->id;
			$im_buddies[] = $id;
			$buddies_with_info[] = $id;
			$v->presence = "offline";
			$v->show = "unavailable";
			$cache_buddies[$id] = $v;
			$all_buddies[] = $id;
		}

		//Get active buddies info.
		$buddies_without_info = array();
		foreach($active_buddies as $k => $v){
			if(!in_array($v, $buddies_with_info)){
				$buddies_without_info[] = $v;
			}
		}
		if(!empty($buddies_without_info) || !empty($strangers)){
			//FIXME
			$bb = $this->plugin->buddiesByIds(implode(",", $buddies_without_info), implode(",", $strangers));
			foreach( $bb as $k => $v){
				$id = $v->id;
				$im_buddies[] = $id;
				$v->presence = "offline";
				$v->show = "unavailable";
				$cache_buddies[$id] = $v;
			}
		}
		if(!$IMC['enable_room']){
			$rooms = $this->plugin->rooms($uid);
			$setting = $this->model->setting($uid);
			$blocked_rooms = $setting && is_array($setting->blocked_rooms) ? $setting->blocked_rooms : array();
			//Find im_rooms 
			//Except blocked.
			foreach($rooms as $k => $v){
				$id = $v->id;
				if(in_array($id, $blocked_rooms)){
					$v->blocked = true;
				}else{
					$v->blocked = false;
					$im_rooms[] = $id;
				}
				$cache_rooms[$id] = $v;
			}
			//Add temporary rooms 
			$temp_rooms = $setting && is_array($setting->temporary_rooms) ? $setting->temporary_rooms : array();
			for ($i = 0; $i < count($temp_rooms); $i++) {
				$rr = $temp_rooms[$i];
				$rr->temporary = true;
				$rr->pic_url = (WEBIM_PATH . "static/images/chat.png");
				$rooms[] = $rr;
				$im_rooms[] = $rr->id;
				$cache_rooms[$rr->id] = $rr;
			}
		}else{
			$rooms = array();
		}

		//===============Online===============
		$data = $this->client->online( implode(",", array_unique( $im_buddies ) ), implode(",", array_unique( $im_rooms ) ) );

		if( $data->success ){
			$data->new_messages = $new_messages;

			if(!$IMC['enable_room']){
                //5.2 fix 20140112
				//Add room online member count.
				foreach ($data->rooms as $id => $count) {
					$cache_rooms[$id]->count = $count;
				}
				//Show all rooms.
			}
			$data->rooms = $rooms;

			$show_buddies = array();//For output.
            //5.2 fix 20140112
			foreach($data->buddies as $id => $show){
				if(!isset($cache_buddies[$id])){
					$cache_buddies[$id] = (object)array(
						"id" => $id,
						"nick" => $id,
						"incomplete" => true,
					);
				}
				$b = $cache_buddies[$id];
				$b->presence = "online";
				$b->show = $show;
                //5.2 fix 20140112
				//if( !empty($v->nick) )
				//	$b->nick = $v->nick;
				//if( !empty($v->status) )
				//	$b->status = $v->status;
				#show online buddy
				$show_buddies[] = $id;
			}
			#show active buddy
			$show_buddies = array_unique(array_merge($show_buddies, $active_buddies, $all_buddies));
			$o = array();
			foreach($show_buddies as $id){
				//Some user maybe not exist.
				if(isset($cache_buddies[$id])){
					$o[] = $cache_buddies[$id];
				}
			}

			//Provide history for active buddies and rooms
			foreach($active_buddies as $id){
				if(isset($cache_buddies[$id])){
					$cache_buddies[$id]->history = $this->model->histories($uid, $id, "chat" );
				}
			}
			foreach($active_rooms as $id){
				if(isset($cache_rooms[$id])){
					$cache_rooms[$id]->history = $this->model->histories($uid, $id, "grpchat" );
				}
			}

			$show_buddies = $o;
			$data->buddies = $show_buddies;
			$this->model->offlineReaded($this->endpoint->uid);
			$this->jsonReturn($data);
		} else {
			$this->jsonReturn(array( 
				"success" => false, 
				"error_msg" => empty( $data->error_msg ) ? "IM Server Not Found" : "IM Server Not Authorized", 
				"im_error_msg" => $data->error_msg)); 
		}
	}

    /**
     * Offline API
     */
	public function offline() {
		$this->client->offline();
		$this->okReturn();
	}

    /**
     * Browser Refresh, may be called
     */
	public function refresh() {
		$this->client->offline();
		$this->okReturn();
	}

    /**
     * Buddies by ids
     */
	public function buddies() {
		$ids = $this->input('ids');
		$this->jsonReturn($this->plugin->buddiesByIds($ids));
	}

    /**
     * Send Message
     */
	public function message() {
		$type = $this->input("type");
		$offline = $this->input("offline");
		$to = $this->input("to");
		$body = $this->input("body");
		$style = $this->input("style");
		$send = $offline == "true" || $offline == "1" ? 0 : 1;
		$timestamp = $this->microtimeFloat() * 1000;
		if( strpos($body, "webim-event:") !== 0 ) {
            $this->model->insertHistory(array(
				"send" => $send,
				"type" => $type,
				"to" => $to,
                'from' => $this->endpoint->id,
                'nick' => $this->endpoint->nick,
				"body" => $body,
				"style" => $style,
				"timestamp" => $timestamp,
			));
		}
		if($send == 1){
			$this->client->message(null, $to, $body, $type, $style, $timestamp);
		}
		$this->okReturn();
	}

    /**
     * Update Presence
     */
	public function presence() {
		$show = $this->input('show');
		$status = $this->input('status');
		$this->client->presence($show, $status);
		$this->okReturn();
	}

    /**
     * Send Status
     */
	public function status() {
		$to = $this->input("to");
		$show = $this->input("show");
		$this->client->status($to, $show);
		$this->okReturn();
	}

    /**
     * Read History
     */
	public function history() {
		$uid = $this->endpoint->uid;
		$with = $this->input('id');
		$type = $this->input('type');
		$histories = $this->model->histories($uid, $with, $type);
		$this->jsonReturn($histories);
	}

    /**
     * Clear History
     */
	public function clear_history() {
		$id = $this->input('id');
		$this->model->clearHistories($this->endpoint->uid, $id);
		$this->okReturn();
	}

    /**
     * Download History
     */
	public function download_history() {
		$uid = $this->endpoint->uid;
		$id = $this->input('id');
		$type = $this->input('type');
		$histories = $this->model->histories($uid, $id, $type, 1000 );
		$date = date( 'Y-m-d' );
		if($this->input('date')) {
			$date = $this->input('date');
		}
		header('Content-Type',	'text/html; charset=utf-8');
		header('Content-Disposition: attachment; filename="histories-'.$date.'.html"');
		echo "<html><head>";
		echo "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />";
		echo "</head><body>";
		echo "<h1>Histories($date)</h1>".PHP_EOL;
		echo "<table><thead><tr><td>用户</td><td>消息</td><td>时间</td></tr></thead><tbody>";
		foreach($histories as $history) {
			$nick = $history['nick'];
			$body = $history['body'];
			$style = $history['style'];
			$time = date( 'm-d H:i', (float)$history['timestamp']/1000 ); 
			echo "<tr><td>{$nick}</td><td style=\"{$style}\">{$body}</td><td>{$time}</td></tr>";
		}
		echo "</tbody></table>";
		echo "</body></html>";
	}

    /**
     * Get Rooms
     */
	public function rooms() {
		$ids = $this->input("ids");
        $ids = explode(',', $ids);
		$this->jsonReturn($this->plugin->roomsByIds($ids));	
	}

    /**
     * Invite Room
     */
    public function invite() {
    
    }

    /**
     * Join Room
     */
	public function join() {
		$id = $this->input('id');
		$room = $this->plugin->roomsByIds( array($id) );
		if( $room && count($room) ) {
			$room = $room[0];
		} else {
			$room = (object)array(
				"id" => $id,
				"nick" => $this->input('nick'),
				"temporary" => true,
				"pic_url" => (WEBIM_PATH . "static/images/chat.png"),
			);
		}
		if($room){
			$re = $this->client->join($id);
			if($re){
                //5.2 fix
				$room->count = $re->{$id};
				$this->jsonReturn($room);
			}else{
				header("HTTP/1.0 404 Not Found");
				exit("Can't join this room right now");
			}
		}else{
			header("HTTP/1.0 404 Not Found");
			exit("Can't found this room");
		}
	}

    /**
     * Leave Room
     */
	public function leave() {
		$id = $this->input('id');
		$this->client->leave( $id );
		$this->okReturn();
	}

    /**
     * Get room members
     */
	public function members() {
		$id = $this->input('id');
		$re = $this->client->members( $id );
		if($re) {
			$this->jsonReturn($re);
		} else {
			$this->jsonReturn("Not Found");
		}
	}

    /**
     * Block Room
     */
    public function block() {

    
    }

    /**
     * Unblock Room
     */
    public function unblock() {

    
    }
    
    /**
     * Read Notifications
     */
	public function notifications() {
		$notifications = $this->plugin->notifications();
		$this->jsonReturn($notifications);
	}

    /**
     * Setting
     */
    public function setting() {
        $data = $this->input('data');
		$uid = $this->endpoint->uid;
		$this->model->setting($uid, $data);
		$this->okReturn();
    }

	private function input($name, $default = null) {
		if( isset( $_POST[$name] ) ) return $_POST[$name];
		if( isset( $_GET[$name] ) ) return $_GET[$name]; 
		return $default;
	}

	private function okReturn() {
		$this->jsonReturn('ok');
	}

	private function jsonReturn($data) {
		header('Content-Type:application/json; charset=utf-8');
		exit(json_encode($data));
	}

	private function idsArray( $ids ){
		return ($ids===null || $ids==="") ? array() : (is_array($ids) ? array_unique($ids) : array_unique(explode(",", $ids)));
	}

	private function microtimeFloat() {
		list($usec, $sec) = explode(" ", microtime());
		return ((float)$usec + (float)$sec);
	}

}

