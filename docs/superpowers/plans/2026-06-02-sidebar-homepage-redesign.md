# Academic Sidebar Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the personal website around a light academic profile sidebar while keeping the existing static HTML/CSS/JS site structure.

**Architecture:** Keep the site as static pages with repeated sidebar markup, shared styling in `assets/style.css`, and lightweight behavior in `assets/main.js`. The sidebar becomes a reusable profile panel pattern across top-level pages; content pages remain independent HTML documents.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript, GitHub Pages.

---

## File Structure

- Modify: `index.html` - Replace current sidebar markup, default theme, and homepage hero copy/layout.
- Modify: `about.html` - Replace sidebar markup and default theme.
- Modify: `research.html` - Replace sidebar markup and default theme.
- Modify: `writing.html` - Replace sidebar markup and default theme.
- Modify: `contact.html` - Replace sidebar markup and default theme.
- Modify: `assets/style.css` - Rework color tokens, profile sidebar, layout spacing, mobile behavior, and remove dark-first visual treatment.
- Modify: `assets/main.js` - Default to light theme, update theme labels, remove desktop sidebar collapse behavior if it conflicts with fixed academic rail.
- Optional modify after inspection: `blogs/assets/style.css` - Only if blog article rendering visibly conflicts with the new main site style.

## Shared Sidebar Markup

Use this same sidebar block in `index.html`, `about.html`, `research.html`, `writing.html`, and `contact.html`:

```html
<nav class="sidebar" aria-label="Primary navigation">
  <div class="profile-card">
    <a href="index.html" class="avatar-link" aria-label="Eisen Jiang home">
      <span class="avatar-fallback">EJ</span>
    </a>
    <a href="index.html" class="site-mark">
      <span class="site-name">Eisen Jiang</span>
      <span class="site-sub">Zihan Jiang / 蒋子涵</span>
    </a>
    <div class="profile-meta">
      <span>Zhejiang University -> Georgia Tech</span>
      <span>Research, systems, agents</span>
    </div>
  </div>

  <div class="sidebar-body" id="sidebarBody">
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="research.html">Research</a></li>
      <li><a href="research.html#projects">Projects</a></li>
      <li><a href="writing.html">Writing</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>

    <div class="sidebar-foot">
      <div class="socials">
        <a href="https://github.com/eisenjiang37-gif" target="_blank" rel="noopener">GitHub</a>
        <a href="contact.html">Scholar</a>
        <a href="mailto:eisenjiang37@gmail.com">Email</a>
        <a href="assets/zihan-CV_2026.1.pdf" target="_blank" rel="noopener">CV</a>
      </div>
      <button class="theme-toggle" type="button">
        <span class="t-icon"></span>
        <span class="t-label">Dark mode</span>
      </button>
      <div class="copy">© 2026 Eisen Jiang</div>
    </div>
  </div>

  <button class="mob-toggle" id="mobToggle" type="button">Menu</button>
</nav>
```

## Task 1: Replace Sidebar Markup Across Top-Level Pages

**Files:**
- Modify: `index.html`
- Modify: `about.html`
- Modify: `research.html`
- Modify: `writing.html`
- Modify: `contact.html`

- [ ] **Step 1: Replace the existing `<nav class="sidebar">...</nav>` block**

Use the exact block from "Shared Sidebar Markup" above in all five files. Remove these old sidebar-only elements from the replaced blocks:

```html
<div class="sidebar-header-actions">
  <button class="sidebar-collapse-btn" id="sidebarCollapse">‹</button>
  <button class="mob-toggle" id="mobToggle">Menu</button>
</div>
```

Remove the nested research sub-nav from the sidebar:

```html
<li class="has-sub">
  <a href="research.html">Research</a>
  <ul class="sub-nav">
    <li><a href="research.html#papers">Papers</a></li>
    <li><a href="research.html#projects">Projects</a></li>
  </ul>
</li>
```

- [ ] **Step 2: Change the inline theme default in all five page heads**

Replace:

```html
<script>document.documentElement.setAttribute("data-theme",localStorage.getItem("theme")||"dark");</script>
```

With:

```html
<script>document.documentElement.setAttribute("data-theme",localStorage.getItem("theme")||"light");</script>
```

- [ ] **Step 3: Run static checks**

Run:

