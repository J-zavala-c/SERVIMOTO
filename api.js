// En la clase ApiService, modificar la función obtenerServicios:
async function obtenerServicios() {
    try {
        return await this.request('php/servicios.php');
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        // Datos de respaldo
        return [
            {
                id: 1,
                nombre: 'Mantenimiento General',
                descripcion: 'Cambio de aceite, filtros, ajuste de frenos, revisión completa de sistemas y puesta a punto.',
                precio: 50.00
            },
            {
                id: 2,
                nombre: 'Reparación de Motor',
                descripcion: 'Diagnóstico y reparación de problemas mecánicos, ajuste de válvulas, reconstrucción de motores.',
                precio: 100.00
            },
            {
                id: 3,
                nombre: 'Sistema Eléctrico',
                descripcion: 'Reparación de alternadores, arranques, instalación de accesorios eléctricos y diagnóstico de fallas.',
                precio: 60.00
            },
            {
                id: 4,
                nombre: 'Pintura y Detallado',
                descripcion: 'Servicios de pintura profesional, detallado completo, pulido y restauración de carenados.',
                precio: 150.00
            },
            {
                id: 5,
                nombre: 'Aceite',
                descripcion: 'Cambio de aceite y filtro para mantener tu motor en perfectas condiciones.',
                precio: 25.00
            },
            {
                id: 6,
                nombre: 'Frenos',
                descripcion: 'Cambio de pastillas, discos y líquido de frenos para máxima seguridad.',
                precio: 45.00
            },
            {
                id: 7,
                nombre: 'Cubierta',
                descripcion: 'Cambio y reparación de cubiertas para todo tipo de motocicletas.',
                precio: 80.00
            },
            {
                id: 8,
                nombre: 'Filtro de Aire',
                descripcion: 'Cambio de filtro de aire para optimizar el rendimiento del motor.',
                precio: 20.00
            },
            {
                id: 9,
                nombre: 'Transmisión',
                descripcion: 'Cambio de transmisión y ajuste de cadena para un funcionamiento suave.',
                precio: 35.00
            },
            {
                id: 10,
                nombre: 'Lubricación',
                descripcion: 'Lubricación de todas las partes móviles para prolongar la vida útil de tu moto.',
                precio: 15.00
            }
        ];
    }
}