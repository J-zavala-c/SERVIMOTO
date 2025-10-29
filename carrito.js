// Carrito de compras
class Carrito {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('carrito')) || [];
        this.productos = []; // Almacenar los productos cargados
        this.servicios = []; // Almacenar los servicios cargados
        this.actualizarContador();
        this.inicializarEventos();
        this.cargarProductos();
        this.cargarServicios();
    }

    inicializarEventos() {
        // Evento para abrir el carrito
        document.getElementById('cartIcon').addEventListener('click', () => {
            this.mostrarCarrito();
        });

        // Evento para cerrar el modal
        document.querySelector('#cartModal .close').addEventListener('click', () => {
            this.cerrarCarrito();
        });

        // Evento para seguir comprando
        document.getElementById('continueShopping').addEventListener('click', () => {
            this.cerrarCarrito();
        });

        // Evento para finalizar compra
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.finalizarCompra();
        });

        // Delegación de eventos para los botones de agregar al carrito
        document.addEventListener('click', (e) => {
            // Para productos
            if (e.target.classList.contains('add-to-cart')) {
                const productId = parseInt(e.target.dataset.id);
                this.agregarProducto(productId);
            }
            
            // Para servicios
            if (e.target.classList.contains('add-service')) {
                const serviceId = parseInt(e.target.dataset.id);
                this.agregarServicio(serviceId);
            }
        });
    }

    async cargarProductos() {
        try {
            this.productos = await apiService.obtenerProductos();
            this.mostrarProductos();
        } catch (error) {
            console.error('Error al cargar productos:', error);
            // Cargar productos de respaldo si la API falla
            this.productos = this.getProductosRespaldo();
            this.mostrarProductos();
        }
    }

    getProductosRespaldo() {
        return [
            {
                id: 1,
                nombre: 'Casco Integral Pro',
                descripcion: 'Casco de alta seguridad con certificación internacional y visor anti-vaho',
                precio: 89.99,
                imagen: 'https://images.unsplash.com/photo-1621814939078-6a16f454f1e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                stock: 50
            },
            {
                id: 2,
                nombre: 'Guantes Térmicos',
                descripcion: 'Guantes con protección en nudillos y aislamiento térmico para todo clima',
                precio: 49.99,
                imagen: 'https://images.unsplash.com/photo-1625602223877-4b3b7a4d1b3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                stock: 30
            },
            {
                id: 3,
                nombre: 'Aceite Sintético 10W-40',
                descripcion: 'Aceite de alto rendimiento para motores de 4 tiempos, 1 litro',
                precio: 19.99,
                imagen: 'https://images.unsplash.com/photo-1571655664818-4d3c3e4e5b8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                stock: 100
            },
            {
                id: 4,
                nombre: 'Llantas Diablo Rosso III',
                descripcion: 'Llantas de alto desempeño para deportivas, excelente agarre en seco y mojado',
                precio: 199.99,
                imagen: 'https://images.unsplash.com/photo-1629483057238-966c7caf3f99?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                stock: 20
            }
        ];
    }

    mostrarProductos() {
        const productGrid = document.getElementById('productGrid');
        if (!productGrid) return;

        productGrid.innerHTML = '';

        this.productos.forEach(producto => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-img">
                    <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <div class="price">$${producto.precio.toFixed(2)}</div>
                    <button class="btn add-to-cart" data-id="${producto.id}">
                        <i class="fas fa-cart-plus"></i> Agregar al Carrito
                    </button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    }

    async cargarServicios() {
        try {
            this.servicios = await apiService.obtenerServicios();
            this.mostrarServicios();
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        }
    }

    mostrarServicios() {
        const serviceGrid = document.getElementById('serviceGrid');
        if (!serviceGrid) return;

        serviceGrid.innerHTML = '';

        this.servicios.forEach(servicio => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card';
            serviceCard.innerHTML = `
                <div class="service-icon">
                    <i class="${servicio.icono}"></i>
                </div>
                <h3>${servicio.nombre}</h3>
                <p>${servicio.descripcion}</p>
                <div class="price" style="margin: 15px 0; font-size: 1.2rem;">$${servicio.precio.toFixed(2)}</div>
                <button class="btn add-service" data-id="${servicio.id}">
                    <i class="fas fa-tools"></i> Solicitar Servicio
                </button>
            `;
            serviceGrid.appendChild(serviceCard);
        });
    }

    agregarProducto(productId) {
        const producto = this.productos.find(p => p.id === productId);
        
        if (!producto) {
            console.error('Producto no encontrado');
            this.mostrarMensaje('Error: Producto no encontrado', 'error');
            return;
        }

        // Verificar stock
        if (producto.stock <= 0) {
            this.mostrarMensaje('Lo sentimos, este producto está agotado', 'error');
            return;
        }

        // Verificar si el producto ya está en el carrito
        const productoExistente = this.items.find(item => 
            item.id === productId && item.tipo === 'producto'
        );

        if (productoExistente) {
            // Verificar que no exceda el stock disponible
            if (productoExistente.cantidad >= producto.stock) {
                this.mostrarMensaje(`No hay más stock disponible de ${producto.nombre}`, 'error');
                return;
            }
            productoExistente.cantidad += 1;
        } else {
            this.items.push({
                id: productId,
                tipo: 'producto',
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: 1
            });
        }

        this.guardarCarrito();
        this.actualizarContador();
        this.mostrarMensaje(`✓ ${producto.nombre} agregado al carrito`);
    }

    agregarServicio(serviceId) {
        const servicio = this.servicios.find(s => s.id === serviceId);
        
        if (!servicio) {
            console.error('Servicio no encontrado');
            this.mostrarMensaje('Error: Servicio no encontrado', 'error');
            return;
        }

        // Verificar si el servicio ya está en el carrito
        const servicioExistente = this.items.find(item => 
            item.id === serviceId && item.tipo === 'servicio'
        );

        if (servicioExistente) {
            servicioExistente.cantidad += 1;
        } else {
            this.items.push({
                id: serviceId,
                tipo: 'servicio',
                nombre: servicio.nombre,
                precio: servicio.precio,
                imagen: null,
                cantidad: 1
            });
        }

        this.guardarCarrito();
        this.actualizarContador();
        this.mostrarMensaje(`✓ ${servicio.nombre} agregado al carrito`);
    }

    eliminarProducto(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.guardarCarrito();
        this.actualizarContador();
        this.mostrarCarrito();
    }

    actualizarCantidad(id, nuevaCantidad) {
        if (nuevaCantidad < 1) {
            this.eliminarProducto(id);
            return;
        }

        const item = this.items.find(item => item.id === id);
        if (item) {
            // Si es un producto, verificar stock
            if (item.tipo === 'producto') {
                const producto = this.productos.find(p => p.id === id);
                if (producto && nuevaCantidad > producto.stock) {
                    this.mostrarMensaje(`No hay suficiente stock. Máximo disponible: ${producto.stock}`, 'error');
                    return;
                }
            }
            
            item.cantidad = nuevaCantidad;
            this.guardarCarrito();
            this.actualizarContador();
            this.mostrarCarrito();
        }
    }

    mostrarCarrito() {
        const modal = document.getElementById('cartModal');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #87cefa; margin-bottom: 15px;"></i>
                    <p>Tu carrito está vacío</p>
                    <p style="font-size: 0.9rem; color: #666;">Agrega algunos productos o servicios para comenzar</p>
                </div>
            `;
            cartTotal.textContent = '0.00';
        } else {
            cartItems.innerHTML = '';
            let total = 0;

            this.items.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                total += subtotal;

                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="cart-item-info">
                        ${item.imagen ? `
                        <div class="cart-item-img">
                            <img src="${item.imagen}" alt="${item.nombre}">
                        </div>
                        ` : `
                        <div class="cart-item-img" style="background: #e6f2ff; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-tools" style="font-size: 1.5rem; color: #1e90ff;"></i>
                        </div>
                        `}
                        <div class="cart-item-details">
                            <h4>${item.nombre}</h4>
                            <p class="cart-item-price">$${item.precio.toFixed(2)}</p>
                            <small style="color: #666;">${item.tipo === 'servicio' ? 'Servicio' : 'Producto'}</small>
                        </div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span class="quantity">${item.cantidad}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item" data-id="${item.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;

                cartItems.appendChild(itemElement);
            });

            cartTotal.textContent = total.toFixed(2);

            // Agregar eventos a los botones de cantidad y eliminar
            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.closest('.quantity-btn').dataset.id);
                    const item = this.items.find(item => item.id === id);
                    if (item) {
                        this.actualizarCantidad(id, item.cantidad - 1);
                    }
                });
            });

            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.closest('.quantity-btn').dataset.id);
                    const item = this.items.find(item => item.id === id);
                    if (item) {
                        this.actualizarCantidad(id, item.cantidad + 1);
                    }
                });
            });

            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.closest('.remove-item').dataset.id);
                    this.eliminarProducto(id);
                });
            });
        }

        modal.style.display = 'block';
    }

    cerrarCarrito() {
        document.getElementById('cartModal').style.display = 'none';
    }

    async finalizarCompra() {
        if (this.items.length === 0) {
            this.mostrarMensaje('Tu carrito está vacío', 'error');
            return;
        }

        // Verificar si el usuario está logueado
        const usuarioLogueado = localStorage.getItem('usuarioLogueado');
        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
        
        if (!usuarioLogueado || !usuarioActual) {
            this.mostrarMensaje('Debes iniciar sesión para finalizar tu compra', 'error');
            document.getElementById('cartModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
            return;
        }

        try {
            // Preparar datos para el pedido
            const productosPedido = this.items.map(item => ({
                id: item.tipo === 'producto' ? item.id : null,
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad,
                tipo: item.tipo
            }));

            const pedidoData = {
                usuario_id: usuarioActual.id,
                productos: productosPedido,
                total: this.calcularTotal()
            };

            // Enviar pedido a la API
            const resultado = await apiService.crearPedido(pedidoData);
            
            if (resultado.error) {
                throw new Error(resultado.error);
            }

            // Mostrar confirmación
            this.mostrarMensaje(`¡Compra realizada con éxito! Pedido #${resultado.pedido_id}`, 'success');
            
            // Limpiar carrito después de la compra
            this.items = [];
            this.guardarCarrito();
            this.actualizarContador();
            this.cerrarCarrito();

            // Mostrar resumen de la compra
            setTimeout(() => {
                alert(`¡Gracias por tu compra, ${usuarioActual.nombre}!\n\nPedido #${resultado.pedido_id}\nTotal: $${pedidoData.total.toFixed(2)}\n\nTe contactaremos pronto para coordinar la entrega.`);
            }, 1000);

        } catch (error) {
            console.error('Error al procesar pedido:', error);
            this.mostrarMensaje('Error al procesar el pedido: ' + error.message, 'error');
        }
    }

    calcularTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    actualizarContador() {
        const totalItems = this.items.reduce((total, item) => total + item.cantidad, 0);
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = totalItems;
            
            // Animación del contador
            if (totalItems > 0) {
                cartCount.style.display = 'flex';
                cartCount.style.animation = 'bounce 0.5s';
                setTimeout(() => {
                    cartCount.style.animation = '';
                }, 500);
            } else {
                cartCount.style.display = 'none';
            }
        }
    }

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
    }

    mostrarMensaje(mensaje, tipo = 'success') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = mensaje;
        
        // Estilos según el tipo
        const styles = {
            success: {
                background: '#4CAF50',
                color: 'white'
            },
            error: {
                background: '#f44336',
                color: 'white'
            },
            warning: {
                background: '#ff9800',
                color: 'white'
            }
        };

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${styles[tipo].background};
            color: ${styles[tipo].color};
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            font-weight: 500;
        `;

        document.body.appendChild(notification);

        // Auto-eliminar después de 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
}

// Inicializar el carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.carrito = new Carrito();
});