```bash
rg -n 'sidebar-collapse-btn|has-sub|sub-nav|\\|\\|\"dark\"' index.html about.html research.html writing.html contact.html
```

Expected: no matches.

Run:

```bash
rg -n '<nav class=\"sidebar\"' index.html about.html research.html writing.html contact.html
```

Expected: exactly five matches.

- [ ] **Step 4: Commit**

```bash
git add index.html about.html research.html writing.html contact.html
git commit -m "feat: replace navigation with academic profile sidebar"
```

## Task 2: Rework Theme Tokens and Sidebar CSS

**Files:**
- Modify: `assets/style.css`

- [ ] **Step 1: Replace the root color token block**

Replace the current `:root` and `html[data-theme="light"]` token sections with:

```css
:root {
  --bg:          #f4f6f8;
  --bg-2:        #ffffff;
  --panel:       #eef1f4;
  --text:        #2f3438;
  --text-mid:    #626970;
  --text-dim:    #8a9095;
  --accent:      #2f6f73;
  --accent-warm: #8d6e3f;
  --border:      #dde3e8;
  --sidebar-w:   318px;
  --font-title:  'Inter', system-ui, sans-serif;
  --font-body:   'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-code:   'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
  --ease:        cubic-bezier(0.16, 1, 0.3, 1);
  --t:           0.32s;
}

html[data-theme="dark"] {
  --bg:          #101214;
  --bg-2:        #17191c;
  --panel:       #14171a;
  --text:        #e7e1d6;
  --text-mid:    #b0a89d;
  --text-dim:    #7d776f;
  --accent:      #9fb8bd;
  --accent-warm: #d0b279;
  --border:      #2a2d30;
}
```

- [ ] **Step 2: Replace sidebar CSS from `/* ─── Sidebar ─── */` through `/* ─── Content area ─── */`**

Use:

```css
/* ─── Sidebar ────────────────────────────────────────── */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-w);
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2.5rem 2rem 1.75rem;
  border-right: 1px solid var(--border);
  background: var(--panel);
  z-index: 100;
  overflow-y: auto;
}

.profile-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2.75rem;
}

.avatar-link {
  display: grid;
  place-items: center;
  width: 8.5rem;
  height: 8.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #c6d1dc, #f1eee8);
  border: 4px solid var(--bg-2);
  box-shadow: 0 1rem 2.5rem rgba(38, 48, 56, 0.12);
  text-decoration: none;
  overflow: hidden;
}

.avatar-fallback {
  font-family: var(--font-title);
  font-size: 2.2rem;
  font-weight: 700;
  color: #5d666d;
}

.site-mark {
  display: block;
  text-decoration: none;
}

.site-name {
  font-family: var(--font-title);
  font-size: 2.15rem;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--text);
  display: block;
  line-height: 1;
}

.site-sub {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--text-mid);
  display: block;
  margin-top: 0.7rem;
}

.profile-meta {
  display: grid;
  gap: 0.35rem;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--text-mid);
}

.mob-toggle {
  display: none;
}

.sidebar-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nav-links {
  list-style: none;
  display: grid;
  gap: 1.05rem;
}

.nav-links > li > a {
  display: flex;
  align-items: center;
  min-height: 2rem;
  font-family: var(--font-title);
  font-size: 1rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-mid);
  text-decoration: none;
  transition: color var(--t) var(--ease), transform var(--t) var(--ease);
}

.nav-links > li > a:hover {
  color: var(--text);
  transform: translateX(4px);
}

.nav-links > li > a.active {
  color: var(--accent);
}

.sidebar-foot {
  margin-top: auto;
  padding-top: 2rem;
}

.socials {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.socials a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  padding: 0 0.65rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg-2);
  font-family: var(--font-title);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-mid);
  text-decoration: none;
  transition: color var(--t), border-color var(--t), background var(--t);
}

.socials a:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.copy {
  font-family: var(--font-body);
  font-size: 0.76rem;
  color: var(--text-dim);
}

/* ─── Content area ───────────────────────────────────── */
```

- [ ] **Step 3: Remove old sidebar selectors that should not exist**

Run:

```bash
rg -n 'sidebar-header|sidebar-header-actions|sidebar-collapse-btn|sidebar-expand-tab|sub-nav|has-sub' assets/style.css
```

Expected: no matches after cleanup.

- [ ] **Step 4: Commit**

```bash
git add assets/style.css
git commit -m "feat: add light academic sidebar styling"
```

