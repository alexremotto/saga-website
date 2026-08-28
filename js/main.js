/* ============================================================
   SAGA IMPRENTA · Main JS
   ============================================================ */

// ── Custom cursor ──────────────────────────────────────────
const cursor = document.getElementById('cursor');

if (window.matchMedia('(hover: hover)').matches && cursor) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, .srv-card, .port-item, input, select, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hov'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hov'));
  });
}

// ── Navigation ─────────────────────────────────────────────
const nav       = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const mobMenu   = document.getElementById('mobMenu');

const heroWordmark = document.querySelector('.hero-brand');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 60;
  nav.classList.toggle('solid', scrolled);
  if (heroWordmark) heroWordmark.classList.toggle('out', scrolled);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobMenu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.mob-link').forEach(l => {
  l.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Language selector (visual only — content i18n pendiente) ──
const lang = document.getElementById('lang');
if (lang) {
  const langBtn = lang.querySelector('.lang-btn');
  const langCur = lang.querySelector('.lang-cur');
  langBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = lang.classList.toggle('open');
    langBtn.setAttribute('aria-expanded', open);
  });
  lang.querySelectorAll('.lang-menu a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      lang.querySelectorAll('.lang-menu a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      langCur.textContent = a.dataset.lang;
      lang.classList.remove('open');
      langBtn.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', () => lang.classList.remove('open'));
}

// Mobile language pills (visual only)
document.querySelectorAll('.mob-lang a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.mob-lang a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
  });
});

// ── Reveal on scroll ───────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    // Stagger siblings
    const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
    const idx = siblings.indexOf(entry.target);
    entry.target.style.transitionDelay = (idx * 0.07) + 's';
    entry.target.classList.add('in');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── Number counters ────────────────────────────────────────
const countObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const dur    = 1800;
    const fps    = 60;
    const step   = target / (dur / (1000 / fps));
    let cur = 0;

    const tick = () => {
      cur += step;
      if (cur >= target) { el.textContent = target.toLocaleString('es-ES'); return; }
      el.textContent = Math.floor(cur).toLocaleString('es-ES');
      requestAnimationFrame(tick);
    };
    tick();
    countObs.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.count').forEach(el => countObs.observe(el));

// ── Portfolio scroll ───────────────────────────────────────
const track = document.getElementById('portTrack');
const pPrev = document.getElementById('pPrev');
const pNext = document.getElementById('pNext');

if (track && pPrev && pNext) {
  const scrollBy = 400;

  const updateBtns = () => {
    pPrev.disabled = track.scrollLeft <= 2;
    pNext.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  };

  pPrev.addEventListener('click', () => track.scrollBy({ left: -scrollBy, behavior: 'smooth' }));
  pNext.addEventListener('click', () => track.scrollBy({ left:  scrollBy, behavior: 'smooth' }));
  track.addEventListener('scroll', updateBtns, { passive: true });
  updateBtns();
}

// ── Magnetic buttons ───────────────────────────────────────
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) * 0.12;
    const dy = (e.clientY - (r.top  + r.height / 2)) * 0.12;
    btn.style.transform  = `translate(${dx}px, ${dy}px)`;
    btn.style.transition = '';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    btn.style.transform  = '';
  });
});

// ── Smooth scroll for anchor links ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();

    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });

    // close mobile menu if open
    hamburger.classList.remove('open');
    mobMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Snackbar ───────────────────────────────────────────────
const snackbar = document.getElementById('snackbar');
let snackTimer;
function showSnack(msg, isError) {
  if (!snackbar) return;
  snackbar.classList.toggle('error', !!isError);
  snackbar.querySelector('.snack-msg').textContent = msg;
  snackbar.querySelector('.snack-ico').textContent = isError ? '!' : '✓';
  snackbar.classList.add('show');
  clearTimeout(snackTimer);
  snackTimer = setTimeout(() => snackbar.classList.remove('show'), 4200);
}

// ── Contact form ───────────────────────────────────────────
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const message = form.querySelector('#msg').value.trim();

    if (!name || !email || !message) {
      showSnack('Completa los campos obligatorios.', true);
      return;
    }

    const btn  = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.disabled  = true;
    btn.innerHTML = '<span>Enviando…</span>';

    setTimeout(() => {
      showSnack('¡Gracias! Te responderemos en menos de 24 h laborables.');
      btn.innerHTML = orig;
      btn.disabled  = false;
      form.reset();
    }, 700);
  });
}
