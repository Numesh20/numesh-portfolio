/* ============================================================
   Numesh Ravindra Portfolio — script.js  (Debugged & Smooth)
   ============================================================ */

/* ----------------------------------------------------------
   UTILITY: throttle
   ---------------------------------------------------------- */
function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
        const now = Date.now();
        if (now - last >= wait) { last = now; fn.apply(this, args); }
    };
}

/* ----------------------------------------------------------
   UTILITY: showNotification
   ---------------------------------------------------------- */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.setAttribute('role', 'alert');
    notification.style.cssText = `
        position:fixed; top:20px; right:20px;
        background:${type === 'success' ? '#64ffda' : '#ff6b6b'};
        color:#0f0f23; padding:1rem 1.5rem; border-radius:8px;
        box-shadow:0 10px 30px rgba(0,0,0,0.3); z-index:10000;
        font-family:Inter,sans-serif; font-weight:600; font-size:0.95rem;
        max-width:320px;
        transform:translateX(420px);
        transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    requestAnimationFrame(() => requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    }));
    setTimeout(() => {
        notification.style.transform = 'translateX(420px)';
        notification.addEventListener('transitionend', () => notification.remove(), { once: true });
    }, 3500);
}

/* ----------------------------------------------------------
   INJECT DYNAMIC STYLES
   ---------------------------------------------------------- */
(function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .nav-link.active { color:#64ffda !important; }
        .nav-link.active::after { width:100% !important; }

        /* Safe parallax — only moves decorative ::before layer */
        .hero::before {
            transform: translateY(var(--parallax-offset, 0px));
            will-change: transform;
        }

        @media (max-width: 768px) {
            .projects-grid { grid-template-columns: 1fr; }
            .certs-grid { grid-template-columns: 1fr; }
        }

        /* Scroll-to-top button */
        #scroll-top-btn {
            position:fixed; bottom:2rem; right:2rem;
            width:48px; height:48px;
            background:#64ffda; color:#0f0f23;
            border:none; border-radius:50%; font-size:1.1rem;
            cursor:pointer; z-index:999;
            display:flex; align-items:center; justify-content:center;
            opacity:0; transform:translateY(20px) scale(0.8);
            transition:opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
            pointer-events:none;
            box-shadow:0 4px 20px rgba(100,255,218,0.4);
        }
        #scroll-top-btn.visible { opacity:1; transform:translateY(0) scale(1); pointer-events:all; }
        #scroll-top-btn:hover { box-shadow:0 8px 30px rgba(100,255,218,0.6); transform:translateY(-3px) scale(1.08); }

        /* CSS-class reveal (preserves hover effects unlike inline styles) */
        .reveal-ready {
            opacity:0; transform:translateY(32px);
            transition:opacity 0.65s cubic-bezier(0.22,1,0.36,1),
                        transform 0.65s cubic-bezier(0.22,1,0.36,1);
        }
        .reveal-ready.revealed { opacity:1; transform:translateY(0); }
        .reveal-ready:nth-child(2) { transition-delay:0.1s; }
        .reveal-ready:nth-child(3) { transition-delay:0.2s; }
        .reveal-ready:nth-child(4) { transition-delay:0.3s; }

        /* Loading overlay */
        #loading-overlay {
            position:fixed; inset:0; background:#0f0f23;
            display:flex; align-items:center; justify-content:center;
            z-index:99999; transition:opacity 0.6s ease;
        }
        #loading-overlay.hidden { opacity:0; pointer-events:none; }
        #loading-spinner {
            width:52px; height:52px;
            border:3px solid rgba(100,255,218,0.2); border-top-color:#64ffda;
            border-radius:50%; animation:spin 0.9s linear infinite;
            margin:0 auto 1rem;
        }
        #loading-text { color:#64ffda; font-family:Inter,sans-serif; font-size:0.9rem; letter-spacing:0.1em; }
        @keyframes spin { to { transform:rotate(360deg); } }
    `;
    document.head.appendChild(style);
})();

/* ----------------------------------------------------------
   LOADING OVERLAY
   FIX: Hard 3 s safety timeout so CDN failures can't freeze it
   ---------------------------------------------------------- */
