/* ── Scroll Expand Media (vanilla port of the ScrollExpandMedia hero effect) ── */
(function () {
  function init() {
    const hero = document.querySelector('.expand-hero');
    if (!hero) return;

    const bg = document.getElementById('expandBg');
    const media = document.getElementById('expandMedia');
    const overlay = document.getElementById('expandOverlay');
    const titleLeft = document.getElementById('expandTitleLeft');
    const titleRight = document.getElementById('expandTitleRight');
    const caption = document.getElementById('expandCaption');
    const reveal = document.getElementById('expandReveal');
    const hintBtn = document.getElementById('expandHintBtn');
    const video = hero.querySelector('.expand-video');
    if (!media || !titleLeft || !titleRight) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let scrollProgress = 0;
    let mediaFullyExpanded = false;
    let showContent = false;
    let touchStartY = 0;
    let isMobile = window.innerWidth < 768;

    function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

    function render() {
      const maxW = isMobile ? 650 : 1250;
      const maxH = isMobile ? 200 : 400;
      const maxTX = isMobile ? 55 : 60;

      const mediaWidth = Math.min(300 + scrollProgress * maxW, window.innerWidth * 0.95);
      const mediaHeight = Math.min(400 + scrollProgress * maxH, window.innerHeight * 0.85);
      const textTranslateX = scrollProgress * maxTX;

      media.style.width = mediaWidth + 'px';
      media.style.height = mediaHeight + 'px';

      titleLeft.style.transform = `translateX(-${textTranslateX}vw)`;
      titleRight.style.transform = `translateX(${textTranslateX}vw)`;

      if (bg) bg.style.opacity = String(1 - scrollProgress);
      if (overlay) overlay.style.opacity = String(0.5 - scrollProgress * 0.3);
      if (caption) caption.style.opacity = String(Math.max(0, 1 - scrollProgress * 1.4));

      if (reveal) reveal.classList.toggle('hidden', !showContent);
    }

    if (reducedMotion) {
      scrollProgress = 1;
      mediaFullyExpanded = true;
      showContent = true;
      render();
      return; // no scroll-jacking for users who prefer reduced motion
    }

    // Hard scroll lock via CSS, not just wheel preventDefault(): some browsers/mice
    // (Windows precision touchpads, drivers that emit OS-level inertial scroll)
    // don't reliably let a single 'wheel' listener cancel the resulting scroll,
    // which let the page slip past the hero instead of growing the media.
    // overflow:hidden makes the document non-scrollable at the rendering level,
    // independent of wheel/touch event quirks.
    function lockScroll() {
      document.documentElement.style.overflow = 'hidden';
    }
    function unlockScroll() {
      document.documentElement.style.overflow = '';
    }

    lockScroll();
    // Start from the collapsed state once JS confirms it can drive the effect.
    render();

    // Wheel deltaY isn't consistently in pixels: deltaMode 1 = lines (Firefox on
    // Windows typically reports ~3 per notch), deltaMode 2 = pages. Normalize to
    // an approximate pixel value so the effect feels the same across browsers.
    function normalizedDeltaY(e) {
      if (e.deltaMode === 1) return e.deltaY * 16;
      if (e.deltaMode === 2) return e.deltaY * window.innerHeight;
      return e.deltaY;
    }

    function updateProgress(newProgress) {
      scrollProgress = clamp(newProgress, 0, 1);
      if (scrollProgress >= 1) {
        mediaFullyExpanded = true;
        showContent = true;
        unlockScroll();
      } else if (scrollProgress < 0.75) {
        showContent = false;
      }
      render();
    }

    function handleWheel(e) {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        mediaFullyExpanded = false;
        lockScroll();
        e.preventDefault();
        render();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        updateProgress(scrollProgress + normalizedDeltaY(e) * 0.0009);
      }
    }

    function handleTouchStart(e) {
      touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
      if (!touchStartY) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        mediaFullyExpanded = false;
        lockScroll();
        e.preventDefault();
        render();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005;
        updateProgress(scrollProgress + deltaY * scrollFactor);
        touchStartY = touchY;
      }
    }

    function handleTouchEnd() { touchStartY = 0; }

    function handleScroll() {
      if (!mediaFullyExpanded) window.scrollTo(0, 0);
    }

    function handleResize() {
      isMobile = window.innerWidth < 768;
      render();
    }

    // Guaranteed-to-work fallback: an explicit clickable control and keyboard
    // support, in case a mouse/trackpad/browser combination never dispatches
    // usable 'wheel' deltas (some hardware drivers remap or swallow them).
    let animRaf = null;
    function animateProgressTo(target, duration) {
      if (animRaf) cancelAnimationFrame(animRaf);
      const start = scrollProgress;
      const startTime = performance.now();
      function step(now) {
        const t = clamp((now - startTime) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        updateProgress(start + (target - start) * eased);
        if (t < 1) animRaf = requestAnimationFrame(step);
      }
      animRaf = requestAnimationFrame(step);
    }

    function handleKeydown(e) {
      const advanceKeys = ['ArrowDown', 'PageDown', ' '];
      const reverseKeys = ['ArrowUp', 'PageUp'];
      if (advanceKeys.indexOf(e.key) !== -1 && !mediaFullyExpanded) {
        e.preventDefault();
        animateProgressTo(clamp(scrollProgress + 0.25, 0, 1), 350);
      } else if (reverseKeys.indexOf(e.key) !== -1) {
        if (mediaFullyExpanded && window.scrollY <= 5) {
          mediaFullyExpanded = false;
          lockScroll();
          e.preventDefault();
          animateProgressTo(clamp(scrollProgress - 0.25, 0, 1), 350);
        } else if (!mediaFullyExpanded) {
          e.preventDefault();
          animateProgressTo(clamp(scrollProgress - 0.25, 0, 1), 350);
        }
      }
    }

    if (hintBtn) {
      hintBtn.addEventListener('click', function () {
        animateProgressTo(1, 900);
      });
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeydown);

    if (video) {
      video.play().catch(function () {
        /* autoplay can be blocked before user interaction; poster covers the gap */
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
