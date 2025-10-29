-- Crear base de datos
CREATE DATABASE IF NOT EXISTS servimoto;
USE servimoto;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    imagen_perfil VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla para logs de registro (opcional)
CREATE TABLE registro_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    exito BOOLEAN,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Insertar usuario de ejemplo
INSERT INTO usuarios (nombre_completo, email, fecha_nacimiento, password_hash) 
VALUES ('Usuario Demo', 'demo@servimoto.com', '1990-01-01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Crear índice para mejorar búsquedas por email
CREATE INDEX idx_email ON usuarios(email);

-- Verificar la tabla creada
SELECT * FROM usuarios;

-- Tabla de servicios
CREATE TABLE servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL
);

-- Insertar servicios de ejemplo
INSERT INTO servicios (nombre, descripcion, precio) VALUES
('Mantenimiento General', 'Cambio de aceite, filtros, ajuste de frenos, revisión completa de sistemas y puesta a punto.', 50.00),
('Reparación de Motor', 'Diagnóstico y reparación de problemas mecánicos, ajuste de válvulas, reconstrucción de motores.', 100.00),
('Sistema Eléctrico', 'Reparación de alternadores, arranques, instalación de accesorios eléctricos y diagnóstico de fallas.', 60.00),
('Pintura y Detallado', 'Servicios de pintura profesional, detallado completo, pulido y restauración de carenados.', 150.00),
('Aceite', 'Cambio de aceite y filtro para mantener tu motor en perfectas condiciones.', 25.00),
('Frenos', 'Cambio de pastillas, discos y líquido de frenos para máxima seguridad.', 45.00),
('Cubierta', 'Cambio y reparación de cubiertas para todo tipo de motocicletas.', 80.00),
('Filtro de Aire', 'Cambio de filtro de aire para optimizar el rendimiento del motor.', 20.00),
('Transmisión', 'Cambio de transmisión y ajuste de cadena para un funcionamiento suave.', 35.00),
('Lubricación', 'Lubricación de todas las partes móviles para prolongar la vida útil de tu moto.', 15.00);