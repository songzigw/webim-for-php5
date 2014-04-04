<?php

define('WEBIM_VERSION', '5.4');
define('WEBIM_PRODUCT', 'php5');
define('WEBIM_DEBUG', true);
define('WEBIMDB_CHARSET', 'utf8');
define('WEBIM_PATH', '/php5/webim');

if(WEBIM_DEBUG) {
	error_reporting( E_ALL );
} else {
	error_reporting( E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED );
}
