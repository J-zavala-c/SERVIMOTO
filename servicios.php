<?php
include 'config.php';

$method = getRequestMethod();
$conn = conectarDB();

switch($method) {
    case 'GET':
        // Obtener servicios
        if(isset($_GET['id'])) {
            // Obtener servicio específico
            $id = $_GET['id'];
            $sql = "SELECT * FROM servicios WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
        } else {
            // Obtener todos los servicios
            $sql = "SELECT * FROM servicios ORDER BY nombre";
            $stmt = $conn->prepare($sql);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $servicios = array();
        
        while($row = $result->fetch_assoc()) {
            $servicios[] = $row;
        }
        
        sendJsonResponse($servicios);
        break;
        
    case 'POST':
        // Crear nuevo servicio (solo administración)
        $data = getJsonData();
        
        if(!isset($data['nombre']) || !isset($data['precio'])) {
            sendJsonResponse(array('error' => 'Nombre y precio son obligatorios'), 400);
        }
        
        $nombre = $data['nombre'];
        $descripcion = $data['descripcion'] ?? null;
        $precio = $data['precio'];
        
        $sql = "INSERT INTO servicios (nombre, descripcion, precio) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssd", $nombre, $descripcion, $precio);
        
        if($stmt->execute()) {
            $servicio_id = $stmt->insert_id;
            sendJsonResponse(array(
                'mensaje' => 'Servicio creado exitosamente',
                'servicio_id' => $servicio_id
            ), 201);
        } else {
            sendJsonResponse(array('error' => 'Error al crear servicio'), 500);
        }
        break;
        
    case 'PUT':
        // Actualizar servicio (solo administración)
        $data = getJsonData();
        $id = $data['id'] ?? null;
        
        if(!$id) {
            sendJsonResponse(array('error' => 'ID de servicio requerido'), 400);
        }
        
        $updates = array();
        $params = array();
        $types = "";
        
        if(isset($data['nombre'])) {
            $updates[] = "nombre = ?";
            $params[] = $data['nombre'];
            $types .= "s";
        }
        
        if(isset($data['descripcion'])) {
            $updates[] = "descripcion = ?";
            $params[] = $data['descripcion'];
            $types .= "s";
        }
        
        if(isset($data['precio'])) {
            $updates[] = "precio = ?";
            $params[] = $data['precio'];
            $types .= "d";
        }
        
        if(empty($updates)) {
            sendJsonResponse(array('error' => 'No hay campos para actualizar'), 400);
        }
        
        $params[] = $id;
        $types .= "i";
        
        $sql = "UPDATE servicios SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        
        if($stmt->execute()) {
            sendJsonResponse(array('mensaje' => 'Servicio actualizado exitosamente'));
        } else {
            sendJsonResponse(array('error' => 'Error al actualizar servicio'), 500);
        }
        break;
        
    case 'DELETE':
        // Eliminar servicio (solo administración)
        $data = getJsonData();
        $id = $data['id'] ?? null;
        
        if(!$id) {
            sendJsonResponse(array('error' => 'ID de servicio requerido'), 400);
        }
        
        $sql = "DELETE FROM servicios WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            sendJsonResponse(array('mensaje' => 'Servicio eliminado exitosamente'));
        } else {
            sendJsonResponse(array('error' => 'Error al eliminar servicio'), 500);
        }
        break;
        
    default:
        sendJsonResponse(array('error' => 'Método no permitido'), 405);
        break;
}

$conn->close();
?>