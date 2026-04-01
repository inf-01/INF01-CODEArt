document.addEventListener('DOMContentLoaded', () => {
    // Redirige al admin si ya está logueado
    if (localStorage.getItem('tatto_admin_auth') === 'true') {
        window.location.href = 'admin.html';
    }

    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        // Cambiar estado del botón para feedback visual
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        loginBtn.disabled = true;

        // Simulamos una demora de red y luego la validación (Login Mock para pruebas)
        setTimeout(() => {
            // Usuario por defecto para demostración
            if (user === 'admin' && pass === 'admin123') {
                localStorage.setItem('tatto_admin_auth', 'true');
                window.location.href = 'admin.html';
            } else {
                alert('Credenciales incorrectas. (Pista: admin / admin123)');
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        }, 800);
    });
});
