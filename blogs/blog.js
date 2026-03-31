(function () {
  'use strict';

  var listEl  = document.getElementById('postList');
  var bodyEl  = document.getElementById('blogContent');

  /* ── Load manifest ───────────────────────────────── */
  async function loadManifest() {
    try {
      var res = await fetch('./index.json');
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
      var res = await fetch('./' + post.file);
      if (!res.ok) throw new Error();
      var md  = await res.text();
      var html = marked.parse(md);
      bodyEl.innerHTML =
        '<article class="blog-article">' +
          '<header class="blog-article-header">' +
            '<div class="pg-label">' + post.date + (post.tag ? ' &nbsp;·&nbsp; ' + post.tag : '') + '</div>' +
            '<h1 class="blog-article-title">' + escHtml(post.title) + '</h1>' +
          '</header>' +
          '<div class="blog-article-body">' + html + '</div>' +
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
      var slug = post.file.replace(/\.md$/, '');
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
    var target = posts.find(function (p) { return p.file.replace(/\.md$/, '') === hash; });
    if (!target) target = posts[0];
    loadPost(target);
    setActive(target.file.replace(/\.md$/, ''));

    /* Browser back / forward */
    window.addEventListener('popstate', function () {
      var h = location.hash.slice(1);
      var p = posts.find(function (p) { return p.file.replace(/\.md$/, '') === h; });
      if (p) { loadPost(p); setActive(p.file.replace(/\.md$/, '')); }
    });
  }

  init();
})();
