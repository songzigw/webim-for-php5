<?php

function timeAgo($dtime) {

    $diff = time() - strtotime($dtime);

    $units = array( 
        12 * 30 * 24 * 60 * 60  =>  '年',
        30 * 24 * 60 * 60       =>  '月',
        24 * 60 * 60            =>  '天',
        60 * 60                 =>  '小时',
        60                      =>  '分',
        1                       =>  '秒'
    );

    foreach ($units as $secs => $unit) {
        $ago = $diff / $secs;
        if ($ago >= 1) {
            $ago = round($ago);
            return "{$ago}{$unit}前";
        }
    }

    return '刚刚';  

}

//echo timeAgo('2013-05-01 00:22:35');
//echo timeAgo('2014-03-01 00:22:35');
