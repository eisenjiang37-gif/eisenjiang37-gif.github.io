(function () {
  'use strict';

  /* ── Theme ────────────────────────────────────────── */
  var THEMES = { dark: 'light', light: 'dark' };
  var LABELS = { dark: '◑ Light mode', light: '◐ Dark mode' };

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.querySelector('.t-label').textContent = LABELS[theme];
    });
  }

  /* Init theme (also applied via inline <head> script to prevent flash) */
  var currentTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(currentTheme);

  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = THEMES[document.documentElement.getAttribute('data-theme')] || 'light';
      applyTheme(next);
    });
  });

  /* ── Progress bar ─────────────────────────────────── */
  var bar = document.createElement('div');
  bar.className = 'progress-bar';
  document.body.prepend(bar);

  window.addEventListener('scroll', function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0%';
  }, { passive: true });

  /* ── Click shatter effect ─────────────────────────── */
  function createShard(x, y) {
    var shard = document.createElement('div');
    shard.className = 'shard';

    var hueA = Math.floor(Math.random() * 360);
    var hueB = (hueA + 70 + Math.random() * 80) % 360;
    var hueC = (hueB + 70 + Math.random() * 80) % 360;
    var hueD = (hueC + 70 + Math.random() * 80) % 360;
    shard.style.setProperty('--shard-c1', 'hsla(' + hueA + ', 100%, 62%, 1)');
    shard.style.setProperty('--shard-c2', 'hsla(' + hueB + ', 100%, 78%, 1)');
    shard.style.setProperty('--shard-c3', 'hsla(' + hueC + ', 100%, 66%, 1)');
    shard.style.setProperty('--shard-c4', 'hsla(' + hueD + ', 100%, 70%, 1)');

    var points = [];
    for (var i = 0; i < 3; i += 1) {
      points.push((Math.random() * 100) + '% ' + (Math.random() * 100) + '%');
    }
    shard.style.clipPath = 'polygon(' + points.join(',') + ')';

    var size = (Math.random() * 40) + 16;
    shard.style.width = size + 'px';
    shard.style.height = size + 'px';
    shard.style.left = x + 'px';
    shard.style.top = y + 'px';

    var angle = Math.random() * Math.PI * 2;
    var distance = (Math.random() * 55) + 18;
    var destX = Math.cos(angle) * distance;
    var destY = Math.sin(angle) * distance;
    var rotation = (Math.random() * 720) - 360;
    shard.style.setProperty('--vector-angle', (angle * 180 / Math.PI) + 'deg');
    shard.style.setProperty('--vector-length', Math.max(8, Math.min(22, distance * 0.48)) + 'px');

    document.body.appendChild(shard);

    var animation = shard.animate([
      {
        transform: 'translate(-50%, -50%) scale(0) rotate(0deg)',
        opacity: 1,
        filter: 'brightness(3) blur(0px)',
        offset: 0
      },
      {
        transform: 'translate(calc(-50% + ' + (destX * 0.16) + 'px), calc(-50% + ' + (destY * 0.16) + 'px)) scale(0.42) rotate(' + (rotation * 0.16) + 'deg)',
        opacity: 0.88,
        filter: 'brightness(2.6) blur(0.2px)',
        offset: 0.12
      },
      {
        transform: 'translate(calc(-50% + ' + (destX * 0.45) + 'px), calc(-50% + ' + (destY * 0.45) + 'px)) scale(0.9) rotate(' + (rotation * 0.45) + 'deg)',
        opacity: 0.58,
        filter: 'brightness(2.1) blur(0.8px)',
        offset: 0.45
      },
      {
        transform: 'translate(calc(-50% + ' + destX + 'px), calc(-50% + ' + destY + 'px)) scale(1.5) rotate(' + rotation + 'deg)',
        opacity: 0,
        filter: 'brightness(1) blur(2px)',
        offset: 1
      }
    ], {
      duration: 260 + (Math.random() * 220),
      easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)',
      fill: 'forwards'
    });

    animation.onfinish = function () {
      shard.remove();
    };
  }

  function triggerShatter(event) {
    if (!event.isPrimary || event.pointerType === 'touch') return;

    var x = event.clientX;
    var y = event.clientY;

    var flash = document.createElement('div');
    flash.className = 'impact-flash';
    flash.style.left = (x - 4) + 'px';
    flash.style.top = (y - 4) + 'px';
    document.body.appendChild(flash);
    window.setTimeout(function () {
      flash.remove();
    }, 280);

    for (var i = 0; i < 6; i += 1) {
      createShard(x, y);
    }

  }

  window.addEventListener('pointerdown', triggerShatter, { passive: true });

  /* ── Active nav state ─────────────────────────────── */
  /* Skip JS detection on /blogs — active classes are hardcoded there */
  var inBlogs  = location.pathname.indexOf('/blogs') !== -1;
  var filename = location.pathname.split('/').filter(Boolean).pop() || 'index.html';

  if (!inBlogs) document.querySelectorAll('.nav-links > li > a').forEach(function (a) {
    var href = a.getAttribute('href').split('#')[0];
    if (href === filename || (filename === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* Expand research sub-nav if on research page */
  var resSub = document.querySelector('.has-sub');
  if (resSub) {
    var resLink = resSub.querySelector(':scope > a');
    if (resLink && resLink.classList.contains('active')) {
      resSub.classList.add('expanded');
    }
    /* Hover expand on all pages */
    resSub.addEventListener('mouseenter', function () {
      resSub.classList.add('expanded');
    });
    resSub.addEventListener('mouseleave', function () {
      if (!resLink.classList.contains('active')) {
        resSub.classList.remove('expanded');
      }
    });
  }

  /* Mark active sub-nav anchor */
  document.querySelectorAll('.sub-nav a').forEach(function (a) {
    if (location.hash && a.getAttribute('href').endsWith(location.hash)) {
      a.classList.add('active');
    }
  });

  /* ── Sidebar collapse (desktop) ──────────────────── */
  var sidebarLayout       = document.querySelector('.layout');
  var sidebarCollapseBtn  = document.getElementById('sidebarCollapse');

  if (sidebarCollapseBtn && sidebarLayout) {
    var sidebarExpandTab = document.createElement('button');
    sidebarExpandTab.className   = 'sidebar-expand-tab';
    sidebarExpandTab.textContent = 'Menu ›';
    sidebarExpandTab.style.display = 'none';
    document.body.appendChild(sidebarExpandTab);

    function setSidebarCollapsed(collapsed) {
      sidebarLayout.classList.toggle('sidebar-collapsed', collapsed);
      sidebarExpandTab.style.display = collapsed ? 'block' : 'none';
      localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
    }

    sidebarCollapseBtn.addEventListener('click', function () { setSidebarCollapsed(true); });
    sidebarExpandTab.addEventListener('click',   function () { setSidebarCollapsed(false); });

    if (localStorage.getItem('sidebar-collapsed') === '1') setSidebarCollapsed(true);
  }

  /* ── Mobile menu ──────────────────────────────────── */
  var toggle = document.getElementById('mobToggle');
  var body   = document.getElementById('sidebarBody');

  if (toggle && body) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('open');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  /* ── Tabs ─────────────────────────────────────────── */
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(function (b)   { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
      history.replaceState(null, '', '#' + target);

      /* Update sub-nav active state */
      document.querySelectorAll('.sub-nav a').forEach(function (a) { a.classList.remove('active'); });
      var subA = document.querySelector('.sub-nav a[href$="#' + target + '"]');
      if (subA) subA.classList.add('active');
    });
  });

  /* Restore tab from URL hash */
  if (location.hash) {
    var hashBtn = document.querySelector('[data-tab="' + location.hash.slice(1) + '"]');
    if (hashBtn) hashBtn.click();
  }

})();
