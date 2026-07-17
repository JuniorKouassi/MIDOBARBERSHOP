/* ── Glowing effect (mouse-tracking border glow) ── */
(function () {
  const proximity = 60;
  const inactiveZone = 0.6;

  function init() {
    const cards = Array.from(document.querySelectorAll('.glow-card'));
    if (!cards.length) return;

    const entries = cards.map(card => ({
      card,
      effect: card.querySelector('.glow-effect'),
      start: 0,
      target: null,
    }));

    let lastX = -Infinity;
    let lastY = -Infinity;

    function updateEntry(entry, mouseX, mouseY) {
      const { card, effect } = entry;
      if (!effect) return;
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distFromCenter = Math.hypot(mouseX - centerX, mouseY - centerY);
      const inactiveRadius = 0.5 * Math.min(rect.width, rect.height) * inactiveZone;

      if (distFromCenter < inactiveRadius) {
        effect.style.setProperty('--glow-active', '0');
        return;
      }

      const isActive =
        mouseX > rect.left - proximity &&
        mouseX < rect.left + rect.width + proximity &&
        mouseY > rect.top - proximity &&
        mouseY < rect.top + rect.height + proximity;

      effect.style.setProperty('--glow-active', isActive ? '1' : '0');
      if (!isActive) return;

      const targetAngle = (180 * Math.atan2(mouseY - centerY, mouseX - centerX)) / Math.PI + 90;
      const angleDiff = ((targetAngle - entry.start + 180) % 360) - 180;
      entry.target = entry.start + angleDiff;
    }

    function tick() {
      entries.forEach(entry => {
        if (entry.target === null) return;
        entry.start += (entry.target - entry.start) * 0.12;
        entry.effect.style.setProperty('--glow-start', String(entry.start));
      });
      requestAnimationFrame(tick);
    }

    function handlePointerMove(e) {
      lastX = e.clientX;
      lastY = e.clientY;
      entries.forEach(entry => updateEntry(entry, lastX, lastY));
    }

    function handleScroll() {
      if (lastX === -Infinity) return;
      entries.forEach(entry => updateEntry(entry, lastX, lastY));
    }

    document.body.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
