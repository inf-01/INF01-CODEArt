document.getElementById('send-broadcast-btn')?.addEventListener('click', async () => {
    const message = document.getElementById('broadcast-message').value;
    const btn = document.getElementById('send-broadcast-btn');
    const status = document.getElementById('broadcast-status');

    if (!message.trim()) return;

    btn.style.display = 'none';
    status.style.display = 'block';
    status.textContent = 'ENVIANDO...';

    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'broadcast',
                message: message,
                whatsapp_token: WHATSAPP_TOKEN_API,
                whatsapp_phone_id: WHATSAPP_PHONE_ID
            })
        });

        setTimeout(() => {
            status.textContent = '✓ ENVIADO';
        }, 1000);

        document.getElementById('broadcast-message').value = '';

    } catch (error) {
        status.textContent = '❌ ERROR';
    }

    setTimeout(() => {
        status.style.display = 'none';
        status.textContent = 'ENVIANDO...';
        btn.style.display = 'block';
    }, 5000);
});

// --- SCRIPT PARA CONTADOR DINÁMICO ---
document.addEventListener('DOMContentLoaded', async () => {
    const countSpan = document.getElementById('count-number');
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();

        if (data && typeof data.count !== 'undefined') {
            countSpan.textContent = data.count;
        } else {
            countSpan.textContent = '0';
        }
    } catch (error) {
        countSpan.textContent = '+';
    }
});

// --- ADMIN ---
if (new URLSearchParams(window.location.search).get('admin') === 'true') {
    const title = document.getElementById('admin-title');
    const panel = document.getElementById('admin-panel');
    if (title) title.style.display = 'block';
    if (panel) panel.style.display = 'block';
}

// --- FUNCIONALIDAD DE ARTE (ZOOM, LIKES, COMPARTIR) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. ZOOM (Lightbox)
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    document.querySelectorAll('.arte-img').forEach(img => {
        img.addEventListener('click', (e) => {
            if (lightbox && lightboxImg) {
                lightbox.style.display = 'block';
                lightboxImg.src = e.target.src;
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            // Cerrar si se hace click fuera de la imagen
            if (e.target !== lightboxImg) {
                lightbox.style.display = 'none';
            }
        });
    }

    // 2. LIKES
    document.querySelectorAll('.fa-heart').forEach(heart => {
        heart.addEventListener('click', (e) => {
            e.target.classList.toggle('far');
            e.target.classList.toggle('fas');
            e.target.classList.toggle('like-active');

            // Animación extra del contador de likes
            const likesCountEl = e.target.closest('.arte-card').querySelector('.arte-likes');
            if (likesCountEl) {
                let currentText = likesCountEl.textContent;
                let currentLikes = parseInt(currentText.replace(/,/g, '')) || 0;
                if (e.target.classList.contains('fas')) {
                    likesCountEl.textContent = (currentLikes + 1).toLocaleString() + ' Me gusta';
                } else {
                    likesCountEl.textContent = (currentLikes - 1).toLocaleString() + ' Me gusta';
                }
            }
        });
    });

    // 3. COMPARTIR (Gated para VIP)
    document.querySelectorAll('.fa-share-alt').forEach(share => {
        share.addEventListener('click', async (e) => {
            const isVIP = localStorage.getItem('isVIP');

            if (isVIP === 'true') {
                const imgSrc = e.target.closest('.arte-card').querySelector('.arte-img').src;
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: 'Tattoo Studio Arte VIP',
                            text: 'Mira este increíble diseño de nuestro estudio.',
                            url: imgSrc
                        });
                    } catch (error) {
                        console.log('Cancelado o error al compartir', error);
                    }
                } else {
                    // Fallback para navegadores antiguos de escritorio
                    prompt('Copia esta URL para compartir la imagen del arte:', imgSrc);
                }
            } else {
                // Bloqueado
                alert('ACCESO DENEGADO 🛑\nDebes estar registrado como CLIENTE VIP para poder compartir nuestro arte exclusivo.\n\nSerás redirigido al registro de captura.');
                window.location.href = 'index.html';
            }
        });
    });
});
