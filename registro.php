<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "servimoto";

// Respuesta por defecto
$response = ['success' => false, 'message' => 'Error desconocido'];

try {
    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Datos no válidos');
    }
    
    // Validar campos requeridos
    $required = ['nombre_completo', 'email', 'fecha_nacimiento', 'password'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            throw new Exception("El campo $field es requerido");
        }
    }
    
    // Validar email
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('El formato del email no es válido');
    }
    
    // Validar fecha de nacimiento
    $birthDate = DateTime::createFromFormat('Y-m-d', $input['fecha_nacimiento']);
    $today = new DateTime();
    $age = $today->diff($birthDate)->y;
    
    if ($age < 18) {
        throw new Exception('Debes tener al menos 18 años para registrarte');
    }
    
    // Conectar a la base de datos
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception('Error de conexión a la base de datos');
    }
    
    // Verificar si el email ya existe
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $input['email']);
    $stmt->execute();
    $stmt->store_result();
    
    if ($stmt->num_rows > 0) {
        throw new Exception('El email ya está registrado');
    }
    $stmt->close();
    
    // Procesar imagen si existe
    $imagen_perfil = null;
    if (!empty($input['imagen_perfil'])) {
        // Guardar imagen en servidor (en un entorno real)
        $imagen_data = $input['imagen_perfil'];
        $imagen_perfil = 'uploads/' . uniqid() . '.jpg'; // Ruta donde guardar la imagen
        // file_put_contents($imagen_perfil, base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imagen_data)));
    }
    
    // Hash de la contraseña
    $password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
    
    // Insertar usuario
    $stmt = $conn->prepare("INSERT INTO usuarios (nombre_completo, email, fecha_nacimiento, imagen_perfil, password_hash) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $input['nombre_completo'], $input['email'], $input['fecha_nacimiento'], $imagen_perfil, $password_hash);
    
    if ($stmt->execute()) {
        $response = [
            'success' => true, 
            'message' => 'Usuario registrado exitosamente',
            'user_id' => $stmt->insert_id
        ];
        
        // Log de registro exitoso
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        $log_stmt = $conn->prepare("INSERT INTO registro_logs (usuario_id, ip_address, user_agent, exito) VALUES (?, ?, ?, TRUE)");
        $log_stmt->bind_param("iss", $stmt->insert_id, $ip, $user_agent);
        $log_stmt->execute();
        $log_stmt->close();
    } else {
        throw new Exception('Error al registrar usuario: ' . $stmt->error);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
    
    // Log de error (en entorno real)
    error_log("Error en registro: " . $e->getMessage());
}

echo json_encode($response);
?>