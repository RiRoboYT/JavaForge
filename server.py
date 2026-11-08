"""
JavaForge local server.

Run it with:  python server.py      (or double-click start.bat on Windows)

It serves JavaForge at http://localhost:8000 and answers /run.php exactly like
run.php does on a web host: it forwards your code to OnlineCompiler.io and adds
the API key from secret.php. Only this computer can connect to it.
Uses only the Python standard library — nothing to install.
"""

import http.server
import json
import os
import re
import socketserver
import sys
import threading
import urllib.error
import urllib.request
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
API_URL = os.environ.get("JAVAFORGE_API_URL", "https://api.onlinecompiler.io/api/run-code-sync/")
COMPILER = "openjdk-25"
MAX_CODE = 65536
MAX_INPUT = 65536
TIMEOUT = 60
HOST = "127.0.0.1"
PORTS = range(8000, 8011)

# Files that must never be served to the browser
BLOCKED = {"secret.php", "secret.example.php", "server.py", "javaforgeserver.java", "start.bat", "config.js", "run.php"}


def api_key():
    env = os.environ.get("JAVAFORGE_API_KEY", "").strip()
    if env:
        return env
    path = os.path.join(ROOT, "secret.php")
    try:
        with open(path, encoding="utf-8") as f:
            m = re.search(r"return\s*['\"]([^'\"]+)['\"]", f.read())
        if m and "PASTE" not in m.group(1).upper():
            return m.group(1).strip()
    except OSError:
        pass
    return ""


class Handler(http.server.SimpleHTTPRequestHandler):
    server_version = "JavaForge"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        pass  # keep the window quiet

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _path(self):
        return self.path.split("?", 1)[0].split("#", 1)[0]

    def do_GET(self):
        path = self._path()
        if path == "/run.php":
            return self._json(200, {"ok": True, "server": "local-python", "hasKey": bool(api_key())})
        name = os.path.basename(path).lower()
        if name in BLOCKED or name.startswith("."):
            return self.send_error(404)
        return super().do_GET()

    def do_HEAD(self):
        return self.do_GET()

    def do_POST(self):
        if self._path() != "/run.php":
            return self.send_error(404)
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0
        if length <= 0 or length > (MAX_CODE + MAX_INPUT) * 4 + 1024:
            return self._json(413 if length > 0 else 400, {"error": "Bad request size."})
        try:
            req = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return self._json(400, {"error": 'Bad request: expected JSON with "code".'})
        code = req.get("code") if isinstance(req, dict) else None
        stdin = req.get("input", "") if isinstance(req, dict) else ""
        if not isinstance(code, str) or not code.strip():
            return self._json(400, {"error": "There is no code to run."})
        if not isinstance(stdin, str):
            stdin = ""
        if len(code) > MAX_CODE or len(stdin) > MAX_INPUT:
            return self._json(413, {"error": "The program or input is too long."})
        key = api_key()
        if not key:
            return self._json(500, {"error": "No API key found. Put your OnlineCompiler.io key in secret.php."})

        payload = json.dumps({"compiler": COMPILER, "code": code, "input": stdin}).encode("utf-8")
        upstream = urllib.request.Request(
            API_URL,
            data=payload,
            method="POST",
            headers={"Authorization": key, "Content-Type": "application/json", "Accept": "application/json", "User-Agent": "JavaForge"},
        )
        try:
            with urllib.request.urlopen(upstream, timeout=TIMEOUT) as res:
                status, body = res.status, res.read()
        except urllib.error.HTTPError as e:
            status, body = e.code, e.read()
        except Exception as e:  # network error, timeout, SSL problem…
            return self._json(502, {"error": f"Could not reach OnlineCompiler.io ({e})."})

        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = False


def main():
    server = None
    for port in PORTS:
        try:
            server = Server((HOST, port), Handler)
            break
        except OSError:
            continue
    if server is None:
        print("Ports 8000-8010 are all busy. Close other servers and try again.")
        sys.exit(1)

    url = f"http://localhost:{server.server_address[1]}/"
    print("=" * 52)
    print("  JavaForge is running at", url)
    print("  API key:", "found in secret.php" if api_key() else "MISSING - add it to secret.php")
    print("  Keep this window open while you use JavaForge.")
    print("  Press Ctrl+C (or close this window) to stop.")
    print("=" * 52)
    if "--no-browser" not in sys.argv:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nJavaForge stopped.")


if __name__ == "__main__":
    main()
