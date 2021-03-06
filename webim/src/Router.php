<?php

/**
 * WebIM-for-PHP5 
 *
 * @author      Feng Lee <feng@nextalk.im>
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
 * WebIM Router
 *
 * @package WebIM
 * @autho Ery Lee
 * @since 5.4.1
 */
class Router {

    /**
     * Current user
     */
    private $user = null;

	/*
	 * WebIM Model
	 */
	private $model;

	/*
	 * WebIM Plugin
	 */
	private $plugin;

	/*
	 * WebIM Client
	 */
	private $client;

    public function __construct() { 
    }


    /**
     * Plugin Get/Set
     */
    public function plugin($plugin = null) {
        if (func_num_args() === 0) {
            return $this->plugin;
        }
        $this->plugin = $plugin; 
    }

    /**
     * Model Get/Set
     */
    public function model($model = null) {
        if (func_num_args() === 0) {
            return $model;
        }
        $this->model = $model;
    }

    /**
     * Route and dispatch ajax request
     */
    public function route() {

        global $IMC;

        $user = $this->plugin->user();
        if($user == null &&  $IMC['visitor']) {
            $user = $this->model->visitor();
        }

        if(!$user) exit(json_encode("Login Required"));

        //WebIM User
        $this->user = $user;

		//WebIM Ticket
		$ticket = $this->input('ticket');
		if($ticket) $ticket = stripslashes($ticket);	

		//IM Client
        $this->client = new \WebIM\Client(
            $this->user, 
            $IMC['domain'], 
            $IMC['apikey'], 
            $IMC['server'], 
            $ticket
        );
        $method = $this->input('action');
        if($method && method_exists($this, $method)) {
            call_user_func(array($this, $method));
        } else {
            header( "HTTP/1.0 400 Bad Request" );
            exit("No Action Found.");
        }
    }

    /**
     * Boot Javascript
     */
	public function boot() {

        global $IMC;
		$fields = array(
            'version',
			'theme', 
			'local', 
			'emot',
			'opacity',
            'discussion',
			'enable_room', 
			'enable_ask', 
			'enable_chatlink', 
			'enable_chatbtn', 
			'enable_shortcut',
			'enable_noti',
			'enable_menu',
			'show_unavailable',
			'upload');

        $this->user->show = "unavailable";
        $uid = $this->user->id;
        $webim_path = WEBIM_PATH();
        if( substr($webim_path, strlen($webim_path)-1) !== '/' ) {
            $webim_path .= '/';
        }

		$scriptVar = array(
            'version' => WEBIM_VERSION,
			'product' => WEBIM_PRODUCT,
			'path' => $webim_path,
			'is_login' => '1',
            'is_visitor' => $this->isvid($uid),
			'login_options' => '',
			'user' => $this->user,
			'setting' => $this->model->setting($uid),
            'jsonp' => false,
			'min' => WEBIM_DEBUG ? "" : ".min"
		);
		$scriptVar['apiPath'] = $webim_path;
		$scriptVar['resPath'] = $webim_path . 'static/';
		if ($this->input('hidden', 'false') == 'false') {
		    $scriptVar['hidden'] = false;
		} else {
		    $scriptVar['hidden'] = true;
		}
		if ($this->input('iframe', 'true') == 'true') {
		    $scriptVar['iframe'] = true;
		} else {
		    $scriptVar['iframe'] = false;
		}
		if ($this->input('simple', 'true') == 'true') {
		    $scriptVar['simple'] = true;
		} else {
		    $scriptVar['simple'] = false;
		}
		if ($this->input('mobile', 'false') == 'false') {
		    $scriptVar['mobile'] = false;
		} else {
		    $scriptVar['mobile'] = true;
		}
		if ($this->input('play_sound', 'false') == 'false') {
		    $scriptVar['playSound'] = false;
		} else {
		    $scriptVar['playSound'] = true;
		}
		if ($this->input('receive', 'false') == 'false') {
		    $scriptVar['receive'] = false;
		} else {
		    $scriptVar['receive'] = true;
		}
		// channelType[XHR_POLLING,WEBSOCKET]
		$scriptVar['channelType'] = 'WEBSOCKET';

		foreach($fields as $f) { $scriptVar[$f] = $IMC[$f];	}

		header("Content-type: application/javascript");
		//header("Cache-Control: no-cache");
		header("Cache-Control: public");
		header("Pragma: cache");
		echo 'if (!window._IMC) { window._IMC = {} }';
		echo "var _TEMP = " . json_encode($scriptVar) . ";";
		echo 'for (var key in _TEMP) { _IMC[key] = _TEMP[key] }' . PHP_EOL;

//		$script = <<<EOF
//_IMC.script = window.webim ? '' : ('<link href="' + _IMC.path + 'static/webim' + _IMC.min + '.css?' + _IMC.version + '" media="all" type="text/css" rel="stylesheet"/><link href="' + _IMC.path + 'static/themes/' + _IMC.theme + '/jquery.ui.theme.css?' + _IMC.version + '" media="all" type="text/css" rel="stylesheet"/><script src="' + _IMC.path + 'static/webim' + _IMC.min + '.js?' + _IMC.version + '" type="text/javascript"></script><script src="' + _IMC.path + 'static/i18n/webim-' + _IMC.local + '.js?' + _IMC.version + '" type="text/javascript"></script>');
//_IMC.script += '<script src="' + _IMC.path + 'static/webim.' + _IMC.product + '.js?vsn=' + _IMC.version + '" type="text/javascript"></script>';
//document.write( _IMC.script );
//EOF;

        $script =
<<<EOF
_IMC.script = '<script src="' + _IMC.resPath + 'js/nextalk.main.js?vsn=' + _IMC.version + '" type="text/javascript"></script>';
_IMC.script += '<script src="' + _IMC.resPath + 'js/nextalk.boot.js?vsn=' + _IMC.version + '" type="text/javascript"></script>';
document.write( _IMC.script );
EOF;
		exit($script);
	}

