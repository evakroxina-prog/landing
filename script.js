/* =========================================================
   07-marketexpert-agency — script
   ========================================================= */

/* ---------- NAV scrolled ---------- */
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ---------- HERO reveal on load ---------- */
window.addEventListener('load', () => {
  const hero = document.querySelector('.hero-editorial');
  if (hero) setTimeout(() => hero.classList.add('is-ready'), 120);
});

/* ---------- REVEALS (IntersectionObserver) ---------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((ent) => {
    if (ent.isIntersecting) {
      ent.target.classList.add('is-visible');
      revealObs.unobserve(ent.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('[data-reveal]').forEach((el) => revealObs.observe(el));

/* ---------- COUNTERS ---------- */
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach((ent) => {
    if (!ent.isIntersecting) return;
    const el = ent.target;
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1700;
    const start = performance.now();

    const fmt = (n) => {
      if (decimals > 0) return n.toFixed(decimals).replace('.', ',');
      return Math.round(n).toLocaleString('ru-RU');
    };

    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target);
    };
    requestAnimationFrame(step);
    counterObs.unobserve(el);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.counter').forEach((el) => counterObs.observe(el));

/* ---------- INTERACTIVE CALCULATOR ---------- */
(function initCalc() {
  const visitors = document.getElementById('cVisitors');
  const close    = document.getElementById('cClose');
  const check    = document.getElementById('cCheck');
  const cac      = document.getElementById('cCac');
  const badConv  = document.getElementById('cBadConv');
  const goodConv = document.getElementById('cGoodConv');

  const out = {
    badLeads:  document.getElementById('cBadLeads'),
    badDeals:  document.getElementById('cBadDeals'),
    badRev:    document.getElementById('cBadRev'),
    goodLeads: document.getElementById('cGoodLeads'),
    goodDeals: document.getElementById('cGoodDeals'),
    goodRev:   document.getElementById('cGoodRev'),
    delta:     document.getElementById('cDelta'),
    mult:      document.getElementById('cMultiplier'),
  };

  if (!visitors) return;

  const fmt = (n) => Math.round(n).toLocaleString('ru-RU');

  const prev = {
    badLeads: 20, badDeals: 6, badRev: 3000,
    goodLeads: 120, goodDeals: 36, goodRev: 18000,
    delta: 15000, mult: 6,
  };

  function animateNumber(el, from, to, key, multi = false) {
    const duration = 600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * eased;
      if (multi) el.textContent = '×' + (v < 10 ? v.toFixed(1).replace('.', ',') : Math.round(v));
      else el.textContent = fmt(v);
      if (p < 1) requestAnimationFrame(step);
      else {
        if (multi) el.textContent = '×' + (to < 10 ? to.toFixed(1).replace('.', ',') : Math.round(to));
        else el.textContent = fmt(to);
        prev[key] = to;
      }
    };
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 500);
    requestAnimationFrame(step);
  }

  function recompute() {
    const v = +visitors.value || 0;
    const cl = +close.value || 0;
    const ch = +check.value || 0;
    const bc = +badConv.value || 0;
    const gc = +goodConv.value || 0;

    const badLeads  = v * bc / 100;
    const badDeals  = badLeads * cl / 100;
    const badRev    = badDeals * ch;
    const goodLeads = v * gc / 100;
    const goodDeals = goodLeads * cl / 100;
    const goodRev   = goodDeals * ch;
    const delta     = goodRev - badRev;
    const mult      = badRev > 0 ? goodRev / badRev : goodRev > 0 ? 99 : 1;

    animateNumber(out.badLeads,  prev.badLeads,  badLeads,  'badLeads');
    animateNumber(out.badDeals,  prev.badDeals,  badDeals,  'badDeals');
    animateNumber(out.badRev,    prev.badRev,    badRev,    'badRev');
    animateNumber(out.goodLeads, prev.goodLeads, goodLeads, 'goodLeads');
    animateNumber(out.goodDeals, prev.goodDeals, goodDeals, 'goodDeals');
    animateNumber(out.goodRev,   prev.goodRev,   goodRev,   'goodRev');
    animateNumber(out.delta,     prev.delta,     Math.max(0, delta), 'delta');
    animateNumber(out.mult,      prev.mult,      mult,      'mult', true);
  }

  [visitors, close, check, cac, badConv, goodConv].forEach((el) => {
    el.addEventListener('input', recompute);
  });
})();

