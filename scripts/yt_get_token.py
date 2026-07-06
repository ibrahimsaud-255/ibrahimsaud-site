#!/usr/bin/env python3
# ============================================================
#  توليد YT_REFRESH_TOKEN — تشغّله مرة واحدة على جهازك:
#    python3 scripts/yt_get_token.py CLIENT_ID CLIENT_SECRET
#  يفتح المتصفح لتسجيل دخول قناتك ← يطبع لك الـ refresh token.
#  التفاصيل خطوة بخطوة في: docs/AUTOPUBLISH_SETUP.md
# ============================================================
import http.server
import json
import sys
import threading
import urllib.parse
import urllib.request
import webbrowser

if len(sys.argv) != 3:
    print("الاستخدام: python3 scripts/yt_get_token.py CLIENT_ID CLIENT_SECRET")
    sys.exit(1)

CLIENT_ID, CLIENT_SECRET = sys.argv[1], sys.argv[2]
REDIRECT = "http://localhost:8765/"
SCOPE = "https://www.googleapis.com/auth/youtube.upload"
code_holder = {}


class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        code_holder["code"] = (q.get("code") or [""])[0]
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write("<h2>تم! ارجع للترمنال ✅</h2>".encode())

    def log_message(self, *a):  # noqa: D102
        pass


srv = http.server.HTTPServer(("localhost", 8765), H)
threading.Thread(target=srv.handle_request, daemon=True).start()

auth = ("https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({
    "client_id": CLIENT_ID,
    "redirect_uri": REDIRECT,
    "response_type": "code",
    "scope": SCOPE,
    "access_type": "offline",
    "prompt": "consent",
}))
print("افتح الرابط وسجّل دخول قناتك:\n", auth)
webbrowser.open(auth)

while "code" not in code_holder:
    pass

data = urllib.parse.urlencode({
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "code": code_holder["code"],
    "redirect_uri": REDIRECT,
    "grant_type": "authorization_code",
}).encode()
req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data, method="POST")
tok = json.loads(urllib.request.urlopen(req).read())
print("\n================ انسخ هذا ================")
print("YT_REFRESH_TOKEN =", tok.get("refresh_token"))
print("==========================================")
