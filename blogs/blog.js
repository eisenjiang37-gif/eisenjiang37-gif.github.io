(function () {
  'use strict';

  var listEl = document.getElementById('postList');
  var bodyEl = document.getElementById('blogContent');
  var scriptUrl = document.currentScript ? document.currentScript.src : 'blogs/blog.js';
  var manifestUrl = new URL('index.json', scriptUrl).href;

  if (!listEl || !bodyEl) return;

  function getSlug(post) {
    return post.slug || post.file.replace(/\.md$/, '');
  }

  /* ── Load manifest ───────────────────────────────── */
  async function loadManifest() {
    if (Array.isArray(window.__BLOGS_INDEX__)) {
      return window.__BLOGS_INDEX__;
    }

    try {
      var res = await fetch(manifestUrl);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (_) {
      listEl.innerHTML = '<p style="padding:1.5rem 2rem;font-family:\'DM Mono\',monospace;font-size:0.65rem;color:var(--text-dim)">No posts yet.</p>';
      return [];
    }
  }

  /* ── Render markdown post ────────────────────────── */
  async function loadPost(post) {
    bodyEl.innerHTML = '<div class="blog-loading">Loading…</div>';
    try {
      bodyEl.innerHTML =
        '<article class="blog-article">' +
          '<header class="blog-article-header">' +
            '<div class="pg-label">' + post.date + (post.tag ? ' &nbsp;·&nbsp; ' + post.tag : '') + '</div>' +
            '<h1 class="blog-article-title">' + escHtml(post.title) + '</h1>' +
          '</header>' +
          '<div class="blog-article-body">' + (post.html || '') + '</div>' +
        '</article>';
      window.scrollTo(0, 0);
    } catch (_) {
      bodyEl.innerHTML = '<div class="blog-loading">Failed to load post.</div>';
    }
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── Active item ─────────────────────────────────── */
  function setActive(slug) {
    document.querySelectorAll('.blog-post-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.slug === slug);
    });
  }

  /* ── Init ────────────────────────────────────────── */
  async function init() {
    var posts = await loadManifest();
    if (!posts.length) return;

    posts.forEach(function (post) {
      var slug = getSlug(post);
      var el   = document.createElement('a');
      el.className    = 'blog-post-item';
      el.href         = '#' + slug;
      el.dataset.slug = slug;
      el.innerHTML    =
        '<span class="bpi-date">' + escHtml(post.date) + '</span>' +
        '<span class="bpi-title">' + escHtml(post.title) + '</span>' +
        (post.tag ? '<span class="bpi-tag">' + escHtml(post.tag) + '</span>' : '');

      el.addEventListener('click', function (e) {
        e.preventDefault();
        history.pushState(null, '', '#' + slug);
        loadPost(post);
        setActive(slug);
      });
      listEl.appendChild(el);
    });

    /* Restore from URL hash or default to first post */
    var hash   = location.hash.slice(1);
    var target = posts.find(function (p) { return getSlug(p) === hash; });
    if (!target) target = posts[0];
    loadPost(target);
    setActive(getSlug(target));

    /* Browser back / forward */
    window.addEventListener('popstate', function () {
      var h = location.hash.slice(1);
      var p = posts.find(function (p) { return getSlug(p) === h; });
      if (p) { loadPost(p); setActive(getSlug(p)); }
    });
  }

  /* ── List toggle ────────────────────────────────── */
  var layout = document.querySelector('.blog-layout');
  var toggleBtn = document.getElementById('listToggle');
  var expandTab = document.getElementById('listExpand');

  function setListVisible(visible) {
    if (!layout) return;
    layout.classList.toggle('list-hidden', !visible);
    localStorage.setItem('blog-list-hidden', visible ? '0' : '1');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      setListVisible(false);
    });
  }

  if (expandTab) {
    expandTab.addEventListener('click', function () {
      setListVisible(true);
    });
  }

  if (localStorage.getItem('blog-list-hidden') === '1') {
    setListVisible(false);
  }

  init();
})();
