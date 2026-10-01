"""
Runs a student's Python program against a list of test inputs.

Vercel's Node.js functions have no Python interpreter, so the Node server
(server.ts -> runPythonTests) calls this function when marking code questions.
Only the server can call it: requests must carry the shared x-runner-secret header.
"""
import hashlib
import hmac
import json
import os
import subprocess
import sys
import tempfile
from http.server import BaseHTTPRequestHandler

TIMEOUT_SECONDS = 4
MAX_OUTPUT = 50_000


def expected_secret() -> str:
    explicit = os.environ.get("TEACHER_TOKEN_SECRET")
    if explicit:
        return explicit
    # Must match getTokenSecret() in server.ts
    seed = "edexcel-token-secret:{}:{}".format(
        os.environ.get("GEMINI_API_KEY", ""),
        os.environ.get("TEACHER_PASSCODE", "4CP0-teacher"),
    )
    return hashlib.sha256(seed.encode("utf-8")).hexdigest()


def run_once(code: str, inputs, workdir: str):
    stdin_text = "\n".join(str(x) for x in (inputs or [])) + "\n" if inputs else ""
    try:
        proc = subprocess.run(
            [sys.executable, "-c", code],
            input=stdin_text,
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
            cwd=workdir,
        )
        out = proc.stdout[:MAX_OUTPUT]
        if proc.returncode == 0:
            return {"out": out, "err": None}
        return {"out": out, "err": proc.stderr.strip() or "Program exited with code {}".format(proc.returncode)}
    except subprocess.TimeoutExpired as e:
        partial = e.stdout.decode("utf-8", "replace") if isinstance(e.stdout, bytes) else (e.stdout or "")
        return {"out": partial[:MAX_OUTPUT], "err": "Execution timed out (exceeded 4s limit)."}
    except Exception as e:  # pragma: no cover
        return {"out": "", "err": str(e)}


class handler(BaseHTTPRequestHandler):
    def _send(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        given = self.headers.get("x-runner-secret", "")
        if not hmac.compare_digest(given, expected_secret()):
            self._send(401, {"error": "unauthorized"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            data = json.loads(self.rfile.read(length) or b"{}")
        except Exception:
            self._send(400, {"error": "invalid JSON"})
            return

        code = data.get("code")
        tests = data.get("tests") or []
        files = data.get("files") or {}
        if not isinstance(code, str) or not isinstance(tests, list) or len(tests) > 50:
            self._send(400, {"error": "invalid request"})
            return

        results = []
        for inputs in tests:
            # Fresh folder per test so file-handling questions start from the same files.
            with tempfile.TemporaryDirectory() as workdir:
                for name, content in files.items():
                    safe = os.path.basename(str(name))
                    if safe:
                        with open(os.path.join(workdir, safe), "w", encoding="utf-8") as fh:
                            fh.write(str(content))
                results.append(run_once(code, inputs, workdir))

        self._send(200, {"results": results})

    def do_GET(self):
        self._send(200, {"ok": True, "python": sys.version.split()[0]})
