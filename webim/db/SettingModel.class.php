<?php

/**
 *
 *   CREATE TABLE `webim_settings` (
 *         `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
 *         `uid` varchar(40) NOT NULL DEFAULT '',
 *         `data` text,
 *         `created_at` datetime DEFAULT NULL,
 *         `updated_at` datetime DEFAULT NULL,
 *         PRIMARY KEY (`id`)
 *   ) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
 */

class SettingModel {

    private $imdb;

	protected $table = 'webim_settings';

    function HistoryModel($db) {
        $this->__construct($db);
    }

    function __construct($db) {
        $this->imdb = $db; 
    }

	public function set($uid, $data) {
        if( $data ) {
            if ( !is_string( $data ) ){
                $data = json_encode( $data );
            }
            $this->imdb->update($this->table, array( "data" => $data ), array( 'uid' => $uid ) );
        }
	}

	public function get($uid) {
        $data = $this->imdb->get_var( $this->imdb->prepare( "SELECT data FROM $this->table WHERE uid = %d", $uid ) );
        if( $data ){
            return json_decode( $data );
        } 
        $this->imdb->insert($this->table, array( "uid" => $uid, "data" => "{}" ) );
        return new stdClass();
	}
	
}
