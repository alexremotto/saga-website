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


// ── Cuentahílos · roseta de semitono CMYK bajo la lente ────
// Un cuentahílos sirve para inspeccionar la trama de un impreso:
// bajo la lente mostramos papel con los 4 tramados a sus ángulos reales.
(function () {
  const wrap   = document.getElementById('loupe');
  const canvas = document.getElementById('loupeCanvas');
  if (!wrap || !canvas) return;

  const ctx    = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Elipse de la lente, normalizada a la caja del isotipo
  const LENS = { cx: 0.462, cy: 0.245, rx: 0.122, ry: 0.055 };

  // Ángulos de trama reales de cuatricromía
  const SCREENS = [
    { rgb: '0,174,239', angle: 15 },   // Cyan
    { rgb: '236,0,140', angle: 75 },   // Magenta
    { rgb: '255,242,0', angle: 0  },   // Yellow
    { rgb: '26,23,27',  angle: 45 }    // Black
  ];

  let W = 0, H = 0, t = 0, reveal = 0, started = false;
  const par = { x: 0, y: 0, tx: 0, ty: 0 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = wrap.offsetWidth;
    H = wrap.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    if (reveal > 0.001) {
      const cx = LENS.cx * W, cy = LENS.cy * H;
      const rx = LENS.rx * W * reveal, ry = LENS.ry * H * reveal;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.clip();

      // Papel bajo la lente
      ctx.fillStyle = '#F7F4ED';
      ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);

      // Tintas: subtractivo real
      ctx.globalCompositeOperation = 'multiply';
      const pitch = Math.max(5, W * 0.0085);
      const R = Math.max(rx, ry) + pitch * 2;

      SCREENS.forEach((s, si) => {
        const a = (s.angle * Math.PI) / 180;
        const cos = Math.cos(a), sin = Math.sin(a);
        ctx.fillStyle = 'rgb(' + s.rgb + ')';
        for (let u = -R; u <= R; u += pitch) {
          for (let v = -R; v <= R; v += pitch) {
            const x = cx + u * cos - v * sin;
            const y = cy + u * sin + v * cos;
            // onda lenta de densidad de tinta: la roseta "respira"
            const w = Math.sin((u + v * 0.6 + t * 16 + si * 47) * 0.021) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(x, y, pitch * (0.13 + w * 0.17), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      ctx.restore();

      // Brillo del cristal
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    if (!reduce) {
      t += 1 / 60;
      par.x += (par.tx - par.x) * 0.06;
      par.y += (par.ty - par.y) * 0.06;
      wrap.style.transform = 'translateY(-50%) translate(' + par.x.toFixed(2) + 'px,' + par.y.toFixed(2) + 'px)';
    }
    if (reveal < 1 && started) reveal = Math.min(1, reveal + 0.02);

    requestAnimationFrame(draw);
  }

  const hero = document.getElementById('hero');
  if (hero && !reduce) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      par.tx = ((e.clientX - r.left) / r.width  - 0.5) * -26;
      par.ty = ((e.clientY - r.top)  / r.height - 0.5) * -18;
    });
    hero.addEventListener('mouseleave', () => { par.tx = 0; par.ty = 0; });
  }

  window.addEventListener('resize', resize);
  resize();

  if (reduce) { reveal = 1; started = true; }
  else setTimeout(() => { started = true; }, 1500);

  draw();
})();
