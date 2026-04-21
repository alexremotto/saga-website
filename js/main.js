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

const heroWordmark = document.querySelector('.hero-wordmark');

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
    const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
    const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
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

// ── Contact form ───────────────────────────────────────────
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn   = form.querySelector('button[type="submit"]');
    const orig  = btn.innerHTML;

    btn.innerHTML = 'Enviado ✓';
    btn.style.background = '#2B8C1B';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML   = orig;
      btn.style.background = '';
      btn.disabled    = false;
      form.reset();
    }, 3500);
  });
}

// ── Parallax on hero title (subtle) ───────────────────────
const heroTitle = document.querySelector('.hero-title');
if (heroTitle && window.matchMedia('(hover: hover)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroTitle.style.transform = `translateY(${y * 0.12}px)`;
    heroTitle.style.opacity   = 1 - (y / window.innerHeight) * 1.5;
  }, { passive: true });
}

// ── Hero Canvas Shader ─────────────────────────────────────
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx   = canvas.getContext('2d');
  const hero  = canvas.closest('.hero');
  const RED   = '204,43,27';
  const GAP   = 50;
  const PUSH  = 140;   // mouse repel radius
  const STR   = 62;    // repel strength

  let W, H, cols;
  let dots    = [];
  let ripples = [];
  let scanY   = 0;
  const mouse = { x: -999, y: -999 };

  // Build dot grid — DPR-aware so retina screens render crisply
  function setup() {
    const dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / GAP) + 1;
    const rows = Math.ceil(H / GAP) + 1;
    dots = [];
    for (let r = 0; r <= rows; r++)
      for (let c = 0; c <= cols; c++)
        dots.push({ ox: c * GAP, oy: r * GAP, x: c * GAP, y: r * GAP });
  }

  // Events — track on the hero section so buttons still work
  hero.addEventListener('mousemove', e => {
    const b = canvas.getBoundingClientRect();
    mouse.x = e.clientX - b.left;
    mouse.y = e.clientY - b.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  hero.addEventListener('click', e => {
    const b = canvas.getBoundingClientRect();
    const x = e.clientX - b.left;
    const y = e.clientY - b.top;
    // Three concentric rings, staggered
    for (let i = 0; i < 3; i++) {
      setTimeout(() => ripples.push({
        x, y, r: 0, life: 1,
        speed: 4.5 + i * 1.5
      }), i * 80);
    }
  });

  window.addEventListener('resize', setup);

  // Main loop
  function tick() {
    ctx.clearRect(0, 0, W, H);

    // ── update dot positions ────────────────────────────────
    dots.forEach(d => {
      // Mouse push
      const mdx = d.ox - mouse.x;
      const mdy = d.oy - mouse.y;
      const md  = Math.hypot(mdx, mdy);
      let tx = d.ox, ty = d.oy;

      if (md < PUSH) {
        const f = (1 - md / PUSH);
        const a = Math.atan2(mdy, mdx);
        tx = d.ox + Math.cos(a) * f * STR;
        ty = d.oy + Math.sin(a) * f * STR;
      }

      // Ripple wave push
      ripples.forEach(rip => {
        const rdx  = d.ox - rip.x;
        const rdy  = d.oy - rip.y;
        const rd   = Math.hypot(rdx, rdy);
        const wave = Math.exp(-((rd - rip.r) ** 2) / 700) * rip.life;
        if (wave > 0.015) {
          const a = Math.atan2(rdy, rdx);
          tx += Math.cos(a) * wave * 35;
          ty += Math.sin(a) * wave * 35;
        }
      });

      // Spring lerp toward target
      d.x += (tx - d.x) * 0.14;
      d.y += (ty - d.y) * 0.14;
    });

    // ── draw grid lines (adjacent only — O(n)) ─────────────
    ctx.lineWidth = 0.7;
    dots.forEach((d, i) => {
      const right  = dots[i + 1];
      const bottom = dots[i + cols + 1]; // +1 because we overshoot by 1

      if (right && right.oy === d.oy) {
        const stretch = Math.hypot(d.x - right.x, d.y - right.y) / GAP;
        const a = Math.max(0, 0.22 - stretch * 0.1);
        if (a > 0.01) {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(right.x, right.y);
          ctx.strokeStyle = `rgba(${RED},${a.toFixed(2)})`;
          ctx.stroke();
        }
      }
      if (bottom) {
        const stretch = Math.hypot(d.x - bottom.x, d.y - bottom.y) / GAP;
        const a = Math.max(0, 0.22 - stretch * 0.1);
        if (a > 0.01) {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(bottom.x, bottom.y);
          ctx.strokeStyle = `rgba(${RED},${a.toFixed(2)})`;
          ctx.stroke();
        }
      }
    });

    // ── draw dots ──────────────────────────────────────────
    dots.forEach(d => {
      const prox = Math.max(0, 1 - Math.hypot(d.ox - mouse.x, d.oy - mouse.y) / PUSH);
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.3 + prox * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${RED},${(0.18 + prox * 0.72).toFixed(2)})`;
      ctx.fill();
    });

    // ── mouse aura glow ────────────────────────────────────
    if (mouse.x > 0 && mouse.x < W) {
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 90);
      g.addColorStop(0, `rgba(${RED},0.1)`);
      g.addColorStop(1, `rgba(${RED},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // ── ripple rings ───────────────────────────────────────
    ripples = ripples.filter(r => r.life > 0.015);
    ripples.forEach(rip => {
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${RED},${(rip.life * 0.7).toFixed(2)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      rip.r    += rip.speed;
      rip.life *= 0.96;
    });

    // ── radar scan line ────────────────────────────────────
    scanY = (scanY + 0.8) % H;
    // Soft halo above/below the line
    const halo = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
    halo.addColorStop(0,   `rgba(${RED},0)`);
    halo.addColorStop(0.5, `rgba(${RED},0.06)`);
    halo.addColorStop(1,   `rgba(${RED},0)`);
    ctx.fillStyle = halo;
    ctx.fillRect(0, scanY - 12, W, 24);
    // Bright core line
    const sg = ctx.createLinearGradient(0, 0, W, 0);
    sg.addColorStop(0,    `rgba(${RED},0)`);
    sg.addColorStop(0.08, `rgba(${RED},0.45)`);
    sg.addColorStop(0.92, `rgba(${RED},0.45)`);
    sg.addColorStop(1,    `rgba(${RED},0)`);
    ctx.fillStyle = sg;
    ctx.fillRect(0, scanY - 1, W, 2);

    // ── HUD cursor readout ─────────────────────────────────
    if (mouse.x > 0 && mouse.x < W - 10) {
      const lx = mouse.x + 24 > W - 130 ? mouse.x - 124 : mouse.x + 24;
      const ly = mouse.y > 22 ? mouse.y - 12 : mouse.y + 24;
      ctx.font      = '10px "Courier New", monospace';
      ctx.fillStyle = `rgba(${RED},0.65)`;
      ctx.fillText(
        `X:${String(Math.round(mouse.x)).padStart(4,'0')}  Y:${String(Math.round(mouse.y)).padStart(4,'0')}`,
        lx, ly
      );
    }

    requestAnimationFrame(tick);
  }

  setup();
  tick();
})();
