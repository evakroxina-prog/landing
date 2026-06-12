/* =========================================================
   07-marketexpert-agency — script
   ========================================================= */

/** ID из <head>: window.__GA4_MEASUREMENT_ID__; иначе поток по умолчанию. */
const GA4_MEASUREMENT_ID = (() => {
  const raw =
    typeof window !== 'undefined' && window.__GA4_MEASUREMENT_ID__
      ? String(window.__GA4_MEASUREMENT_ID__).trim()
      : '';
  if (raw && /^G-[A-Z0-9]+$/i.test(raw)) return raw;
  return 'G-SPKHXMCQGM';
})();

const COOKIE_CONSENT_KEY = 'cookie_consent';
const CLARITY_PROJECT_ID = (() => {
  const raw =
    typeof window !== 'undefined' && window.__CLARITY_PROJECT_ID__
      ? String(window.__CLARITY_PROJECT_ID__).trim()
      : '';
  if (raw && /^[a-z0-9]+$/i.test(raw)) return raw;
  return 'qqt5aodv7n';
})();

function isValidGa4Id(id) {
  return typeof id === 'string' && /^G-[A-Z0-9]+$/i.test(id);
}

function loadGA4() {
  if (!isValidGa4Id(GA4_MEASUREMENT_ID) || window.__ga4Loaded) return;
  window.__ga4Loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_MEASUREMENT_ID);
  document.head.appendChild(s);
  s.onload = () => {
    gtag('config', GA4_MEASUREMENT_ID);
  };
}

function grantClarityConsent() {
  if (typeof window.clarity !== 'function') return;
  try {
    window.clarity('consentv2', {
      ad_Storage: 'granted',
      analytics_Storage: 'granted'
    });
  } catch (_) {}
}

function loadClarity() {
  if (window.__clarityLoaded) return;
  window.__clarityLoaded = true;
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);
  grantClarityConsent();
}

function loadAnalytics() {
  loadGA4();
  loadClarity();
}

/** Совместимость с другим лендингом marketexpert.cz */
function loadGA() {
  loadAnalytics();
}
window.loadGA = loadGA;
window.loadGA4 = loadGA4;
window.loadClarity = loadClarity;
window.loadAnalytics = loadAnalytics;

