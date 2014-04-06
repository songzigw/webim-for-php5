<?php

namespace WebIM;

/**
 * WebIM APP
 */
class App {

    public static function run() {

        $router = new \WebIM\Router();

        $router->model( new \WebIM\Model() );

        $router->plugin( new \WebIM\Plugin() );

        $router->route();
    
    }

}

