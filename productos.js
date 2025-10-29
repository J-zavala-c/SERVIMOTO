// Productos disponibles
const productos = [
    {
        id: 1,
        nombre: "Casco Integral Pro",
        precio: 89.99,
        imagen: "https://images.unsplash.com/photo-1621814939078-6a16f454f1e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        descripcion: "Casco de alta seguridad con certificación internacional y visor anti-vaho"
    },
    {
        id: 2,
        nombre: "Guantes Térmicos",
        precio: 49.99,
        imagen: "https://images.unsplash.com/photo-1625602223877-4b3b7a4d1b3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        descripcion: "Guantes con protección en nudillos y aislamiento térmico para todo clima"
    },
    {
        id: 3,
        nombre: "Aceite Sintético 10W-40",
        precio: 19.99,
        imagen: "https://images.unsplash.com/photo-1571655664818-4d3c3e4e5b8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        descripcion: "Aceite de alto rendimiento para motores de 4 tiempos, 1 litro"
    },
    {
        id: 4,
        nombre: "Llantas Diablo Rosso III",
        precio: 199.99,
        imagen: "https://images.unsplash.com/photo-1629483057238-966c7caf3f99?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        descripcion: "Llantas de alto desempeño para deportivas, excelente agarre en seco y mojado"
    }
];

// Cargar productos en la página
function cargarProductos() {
    const container = document.getElementById('productos-container');
    
    container.innerHTML = productos.map(producto => `
        <div class="product-card">
            <div class="product-img">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>
            <div class="product-info">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <div class="price">$${producto.precio.toFixed(2)}</div>
                <button class="btn agregar-carrito-btn" data-id="${producto.id}">
                    <i class="fas fa-cart-plus me-2"></i>Agregar al Carrito
                </button>
            </div>
        </div>
    `).join('');

    // Agregar event listeners a los botones
    document.querySelectorAll('.agregar-carrito-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').dataset.id;
            agregarAlCarrito(id);
        });
    });
}

// Agregar producto al carrito
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id == id);
    if (!producto) return;

    let carrito = JSON.parse(localStorage.getItem('carritoServimoto') || '[]');
    
    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.id == id);
    
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    // Guardar en localStorage
    localStorage.setItem('carritoServimoto', JSON.stringify(carrito));
    
    // Actualizar contador
    actualizarContadorCarrito();
    
    // Redirigir al carrito o mostrar mensaje
    if (confirm('¡Producto agregado al carrito! ¿Deseas ver tu carrito?')) {
        window.location.href = 'carrito.html';
    }
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carritoServimoto') || '[]');
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    actualizarContadorCarrito();
});