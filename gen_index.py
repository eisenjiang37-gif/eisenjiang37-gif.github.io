#!/usr/bin/env python3
"""
gen_index.py — regenerate blogs/index.json from blogs/*.md

Title  : first H1 heading in the file  (# ...)
         falls back to filename stem if no H1 found
Date   : file modification date (YYYY-MM-DD)
Tag    : optional — set tag via a front-matter comment on line 2:
           <!-- tag: Note -->
"""
import json, os, re
from datetime import datetime

BLOGS_DIR = os.path.join(os.path.dirname(__file__), "blogs")
OUT_FILE  = os.path.join(BLOGS_DIR, "index.json")

def stem_to_title(stem):
    return stem.replace("-", " ").replace("_", " ").title()

def parse_md(path):
    title = None
    tag   = None
    with open(path, encoding="utf-8") as f:
        for i, line in enumerate(f):
            line = line.rstrip()
            if i == 0 and line.startswith("# "):
                title = line[2:].strip()
            m = re.match(r"<!--\s*tag:\s*(.+?)\s*-->", line, re.I)
            if m:
                tag = m.group(1)
            if i > 20:          # only scan the top of the file
                break
    return title, tag

entries = []
for fname in sorted(os.listdir(BLOGS_DIR)):
    if not fname.endswith(".md"):
        continue
    path  = os.path.join(BLOGS_DIR, fname)
    mtime = os.path.getmtime(path)
    date  = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d")
    title, tag = parse_md(path)
    if not title:
        title = stem_to_title(os.path.splitext(fname)[0])
    entry = {"file": fname, "title": title, "date": date}
    if tag:
        entry["tag"] = tag
    entries.append(entry)

# sort newest first
entries.sort(key=lambda e: e["date"], reverse=True)

with open(OUT_FILE, "w", encoding="utf-8") as f:
    json.dump(entries, f, indent=2, ensure_ascii=False)
    f.write("\n")

# ── README.md ──────────────────────────────────────────────────────────────
README = os.path.join(os.path.dirname(__file__), "README.md")
lines  = [
    "# eisenjiang37-gif.github.io",
    "",
    "Personal website of **Eisen Jiang** (Zihan Jiang / 蒋子涵).",
    "Built with plain HTML/CSS/JS, hosted on GitHub Pages.",
    "",
    "## Pages",
    "",
    "| # | Page | Description |",
    "|---|------|-------------|",
    "| 01 | [About](about.html) | Background, education, and research interests |",
    "| 02 | [Research](research.html) | Papers and projects |",
    "| 03 | [Blog](writing.html) | Notes and essays |",
    "| 04 | [Contact](contact.html) | Get in touch |",
    "",
    "## Blog Posts",
    "",
]
if entries:
    lines += ["| Date | Title | Tag |", "|------|-------|-----|"]
    for e in entries:
        tag  = e.get("tag", "")
        slug = e["file"].replace(".md", "")
        link = f"[{e['title']}](writing.html#{slug})"
        lines.append(f"| {e['date']} | {link} | {tag} |")
else:
    lines.append("_No posts yet._")

lines += [
    "",
    "## Dev",
    "",
    "Drop `.md` files into `blogs/` then run:",
    "```",
    "python3 gen_index.py",
    "```",
    "This regenerates `blogs/index.json` and this `README.md`.",
    "",
]

with open(README, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"Written {len(entries)} entr{'y' if len(entries)==1 else 'ies'} to {OUT_FILE}")
print(f"Written README.md")
for e in entries:
    print(f"  {e['date']}  {e['file']:<40}  {e['title']}")