function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  let stored = null;
  try {
    stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch (_) {
    stored = null;
  }
  if (stored === 'yes') {
    loadAnalytics();
    banner.remove();
    return;
  }
  if (stored === 'no') {
    banner.remove();
    return;
  }
  banner.classList.remove('cookie-banner--closed');
  banner.removeAttribute('aria-hidden');
  const accept = banner.querySelector('[data-cookie-accept]');
  const reject = banner.querySelector('[data-cookie-reject]');
  const close = () => {
    try {
      banner.remove();
    } catch (_) {
      banner.classList.add('cookie-banner--closed');
      banner.setAttribute('aria-hidden', 'true');
    }
  };
  if (accept) {
    accept.addEventListener('click', () => {
      try {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'yes');
      } catch (_) {}
      loadAnalytics();
      close();
    });
  }
  if (reject) {
    reject.addEventListener('click', () => {
      try {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'no');
      } catch (_) {}
      close();
    });
  }
}

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
  const cpc = document.getElementById('cCpc');
  const check = document.getElementById('cCheck');
  const saleConv = document.getElementById('cSaleConv');
  const badConv = document.getElementById('cBadConv');
  const goodConv = document.getElementById('cGoodConv');

  const out = {
    badLeads: document.getElementById('cBadLeads'),
    badSales: document.getElementById('cBadSales'),
    badRev: document.getElementById('cBadRev'),
    badAdSpend: document.getElementById('cBadAdSpend'),
    badNet: document.getElementById('cBadNet'),
    badCac: document.getElementById('cBadCac'),
    goodLeads: document.getElementById('cGoodLeads'),
    goodSales: document.getElementById('cGoodSales'),
    goodRev: document.getElementById('cGoodRev'),
    goodAdSpend: document.getElementById('cGoodAdSpend'),
    goodNet: document.getElementById('cGoodNet'),
    goodCac: document.getElementById('cGoodCac'),
    deltaProfit: document.getElementById('cDeltaProfit'),
    mult: document.getElementById('cMultiplier'),
  };

  if (!visitors || !cpc) return;

  const fmt = (n) => Math.round(n).toLocaleString('cs-CZ');

  function fmtCac(n) {
    if (!Number.isFinite(n) || n <= 0) return '—';
    const r = n >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
    return r.toLocaleString('cs-CZ');
  }

  const prev = {
    badLeads: 20,
    badSales: 6,
    badRev: 75000,
    badAdSpend: 25000,
    badNet: 50000,
    goodLeads: 120,
    goodSales: 36,
    goodRev: 450000,
    goodAdSpend: 25000,
    goodNet: 425000,
    deltaProfit: 375000,
    /** Кратность чистой прибыли (Б/А), не выручки */
    mult: 8.5,
  };

  function animateNumber(el, from, to, key) {
    if (!el) return;
    const duration = 600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * eased;
      el.textContent = fmt(v);
      if (p < 1) requestAnimationFrame(step);
      else {
        el.textContent = fmt(to);
        prev[key] = to;
      }
    };
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 500);
    requestAnimationFrame(step);
  }

  function animateMult(el, from, to, key) {
    if (!el) return;
    const duration = 600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * eased;
      el.textContent = '×' + (v < 10 ? v.toFixed(1).replace('.', ',') : Math.round(v));
      if (p < 1) requestAnimationFrame(step);
      else {
        el.textContent = '×' + (to < 10 ? to.toFixed(1).replace('.', ',') : Math.round(to));
        prev[key] = to;
      }
    };
    requestAnimationFrame(step);
  }

  function setNetStyle(elNet, net) {
    if (!elNet) return;
    elNet.classList.toggle('is-negative', net < 0);
  }

  function recompute() {
    const v = +visitors.value || 0;
    const cpcVal = +cpc.value || 0;
    const ch = +check.value || 0;
    const sc = (+saleConv.value || 0) / 100;
    const bc = (+badConv.value || 0) / 100;
    const gc = (+goodConv.value || 0) / 100;

    const adSpend = v * cpcVal;

    const badLeads = v * bc;
    const badSalesExact = badLeads * sc;
    const badRev = badSalesExact * ch;
    const badNet = badRev - adSpend;
    const badCac = badSalesExact > 0 ? adSpend / badSalesExact : NaN;

    const goodLeads = v * gc;
    const goodSalesExact = goodLeads * sc;
    const goodRev = goodSalesExact * ch;
    const goodNet = goodRev - adSpend;
    const goodCac = goodSalesExact > 0 ? adSpend / goodSalesExact : NaN;

    const deltaProfit = goodNet - badNet;
    /** Кратность чистой прибыли (Б/А): реагирует на CPC, чек и трафик; отношение выручек = только goodConv/badConv. */
    let multProfit = NaN;
    let multDisplayKind = 'finite';
    if (badNet > 0 && goodNet > 0) {
      multProfit = goodNet / badNet;
    } else if (badNet <= 0 && goodNet > 0) {
      multDisplayKind = 'infinity';
    } else {
      multDisplayKind = 'nan';
    }

    const badLeadsDisp = Math.round(badLeads);
    const badSalesDisp = Math.round(badSalesExact);
    const goodLeadsDisp = Math.round(goodLeads);
    const goodSalesDisp = Math.round(goodSalesExact);

    animateNumber(out.badLeads, prev.badLeads, badLeadsDisp, 'badLeads');
    animateNumber(out.badSales, prev.badSales, badSalesDisp, 'badSales');
    animateNumber(out.badRev, prev.badRev, badRev, 'badRev');
    animateNumber(out.badNet, prev.badNet, badNet, 'badNet');
    animateNumber(out.goodLeads, prev.goodLeads, goodLeadsDisp, 'goodLeads');
    animateNumber(out.goodSales, prev.goodSales, goodSalesDisp, 'goodSales');
    animateNumber(out.goodRev, prev.goodRev, goodRev, 'goodRev');
    animateNumber(out.goodNet, prev.goodNet, goodNet, 'goodNet');
    animateNumber(out.deltaProfit, prev.deltaProfit, deltaProfit, 'deltaProfit');

    if (out.badAdSpend) out.badAdSpend.textContent = fmt(adSpend);
    if (out.goodAdSpend) out.goodAdSpend.textContent = fmt(adSpend);
    prev.badAdSpend = adSpend;
    prev.goodAdSpend = adSpend;

    if (multDisplayKind === 'infinity' && out.mult) {
      out.mult.textContent = '∞';
      prev.mult = 99;
    } else if (multDisplayKind === 'nan' && out.mult) {
      out.mult.textContent = '—';
      prev.mult = 1;
    } else if (multDisplayKind === 'finite') {
      animateMult(out.mult, prev.mult, multProfit, 'mult');
    }

    if (out.badCac) out.badCac.textContent = fmtCac(badCac);
    if (out.goodCac) out.goodCac.textContent = fmtCac(goodCac);

    setNetStyle(out.badNet, badNet);
    setNetStyle(out.goodNet, goodNet);

    syncCalcTeaser(deltaProfit, multDisplayKind, multProfit);
  }

  const shell = document.getElementById('calc_shell');
  const panel = document.getElementById('calc_panel_inner');
  const teaser = document.getElementById('calc_teaser');
  const toggleOpen = document.getElementById('calc_teaser_toggle');
  const collapseTop = document.getElementById('calc_panel_collapse_top');
  const collapseBottom = document.getElementById('calc_panel_collapse_bottom');

  const teaserProfit = document.getElementById('calcTeaserProfit');
  const teaserMultEl = document.getElementById('calcTeaserMult');

  function formatTeaserMult(multDisplayKind, multProfit) {
    if (!teaserMultEl) return '';
    if (multDisplayKind === 'infinity') return '∞';
    if (multDisplayKind === 'nan') return '—';
    if (!Number.isFinite(multProfit)) return '—';
    return multProfit < 10
      ? '×' + multProfit.toFixed(1).replace('.', ',')
      : '×' + Math.round(multProfit);
  }

  function syncCalcTeaser(deltaProfit, multDisplayKind, multProfit) {
    if (teaserProfit) {
      const sign = deltaProfit >= 0 ? '+' : '−';
      teaserProfit.textContent = `${sign}${fmt(Math.abs(deltaProfit))} Kč`;
    }
    if (teaserMultEl) {
      teaserMultEl.textContent = formatTeaserMult(multDisplayKind, multProfit);
    }
  }

  function setCalcExpanded(expanded, opts = {}) {
    const persist = opts.persist !== false;
    const scrollSmooth = !!opts.scrollSmooth;
    const focusFirst = !!opts.focusFirst;
    if (!shell || !panel || !teaser || !toggleOpen) return;

    if (expanded) {
      shell.classList.add('math-calc-shell--expanded');
      panel.hidden = false;
      panel.removeAttribute('aria-hidden');
      teaser.hidden = true;
      toggleOpen.setAttribute('aria-expanded', 'true');
      if (persist) {
        try {
          localStorage.setItem('me_calc_math_expanded', '1');
        } catch (_) {}
      }
      if (scrollSmooth) {
        requestAnimationFrame(() => {
          collapseTop?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
      if (focusFirst && visitors && typeof visitors.focus === 'function') {
        visitors.focus({ preventScroll: true });
      }
    } else {
      shell.classList.remove('math-calc-shell--expanded');
      panel.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
      teaser.hidden = false;
      toggleOpen.setAttribute('aria-expanded', 'false');
      if (persist) {
        try {
          localStorage.setItem('me_calc_math_expanded', '0');
        } catch (_) {}
      }
      if (!opts.skipRevealScroll && scrollSmooth) {
        requestAnimationFrame(() =>
          teaser.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        );
      }
    }
  }

  if (shell && panel && teaser && toggleOpen) {
    let startExpanded = false;
    try {
      startExpanded = localStorage.getItem('me_calc_math_expanded') === '1';
    } catch (_) {}
    setCalcExpanded(startExpanded, { persist: false, scrollSmooth: false });

    toggleOpen.addEventListener('click', () => {
      setCalcExpanded(true, { scrollSmooth: true, focusFirst: true });
    });
    [collapseTop, collapseBottom].forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => {
          setCalcExpanded(false, { scrollSmooth: true, skipRevealScroll: false });
        });
      }
    });
  }

  [visitors, cpc, check, saleConv, badConv, goodConv].forEach((el) => {
    if (el) el.addEventListener('input', recompute);
  });
  recompute();
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
  const rawAttr = el.getAttribute('data-magnetic-strength');
  const strength = parseFloat(
    rawAttr != null && rawAttr !== '' ? rawAttr : el.dataset.magneticStrength || '0.3'
  );
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

