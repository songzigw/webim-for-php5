# WebIM-php-composer

A PHP library for interacting with the [NexTalk](http://nextalk.im) Server.

## Composer Installation

Installed with Composer (http://getcomposer.org/).  Add the following to your
composer.json file.  Composer will handle the autoloading.

```json
{
    "require": {
        "WebIM/WebIM": "*"
    }
}
```

## Usage

```php
$endpoint = array(
    'id' => 'uid1',
    'nick' => 'User1',
    'status' => 'Online',
    'show' => 'available',
);
$domain = 'www.example.com';
$apikey = 'akakakakakdka';
$server = 'http://nextalk.im:8000';
$webim = new WebIM\WebIM($endpoint, $domain, $apikey, $server);

$buddy_ids = ['uid2', 'uid3'];
$group_ids = ['gid1', 'gid2'];
$webim.online($buddy_ids, $groupd_ids);

$webim.message(null, 'uid2', 'blabla');

```

## Testing

To test the library itself, run the PHPUnit tests:

    phpunit tests/

