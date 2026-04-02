#!/usr/bin/env python3
"""
gen_index.py — compile blogs/*.md → HTML, write blogs/index.json + README.md

Title  : first H1 heading (# ...) or filename stem if none found
Date   : file modification date (YYYY-MM-DD)
Tag    : optional comment anywhere in first 20 lines:  <!-- tag: Note -->
Html   : compiled HTML embedded in index.json — no CDN, no per-post fetch
"""
import json, os, re
import html as _h
from datetime import datetime


# ── Markdown → HTML compiler ──────────────────────────────────────────────────

def md_to_html(src):
    src = src.replace('\r\n', '\n').replace('\r', '\n')

    # --- Step 1: stash fenced code blocks before any other processing ---
    stash   = {}
    counter = [0]

    def stash_block(m):
        k    = f'\x02{counter[0]}\x03'; counter[0] += 1
        lang = m.group(1).strip()
        code = _h.escape(m.group(2).rstrip('\n'))
        cls  = f' class="language-{lang}"' if lang else ''
        stash[k] = f'<pre><code{cls}>{code}</code></pre>'
        return '\n' + k + '\n'

    src = re.sub(r'```(\w*)\n(.*?)```', stash_block, src, flags=re.DOTALL)

    # --- Step 2: process each blank-line-separated block ---
    out = []
    for part in re.split(r'\n{2,}', src.strip()):
        part = part.strip()
        if not part:
            continue

        # Code block stash key (exact match after stripping)
        if part in stash:
            out.append(stash[part])
            continue

        lines = part.split('\n')
        first = lines[0]

        # ATX heading  (# … through ######)
        m = re.match(r'^(#{1,6})\s+(.*)', first)
        if m and len(lines) == 1:
            lvl = len(m.group(1))
            out.append(f'<h{lvl}>{span(m.group(2), stash)}</h{lvl}>')
            continue

        # Horizontal rule  (---, ***, ___)
        if re.match(r'^[-*_]{3,}\s*$', part) and '\n' not in part:
            out.append('<hr>')
            continue

        # Pipe table  (requires separator row on line 2)
        if '|' in first and len(lines) >= 2 and re.match(r'^[\|\s\-:]+$', lines[1]):
            cols = [c.strip() for c in first.strip('|').split('|')]
            th   = ''.join(f'<th>{span(c, stash)}</th>' for c in cols)
            rows = []
            for row in lines[2:]:
                if '|' not in row:
                    continue
                cells = [c.strip() for c in row.strip('|').split('|')]
                while len(cells) < len(cols):
                    cells.append('')
                td = ''.join(f'<td>{span(c, stash)}</td>' for c in cells[:len(cols)])
                rows.append(f'<tr>{td}</tr>')
            out.append(
                f'<table><thead><tr>{th}</tr></thead>'
                f'<tbody>{"".join(rows)}</tbody></table>'
            )
            continue

        # Blockquote
        if all(l.startswith('> ') or l == '>' for l in lines):
            inner = '\n\n'.join(l[2:] if l.startswith('> ') else '' for l in lines)
            out.append(f'<blockquote>{md_to_html(inner)}</blockquote>')
            continue

        # Unordered list
        if re.match(r'^[-*+]\s', first):
            items = []
            for l in lines:
                m2 = re.match(r'^[-*+]\s+(.*)', l)
                if m2:
                    items.append(f'<li>{span(m2.group(1), stash)}</li>')
            out.append('<ul>' + ''.join(items) + '</ul>')
            continue

        # Ordered list
        if re.match(r'^\d+\.\s', first):
            items = []
            for l in lines:
                m2 = re.match(r'^\d+\.\s+(.*)', l)
                if m2:
                    items.append(f'<li>{span(m2.group(1), stash)}</li>')
            out.append('<ol>' + ''.join(items) + '</ol>')
            continue

        # HTML comment — pass through (e.g. <!-- tag: Note -->)
        if part.startswith('<!--') and '-->' in part:
            out.append(part)
            continue

        # Paragraph (each line may be a stash key or inline text)
        pieces = []
        for l in lines:
            s = l.strip()
            if not s:
                continue
            pieces.append(stash[s] if s in stash else span(l, stash))
        if pieces:
            out.append('<p>' + ' '.join(pieces) + '</p>')

    return '\n'.join(out)


def span(text, stash=None):
    """Process inline markdown: code, bold/italic, links."""
    if stash is None:
        stash = {}
    ic, ctr = {}, [0]

    def save_code(m):
        k = f'\x04{ctr[0]}\x05'; ctr[0] += 1
        ic[k] = f'<code>{_h.escape(m.group(1))}</code>'
        return k

    text = re.sub(r'`([^`]+)`', save_code, text)
    text = re.sub(r'\*{3}(.+?)\*{3}',           r'<strong><em>\1</em></strong>', text)
    text = re.sub(r'\*{2}(.+?)\*{2}',           r'<strong>\1</strong>', text)
    text = re.sub(r'(?<!\w)__(.+?)__(?!\w)',     r'<strong>\1</strong>', text)
    text = re.sub(r'\*([^*\n]+)\*',             r'<em>\1</em>', text)
    text = re.sub(r'(?<!\w)_([^_\n]+)_(?!\w)', r'<em>\1</em>', text)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)',   r'<a href="\2">\1</a>', text)
    for k, v in ic.items():
        text = text.replace(k, v)
    return text


