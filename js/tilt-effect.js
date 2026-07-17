/* ── Tilt effect (3D mouse-follow movement on hover) ── */
(function () {
  const MAX_TILT = 14;
  const SCALE = 1.06;
  const LIFT = 10;

  function attachTilt(card) {
    let frame = null;

    function onMove(e) {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        const rotateY = px * MAX_TILT * 2;
        const rotateX = -py * MAX_TILT * 2;

        card.classList.add('tilting');
        card.style.transform =
          `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-${LIFT}px) scale3d(${SCALE},${SCALE},${SCALE})`;

        const shadowX = -rotateY * 1.6;
        const shadowY = 24 - rotateX * 1.6;
        card.style.boxShadow = `${shadowX}px ${shadowY}px 45px -14px rgba(0,0,0,.65), 0 0 0 1px rgba(216,169,74,.18)`;
      });
    }

    function onLeave() {
      if (frame) cancelAnimationFrame(frame);
      card.classList.remove('tilting');
      card.style.transform = '';
      card.style.boxShadow = '';
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  }

  function init() {
    document.querySelectorAll('.tilt-card').forEach(attachTilt);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