(function initLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
        <div style="text-align:center">
            <div id="loading-spinner"></div>
            <p id="loading-text">Loading…</p>
        </div>`;
    document.body.prepend(overlay);

    function hideOverlay() {
        overlay.classList.add('hidden');
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }
    const safetyTimer = setTimeout(hideOverlay, 3000);
    window.addEventListener('load', () => {
        clearTimeout(safetyTimer);
        setTimeout(hideOverlay, 500);
    }, { once: true });
})();

/* ----------------------------------------------------------
   SCROLL-TO-TOP BUTTON
   ---------------------------------------------------------- */
(function initScrollTopBtn() {
    const btn = document.createElement('button');
    btn.id = 'scroll-top-btn';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    document.body.appendChild(btn);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ----------------------------------------------------------
   MAIN DOM-READY BLOCK
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {

    /* ── 1. MOBILE MENU ────────────────────────────────── */
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu    = document.querySelector('.nav-menu');

    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', function () {
            const isOpen = navMenu.classList.toggle('active');
            mobileMenu.classList.toggle('active', isOpen);
            mobileMenu.setAttribute('aria-expanded', String(isOpen));
        });

        navMenu.querySelectorAll('.nav-link, .nav-cv-btn').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileMenu.setAttribute('aria-expanded', 'false');
            });
        });

        // FIX: Close menu on outside click (was missing)
        document.addEventListener('click', e => {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !mobileMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileMenu.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ── 2. SMOOTH SCROLLING ───────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ── 3. UNIFIED SCROLL HANDLER (throttled) ──────────
       FIX: Was 3 separate scroll listeners causing triple
       repaints per frame. Merged into one at ~60fps.
       ─────────────────────────────────────────────────── */
    const navbar    = document.querySelector('.navbar');
    const hero      = document.querySelector('.hero');
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-link');
    const scrollBtn = document.getElementById('scroll-top-btn');

    window.addEventListener('scroll', throttle(function () {
        const scrolled = window.pageYOffset;

        // 3a. Navbar opacity
        if (navbar) {
            navbar.style.background = scrolled > 50
                ? 'rgba(15,15,35,0.98)' : 'rgba(15,15,35,0.95)';
        }

        // 3b. Active nav link
        let current = '';
        sections.forEach(s => {
            if (scrolled >= s.offsetTop - 120) current = s.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href').substring(1) === current);
        });

        // 3c. Parallax (CSS variable — never moves the section itself)
        if (hero) hero.style.setProperty('--parallax-offset', `${scrolled * 0.25}px`);

        // 3d. Scroll-to-top visibility
        if (scrollBtn) scrollBtn.classList.toggle('visible', scrolled > 400);

    }, 16), { passive: true });

    /* ── 4. REVEAL ANIMATIONS (IntersectionObserver) ────
       FIX: Previously set inline opacity/transform which
       overrode hover effects after revealing. Now uses
       CSS classes so hover transitions still work.
       ─────────────────────────────────────────────────── */
    const revealEls = document.querySelectorAll(
        '.service-card, .project-card, .tech-category, .contact-item, .cert-card'
    );
    revealEls.forEach(el => el.classList.add('reveal-ready'));

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    /* ── 5. TYPING EFFECT ───────────────────────────────
       FIX: Now waits for CSS fadeInUp to finish (1400ms)
       before clearing text, prevents blank-title flash.
       ─────────────────────────────────────────────────── */
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent.trim();
        setTimeout(() => {
            heroTitle.style.animation = 'none';
            heroTitle.textContent = '';
            heroTitle.style.opacity = '1';
            let i = 0;
            (function type() {
                if (i < text.length) { heroTitle.textContent += text.charAt(i++); setTimeout(type, 75); }
            })();
        }, 1400);
    }

    /* ── 6. ANIMATED STATS COUNTER ──────────────────────
       FIX: hasSuffix captured BEFORE interval, so '+' is
       never lost mid-animation.
       ─────────────────────────────────────────────────── */
    function animateStats() {
        document.querySelectorAll('.stat-item h3').forEach(stat => {
            const raw       = stat.textContent.trim();
            const hasSuffix = raw.includes('+');
            const target    = parseInt(raw.replace('+', ''), 10);
            const step      = Math.max(1, target / 60);
            let count       = 0;
            const timer = setInterval(() => {
                count = Math.min(count + step, target);
                stat.textContent = Math.floor(count) + (hasSuffix ? '+' : '');
                if (count >= target) clearInterval(timer);
            }, 30);
        });
    }

    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
        new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { animateStats(); obs.disconnect(); }
            });
        }, { threshold: 0.4 }).observe(statsSection);
    }

    /* ── 7. PROJECT IMAGE FALLBACK ──────────────────────── */
    document.querySelectorAll('.project-image img').forEach(img => {
        img.addEventListener('error', function () {
            this.style.display = 'none';
            const parent = this.parentElement;
            parent.style.background = 'linear-gradient(135deg, #0d7377, #14a085, #4ecdc4)';
            const ph = document.createElement('div');
            ph.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:.5rem';
            ph.innerHTML = `
                <i class="fas fa-laptop-code" style="font-size:2.5rem;color:#0f0f23;opacity:.7"></i>
                <span style="color:#0f0f23;font-size:.8rem;opacity:.6;font-family:Inter,sans-serif">Preview unavailable</span>`;
            parent.appendChild(ph);
        });
    });

    /* ── 8. CONTACT FORM ─────────────────────────────────── */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name    = this.name.value.trim();
            const email   = this.email.value.trim();
            const subject = this.subject.value.trim();
            const message = this.message.value.trim();

            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }

            const body = `From: ${name} (${email})\n\nMessage:\n${message}`;
            window.location.href = `mailto:numeshravindra2003@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            showNotification('Your email client should open now!', 'success');
            this.reset();
        });
    }

    /* ── 9. DYNAMIC COPYRIGHT YEAR ───────────────────────── */
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

});
