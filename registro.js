// Configuración
const API_URL = 'http://localhost/servimoto/backend/registro.php';

// Elementos del DOM
const registerForm = document.getElementById('registerForm');
const profileImage = document.getElementById('profileImage');
const profilePreview = document.getElementById('profilePreview');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const loading = document.getElementById('loading');
const successAlert = document.getElementById('successAlert');
const errorAlert = document.getElementById('errorAlert');

// Vista previa de imagen de perfil
profileImage.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showError('Por favor, selecciona una imagen válida (JPEG, PNG o GIF)');
            this.value = '';
            return;
        }
        
        // Validar tamaño (máximo 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showError('La imagen no debe superar los 2MB');
            this.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            profilePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Validación personalizada para confirmar contraseña
function validatePassword() {
    if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity('Las contraseñas no coinciden');
    } else {
        confirmPassword.setCustomValidity('');
    }
}

password.addEventListener('change', validatePassword);
confirmPassword.addEventListener('keyup', validatePassword);

// Validación de edad mínima (18 años)
document.getElementById('birthDate').addEventListener('change', function() {
    const birthDate = new Date(this.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 18) {
        this.setCustomValidity('Debes tener al menos 18 años para registrarte');
    } else {
        this.setCustomValidity('');
    }
});

// Mostrar/ocultar loading
function toggleLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    registerForm.style.display = show ? 'none' : 'block';
}

// Mostrar mensajes
function showSuccess(message) {
    successAlert.textContent = message;
    successAlert.style.display = 'block';
    errorAlert.style.display = 'none';
}

function showError(message) {
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    successAlert.style.display = 'none';
}

// Convertir imagen a Base64
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Enviar datos al servidor
async function submitForm(formData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
            return { success: true, message: result.message };
        } else {
            return { success: false, message: result.message || 'Error en el servidor' };
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Error de conexión' };
    }
}

// Manejo del envío del formulario
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Ocultar mensajes anteriores
    successAlert.style.display = 'none';
    errorAlert.style.display = 'none';
    
    if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
    }
    
    toggleLoading(true);
    
    try {
        // Preparar datos del formulario
        const formData = {
            nombre_completo: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            fecha_nacimiento: document.getElementById('birthDate').value,
            password: document.getElementById('password').value
        };
        
        // Procesar imagen si existe
        const imageFile = profileImage.files[0];
        if (imageFile) {
            formData.imagen_perfil = await imageToBase64(imageFile);
        }
        
        // Enviar al servidor
        const result = await submitForm(formData);
        
        if (result.success) {
            showSuccess(result.message);
            this.reset();
            profilePreview.src = 'https://via.placeholder.com/100';
            this.classList.remove('was-validated');
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Ha ocurrido un error inesperado');
    } finally {
        toggleLoading(false);
    }
});

// Enlace para iniciar sesión
document.getElementById('loginLink').addEventListener('click', function(e) {
    e.preventDefault();
    alert('Redirigiendo al formulario de inicio de sesión...');
    // window.location.href = 'login.html';
});

// Validación en tiempo real
const inputs = registerForm.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('blur', () => {
        if (input.checkValidity()) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
        }
    });
});