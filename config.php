<?php
// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_USER', 'root'); // Cambia esto por tu usuario de MySQL
define('DB_PASS', ''); // Cambia esto por tu contraseña de MySQL
define('DB_NAME', 'servimoto'); // Cambia esto por el nombre de tu base de datos

// Función para conectar a la base de datos
function conectarDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        die("Error de conexión: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8");
    return $conn;
}

// Función para enviar respuestas JSON
function sendJsonResponse($data, $status = 200) {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Función para obtener datos JSON del cuerpo de la petición
function getJsonData() {
    return json_decode(file_get_contents('php://input'), true);
}
?>