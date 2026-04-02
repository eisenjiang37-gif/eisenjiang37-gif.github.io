#!/usr/bin/env python3
"""
watch.py — watch for file changes, auto-push, then open the live site.

Usage:
    python3 watch.py          # watches everything, opens GitHub Pages after push
    python3 watch.py --local  # also starts python3 -m http.server on :8080

Ignores: .git/, __pycache__/, *.py, node_modules/
"""
import os, sys, time, subprocess, hashlib, threading, http.server, webbrowser

ROOT      = os.path.dirname(os.path.abspath(__file__))
SITE_URL  = "https://eisenjiang37-gif.github.io"
LOCAL_URL = "http://localhost:8080"
POLL_SEC  = 1.5

IGNORE_DIRS  = {'.git', '__pycache__', 'node_modules', '.claude'}
IGNORE_EXTS  = {'.py'}   # don't trigger on script edits
IGNORE_FILES = {'watch.py', 'gen_index.py', 'README.md'}


def file_sig(path):
    try:
        with open(path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    except OSError:
        return None


def snapshot():
    sigs = {}
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for fname in filenames:
            if fname in IGNORE_FILES:
                continue
            ext = os.path.splitext(fname)[1]
            if ext in IGNORE_EXTS:
                continue
            path = os.path.join(dirpath, fname)
            sigs[path] = file_sig(path)
    return sigs


def changed_files(old, new):
    added    = [p for p in new if p not in old]
    removed  = [p for p in old if p not in new]
    modified = [p for p in new if p in old and new[p] != old[p]]
    return added + removed + modified


def run(cmd, **kw):
    return subprocess.run(cmd, shell=True, cwd=ROOT, capture_output=True, text=True, **kw)


def deploy(changed):
    print(f"\n[watch] {len(changed)} file(s) changed:")
    for p in changed:
        print(f"  {os.path.relpath(p, ROOT)}")

    # regenerate blog index if any md changed
    if any(p.endswith('.md') and 'blogs/' in p for p in changed):
        print("[watch] regenerating blogs/index.json …")
        r = run("python3 gen_index.py")
        if r.returncode != 0:
            print("[watch] gen_index.py failed:", r.stderr)

    # stage + commit + push
    run("git add -A")
    r = run('git diff --cached --quiet')
    if r.returncode == 0:
        print("[watch] nothing staged — skipping commit")
        return

    msg = "auto: " + ", ".join(os.path.relpath(p, ROOT) for p in changed[:3])
    if len(changed) > 3:
        msg += f" (+{len(changed)-3} more)"
    run(f'git commit -m "{msg}\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"')
    r = run("git push")
    if r.returncode == 0:
        print(f"[watch] pushed → {SITE_URL}")
        # GitHub Pages usually deploys in ~30s
        print("[watch] opening site in 35s (GH Pages build time) …")
        threading.Timer(35, lambda: webbrowser.open(SITE_URL)).start()
    else:
        print("[watch] push failed:", r.stderr)


def start_local_server():
    import socketserver
    handler = http.server.SimpleHTTPRequestHandler
    handler.log_message = lambda *a: None   # silence logs
    os.chdir(ROOT)
    with socketserver.TCPServer(("", 8080), handler) as httpd:
        print(f"[watch] local server at {LOCAL_URL}")
        webbrowser.open(LOCAL_URL)
        httpd.serve_forever()


if __name__ == "__main__":
    local = "--local" in sys.argv

    if local:
        t = threading.Thread(target=start_local_server, daemon=True)
        t.start()

    print(f"[watch] watching {ROOT}")
    print(f"[watch] poll interval {POLL_SEC}s  |  Ctrl-C to stop\n")

    prev = snapshot()
    try:
        while True:
            time.sleep(POLL_SEC)
            curr = snapshot()
            diff = changed_files(prev, curr)
            if diff:
                prev = curr
                deploy(diff)
            else:
                prev = curr   # update for new files added while no change
    except KeyboardInterrupt:
        print("\n[watch] stopped.")
