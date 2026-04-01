document.addEventListener('DOMContentLoaded', () => {
    // Verificación de autenticación de seguridad
    if (localStorage.getItem('tatto_admin_auth') !== 'true') {
        window.location.href = 'login.html';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const dataTable = document.getElementById('dataTable');
    const loader = document.getElementById('loader');

    // Cerrar Sesión
    logoutBtn.addEventListener('click', () => {
        if (confirm('¿Deseas cerrar sesión del panel de control?')) {
            localStorage.removeItem('tatto_admin_auth');
            window.location.href = 'login.html';
        }
    });

    // Actualizar datos (Simulación de Fetch a Google Sheets)
    refreshBtn.addEventListener('click', () => {
        dataTable.style.display = 'none';
        loader.style.display = 'block';

        // Aquí iría el fetch a la URL generada por Google Apps Script (WebApp)
        // fetch('URL_DE_GOOGLE_SHEETS_MACRO')
        // .then(response => response.json())
        // .then(data => {...Renderizar data...})

        setTimeout(() => {
            loader.style.display = 'none';
            dataTable.style.display = 'table-row-group';
            alert('Datos sincronizados desde Google Sheets correctamente.');
        }, 1500);
    });
});
