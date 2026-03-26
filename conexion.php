<?php
// ══════════════════════════════════════════
//  ALIANZA AZUL — Conexión a base de datos
//  Ajusta los valores según tu entorno local
// ══════════════════════════════════════════

define('DB_HOST',   'localhost');
define('DB_USER',   'root');        // usuario de tu MySQL/phpMyAdmin
define('DB_PASS',   '');            // contraseña (vacía en XAMPP por defecto)
define('DB_NAME',   'alianza_azul');
define('DB_CHARSET','utf8mb4');

function getConexion(): mysqli {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode([
            'ok'  => false,
            'msg' => 'Error de conexión: ' . $conn->connect_error
        ]));
    }
    $conn->set_charset(DB_CHARSET);
    return $conn;
}
