<?php
include 'config.php';

function getRequestMethod() {
    return $_SERVER['REQUEST_METHOD'];
}

$method = getRequestMethod();

switch($method) {
    case 'GET':
        // Obtener pedidos
        if(isset($_GET['id'])) {
            // Obtener pedido específico con detalles
            $id = $_GET['id'];
            
            // Información del pedido
            $sql = "SELECT p.*, u.nombre as usuario_nombre, u.email, u.telefono 
                    FROM pedidos p 
                    JOIN usuarios u ON p.usuario_id = u.id 
                    WHERE p.id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $pedido = $result->fetch_assoc();
            
            if(!$pedido) {
                sendJsonResponse(array('error' => 'Pedido no encontrado'), 404);
            }
            
            // Detalles del pedido
            $sql = "SELECT dp.*, 
                    COALESCE(pr.nombre, s.nombre) as nombre,
                    COALESCE(pr.imagen, '') as imagen,
                    CASE 
                        WHEN dp.producto_id IS NOT NULL THEN 'producto'
                        WHEN dp.servicio_id IS NOT NULL THEN 'servicio'
                    END as tipo
                    FROM detalle_pedido dp 
                    LEFT JOIN productos pr ON dp.producto_id = pr.id 
                    LEFT JOIN servicios s ON dp.servicio_id = s.id 
                    WHERE dp.pedido_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $detalles = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            
            $pedido['detalles'] = $detalles;
            
            sendJsonResponse($pedido);
            
        } elseif(isset($_GET['usuario_id'])) {
            // Obtener pedidos de un usuario específico
            $usuario_id = $_GET['usuario_id'];
            
            $sql = "SELECT p.*, 
                    (SELECT COUNT(*) FROM detalle_pedido dp WHERE dp.pedido_id = p.id) as cantidad_items
                    FROM pedidos p 
                    WHERE p.usuario_id = ? 
                    ORDER BY p.fecha DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $usuario_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $pedidos = array();
            while($row = $result->fetch_assoc()) {
                $pedidos[] = $row;
            }
            
            sendJsonResponse($pedidos);
        } else {
            // Obtener todos los pedidos (solo administración)
            $sql = "SELECT p.*, u.nombre as usuario_nombre, u.email,
                    (SELECT COUNT(*) FROM detalle_pedido dp WHERE dp.pedido_id = p.id) as cantidad_items
                    FROM pedidos p 
                    JOIN usuarios u ON p.usuario_id = u.id 
                    ORDER BY p.fecha DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $pedidos = array();
            while($row = $result->fetch_assoc()) {
                $pedidos[] = $row;
            }
            
            sendJsonResponse($pedidos);
        }
        break;
        
    case 'POST':
        // Crear nuevo pedido
        $data = getJsonData();
        
        if(!isset($data['usuario_id']) || !isset($data['productos']) || !is_array($data['productos'])) {
            sendJsonResponse(array('error' => 'Datos incompletos para crear el pedido'), 400);
        }
        
        $usuario_id = $data['usuario_id'];
        $productos = $data['productos'];
        
        // Verificar que el usuario existe
        $sql = "SELECT id FROM usuarios WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $usuario_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if($result->num_rows === 0) {
            sendJsonResponse(array('error' => 'Usuario no encontrado'), 404);
        }
        
        // Calcular total
        $total = 0;
        foreach($productos as $producto) {
            if(!isset($producto['precio']) || !isset($producto['cantidad'])) {
                sendJsonResponse(array('error' => 'Datos de productos incompletos'), 400);
            }
            $total += $producto['precio'] * $producto['cantidad'];
        }
        
        // Iniciar transacción
        $conn->begin_transaction();
        
        try {
            // Crear pedido
            $sql = "INSERT INTO pedidos (usuario_id, total) VALUES (?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("id", $usuario_id, $total);
            
            if(!$stmt->execute()) {
                throw new Exception("Error al crear el pedido: " . $stmt->error);
            }
            
            $pedido_id = $stmt->insert_id;
            
            // Agregar detalles del pedido
            foreach($productos as $producto) {
                $producto_id = null;
                $servicio_id = null;
                
                if(isset($producto['tipo'])) {
                    if($producto['tipo'] === 'producto' && isset($producto['id'])) {
                        $producto_id = $producto['id'];
                    } elseif($producto['tipo'] === 'servicio' && isset($producto['id'])) {
                        $servicio_id = $producto['id'];
                    }
                } else {
                    // Por compatibilidad con versiones anteriores
                    $producto_id = $producto['id'] ?? null;
                }
                
                $cantidad = $producto['cantidad'];
                $precio = $producto['precio'];
                
                $sql = "INSERT INTO detalle_pedido (pedido_id, producto_id, servicio_id, cantidad, precio) VALUES (?, ?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("iiidd", $pedido_id, $producto_id, $servicio_id, $cantidad, $precio);
                
                if(!$stmt->execute()) {
                    throw new Exception("Error al agregar detalle del pedido: " . $stmt->error);
                }
                
                // Actualizar stock solo si es un producto físico
                if($producto_id && (!isset($producto['tipo']) || $producto['tipo'] === 'producto')) {
                    $sql = "UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("iii", $cantidad, $producto_id, $cantidad);
                    
                    if(!$stmt->execute()) {
                        throw new Exception("Error al actualizar stock: " . $stmt->error);
                    }
                    
                    if($stmt->affected_rows === 0) {
                        throw new Exception("Stock insuficiente para el producto ID: $producto_id");
                    }
                }
            }
            
            // Confirmar transacción
            $conn->commit();
            
            sendJsonResponse(array(
                'mensaje' => 'Pedido creado exitosamente',
                'pedido_id' => $pedido_id,
                'total' => $total,
                'fecha' => date('Y-m-d H:i:s')
            ), 201);
            
        } catch (Exception $e) {
            // Revertir transacción en caso de error
            $conn->rollback();
            sendJsonResponse(array('error' => 'Error al crear pedido: ' . $e->getMessage()), 500);
        }
        break;
        
    case 'PUT':
        // Actualizar estado del pedido
        $data = getJsonData();
        $id = $data['id'] ?? null;
        $estado = $data['estado'] ?? null;
        
        if(!$id || !$estado) {
            sendJsonResponse(array('error' => 'ID y estado del pedido requeridos'), 400);
        }
        
        $estados_validos = ['pendiente', 'procesando', 'completado', 'cancelado'];
        if(!in_array($estado, $estados_validos)) {
            sendJsonResponse(array('error' => 'Estado no válido. Los estados permitidos son: ' . implode(', ', $estados_validos)), 400);
        }
        
        // Verificar que el pedido existe
        $sql = "SELECT id FROM pedidos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if($result->num_rows === 0) {
            sendJsonResponse(array('error' => 'Pedido no encontrado'), 404);
        }
        
        $sql = "UPDATE pedidos SET estado = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $estado, $id);
        
        if($stmt->execute()) {
            sendJsonResponse(array(
                'mensaje' => 'Estado del pedido actualizado exitosamente',
                'pedido_id' => $id,
                'nuevo_estado' => $estado
            ));
        } else {
            sendJsonResponse(array('error' => 'Error al actualizar estado del pedido: ' . $stmt->error), 500);
        }
        break;
        
    case 'DELETE':
        // Eliminar pedido (solo para administración)
        $data = getJsonData();
        $id = $data['id'] ?? null;
        
        if(!$id) {
            sendJsonResponse(array('error' => 'ID de pedido requerido'), 400);
        }
        
        // Iniciar transacción para eliminar detalles primero
        $conn->begin_transaction();
        
        try {
            // Eliminar detalles del pedido
            $sql = "DELETE FROM detalle_pedido WHERE pedido_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if(!$stmt->execute()) {
                throw new Exception("Error al eliminar detalles del pedido: " . $stmt->error);
            }
            
            // Eliminar pedido
            $sql = "DELETE FROM pedidos WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if(!$stmt->execute()) {
                throw new Exception("Error al eliminar pedido: " . $stmt->error);
            }
            
            // Confirmar transacción
            $conn->commit();
            
            sendJsonResponse(array('mensaje' => 'Pedido eliminado exitosamente'));
            
        } catch (Exception $e) {
            // Revertir transacción en caso de error
            $conn->rollback();
            sendJsonResponse(array('error' => 'Error al eliminar pedido: ' . $e->getMessage()), 500);
        }
        break;
        
    default:
        sendJsonResponse(array('error' => 'Método no permitido'), 405);
        break;
}

$conn->close();
?>