	public function agents_random() {
	    $agents = $this->model->get_random_agent();
	    $this->jsonReply($agents);
	}
	
	public function house() {
	    $houseId = $this->input('id');
	    $house = $this->model->get_house($houseId);
	    $this->jsonReply($house);
	}
	
    /**
     * Online
     */
	public function online() {
        global $IMC;

        $uid = $this->user->id;
        $show = $this->input('show');

        //buddy, room, chatlink ids
		$chatlinkIds= $this->idsArray($this->input('chatlink_ids', '') );
		$activeRoomIds = $this->idsArray( $this->input('room_ids') );
		$activeBuddyIds = $this->idsArray( $this->input('buddy_ids') );

		//active buddy who send a offline message.
		$type = $this->user->type;
		$offlineMessages = $this->model->offlineHistories($uid, $type);
		foreach($offlineMessages as $msg) {
			if(!in_array($msg->from, $activeBuddyIds)) {
				$activeBuddyIds[] = $msg->from;
			}
		}
        //buddies of uid
		$buddies = $this->plugin->buddies($uid);
        $buddyIds = array_map(array($this, 'buddyId'), $buddies);
        $buddyIdsWithoutInfo = array();
        foreach(array_merge($chatlinkIds, $activeBuddyIds) as $id) {
            if( !in_array($id, $buddyIds) ) {
                $buddyIdsWithoutInfo[] = $id;
            }
        }
        //buddies by ids
		$buddiesByIds = $this->plugin->buddiesByIds($uid, $buddyIdsWithoutInfo);

        //all buddies
        $buddies = array_merge($buddies, $buddiesByIds);
        $allBuddyIds = array();
        foreach($buddies as $buddy) { $allBuddyIds[] = $buddy->id; }

        $rooms = array(); $roomIds = array();
		if( $IMC['enable_room'] ) {
            //persistent rooms
			$persistRooms = $this->plugin->rooms($uid);
            //temporary rooms
			$temporaryRooms = $this->model->rooms($uid);
            $rooms = array_merge($persistRooms, $temporaryRooms);
            $roomIds = array_map(array($this, 'roomId'), $rooms);
		}

		//===============Online===============
		$data = $this->client->online($allBuddyIds, $roomIds, $show);
		if( $data->success ) {
            $rtBuddies = array();
            $presences = $data->presences;
            foreach($buddies as $buddy) {
                $id = $buddy->id;
                //fix invisible problem
                if( isset($presences->$id) && $presences->$id != "invisible") {
                    $buddy->presence = 'online';
                    $buddy->show = $presences->$id;
                } else {
                    $buddy->presence = 'offline';
                    $buddy->show = 'unavailable';
                }
                $rtBuddies[$id] = $buddy;
            }
			//histories for active buddies and rooms
			foreach($activeBuddyIds as $id) {
                if( isset($rtBuddies[$id]) ) {
                    //$rtBuddies[$id]->history = $this->model->histories($uid, $id, "chat" );
                }
			}
            if( !$IMC['show_unavailable'] ) {
                $olBuddies = array();
                foreach($rtBuddies as $buddy) {
                    if($buddy->presence === 'online') $olBuddies[] = $buddy;
                }
                $rtBuddies = $olBuddies;
            }
            $rtRooms = array();
            if( $IMC['enable_room'] ) {
                foreach($rooms as $room) {
                    $rtRooms[$room->id] = $room;
                }
                foreach($activeRoomIds as $id){
                    if( isset($rtRooms[$id]) ) {
                        //$rtRooms[$id]->history = $this->model->histories($uid, $id, "grpchat" );
                    }
                }
            }

			//$this->model->offlineReaded($uid);

            if($show) $this->user->show = $show;
            if ($this->user->type == 'backstage' && $this->user->agents) {
                foreach ($this->user->agents as $agt) {
                    $connection = $this->client->online2($agt->id);
                    $agt->connection = $connection;
                }
            }

            $this->jsonReply(array(
                'success' => true,
                'connection' => $data->connection,
                'user' => $this->user,
                'presences' => $data->presences,
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
     * Offline
     */
	public function offline() {
		$this->client->offline();
		$this->okReply();
	}

	public function message_read() {
	    $type = $this->input('type');
	    $to = $this->input('to');
	    $from = $this->input('from');
	    $this->model->markReaded($type, $to, $from);
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
        $uid = $this->user->id;
		$ids = $this->input('ids');
        $vids = array();
        $uids = array();
        foreach(explode(',', $ids) as $id) {
            if($this->isvid($id)) { 
                $vids[] = $id;
            } else {
                $uids[] = $id;
            }
        }
        $buddies = array_merge(
            $this->plugin->buddiesByIds($uid, $uids),
            $this->model->visitors($vids)
        );
        $buddyIds = array_map(array($this, 'buddyId'), $buddies);
        $presences = $this->client->presences($buddyIds);
        foreach($buddies as $buddy) {
            $id = $buddy->id;
            if( isset($presences->$id) ) {
                $buddy->presence = 'online';
                $buddy->show = $presences->$id;
            } else {
                $buddy->presence = 'offline';
                $buddy->show = 'unavailable';
            }
        }
		$this->jsonReply($buddies);
	}

    /**
     * Send Message
     */
	public function message() {
        global $IMC;
		$type = $this->input("type");
		$from = $this->input('from');
		$nick = $this->input('nick');
		$avatar = $this->input('avatar');
		$offline = $this->input("offline");
		$to = $this->input("to");
		$to_name = $this->input("to_name");
		$to_avatar = $this->input("to_avatar");
		$body = stripslashes( $this->input("body") );
        if( defined('WEBIM_MESSAGE_DECODE') ) {
            $body = html_entity_decode($body);
        }
        if($IMC['censor'] && !$this->plugin->censor($body)) { //censor
            $this->jsonReply(array('status' => 'error', 'message' => '消息含有敏感词不能发送'));
            return;
        }
        
		$style = $this->input("style");
		$send = $offline == "true" || $offline == "1" ? 0 : 1;
		$timestamp = microtime(true) * 1000;
		if( strpos($body, "webim-event:") !== 0 ) {
            $this->model->insertHistory(array(
				"send" => $send,
				"type" => $type,
				"to" => $to,
                //"to_name" => $to_name,
                //"to_avatar" => $to_avatar,
                'from' => $from,
                'nick' => $nick,
                'avatar' => $avatar,
				"body" => $body,
				"style" => $style,
				"timestamp" => $timestamp,
			));
		}
		$to_other = null;
		if ($this->user->type == 'agent') {
		    $to_other = $this->user->customer_id;
		}
		//if($send == 1){
			$this->client->message($from, $to, $nick, $body, $type, $style, $timestamp, $avatar, $to_name, $to_avatar, $to_other);
		//}
        //Error Reply
        //$this->jsonReply(array('status' => 'error', 'message' => $body));
		$conv = array(
		        'uid' => $from,
		        'oid' => $to,
		        'body' => $body,
		        'type' => $type,
		        'direction' => 'send',
		        'oname' => $to_name,
		        'oavatar' => $to_avatar
		);
		$this->model->insert_conv($conv);
		if ($type == 'chat') {
		    $conv = array(
		            'uid' => $to,
		            'oid' => $from,
		            'body' => $body,
		            'type' => 'chat',
		            'direction' => 'receive',
		            'oname' => $nick,
		            'oavatar' => $avatar
		    );
		    $this->model->insert_conv($conv);
		}
		$this->okReply();
	}
	
	public function disguise() {
	    $auids = $this->input('auids');
	    $this->client->disguise($auids);
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
        $uid = $this->user->id;
        $uid = $this->input('currUid');
		$with = $this->input('objId');
		$type = $this->input('type');
		$before = $this->input('before');
		$histories = $this->model->histories($uid, $with, $type, $before);
		$this->jsonReply($histories);
	}

    /**
     * Clear History
     */
	public function clear_history() {
        $uid = $this->user->id;
		$id = $this->input('id');
		$this->model->clearHistories($uid, $id);
		$this->okReply();
	}

    /**
     * Download History
     */
	public function download_history() {
        $uid = $this->user->id;
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
		echo "<table><thead><tr><td>鐢ㄦ埛</td><td>娑堟伅</td><td>鏃堕棿</td></tr></thead><tbody>";
		foreach($histories as $history) {
			$nick = $history->nick;
			$body = $history->body;
			$style = $history->style;
			$time = date( 'm-d H:i', (float)$history->timestamp/1000 ); 
			echo "<tr><td>{$nick}:</td><td style=\"{$style}\">{$body}</td><td>{$time}</td></tr>";
		}
		echo "</tbody></table>";
		echo "</body></html>";
	}

    public function chatbox() {
        $webim_path = WEBIM_PATH();
        $uid = $this->input('uid');
        $body_type = $this->input('body_type');
        $body = $this->input('body');
        $type = $this->user->type;
        $buddy = null;
        if ($uid != null && $type == 'general') {
            $buddy = $this->plugin->getUserById($uid);
            if(!$buddy) {
                header("HTTP/1.0 404 Not Found");
                exit("User Not Found");
            }
        }
		header('Content-Type',	'text/html; charset=utf-8');
// 		echo '<html><head>';
// 		echo '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
//         echo '<meta content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0" name="viewport">'; 
//         echo '<title>Webim ChatBox</title>';
//         echo "<link rel=\"stylesheet\" type=\"text/css\" href=\"{$webim_path}/static/webim-chatbox.css\"/>";
//         echo "<script type=\"text/javascript\" src=\"{$webim_path}/static/webim-chatbox.js\"></script>";
//         echo '</head><body>';
//         echo '<body id="chatbox">';
//         echo '<div id="header">';
//         echo "<img id=\"avatar\" class=\"avatar\" src=\"{$buddy->avatar}\"></img>";
//         echo "<h4 id=\"user\">{$buddy->nick}</h4>";
//         echo "</div>";
//         echo '<div id="notice" class="chatbox-notice ui-state-highlight" style="display: none;">';
//         echo '</div>';
//         echo '<div id="content"><div id="histories"></div></div>';
//         echo '<div id="footer">';
//         echo '<table style="width:100%"><tbody><tr><td width="100%">';
//         echo "<input type=\"hidden\" id=\"to\" value=\"{$buddy->id}\">";
//         echo '<input type="text" data-inline="true" placeholder="璇疯繖閲岃緭鍏ユ秷鎭�..." name="" id="inputbox">';
//         echo '</td><tr><tbody></table>';
//         echo '</div>';
//         echo '<script>';
//         echo '(function(webim, options) { ';
//         echo '  var path = options.path || "";';
//         echo '  function url(api) { return path + api; }';
//         echo '  webim.route({';
//         echo '    online: url("/index.php?action=online"),';
//         echo '    offline: url("/index.php?action=offline"),';
//         echo '    deactivate: url("/index.php?action=refresh"),';
//         echo '    message: url("/index.php?action=message"),';
//         echo '    presence: url("/index.php?action=presence"),';
//         echo '    status: url("/index.php?action=status"),';
//         echo '    setting: url("/index.php?action=setting"),';
//         echo '    history: url("/index.php?action=history"),';
//         echo '    buddies: url("/index.php?action=buddies")';
//         echo '  });';
//         echo '  var im = new webim(null, options);';
//         echo '  var chatbox = new webim.chatbox(im, options);';
//         echo '  im.online();';
//         echo "})(webim, {touid: '{$buddy->id}', path:'{$webim_path}/'})";
//         echo '</script>';
//         echo '</body>';
//         echo '</html>';
        
        echo '<!DOCTYPE html>';
        echo '<html>';
        echo '<head>';
        echo '<meta charset="UTF-8">';
        echo '<meta name="viewport"';
        echo '    content="maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,width=device-width,initial-scale=1.0" />';
        echo '<title>Chat</title>';
        echo '</head>';
        echo '<body>';
        echo '        <script type="text/javascript">';
        echo '        var _IMC = {};';
        if ($buddy) {
            echo '        _IMC.chatObj = {';
            echo '            type : "chat",';
            echo '            id : "'. $buddy->id .'",';
            echo '            name : "'. $buddy->nick .'",';
            echo '            avatar : "'. $buddy->avatar .'",';
            echo '            body_type : "'. $body_type .'",';
            echo '            body : "'. $body .'"';
            echo '        };';
        }
        echo '        </script>';
        echo '        <script type="text/javascript" src="'.$webim_path.'index.php?action=boot&simple=true&iframe=false"></script>';
        echo '</body>';
        echo '</html>';
    }

    public function mobile() {
        $user = $this->plugin->user();
        if (!$user) {
            echo '<script type="text/javascript">window.location="/mobile/user.php"</script>';
            return;
        }
        $webim_path = WEBIM_PATH();
        $uid = $this->input('uid');
        $currUid = $this->input('curr_uid');
        $body_type = $this->input('body_type');
        $body = $this->input('body');
        $uids = $this->idsArray($this->input('uids', ''));
        $type = $this->user->type;
        $buddy = null;
        if ($uid != null) {
            $buddy = $this->plugin->getUserById($uid);
        }
        $agents = array();
        if ($type == 'general') {
            foreach($uids as $id){
                $a = $this->plugin->getUserById($id);
                if ($a) {
                    $a->type = 'chat';
                    $a->name = $a->nick;
                    $a->body_type = $body_type;
                    $a->body = $body;
                    $agents[] = $a;
                }
            }
        }
		header('Content-Type',	'text/html; charset=utf-8');
		header("Cache-Control: public");
		header("Pragma: cache");
        echo '<!DOCTYPE html>';
        echo '<html>';
        echo '<head>';
        echo '<meta charset="UTF-8">';
        echo '<meta name="viewport"';
        echo '    content="maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,width=device-width,initial-scale=1.0" />';
        echo '<title>Chat</title>';
        echo '</head>';
        echo '<body>';
        echo '        <script type="text/javascript">';
        echo '        var _IMC = {};';
        if ($this->input('his_conv')) {
            echo '_IMC.his_conv = '.$this->input('his_conv').';';
        }
        if ($buddy) {
            echo '        _IMC.chatObj = {';
            echo '            type : "chat",';
            echo '            id : "'. $buddy->id .'",';
            echo '            name : "'. $buddy->nick .'",';
            echo '            avatar : "'. $buddy->avatar .'",';
            echo '            currUid : "'. $currUid .'",';
            echo '            body_type : "'. $body_type .'",';
            echo '            body : "'. $body .'"';
            echo '        };';
        }
        echo '        _IMC.chatObjs = ' . json_encode($agents) . ';';
        echo '        _IMC.obj_suit = "' . $this->input('obj_suit') . '";';
        echo '        </script>';
        echo '<script type="text/javascript" src="'.$webim_path.'index.php?action=boot&iframe=false&mobile=true"></script>';
        echo '</body>';
        echo '</html>';
    }
    
    /**
     * Get rooms
     */
	public function rooms() {
        $uid = $this->user->id;
		$ids = $this->input("ids");
        $ids = explode(',', $ids);
        $persistRooms = $this->plugin->roomsByIds($uid, $ids);
        $temporaryRooms = $this->model->roomsByIds($uid, $ids);
		$this->jsonReply(array_merge($persistRooms, $temporaryRooms));	
	}

    /**
     * Invite room
     */
    public function invite() {
        $uid = $this->user->id;
        $roomId = $this->input('id');
        $nick = $this->input('nick');
        if(strlen($nick) === 0) {
			header("HTTP/1.0 400 Bad Request");
			exit("Nick is Null");
        }
        //find persist room 
        $room = $this->findRoom($this->model, $roomId);
        if(!$room) {
            //create temporary room
            $room = $this->model->createRoom(array(
                'owner' => $uid,
                'name' => $roomId, 
                'nick' => $nick
            ));
        }
        //join the room
        $this->model->joinRoom($roomId, $uid, $this->user->nick);
        //invite members
        $members = explode(",", $this->input('members'));
        $members = $this->plugin->buddiesByIds($uid, $members);
        $this->model->inviteRoom($roomId, $members);
        //send invite message to members
        foreach($members as $m) {
            $body = "webim-event:invite|,|{$roomId}|,|{$nick}";
            $this->client->message(null, $m->id, $body); 
        }
        //tell server that I joined
        $this->client->join($roomId);
        $this->jsonReply(array(
            'id' => $room->name,
            'nick' => $room->nick,
            'temporary' => true,
            'avatar' => WEBIM_IMAGE('room.png')
        ));
    }

    /**
     * Join room
     */
	public function join() {
        $uid = $this->user->id;
        $roomId = $this->input('id');
        $nick = $this->input('nick');
        $room = $this->findRoom($this->plugin, $roomId);
        if(!$room) {
            $room = $this->findRoom($this->model, $roomId);
        }
        if(!$room) {
			header("HTTP/1.0 404 Not Found");
			exit("Can't found room: {$roomId}");
        }
        $this->model->joinRoom($roomId, $uid, $this->user->nick);
        $data = $this->client->join($roomId);
        $this->jsonReply(array(
            'id' => $roomId,
            'nick' => $nick,
            'temporary' => true,
            'avatar' => WEBIM_IMAGE('room.png')
        ));
	}

    /**
     * Leave room
     */
	public function leave() {
        $uid = $this->user->id;
		$room = $this->input('id');
		$this->client->leave( $room );
        $this->model->leaveRoom($room, $uid);
		$this->okReply();
	}

    /**
     * Room members
     */
	public function members() {
        $members = array();
        $roomId = $this->input('id');
        $room = $this->findRoom($this->plugin, $roomId);
        if($room) {
            $members = $this->plugin->members($roomId);
        } else {
            $room = $this->findRoom($this->model, $roomId);
            if($room) {
                $members = $this->model->members($roomId);
            }
        }
        if(!$room) {
			header("HTTP/1.0 404 Not Found");
			exit("Can't found room: {$roomId}");
        }
        $presences = $this->client->members($roomId);
        $rtMembers = array();
        foreach($members as $m) {
            $id = $m->id;
            if( isset($presences->$id) && $presences->$id != "invisible") {
                $m->presence = 'online';
                $m->show = $presences->$id;
            } else {
                $m->presence = 'offline';
                $m->show = 'unavailable';
            }
            $rtMembers[] = $m;
        }
        usort($rtMembers, function($m1, $m2) {
            if($m1->presence === $m2->presence) return 0;
            if($m1->presence === 'online') return 1;
            return -1;
        });
        $this->jsonReply($rtMembers);
	}

    /**
     * Block room
     */
    public function block() {
        $uid = $this->user->id;
        $room = $this->input('id');
        $this->model->blockRoom($room, $uid);
        $this->okReply();
    }

    /**
     * Unblock room
     */
    public function unblock() {
        $uid = $this->user->id;
        $room = $this->input('id');
        $this->model->unblockRoom($room, $uid);
        $this->okReply();
    }

    /**
     * Notifications
     */
	public function notifications() {
        $uid = $this->user->id;
		$notifications = $this->plugin->notifications($uid);
		$this->jsonReply($notifications);
	}

    /**
     * Setting
     */
    public function setting() {
        $uid = $this->user->id;
        $data = $this->input('data');
		$this->model->setting($uid, $data);
		$this->okReply();
    }

    /**
     * Asks
     */
    public function asks() {
        $uid = $this->user->id;
		$asks = $this->model->asks($uid);
		$this->jsonReply($asks);
    }

    /**
     * Accept Ask
     */
    public function accept_ask() {
        $uid = $this->user->id;
        $askid = $this->input('askid');
        //TODO: insert into buddies
        //TODO: should send presence
		$this->model->accept_ask($uid, $askid);
        $this->okReply();
    }

    /**
     * Reject Ask
     */
    public function reject_ask() {
        $uid = $this->user->id;
        $askid = $this->input('askid');
        //TODO: should send presence
		$this->model->reject_ask($uid, $askid);
        $this->okReply();
    }
    
    public function conversations() {
        $uid = $this->user->id;
        $type = $this->user->type;
        $convs = $this->model->query_convs($uid, $type);
        $uids = array();
        foreach($convs as $conv) {
            $conv->updated = strtotime($conv->updated) * 1000;
            if ($conv->type == 'chat') {
                $uids[] = $conv->oid;
            }
        }
        $presences = (object)$this->client->presences($uids);
        $data = (object) array(
                'presences' => $presences,
                'convs'     => $convs
        );
        $this->jsonReply($data);
    }
    
    public function get_user_favorite() {
        $uid = $this->user->id;
        $convs = $this->model->get_user_favorite($uid);
        $this->jsonReply($convs);
    }
//     public function conv_new() {
//         // $uid = $this->user->id;
//         $conv = array(
//                 'uid' => $this->input('uid'),
//                 'oid' => $this->input('oid'),
//                 'body' => $this->input('body'),
//                 'type' => $this->input('type'),
//                 'direction' => $this->input('direction'),
//                 'oname' => $this->input('oname'),
//                 'oavatar' => $this->input('oavatar')
//         );
//         $this->model->insert_conv($conv);
//         if ($this->input('type') == 'chat' && $this->input('direction') == 'send') {
//             $conv = array(
//                     'uid' => $this->input('oid'),
//                     'oid' => $this->input('uid'),
//                     'body' => $this->input('body'),
//                     'type' => 'chat',
//                     'direction' => 'receive',
//                     'oname' => $this->input('nick'),
//                     'oavatar' => $this->input('avatar')
//             );
//             $this->model->insert_conv($conv);
//         }
//         $this->okReply();
//     }
    public function conv_del() {
        // $uid = $this->user->id;
        $uid = $this->input('uid');
        $oid = $this->input('oid');
        $this->model->del_conv($uid, $oid);
        $this->okReply();
    }

    public function agent() {
        $uid = $this->input('uid');
        $agent = $this->model->getAgentByUid($uid);
        $this->jsonReply($agent);
    }
    
	private function input($name, $default = null) {
		if( isset( $_POST[$name] ) ) return $_POST[$name];
		if( isset( $_GET[$name] ) ) return $_GET[$name]; 
		return $default;
	}

    private function findRoom($obj, $id) {
        $rooms = $obj->roomsByIds($this->user->id, array($id));
        if($rooms && isset($rooms[0])) return $rooms[0];
        return null;
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

    private function isvid($id) {
        return strpos($id, 'vid:') === 0;
    }

    private function roomId($room) {
        return $room->id;
    }

    private function buddyId($buddy) {
        return $buddy->id;
    }
    
    public function presences() {
        $uids = $this->idsArray($this->input('uids', ''));
        $presences = (object)$this->client->presences($uids);
        $this->jsonReply($presences);
    }
    
    public function test() {
        $uids = $this->idsArray($this->input('uids', ''));
        $presences = (object)$this->client->presences($uids);
        $this->jsonReply($presences);
    }

}

?>
