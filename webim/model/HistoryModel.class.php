<?php

/**
 *   CREATE TABLE `webim_histories` (
 *         `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
 *         `send` tinyint(1) DEFAULT NULL,
 *         `type` varchar(20) DEFAULT NULL,
 *         `to` varchar(50) NOT NULL,
 *         `from` varchar(50) NOT NULL,
 *         `nick` varchar(20) DEFAULT NULL COMMENT 'from nick',
 *         `body` text,
 *         `style` varchar(150) DEFAULT NULL,
 *         `timestamp` double DEFAULT NULL,
 *         `todel` tinyint(1) NOT NULL DEFAULT '0',
 *         `fromdel` tinyint(1) NOT NULL DEFAULT '0',
 *         `created_at` date DEFAULT NULL,
 *         `updated_at` date DEFAULT NULL,
 *         PRIMARY KEY (`id`),
 *         KEY `timestamp` (`timestamp`),
 *         KEY `to` (`to`),
 *         KEY `from` (`from`),
 *         KEY `send` (`send`)
 *   ) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
 */

class HistoryModel {

    private $imdb;

	protected $table = 'webim_histories';

    private $fields = "`to`,`nick`,`from`,`style`,`body`,`type`,`timestamp`"; 

    function HistoryModel($db) {
        $this->imdb = $db; 
    }

	public function get($uid, $with, $type='chat', $limit=30) {
        if( $type == "chat" ) {
            $query = $this->imdb->prepare( "SELECT $this->fields  FROM  $this->table  
                WHERE `type` = 'chat' 
                AND ((`to`=%s AND `from`=%s AND `fromdel` != 1) 
                OR (`send` = 1 AND `from`=%s AND `to`=%s AND `todel` != 1))  
                ORDER BY timestamp DESC LIMIT %d", $with, $uid, $with, $uid, $limit );
        } else {
            $query = $this->imdb->prepare( "SELECT $this->fields  FROM $this->table 
                WHERE `to`=%s AND `type`='grpchat' AND send = 1 
                ORDER BY timestamp DESC LIMIT %d", $with, $limit );
        }
        return array_reverse( $this->imdb->get_results( $query ) );
	}

	public function getOffline($uid, $limit = 50) {
        $query = $this->imdb->prepare( "SELECT $this->fields FROM $this->table
            WHERE `to`=%s and send != 1 
            ORDER BY timestamp DESC LIMIT %d", $uid, $limit );
        return array_reverse( $this->imdb->get_results( $query ) );
	}

	public function insert($user, $message) {
        $res = $this->imdb->insert( $this->table, array(
            "send" => $message['send'],
            "type" => $message['type'],
            "to" => $message['to'],
            "from" => $user->id,
            "nick" => $user->nick,
            "body" => $message['body'],
            "style" => $message['style'],
            "timestamp" => $message['timestamp'],
            "created_at" => date( 'Y-m-d H:i:s' ),
        ) );
        var_dump($res);
	}

	public function clear($uid, $with) {
        $this->imdb->update($this->table, array( "fromdel" => 1, "type" => "chat" ), array( "from" => $uid, "to" => $with ) );
        $this->imdb->update($this->table, array( "todel" => 1, "type" => "chat" ), array( "to" => $uid, "from" => $with ) );
        $this->imdb->query( $this->imdb->prepare( "DELETE FROM $this->table WHERE todel=1 AND fromdel=1" ) );
	}

	public function offlineReaded($uid) {
        $this->imdb->update( $this->table, array( "send" => 1 ), array( "to" => $uid, "send" => 0 ) );
	}

}

