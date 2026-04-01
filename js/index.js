document.getElementById('capture-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('submit-btn');
    const loader = document.getElementById('loader');
    const name = document.getElementById('name').value;
    const contactValue = document.getElementById('contact').value.trim();
    const sanitizedContact = contactValue.replace(/[\s-()]/g, '');

    // Validaciones
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+[0-9]{10,15}$/;

    let email = "";
    let whatsapp = "";

    if (emailRegex.test(contactValue)) {
        email = contactValue;
    } else if (phoneRegex.test(sanitizedContact)) {
        whatsapp = sanitizedContact;
    } else {
        alert("Por favor ingresa un Email válido o un WhatsApp iniciando con '+' (ej. +50688888888).");
        return;
    }

    btn.style.display = 'none';
    loader.style.display = 'block';

    try {
        if (GOOGLE_SCRIPT_URL === '{{GOOGLE_SHEETS_URL}}') {
            setTimeout(() => { window.location.href = 'portal.html'; }, 1500);
            return;
        }

        // POST a Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                email: email,
                whatsapp: whatsapp
            })
        });

        // Dar pase VIP al usuario por haberse registrado
        localStorage.setItem('isVIP', 'true');

        window.location.href = 'portal.html';

    } catch (error) {
        console.error('Error de sincronización:', error);
        window.location.href = 'portal.html';
    }
});
