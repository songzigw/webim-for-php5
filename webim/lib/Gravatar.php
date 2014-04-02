<?php 

class Gravatar {

    public static function d($id, $size = 48) {
        return "http://www.gravatar.com/avatar/" . md5($id) . "?s={$size}&d=identicon&f=y";
    }

    public static function url($email, $size = 48) {
        return "http://www.gravatar.com/avatar/" . md5( strtolower( trim( $email ) ) ) . "&s={$size}";
    }

}

//var_dump(Gravatar::d('1'));
//var_dump(Gravatar::url('ery.lee@gmail.com'));