/* ---------- SHOWREEL — load YouTube iframe on play ----------
   Ошибка 153: часто из‑за Referrer-Policy (same-origin на сервере) или открытия HTML как file://.
   Решение: meta name="referrer" в HTML, embed с www.youtube.com и origin при http(s). */
(function initShowreel() {
  function buildEmbedSrc(videoId) {
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
    });
    const { protocol, hostname } = window.location;
    if (protocol === 'http:' || protocol === 'https:') {
      if (hostname && hostname !== '') {
        params.set('origin', `${protocol}//${window.location.host}`);
      }
    }
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  document.querySelectorAll('.yt-embed').forEach((wrap) => {
    const id = wrap.dataset.yt;
    const title = wrap.dataset.title || 'Видео с YouTube';
    const btn = wrap.querySelector('.yt-poster');
    if (!id || !btn) return;

    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('title', title);
      iframe.setAttribute('src', buildEmbedSrc(id));
      iframe.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      );
      iframe.setAttribute('allowfullscreen', '');
      /* не использовать no-referrer: YouTube ожидает referer для встраивания */
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.setAttribute('loading', 'eager');
      wrap.replaceChildren(iframe);
    });
  });
})();

/* ---------- DELIVERABLES line + mockup sync ---------- */
(function initDeliverables() {
  const line = document.getElementById('delivLine');
  const items = document.querySelectorAll('.deliv-item');
  if (!line || !items.length) return;

  const totalLen = 900;
  const list = items[0].parentElement;

  function update() {
    const rect = list.getBoundingClientRect();
    const wh = window.innerHeight;
    const progress = Math.max(0, Math.min(1,
      (wh - rect.top) / (rect.height + wh * 0.3)
    ));
    line.style.strokeDashoffset = totalLen - totalLen * progress;
  }
  window.addEventListener('scroll', update, { passive: true });
  update();

  const mockupSections = document.querySelectorAll('.mockup-section');
  const activateObs = new IntersectionObserver((entries) => {
    entries.forEach((ent) => {
      if (!ent.isIntersecting) return;
      ent.target.classList.add('is-visible');
      const idx = parseInt(ent.target.dataset.deliv, 10);
      mockupSections.forEach((s, i) => s.classList.toggle('active', i === idx));
    });
  }, { threshold: 0.4 });
  items.forEach((it) => activateObs.observe(it));
})();

/* ---------- PROCESS timeline progress ---------- */
(function initProcess() {
  const track = document.querySelector('.process-track');
  const fill = document.getElementById('processLineFill');
  const steps = document.querySelectorAll('.process-step');
  if (!track || !fill) return;

  function update() {
    const rect = track.getBoundingClientRect();
    const wh = window.innerHeight;
    const progress = Math.max(0, Math.min(1,
      (wh * 0.8 - rect.top) / (rect.height)
    ));
    fill.style.width = (progress * 100) + '%';

    const activeIdx = Math.min(steps.length - 1, Math.floor(progress * steps.length));
    steps.forEach((s, i) => s.classList.toggle('is-active', i <= activeIdx && progress > 0));
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---------- MAGNETIC BUTTONS ---------- */
document.querySelectorAll('.magnetic').forEach((el) => {
  const strength = parseFloat(el.dataset.magneticStrength || '0.3');
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

/* ---------- FAQ — close others when opening ---------- */
document.querySelectorAll('.faq-item').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      document.querySelectorAll('.faq-item').forEach((o) => {
        if (o !== item) o.open = false;
      });
    }
  });
});

/* ---------- FORM submit ---------- */
function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('formSubmit');
  btn.innerHTML = '<span>✓ Заявка отправлена</span>';
  btn.classList.add('is-submitted');
  btn.disabled = true;
}
window.handleFormSubmit = handleFormSubmit;

/* ---------- SAFETY NET ---------- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (!el.classList.contains('is-visible')) el.classList.add('is-visible');
    });
  }, 3500);
});