## Task 3: Update Layout, Homepage, and Responsive CSS

**Files:**
- Modify: `assets/style.css`
- Modify: `index.html`

- [ ] **Step 1: Adjust homepage hero content in `index.html`**

Replace the current `<section class="hero">...</section>` with:

```html
<section class="hero">
  <div class="hero-eyebrow">Personal research notebook</div>
  <h1 class="hero-name">
    <span class="hero-first">Research, systems, and agents.</span>
  </h1>
  <div class="hero-footer">
    <p class="hero-tagline">I am a senior at Zhejiang University working on gesture recognition, action understanding, reinforcement learning, and embodied AI. I will begin graduate study at Georgia Tech in Fall 2026.</p>
    <span class="badge">Incoming Grad — Fall 2026</span>
  </div>
</section>
```

- [ ] **Step 2: Replace homepage and page spacing CSS**

Update the content and hero rules so the main area reads as an academic page:

```css
.content {
  margin-left: var(--sidebar-w);
  flex: 1;
  min-height: 100vh;
  background: var(--bg);
  animation: pageIn 0.55s var(--ease) both;
}

.home-page .content {
  display: flex;
  align-items: center;
  min-height: 100vh;
}

.hero {
  width: 100%;
  padding: 5rem clamp(2rem, 7vw, 7rem);
  border-bottom: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  background: var(--bg);
}

.home-page .hero {
  min-height: 100vh;
  border-bottom: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero::before,
.home-page .hero::before {
  display: none;
}

.hero-eyebrow {
  font-family: var(--font-body);
  font-size: 0.86rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1.4rem;
}

.hero-eyebrow::before {
  content: '';
}

.hero-name {
  font-family: var(--font-title);
  font-weight: 800;
  font-size: clamp(2.4rem, 5.8vw, 5.8rem);
  line-height: 1.03;
  letter-spacing: 0;
  color: var(--text);
  margin-bottom: 2rem;
  display: block;
  max-width: 11ch;
}

.hero-last {
  margin-left: 0;
  color: var(--text);
}

.hero-footer {
  display: flex;
  align-items: flex-start;
  gap: 1.75rem;
  flex-wrap: wrap;
  max-width: 48rem;
}
```

- [ ] **Step 3: Add mobile CSS at the end of the responsive section**

Ensure mobile switches to a top profile header:

```css
@media (max-width: 860px) {
  :root {
    --sidebar-w: 100%;
  }

  .layout {
    display: block;
  }

  .sidebar {
    position: relative;
    width: 100%;
    height: auto;
    min-height: 0;
    padding: 1.25rem;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .profile-card {
    display: grid;
    grid-template-columns: 4.5rem 1fr;
    align-items: center;
    column-gap: 1rem;
    margin-bottom: 1rem;
  }

  .avatar-link {
    width: 4.5rem;
    height: 4.5rem;
    grid-row: span 2;
  }

  .avatar-fallback {
    font-size: 1.2rem;
  }

  .site-name {
    font-size: 1.55rem;
  }

  .profile-meta {
    grid-column: 2;
  }

  .mob-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 2.5rem;
    margin-top: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-2);
    color: var(--text);
    font: inherit;
  }

  .sidebar-body {
    display: none;
    padding-top: 1rem;
  }

  .sidebar-body.open {
    display: flex;
  }

  .content {
    margin-left: 0;
  }

  .hero,
  .pg-header,
  .pg-body {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }
}
```

- [ ] **Step 4: Check for negative letter spacing in edited display styles**

Run:

```bash
rg -n 'letter-spacing:\\s*-' assets/style.css
```

Expected: no matches. Replace any remaining negative letter spacing with `letter-spacing: 0;`.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/style.css
git commit -m "feat: adapt homepage layout for academic profile rail"
```

## Task 4: Simplify JavaScript for New Sidebar Behavior

**Files:**
- Modify: `assets/main.js`

- [ ] **Step 1: Update theme defaults and labels**

Replace:

```js
var LABELS = { dark: '◑ Light mode', light: '◐ Dark mode' };
var currentTheme = localStorage.getItem('theme') || 'dark';
```

With:

```js
var LABELS = { dark: 'Light mode', light: 'Dark mode' };
var currentTheme = localStorage.getItem('theme') || 'light';
```

- [ ] **Step 2: Remove desktop sidebar collapse behavior**

Delete the entire block beginning with:

```js
/* ── Sidebar collapse (desktop) ──────────────────── */
```

And ending after:

```js
if (localStorage.getItem('sidebar-collapsed') === '1') setSidebarCollapsed(true);
```

- [ ] **Step 3: Keep mobile menu behavior**

Ensure this block remains:

```js
var toggle = document.getElementById('mobToggle');
var body   = document.getElementById('sidebarBody');

