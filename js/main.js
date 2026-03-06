// ===== COOKIE BANNER =====
(function() {
  if (localStorage.getItem('roy_cookie_decision')) {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
  }
})();

function closeCookie(action) {
  localStorage.setItem('roy_cookie_decision', action);
  var banner = document.getElementById('cookie-banner');
  if (banner) banner.style.display = 'none';
}

// ===== MOBILE MENU =====
function toggleMenu() {
  var menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('open');
}

// ===== VIDEO MODAL =====
function openVideo() {
  var modal = document.getElementById('video-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeVideo(e) {
  var modal = document.getElementById('video-modal');
  if (!modal) return;
  if (!e || e.target === modal || (e.target && e.target.classList.contains('video-modal-close'))) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ===== ANIMATED COUNTER =====
(function() {
  var el = document.getElementById('counter');
  if (!el) return;

  var target = 847293512;
  var started = false;

  function formatDollar(n) {
    return '$' + Math.floor(n).toLocaleString('en-US');
  }

  function animateCounter() {
    if (started) return;
    started = true;
    var duration = 2500;
    var start = performance.now();
    function step(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatDollar(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = formatDollar(target);
    }
    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) animateCounter();
    });
  }, { threshold: 0.3 });
  observer.observe(el);
})();

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', function() {
  var nav = document.getElementById('navbar');
  if (!nav) return;
  if (window.scrollY > 20) {
    nav.style.background = 'rgba(5,6,10,0.97)';
  } else {
    nav.style.background = 'rgba(5,6,10,0.85)';
  }
});
