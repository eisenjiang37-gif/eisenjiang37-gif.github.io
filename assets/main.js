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

  /* ── BibTeX toggles ───────────────────────────────── */
  document.querySelectorAll('.bib-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id    = btn.dataset.bib;
      var block = document.getElementById(id);
      if (!block) return;
      var open = block.classList.toggle('open');
      btn.classList.toggle('open', open);
    });
  });

})();
