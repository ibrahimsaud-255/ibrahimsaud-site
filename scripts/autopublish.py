#!/usr/bin/env python3
# ============================================================
#  النشر التلقائي — المرحلة ١ (يشتغل داخل GitHub Actions)
#  يقرأ طابور النشر من Supabase ← ينزّل المقطع (yt-dlp) ←
#  يرفعه يوتيوب شورتس ← يحدّث الحالة والنتائج.
#
#  الأسرار المطلوبة (GitHub → Settings → Secrets and variables → Actions):
#    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
#    YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN
#  الدليل: docs/AUTOPUBLISH_SETUP.md
# ============================================================
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request

SUPA_URL = os.environ["SUPABASE_URL"].rstrip("/")
SERVICE = os.environ["SUPABASE_SERVICE_ROLE_KEY"]


def rest(method: str, path: str, body=None):
    req = urllib.request.Request(
        f"{SUPA_URL}/rest/v1/{path}",
        method=method,
        headers={
            "apikey": SERVICE,
            "Authorization": f"Bearer {SERVICE}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        data=json.dumps(body).encode() if body is not None else None,
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read() or "[]")


def set_status(item_id: str, status: str, results=None):
    body = {"status": status, "updated_at": "now()"}
    if results is not None:
        body["results"] = results
    rest("PATCH", f"publish_queue?id=eq.{item_id}", body)


def download_video(url: str, out: str) -> None:
    """تنزيل المقطع بأفضل جودة MP4 متاحة."""
    subprocess.run(
        ["yt-dlp", "-f", "mp4/bv*+ba/b", "--no-playlist", "-o", out, url],
        check=True,
        capture_output=True,
        text=True,
    )


def youtube_token() -> str:
    """access token من refresh token."""
    data = urllib.parse.urlencode({
        "client_id": os.environ["YT_CLIENT_ID"],
        "client_secret": os.environ["YT_CLIENT_SECRET"],
        "refresh_token": os.environ["YT_REFRESH_TOKEN"],
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["access_token"]


def upload_youtube(path: str, title: str, caption: str) -> str:
    """رفع المقطع كـ Short (فيديو عادي قصير عمودي = شورت تلقائياً)."""
    token = youtube_token()
    meta = {
        "snippet": {
            "title": (title or "مقطع جديد")[:95],
            "description": (caption or "") + "\n#Shorts",
            "categoryId": "22",
        },
        "status": {"privacyStatus": "public", "selfDeclaredMadeForKids": False},
    }
    # جلسة رفع resumable
    req = urllib.request.Request(
        "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
        method="POST",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        data=json.dumps(meta).encode(),
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        upload_url = r.headers["Location"]
    with open(path, "rb") as f:
        video = f.read()
    req2 = urllib.request.Request(
        upload_url,
        method="PUT",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "video/mp4"},
        data=video,
    )
    with urllib.request.urlopen(req2, timeout=600) as r2:
        vid = json.loads(r2.read())["id"]
    return f"https://www.youtube.com/shorts/{vid}"


def main() -> int:
    pending = rest("GET", "publish_queue?status=eq.pending&order=created_at.asc&limit=3")
    if not pending:
        print("لا مقاطع في الطابور.")
        return 0
    for item in pending:
        iid = item["id"]
        print(f"▶ معالجة {iid}: {item['video_url']}")
        set_status(iid, "processing")
        results = dict(item.get("results") or {})
        try:
            out = f"/tmp/{iid}.mp4"
            download_video(item["video_url"], out)
            platforms = item.get("platforms") or ["youtube"]
            if "youtube" in platforms:
                link = upload_youtube(out, item.get("title") or "", item.get("caption") or "")
                results["youtube"] = link
                print(f"  ✓ يوتيوب: {link}")
            set_status(iid, "done", results)
        except subprocess.CalledProcessError as e:
            msg = (e.stderr or str(e))[-500:]
            results["error"] = "فشل تنزيل المقطع: " + msg
            set_status(iid, "error", results)
            print(f"  ✗ {msg}", file=sys.stderr)
        except Exception as e:  # noqa: BLE001
            results["error"] = str(e)[:500]
            set_status(iid, "error", results)
            print(f"  ✗ {e}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
