(function () {
  'use strict';

  var listEl    = document.getElementById('postList');
  var bodyEl    = document.getElementById('blogContent');
  var scriptUrl = document.currentScript ? document.currentScript.src : 'blogs/blog.js';
  var manifestUrl = new URL('index.json', scriptUrl).href;

  if (!listEl || !bodyEl) return;

  /* ── Helpers ─────────────────────────────────────── */
  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function getSlug(post) {
    return post.slug || post.file.replace(/\.md$/, '');
  }

  /* ── Load manifest ───────────────────────────────── */
  async function loadManifest() {
    if (Array.isArray(window.__BLOGS_INDEX__)) return window.__BLOGS_INDEX__;
    try {
      var res = await fetch(manifestUrl);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (_) {
      listEl.innerHTML = '<p class="bpi-empty">No posts yet.</p>';
      return [];
    }
  }

  /* ── Build slug → post flat map (includes children) ─ */
  function buildFlatMap(posts) {
    var map = {};
    posts.forEach(function (post) {
      map[getSlug(post)] = post;
      (post.children || []).forEach(function (child) {
        map[getSlug(child)] = child;
      });
    });
    return map;
  }

  /* ── Render post content ─────────────────────────── */
  function loadPost(post) {
    bodyEl.innerHTML =
      '<article class="blog-article">' +
        '<header class="blog-article-header">' +
          '<div class="pg-label">' + post.date + (post.tag ? ' &nbsp;·&nbsp; ' + post.tag : '') + '</div>' +
          '<h1 class="blog-article-title">' + esc(post.title) + '</h1>' +
        '</header>' +
        '<div class="blog-article-body">' + (post.html || '') + '</div>' +
      '</article>';
    window.scrollTo(0, 0);
  }

  /* ── Set active + expand parent if child ────────── */
  function setActive(slug) {
    document.querySelectorAll('.blog-post-item').forEach(function (el) {
      el.classList.remove('active');
    });
    document.querySelectorAll('.bpi-wrapper').forEach(function (el) {
      el.classList.remove('bpi-parent-active');
    });
    var activeEl = listEl.querySelector('.blog-post-item[data-slug="' + slug + '"]');
    if (!activeEl) return;
    activeEl.classList.add('active');
    var wrapper = activeEl.closest('.bpi-wrapper');
    if (wrapper) wrapper.classList.add('bpi-parent-active');
  }

  /* ── Expand the parent wrapper for a given slug ── */
  function expandParent(slug) {
    if (slug.indexOf('/') === -1) return;
    var parentSlug = slug.split('/')[0];
    var parentEl   = listEl.querySelector('.blog-post-item[data-slug="' + parentSlug + '"]');
    if (parentEl) {
      var wrapper = parentEl.closest('.bpi-wrapper');
      if (wrapper) wrapper.classList.add('bpi-expanded');
    }
  }

  /* ── Navigate: load + set active + expand ────────── */
  function navigateTo(slug, flatMap, pushState) {
    var post = flatMap[slug];
    if (!post) return;
    if (pushState) history.pushState(null, '', '#' + slug);
    expandParent(slug);
    loadPost(post);
    setActive(slug);
  }

  /* ── Build list item for one post ───────────────── */
  function makeItem(post, flatMap, isChild) {
    var slug        = getSlug(post);
    var hasChildren = !isChild && post.children && post.children.length > 0;

    /* Wrapper div */
    var wrapper = document.createElement('div');
    wrapper.className = 'bpi-wrapper' + (hasChildren ? ' bpi-has-children' : '');

    /* Row <a> */
    var row = document.createElement('a');
    row.className    = 'blog-post-item' + (isChild ? ' bpi-child' : '');
    row.href         = '#' + slug;
    row.dataset.slug = slug;

    if (hasChildren) {
      row.innerHTML =
        '<span class="bpi-chevron"></span>' +
        '<span class="bpi-meta">' +
          '<span class="bpi-date">' + esc(post.date) + '</span>' +
          '<span class="bpi-title">' + esc(post.title) + '</span>' +
          (post.tag ? '<span class="bpi-tag">' + esc(post.tag) + '</span>' : '') +
        '</span>';
    } else {
      row.innerHTML =
        '<span class="bpi-date">' + esc(post.date) + '</span>' +
        '<span class="bpi-title">' + esc(post.title) + '</span>' +
        (post.tag ? '<span class="bpi-tag">' + esc(post.tag) + '</span>' : '');
    }

    row.addEventListener('click', function (e) {
      e.preventDefault();
      if (hasChildren) {
        wrapper.classList.toggle('bpi-expanded');
      }
      navigateTo(slug, flatMap, true);
    });

    wrapper.appendChild(row);

    /* Children list */
    if (hasChildren) {
      var childContainer = document.createElement('div');
      childContainer.className = 'bpi-children';
      post.children.forEach(function (child) {
        childContainer.appendChild(makeItem(child, flatMap, true));
      });
      wrapper.appendChild(childContainer);
    }

    return wrapper;
  }

  /* ── Init ────────────────────────────────────────── */
  async function init() {
    var posts   = await loadManifest();
    if (!posts.length) return;
    var flatMap = buildFlatMap(posts);

    posts.forEach(function (post) {
      listEl.appendChild(makeItem(post, flatMap, false));
    });

    /* Restore from hash, default to first post */
    var hash   = location.hash.slice(1);
    var target = flatMap[hash] ? hash : getSlug(posts[0]);
    navigateTo(target, flatMap, false);

    /* Browser back / forward */
    window.addEventListener('popstate', function () {
      var h = location.hash.slice(1);
      if (flatMap[h]) navigateTo(h, flatMap, false);
    });
  }

  /* ── Blog list panel toggle ──────────────────────── */
  var layout    = document.querySelector('.blog-layout');
  var toggleBtn = document.getElementById('listToggle');
  var expandTab = document.getElementById('listExpand');

  function setListVisible(visible) {
    if (!layout) return;
    layout.classList.toggle('list-hidden', !visible);
    localStorage.setItem('blog-list-hidden', visible ? '0' : '1');
  }

  if (toggleBtn) toggleBtn.addEventListener('click', function () { setListVisible(false); });
  if (expandTab) expandTab.addEventListener('click', function () { setListVisible(true); });
  if (localStorage.getItem('blog-list-hidden') === '1') setListVisible(false);

  init();
})();