# ── Helpers ───────────────────────────────────────────────────────────────────

def stem_to_title(stem):
    return stem.replace('-', ' ').replace('_', ' ').title()

def stem_to_slug(stem):
    slug = stem.strip().lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')

def parse_meta(path):
    """Return (title, tag) from first 20 lines of a markdown file."""
    title = None; tag = None
    with open(path, encoding='utf-8') as f:
        for i, line in enumerate(f):
            line = line.rstrip()
            if i == 0 and line.startswith('# '):
                title = line[2:].strip()
            m = re.match(r'<!--\s*tag:\s*(.+?)\s*-->', line, re.I)
            if m:
                tag = m.group(1)
            if i > 20:
                break
    return title, tag


# ── Build entries ─────────────────────────────────────────────────────────────

BLOGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blogs')
OUT_FILE  = os.path.join(BLOGS_DIR, 'index.json')
OUT_JS    = os.path.join(BLOGS_DIR, 'index.js')
README    = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'README.md')

entries = []
for fname in sorted(os.listdir(BLOGS_DIR)):
    if not fname.endswith('.md'):
        continue
    path  = os.path.join(BLOGS_DIR, fname)
    mtime = os.path.getmtime(path)
    date  = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')

    title, tag = parse_meta(path)
    if not title:
        title = stem_to_title(os.path.splitext(fname)[0])

    with open(path, encoding='utf-8') as f:
        raw = f.read()

    stem = os.path.splitext(fname)[0]
    entry = {
        'file': fname,
        'slug': stem_to_slug(stem),
        'title': title,
        'date': date,
        'html': md_to_html(raw),
    }
    if tag:
        entry['tag'] = tag

    # ── Sub-items: blogs/<stem>/*.md ──────────────────────
    sub_dir = os.path.join(BLOGS_DIR, stem)
    if os.path.isdir(sub_dir):
        children = []
        for child_fname in sorted(os.listdir(sub_dir)):
            if not child_fname.endswith('.md'):
                continue
            child_path  = os.path.join(sub_dir, child_fname)
            child_mtime = os.path.getmtime(child_path)
            child_date  = datetime.fromtimestamp(child_mtime).strftime('%Y-%m-%d')
            child_title, child_tag = parse_meta(child_path)
            child_stem  = os.path.splitext(child_fname)[0]
            if not child_title:
                child_title = stem_to_title(child_stem)
            with open(child_path, encoding='utf-8') as f:
                child_raw = f.read()
            child_entry = {
                'file':  f'{stem}/{child_fname}',
                'slug':  f'{stem_to_slug(stem)}/{stem_to_slug(child_stem)}',
                'title': child_title,
                'date':  child_date,
                'html':  md_to_html(child_raw),
            }
            if child_tag:
                child_entry['tag'] = child_tag
            children.append(child_entry)
        if children:
            entry['children'] = children

    entries.append(entry)

entries.sort(key=lambda e: e['date'], reverse=True)

with open(OUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(entries, f, indent=2, ensure_ascii=False)
    f.write('\n')

with open(OUT_JS, 'w', encoding='utf-8') as f:
    f.write('window.__BLOGS_INDEX__ = ')
    json.dump(entries, f, indent=2, ensure_ascii=False)
    f.write(';\n')

# ── README ────────────────────────────────────────────────────────────────────

readme_lines = [
    '# eisenjiang37-gif.github.io',
    '',
    'Personal website of **Eisen Jiang** (Zihan Jiang / 蒋子涵).',
    'Built with plain HTML/CSS/JS, hosted on GitHub Pages.',
    '',
    '## Pages',
    '',
    '| # | Page | Description |',
    '|---|------|-------------|',
    '| 01 | [About](about.html) | Background, education, and research interests |',
    '| 02 | [Research](research.html) | Papers and projects |',
    '| 03 | [Blog](writing.html) | Notes and essays |',
    '| 04 | [Contact](contact.html) | Get in touch |',
    '',
    '## Blog Posts',
    '',
]
if entries:
    readme_lines += ['| Date | Title | Tag |', '|------|-------|-----|']
    for e in entries:
        tag  = e.get('tag', '')
        link = f'[{e["title"]}](writing.html#{e["slug"]})'
        readme_lines.append(f'| {e["date"]} | {link} | {tag} |')
else:
    readme_lines.append('_No posts yet._')

readme_lines += [
    '',
    '## Dev',
    '',
    'Drop `.md` files into `blogs/` then run:',
    '```',
    'python3 gen_index.py',
    '```',
    'This compiles markdown → HTML, regenerates `blogs/index.json` and this `README.md`.',
    '',
    'Serve locally with:',
    '```',
    'python3 -m http.server',
    '```',
    '',
]

with open(README, 'w', encoding='utf-8') as f:
    f.write('\n'.join(readme_lines))

# ── Summary ───────────────────────────────────────────────────────────────────

print(f'Compiled {len(entries)} post{"" if len(entries)==1 else "s"} → {OUT_FILE}')
print(f'Updated README.md')
for e in entries:
    print(f'  {e["date"]}  {e["file"]:<40}  {e["title"]}')