if (toggle && body) {
  toggle.addEventListener('click', function () {
    var open = body.classList.toggle('open');
    toggle.textContent = open ? 'Close' : 'Menu';
  });
}
```

- [ ] **Step 4: Run JavaScript sanity checks**

Run:

```bash
rg -n 'sidebarCollapse|sidebar-expand-tab|sidebar-collapsed|Light mode|Dark mode|currentTheme' assets/main.js
```

Expected: matches only for `Light mode`, `Dark mode`, and `currentTheme`.

- [ ] **Step 5: Commit**

```bash
git add assets/main.js
git commit -m "feat: simplify sidebar interactions for profile layout"
```

## Task 5: Visual Verification and Final Polish

**Files:**
- Modify if needed: `assets/style.css`
- Modify if needed: `writing.html`
- Modify if needed: `blogs/assets/style.css`

- [ ] **Step 1: Start a local static server**

Run:

```bash
python3 -m http.server 8000
```

Expected: server prints `Serving HTTP on :: port 8000` or equivalent.

- [ ] **Step 2: Check desktop pages**

Open:

```text
http://localhost:8000/index.html
http://localhost:8000/about.html
http://localhost:8000/research.html
http://localhost:8000/writing.html
http://localhost:8000/contact.html
```

Expected:

- Left profile sidebar is fixed and light.
- Main content starts to the right of the sidebar.
- Active nav state is visible.
- Text does not overlap with sidebar or page content.
- Social/contact links do not wrap awkwardly outside the sidebar.

- [ ] **Step 3: Check mobile pages**

Use a viewport near `390x844`.

Expected:

- Sidebar becomes a top profile header.
- `Menu` button opens and closes navigation.
- No horizontal scrolling.
- Hero heading and page titles fit.

- [ ] **Step 4: Check blog UI compatibility**

Open:

```text
http://localhost:8000/writing.html
```

Expected:

- Blog post list remains usable beside the redesigned global sidebar on desktop.
- On mobile, post list and article area remain readable.

If `blogs/assets/style.css` conflicts with the main redesign, adjust only the conflicting colors or spacing. Do not rewrite blog generation logic.

- [ ] **Step 5: Final grep checks**

Run:

```bash
rg -n 'href=\"#\"|sidebar-collapse-btn|sidebar-expand-tab|sidebar-collapsed|\\|\\|\"dark\"' index.html about.html research.html writing.html contact.html assets/style.css assets/main.js
```

Expected: no matches.

Run:

```bash
git status --short
```

Expected: only intentional modified files.

- [ ] **Step 6: Commit final polish**

If polish changes were needed:

```bash
git add assets/style.css writing.html blogs/assets/style.css
git commit -m "fix: polish responsive academic sidebar layout"
```

If no polish changes were needed, skip this commit.

## Task 6: Push to GitHub

**Files:**
- No file edits.

- [ ] **Step 1: Verify history**

Run:

```bash
git log --oneline --decorate --max-count=8
```

Expected: plan commit plus implementation commits are on `main`.

- [ ] **Step 2: Push**

Run:

```bash
git push origin main
```

Expected: `main` updates on `origin`.

## Self-Review

Spec coverage:

- Academic profile panel: Task 1 and Task 2.
- Light neutral visual direction: Task 2.
- Desktop fixed sidebar: Task 2 and Task 5.
- Mobile top profile header: Task 3 and Task 5.
- Static site architecture preserved: all tasks keep HTML/CSS/JS only.
- No temporary brainstorming files: already handled by `.gitignore` in the design commit.

Placeholder scan:

- No unfilled marker language is used.
- Conditional polish is explicit and bounded to visual conflicts only.

Type and name consistency:

- `mobToggle`, `sidebarBody`, `.sidebar-body.open`, `.theme-toggle`, `.t-label`, and `.nav-links` names match existing JavaScript and HTML patterns.