/* ---------- FORM submit (Formspree) ---------- */
async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  if (!(form instanceof HTMLFormElement) || !form.action) return;
  const btn = form.querySelector('.form-submit');
  if (!btn || btn.disabled) return;

  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span>Отправка…</span>';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      btn.innerHTML = '<span>✓ Заявка отправлена</span>';
      btn.classList.add('is-submitted');
      btn.disabled = true;
      form.reset();
      if (typeof window.showFormSuccess === 'function') {
        window.showFormSuccess({ lang: 'ru', email: 'landing@marketexpert.cz' });
      }
      return;
    }
    let msg = 'Не удалось отправить заявку.';
    if (data.error) {
      msg = typeof data.error === 'string' ? data.error : data.error.message || msg;
    } else if (Array.isArray(data.errors)) {
      const parts = data.errors.map((x) => (x && x.message) || '').filter(Boolean);
      if (parts.length) msg = parts.join(' ');
    }
    btn.innerHTML = originalHTML;
    btn.disabled = false;
    alert(msg);
  } catch {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
    alert('Ошибка сети. Попробуйте позже или напишите напрямую на email.');
  }
}
window.handleFormSubmit = handleFormSubmit;

function initLeadForm() {
  const form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
}

function runWhenDomReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}
runWhenDomReady(() => {
  initLeadForm();
  initCookieBanner();
});

/* ---------- SAFETY NET ---------- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (!el.classList.contains('is-visible')) el.classList.add('is-visible');
    });
  }, 3500);
});
