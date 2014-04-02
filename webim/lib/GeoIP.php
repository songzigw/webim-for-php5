<?php

require_once dirname(__FILE__) . "/IP.class.php";

class GeoIP {

    public static function convert($ip) {
        $loc = IP::find($ip);
        return $loc[1];
    }

}

function GeoIP_test() {
	//["115.193.152.250", "浙江", "杭州市"],
	//["60.13.250.0", "新疆", "克拉玛依市"],
	//["117.25.128.84", "福建", "厦门市"],
	//["222.73.68.35", "上海", "上海市"],
	//["203.198.23.69", "香港", "香港"],
	//["221.223.102.183", "北京市", "北京市"],
	//["211.66.210.249", "广东", ""]
	var_dump(GeoIP::convert("114.66.9.48"));
	var_dump(GeoIP::convert("8.8.8.8"));
	var_dump(GeoIP::convert("192.168.1.1"));
	var_dump(GeoIP::convert("127.0.0.1"));
	var_dump(GeoIP::convert("192.30.252.128"));
	//print_r( $geoip->convert("115.193.152.250") );
	//print_r( $geoip->convert("203.198.23.69") );
}

//GeoIP_test();

