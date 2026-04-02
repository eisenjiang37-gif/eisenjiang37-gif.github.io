window.__BLOGS_INDEX__ = [
  {
    "file": "QuantLearning.md",
    "slug": "quantlearning",
    "title": "Quantlearning",
    "date": "2026-04-01",
    "html": "<p>Here I will share my quantum learning and attempts at investing.</p>"
  },
  {
    "file": "notes-on-tensor-permute.md",
    "slug": "notes-on-tensor-permute",
    "title": "Notes on tensor.permute and view: What I Got Wrong for Too Long",
    "date": "2026-03-31",
    "html": "<h1>Notes on tensor.permute and view: What I Got Wrong for Too Long</h1>\n<p>These are working notes, not a tutorial. I kept making the same mistake and eventually decided to write it down.</p>\n<hr>\n<h2>The core confusion</h2>\n<p>I treated <code>permute</code> and <code>view</code> as interchangeable ways to reshape a tensor. They are not.</p>\n<ul><li><strong><code>view</code></strong> reinterprets the raw memory layout without moving any data. It only works when the tensor is <em>contiguous</em> — i.e. elements are stored in C-order row-major with no gaps.</li><li><strong><code>permute</code></strong> reorders the <em>axes</em>, which changes the logical shape but does <strong>not</strong> rearrange memory. The result is almost always non-contiguous.</li></ul>\n<p>The problem: after a <code>permute</code>, calling <code>view</code> raises a RuntimeError because the underlying storage is no longer contiguous. The fix is to call <code>.contiguous()</code> first (which copies data into a fresh contiguous buffer), then <code>view</code>.</p>\n<pre><code class=\"language-python\">x = torch.randn(2, 3, 4)\n\n# permute reorders axes: (2,3,4) -&gt; (2,4,3)\nx_t = x.permute(0, 2, 1)\nprint(x_t.is_contiguous())  # False\n\n# this fails:\n# x_t.view(2, 12)  -&gt; RuntimeError\n\n# this works:\nx_t.contiguous().view(2, 12)\n\n# or just use reshape, which handles this automatically:\nx_t.reshape(2, 12)</code></pre>\n<hr>\n<h2>When reshape saves you (and when it doesn't)</h2>\n<p><code>reshape</code> is the safe default — it calls <code>view</code> if contiguous, otherwise allocates and copies. For most forward-pass code this is fine.</p>\n<p>Where it matters: inside tight training loops, an unexpected <code>.contiguous()</code> call inside <code>reshape</code> allocates new memory every step. On large spatiotemporal tensors (video models, radar spectrograms) this adds up. Profile before assuming it is free.</p>\n<hr>\n<h2>The spatiotemporal case</h2>\n<p>Working on action recognition, tensors frequently have shape <code>(B, T, C, H, W)</code>. A typical operation:</p>\n<pre><code class=\"language-python\"># Merge time and batch for a 2D conv:\nx = x.permute(0, 2, 1, 3, 4)   # (B, C, T, H, W)\nx = x.reshape(B * C, T, H * W)  # flatten spatial</code></pre>\n<p>After the <code>permute</code> the tensor is non-contiguous. <code>reshape</code> handles it, but if you need <code>view</code> (e.g. for in-place ops or when you want to be explicit), add <code>.contiguous()</code>:</p>\n<pre><code class=\"language-python\">x = x.permute(0, 2, 1, 3, 4).contiguous().view(B * C, T, H * W)</code></pre>\n<hr>\n<h2>Rule of thumb</h2>\n<table><thead><tr><th>Operation</th><th>Moves data?</th><th>Safe after permute?</th></tr></thead><tbody><tr><td><code>view</code></td><td>No</td><td>No (raises error)</td></tr><tr><td><code>reshape</code></td><td>Sometimes</td><td>Yes</td></tr><tr><td><code>.contiguous().view</code></td><td>Yes (copy)</td><td>Yes</td></tr></tbody></table>\n<p>Use <code>reshape</code> unless you need the guarantee that no copy happens, in which case check <code>.is_contiguous()</code> first.</p>\n<hr>\n<p><em>Last updated: March 2026</em></p>"
  },
  {
    "file": "test.md",
    "slug": "test",
    "title": "Test",
    "date": "2026-03-31",
    "html": ""
  }
];
