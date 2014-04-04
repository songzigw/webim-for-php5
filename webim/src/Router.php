<?php

namespace WebIM;

class Router {

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

        global $IMC;

		if( !$this->plugin->logined ) exit();

		//IM Ticket
		$ticket = $this->input('ticket');
		if($ticket) $ticket = stripslashes($ticket);	
		$this->ticket = $ticket;

		//IM Client
        $this->client = new \WebIM\WebIM(
            $this->currentEndpoint(), 
            $IMC['domain'], 
            $IMC['apikey'], 
            $IMC['server'], 
            $this->ticket
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
     * Current Ednpoint
     */
    private function currentEndpoint() {
        return $this->plugin->endpoint;
    }
    
    /**
     * Current UID
     */
    private function currentUID() {
        $ep = $this->currentEndpoint();
        return $ep['uid'];
    }

    /**
     * Boot Javascript
     */
	public function boot() {

        global $IMC;

        //FIX offline Bug
        $endpoint = $this->currentEndpoint();
        $endpoint['show'] = "unavailable";

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
            'is_visitor' => $endpoint['role'] === 'visitor',
			'login_options' => '',
			'user' => $endpoint,
			'setting' => $this->model->setting($endpoint['uid']),
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
_IMC.script += '<script src="' + _IMC.path + '/static/webim.' + _IMC.product_name + '.js?vsn=' + _IMC.version + '" type="text/javascript"></script>';
document.write( _IMC.script );

EOF;
		exit($script);
	}

    /**
     * Endpoint Online
     */
	public function online() {
        global $IMC;
		$uid = $this->currentUID();
        $show = $this->input('show');
        //buddy, room, chatlink ids
		$chatlinkIds= $this->idsArray($this->input('chatlink_ids') );
		$activeRoomIds = $this->idsArray( $this->input('room_ids') );
		$activeBuddyIds = $this->idsArray( $this->input('buddy_ids') );
		//active buddy who send a offline message.
		$offlineMessages = $this->model->offlineHistories($uid);
		foreach($offlineMessages as $msg) {
			if(!in_array($msg['from'], $activeBuddyIds)) {
				$activeBuddyIds[] = $msg['from'];
			}
		}
        //buddies of uid
		$buddies = $this->plugin->buddies($uid);
        $buddyIds = array_map(function($buddy) { return $buddy['id']; }, $buddies);
        $buddyIdsWithoutInfo = array_filter( array_merge($chatlinkIds, $activeBuddyIds), function($id) use($buddyIds){ return !in_array($id, $buddyIds); } );
        //buddies by ids
		$buddiesByIds = $this->plugin->buddiesByIds($buddyIdsWithoutInfo);
        //all buddies
        $buddies = array_merge($buddies, $buddiesByIds);

        $rooms = array(); $roomIds = array();
		if( $IMC['enable_room'] ) {
            //persistent rooms
			$persistRooms = $this->plugin->rooms($uid);
            //temporary rooms
			$temporaryRooms = $this->model->rooms($uid);
            $rooms = array_merge($persistRooms, $temporaryRooms);
            $roomIds = array_map(function($room) { return $room['id']; }, $rooms);
		}

		//===============Online===============
		$data = $this->client->online($buddyIds, $roomIds, $show);
		if( $data->success ) {
            $rtBuddies = array();
            $presences = (array)$data->presences;
            foreach($buddies as $buddy) {
                $id = $buddy['id'];
                if( isset($presences[$id]) ) {
                    $buddy['presence'] = 'online';
                    $buddy['show'] = $presences[$id];
                } else {
                    $buddy['presence'] = 'offline';
                    $buddy['show'] = 'unavailable';
                }
                $rtBuddies[$id] = $buddy;
            }
			//histories for active buddies and rooms
            /*
			foreach($activeBuddyIds as $id) {
                if( isset($rtBuddies[$id]) ) {
                    $rtBuddies[$id]->history = $this->model->histories($uid, $id, "chat" );
                }
			}
            if( !$IMC['show_unavailable'] ) {
                $rtBuddies = array_filter($rtBuddies, 
                    function($buddy) { return $buddy['presence'] === 'online'; });        
            }
            */
            $rtRooms = array();
            if( $IMC['enable_room'] ) {
                foreach($rooms as $room) {
                    $rtRooms[$room['id']] = $room;
                }
                foreach($activeRoomIds as $id){
                    if( isset($rtRooms[$id]) ) {
                        $rtRooms[$id]->history = $this->model->histories($uid, $id, "grpchat" );
                    }
                }
            }

			$this->model->offlineReaded($this->currentUID());

            $this->jsonReply(array(
                'success' => true,
                'connection' => $data->connection,
                'user' => $this->currentEndpoint(),
                'buddies' => array_values($rtBuddies),
                'rooms' => array_values($rtRooms),
                'new_messages' => $offlineMessages,
                'server_time' => microtime(true) * 1000
            ));
		} else {
			$this->jsonReply(array ( 
				'success' => false,
                'error' => $data
            )); 
        }
	}

    /**
     * Offline API
     */
	public function offline() {
		$this->client->offline();
		$this->okReply();
	}

    /**
     * Browser Refresh, may be called
     */
	public function refresh() {
		$this->client->offline();
		$this->okReply();
	}

    /**
     * Buddies by ids
     */
	public function buddies() {
		$ids = $this->input('ids');
		$this->jsonReply($this->plugin->buddiesByIds($ids));
	}

    /**
     * Send Message
     */
	public function message() {
        $endpoint = $this->currentEndpoint();
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
                'from' => $endpoint['id'],
                'nick' => $endpoint['nick'],
				"body" => $body,
				"style" => $style,
				"timestamp" => $timestamp,
			));
		}
		if($send == 1){
			$this->client->message(null, $to, $body, $type, $style, $timestamp);
		}
		$this->okReply();
	}

    /**
     * Update Presence
     */
	public function presence() {
		$show = $this->input('show');
		$status = $this->input('status');
		$this->client->presence($show, $status);
		$this->okReply();
	}

    /**
     * Send Status
     */
	public function status() {
		$to = $this->input("to");
		$show = $this->input("show");
		$this->client->status($to, $show);
		$this->okReply();
	}

    /**
     * Read History
     */
	public function history() {
		$uid = $this->currentUID();
		$with = $this->input('id');
		$type = $this->input('type');
		$histories = $this->model->histories($uid, $with, $type);
		$this->jsonReply($histories);
	}

    /**
     * Clear History
     */
	public function clear_history() {
		$id = $this->input('id');
		$this->model->clearHistories($this->currentUID(), $id);
		$this->okReply();
	}

    /**
     * Download History
     */
	public function download_history() {
		$uid = $this->currentUID();
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
		$this->jsonReply($this->plugin->roomsByIds($ids));	
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
				$this->jsonReply($room);
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
		$this->okReply();
	}

    /**
     * Get room members
     */
	public function members() {
		$id = $this->input('id');
		$re = $this->client->members( $id );
		if($re) {
			$this->jsonReply($re);
		} else {
			$this->jsonReply("Not Found");
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
        $uid = $this->currentUID();
		$notifications = $this->plugin->notifications($uid);
		$this->jsonReply($notifications);
	}

    /**
     * Setting
     */
    public function setting() {
        $data = $this->input('data');
		$this->model->setting($this->currentUID(), $data);
		$this->okReply();
    }

	private function input($name, $default = null) {
		if( isset( $_POST[$name] ) ) return $_POST[$name];
		if( isset( $_GET[$name] ) ) return $_GET[$name]; 
		return $default;
	}

	private function okReply() {
		$this->jsonReply('ok');
	}

	private function jsonReply($data) {
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

