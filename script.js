// ── Full-screen height fix for mobile browsers ────────────────────────────────
// Browsers subtract their chrome (address bar, nav bar) from 100vh.
// This sets --vh to the real pixel height so the hero fills the full screen.
(function setFullHeight() {
  function update() {
    document.documentElement.style.setProperty('--vh', window.innerHeight + 'px');
  }
  update();
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', function () {
    setTimeout(update, 150); // short delay for orientation to settle
  });
})();

(function () {
  const hero = document.getElementById('heroSlideshow');
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('.hero-dot'));
  const prevBtn = hero.querySelector('.hero-edge--prev');
  const nextBtn = hero.querySelector('.hero-edge--next');
  const header = document.querySelector('.site-header');

  if (!slides.length) return;

  let current = slides.findIndex((s) => s.classList.contains('active'));
  if (current < 0) current = 0;

  const AUTO_MS = 2000;
  let autoTimer = null;

  function applyTint(index) {
    const tint = slides[index].getAttribute('data-tint');
    if (tint) hero.style.setProperty('--hero-tint', tint);
  }

  function goTo(index) {
    const next = ((index % slides.length) + slides.length) % slides.length;
    if (next === current) return;
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    slides[next].classList.add('active');
    dots[next] && dots[next].classList.add('active');
    current = next;
    applyTint(current);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, AUTO_MS);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // Initial tint so the first slide's background applies on load
  applyTint(current);

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const i = parseInt(dot.getAttribute('data-index'), 10);
      if (!Number.isNaN(i)) { goTo(i); startAuto(); }
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });

  // Keyboard arrows
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); startAuto(); }
    else if (e.key === 'ArrowRight') { next(); startAuto(); }
  });

  // Touch swipe
  let touchStartX = null;
  let touchStartY = null;
  hero.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
      startAuto();
    }
    touchStartX = touchStartY = null;
  }, { passive: true });

  // Pause auto-rotate when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto(); else startAuto();
  });

  startAuto();

  // Header solid state after scrolling past the hero
  if (header) {
    const updateHeader = () => {
      const threshold = (hero.offsetHeight || window.innerHeight) - 80;
      header.classList.toggle('is-solid', window.scrollY > threshold);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateHeader);
  }
})();
