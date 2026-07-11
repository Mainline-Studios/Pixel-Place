(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  var root = document.documentElement;
  var lockup = document.getElementById('brandLockup');
  var orb = document.getElementById('glowOrb');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!lockup) return;

  var rect = null;
  var targetX = 0;
  var targetY = 0;
  var curX = 0;
  var curY = 0;
  var strength = 0.4;
  var targetStrength = 0.4;

  function measure() {
    rect = lockup.getBoundingClientRect();
  }

  function onMove(e) {
    if (reduce) return;
    if (!rect) measure();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = (e.clientX - cx) / Math.max(rect.width * 0.85, 1);
    var dy = (e.clientY - cy) / Math.max(rect.height * 0.85, 1);
    var dist = Math.min(1, Math.hypot(dx, dy));
    targetX = Math.max(-1, Math.min(1, dx));
    targetY = Math.max(-1, Math.min(1, dy));
    targetStrength = 0.3 + dist * 0.7;

    if (orb) {
      orb.style.left = e.clientX + 'px';
      orb.style.top = e.clientY + 'px';
      orb.style.opacity = String(0.35 + dist * 0.4);
    }
  }

  function onLeave() {
    targetX = 0;
    targetY = 0;
    targetStrength = 0.35;
    if (orb) orb.style.opacity = '0.4';
  }

  function tick() {
    curX += (targetX - curX) * 0.14;
    curY += (targetY - curY) * 0.14;
    strength += (targetStrength - strength) * 0.12;
    root.style.setProperty('--glow-x', curX.toFixed(4));
    root.style.setProperty('--glow-y', curY.toFixed(4));
    root.style.setProperty('--glow-strength', strength.toFixed(4));
    requestAnimationFrame(tick);
  }

  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  if (!reduce) requestAnimationFrame(tick);
})();
