// ============================================
// BROADCAST (Admin)
// ============================================
document.getElementById('send-broadcast-btn')?.addEventListener('click', async () => {
    const message = document.getElementById('broadcast-message').value;
    const btn     = document.getElementById('send-broadcast-btn');
    const status  = document.getElementById('broadcast-status');

    if (!message.trim()) return;

    btn.style.display    = 'none';
    status.style.display = 'block';
    status.textContent   = 'ENVIANDO...';

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
        setTimeout(() => { status.textContent = '✓ ENVIADO'; }, 1000);
        document.getElementById('broadcast-message').value = '';
    } catch (error) {
        status.textContent = '❌ ERROR';
    }

    setTimeout(() => {
        status.style.display = 'none';
        status.textContent   = 'ENVIANDO...';
        btn.style.display    = 'block';
    }, 5000);
});

// ============================================
// CONTADOR DINÁMICO DE ALIADOS
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    const countSpan = document.getElementById('count-number');
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data     = await response.json();
        countSpan.textContent = (data && typeof data.count !== 'undefined') ? data.count : '0';
    } catch (error) {
        countSpan.textContent = '+';
    }
});

// ============================================
// ADMIN PANEL
// ============================================
if (new URLSearchParams(window.location.search).get('admin') === 'true') {
    const title = document.getElementById('admin-title');
    const panel = document.getElementById('admin-panel');
    if (title) title.style.display = 'block';
    if (panel) panel.style.display = 'block';
}

// ============================================
// TOAST — reemplaza los alert() feos
// ============================================
function showToast(msg, tipo = 'default', duracion = 3000) {
    // Crea el toast si no existe todavía
    let toast = document.getElementById('arte-toast-global');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'arte-toast-global';
        toast.className = 'arte-toast';
        document.body.appendChild(toast);
    }

    toast.textContent = msg;
    toast.className   = 'arte-toast' + (tipo === 'ok' ? ' toast-ok' : '');

    // Forzar reflow para reiniciar la animación si ya estaba visible
    void toast.offsetWidth;
    toast.classList.add('show');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duracion);
}

// ============================================
// FUNCIONALIDAD PRINCIPAL — Arte interactivo
// ============================================
document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------
    // 1. LIKES — corazón animado + contador
    // ------------------------------------------
    document.querySelectorAll('.fa-heart').forEach(heart => {
        heart.addEventListener('click', (e) => {
            const icon       = e.currentTarget;
            const card       = icon.closest('.arte-card');
            const likesEl    = card ? card.querySelector('.arte-likes') : null;
            const liked      = icon.classList.contains('fas');

            // Alternar icono relleno / vacío
            icon.classList.toggle('far',  liked);
            icon.classList.toggle('fas', !liked);
            icon.classList.toggle('like-active', !liked);

            // Actualizar contador
            if (likesEl) {
                const current = parseInt(likesEl.textContent.replace(/[^0-9]/g, '')) || 0;
                const next    = liked ? current - 1 : current + 1;
                likesEl.textContent = next.toLocaleString('es-ES') + ' Me gusta';

                // Animación del número
                likesEl.classList.remove('likes-bump');
                void likesEl.offsetWidth; // reflow
                likesEl.classList.add('likes-bump');
                setTimeout(() => likesEl.classList.remove('likes-bump'), 400);
            }

            // Toast sutil
            showToast(liked ? '💔 Like retirado' : '❤️ ¡Te gustó este arte!', 'default', 2000);
        });
    });

    // ------------------------------------------
    // 2. COMPARTIR — Web Share API + fallback
    //    (sin bloqueo VIP para que funcione en móvil)
    // ------------------------------------------
    document.querySelectorAll('.fa-share-alt').forEach(shareBtn => {
        shareBtn.addEventListener('click', async (e) => {
            const icon = e.currentTarget;
            const card = icon.closest('.arte-card');

            // Feedback visual inmediato
            icon.classList.add('share-active');
            setTimeout(() => icon.classList.remove('share-active'), 500);

            // Obtener nombre del arte desde el subtítulo de la tarjeta
            const subtitle = card ? card.querySelector('.arte-user-info small') : null;
            const nombre   = subtitle ? subtitle.textContent : 'Arte Digital';
            const shareUrl = window.location.href;

            if (navigator.share) {
                // Web Share API — funciona en móvil (iOS/Android)
                try {
                    await navigator.share({
                        title: 'ARTE CODE — ' + nombre,
                        text:  '¡Mira este arte digital interactivo! ' + nombre,
                        url:   shareUrl
                    });
                    showToast('✓ Compartido con éxito', 'ok', 2500);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        // Falló por alguna razón — copiar al portapapeles
                        copiarAlPortapapeles(shareUrl);
                    }
                }
            } else {
                // Fallback escritorio — copiar link al portapapeles
                copiarAlPortapapeles(shareUrl);
            }
        });
    });

    // ------------------------------------------
    // 3. LIGHTBOX — ya no aplica a iframes,
    //    pero lo mantenemos por si hay imágenes
    // ------------------------------------------
    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn    = document.querySelector('.lightbox-close');

    // Solo activar en <img>, no en <iframe>
    document.querySelectorAll('.arte-img-wrapper img').forEach(img => {
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
            if (e.target !== lightboxImg) lightbox.style.display = 'none';
        });
    }

});

// ============================================
// HELPER — copiar URL al portapapeles
// ============================================
function copiarAlPortapapeles(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto)
            .then(() => showToast('🔗 Link copiado al portapapeles', 'ok', 3000))
            .catch(() => showToast('No se pudo copiar el link', 'default', 3000));
    } else {
        // Método antiguo para HTTP o navegadores viejos
        const el = document.createElement('textarea');
        el.value = texto;
        el.style.position = 'fixed';
        el.style.opacity  = '0';
        document.body.appendChild(el);
        el.focus();
        el.select();
        try {
            document.execCommand('copy');
            showToast('🔗 Link copiado al portapapeles', 'ok', 3000);
        } catch {
            showToast('Copia este link: ' + texto, 'default', 5000);
        }
        document.body.removeChild(el);
    }
}
