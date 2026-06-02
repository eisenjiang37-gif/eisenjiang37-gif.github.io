# eisenjiang37-gif.github.io

Personal website of **Eisen Jiang** (Zihan Jiang / 蒋子涵).
Built with plain HTML/CSS/JS, hosted on GitHub Pages.

## Pages

| # | Page | Description |
|---|------|-------------|
| 01 | [About](about.html) | Background, education, and research interests |
| 02 | [Research](research.html) | Papers and projects |
| 03 | [Blog](writing.html) | Notes and essays |
| 04 | [Contact](contact.html) | Get in touch |

## Blog Posts

| Date | Title | Tag |
|------|-------|-----|
| 2026-06-02 | [CUDA Programming](writing.html#cuda) |  |
| 2026-06-02 | [Quantlearning](writing.html#quantlearning) |  |
| 2026-06-02 | [Vector C++](writing.html#vector-c) |  |
| 2026-06-02 | [Test](writing.html#test) |  |

## Dev

Drop `.md` files into `blogs/` and push. GitHub Actions runs:
```
python3 gen_index.py
```
This compiles markdown → HTML, regenerates `blogs/index.json`, `blogs/index.js`, and this `README.md`.

For local preview before pushing, run the same command manually.

Serve locally with:
```
python3 -m http.server
```
