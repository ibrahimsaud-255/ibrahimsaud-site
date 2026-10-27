"""
ff2board.py — يحوّل لوحات Freeform المصدَّرة PDF إلى لوحات نظام إبراهيم (S.boards).
الاستخدام: python3 ff2board.py <مجلد-PDF> <ملف-الإخراج.json>
- الصور: تُستخرج أصليّةً من الـPDF بمواقعها وأحجامها (JPEG/PNG مضغوطة كـ data URL).
- الأشكال والملاحظات: من رسوم الـPDF المعبّأة (لون، مستطيل/مدوّر/دائرة).
- الخطوط والأسهم والرسم الحرّ: من المسارات المرسومة (stroke) → عناصر draw.
- النصوص: تصدير Freeform يكسر تشكيل العربية في الـPDF، فنأخذ موضع النص وحجمه
  ولونه من الـPDF ونقرأ الكلمات نفسها بالتعرّف الضوئي (Vision في macOS).
"""
import base64, hashlib, io, json, os, subprocess, sys, tempfile
import fitz  # PyMuPDF

HERE = os.path.dirname(os.path.abspath(__file__))
OCR = os.path.join(HERE, 'ocr')
MAXW = 1400  # أقصى عرض للصورة المضمّنة


def hx(c):
    if c is None:
        return None
    if isinstance(c, int):
        return '#%06x' % c
    return '#%02x%02x%02x' % tuple(max(0, min(255, round(v * 255))) for v in c[:3])


def uid(*parts):
    return 'ff' + hashlib.md5('|'.join(map(str, parts)).encode()).hexdigest()[:12]


def img_data_url(doc, xref):
    pm = fitz.Pixmap(doc, xref)
    if pm.alpha or pm.n > 3:
        pm = fitz.Pixmap(fitz.csRGB, pm) if pm.n - pm.alpha > 3 else pm
    if pm.width > MAXW:
        pm = fitz.Pixmap(pm, MAXW, round(pm.height * MAXW / pm.width), None)
    if pm.alpha:
        data, mime = pm.tobytes('png'), 'image/png'
    else:
        data, mime = pm.tobytes('jpeg', jpg_quality=82), 'image/jpeg'
    return 'data:%s;base64,%s' % (mime, base64.b64encode(data).decode())


def inside(a, b, tol=4):
    return a[0] >= b[0] - tol and a[1] >= b[1] - tol and a[2] <= b[2] + tol and a[3] <= b[3] + tol


def overlap(a, b):
    return not (a[2] < b[0] or b[2] < a[0] or a[3] < b[1] or b[3] < a[1])


def sample_items(items):
    """نقاط مسار (خطوط ومنحنيات بيزييه) لعنصر رسم."""
    pts = []
    for it in items:
        k = it[0]
        if k == 'l':
            a, b = it[1], it[2]
            if not pts:
                pts.append((a.x, a.y))
            pts.append((b.x, b.y))
        elif k == 'c':
            p0, p1, p2, p3 = it[1], it[2], it[3], it[4]
            if not pts:
                pts.append((p0.x, p0.y))
            for i in range(1, 9):
                t = i / 8
                mt = 1 - t
                x = mt**3 * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t**3 * p3.x
                y = mt**3 * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t**3 * p3.y
                pts.append((x, y))
        elif k == 're':
            r = it[1]
            pts += [(r.x0, r.y0), (r.x1, r.y0), (r.x1, r.y1), (r.x0, r.y1), (r.x0, r.y0)]
    return [[round(x), round(y)] for x, y in pts]


def shape_kind(d, r):
    n_c = sum(1 for it in d['items'] if it[0] == 'c')
    n_l = sum(1 for it in d['items'] if it[0] == 'l')
    if n_c >= 4 and n_l == 0:
        return 'ellipse' if abs(r.width - r.height) < 0.15 * max(r.width, r.height) or n_c == 4 else 'pill'
    if n_c >= 4:
        rad = min(r.width, r.height)
        return 'pill' if n_l <= 2 and n_c >= 4 and rad < 0.55 * max(r.width, r.height) and n_l == 2 else 'round'
    return 'rect'


def ocr_regions(page, rects, tmp):
    """يرسم كل منطقة نص بدقّة عالية ويقرأها بالتعرّف الضوئي."""
    paths = []
    for i, r in enumerate(rects):
        x0, y0, x1, y1 = r
        clip = fitz.Rect(x0 - 6, y0 - 6, x1 + 6, y1 + 6) & page.rect
        pm = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=clip, alpha=False)
        p = os.path.join(tmp, 't%d.png' % i)
        pm.save(p)
        paths.append(p)
    if not paths:
        return []
    res = subprocess.run([OCR] + paths, capture_output=True, text=True, timeout=600)
    got = {o['path']: o['text'] for o in json.loads(res.stdout or '[]')}
    return [got.get(p, '') for p in paths]


def convert(pdf_path):
    doc = fitz.open(pdf_path)
    page = doc[0]
    name = os.path.splitext(os.path.basename(pdf_path))[0]
    items, z = [], 0

    def nz():
        nonlocal z
        z += 1
        return z

    # الصور
    img_rects = []
    for info in page.get_image_info(xrefs=True):
        x0, y0, x1, y1 = info['bbox']
        if x1 - x0 < 4 or y1 - y0 < 4 or not info.get('xref'):
            continue
        try:
            url = img_data_url(doc, info['xref'])
        except Exception:
            continue
        img_rects.append((x0, y0, x1, y1))
        items.append({'id': uid(name, 'img', info['xref'], x0, y0), 'type': 'image', 'x': round(x0), 'y': round(y0),
                      'w': round(x1 - x0), 'h': round(y1 - y0), 'z': nz(), 'url': url, 'radius': 0})

    # الأشكال (معبّأة) والخطوط (مرسومة)
    shapes = []
    for d in page.get_drawings():
        r = d['rect']
        if d.get('fill') is not None and r.width > 24 and r.height > 18 and d.get('fill_opacity', 1) > 0.05:
            if r.width > page.rect.width * 0.95 and r.height > page.rect.height * 0.95:
                continue  # خلفيّة الصفحة
            fill = hx(d['fill'])
            kind = shape_kind(d, r)
            sh = {'id': uid(name, 'shp', r.x0, r.y0, r.x1, r.y1), 'type': 'shape', 'shape': kind, 'x': round(r.x0), 'y': round(r.y0),
                  'w': round(r.width), 'h': round(r.height), 'z': nz(), 'fill': fill, 'text': '', 'fontSize': 16}
            shapes.append(sh)
            items.append(sh)
        elif d.get('color') is not None and d.get('fill') is None:
            pts = sample_items(d['items'])
            if len(pts) >= 2:
                items.append({'id': uid(name, 'drw', r.x0, r.y0, r.x1, r.y1, len(pts)), 'type': 'draw', 'stroke': hx(d['color']),
                              'sw': max(1, round(d.get('width') or 2)), 'points': pts, 'z': nz()})

    # النصوص: كتلة لكل مربّع نصّ، حجم ولون من الـPDF، والكلمات من التعرّف الضوئي
    blocks = []
    for b in page.get_text('dict')['blocks']:
        if b['type'] != 0:
            continue
        spans = [s for l in b['lines'] for s in l['spans'] if s['text'].strip()]
        if not spans:
            continue
        bb = b['bbox']
        if any(inside(bb, ir, 2) for ir in img_rects):
            continue  # نصّ داخل صورة (لقطات شاشة) — يبقى جزءاً من الصورة
        size = max(s['size'] for s in spans)
        col = max(spans, key=lambda s: len(s['text']))['color']
        blocks.append({'bbox': bb, 'size': size, 'color': hx(col)})
    # دمج الكتل المتجاورة لنفس مربّع النصّ (أسطر متتالية)
    blocks.sort(key=lambda b: (b['bbox'][1], b['bbox'][0]))
    merged = []
    for b in blocks:
        m = next((m for m in merged if abs(m['size'] - b['size']) < 1 and b['bbox'][1] - m['bbox'][3] < m['size'] * 0.8
                  and overlap((m['bbox'][0] - 20, 0, m['bbox'][2] + 20, 1), (b['bbox'][0], 0, b['bbox'][2], 1))), None)
        if m:
            m['bbox'] = (min(m['bbox'][0], b['bbox'][0]), min(m['bbox'][1], b['bbox'][1]), max(m['bbox'][2], b['bbox'][2]), max(m['bbox'][3], b['bbox'][3]))
        else:
            merged.append(dict(b))
    with tempfile.TemporaryDirectory() as tmp:
        texts = ocr_regions(page, [m['bbox'] for m in merged], tmp)
    for m, t in zip(merged, texts):
        t = (t or '').strip()
        if not t:
            continue
        x0, y0, x1, y1 = m['bbox']
        host = next((s for s in shapes if inside((x0, y0, x1, y1), (s['x'], s['y'], s['x'] + s['w'], s['y'] + s['h']), 6)), None)
        fs = max(10, min(96, round(m['size'])))
        if host and not host['text']:
            host['text'] = t
            host['fontSize'] = fs
            host['color'] = m['color']
            continue
        items.append({'id': uid(name, 'txt', x0, y0), 'type': 'text', 'x': round(x0 - (x1 - x0) * 0.08) - 4, 'y': round(y0) - 4, 'w': round((x1 - x0) * 1.16) + 8,
                      'h': round(y1 - y0) + 8, 'z': nz(), 'text': t, 'fontSize': fs, 'color': m['color'] if m['color'] != '#000000' else None,
                      'bold': False})
    # الأشكال الصفراء بحجم الملاحظة اللاصقة → ملاحظة
    for s in shapes:
        if s['shape'] in ('rect', 'round') and 0.8 < s['w'] / max(1, s['h']) < 1.25 and s['w'] >= 120:
            s['type'] = 'note'
            del s['shape']
    for it in items:
        if it.get('color') is None:
            it.pop('color', None)
    raw = open(pdf_path, 'rb').read()
    return {'id': uid('board', name, hashlib.md5(raw).hexdigest()), 'name': name, 'items': items, 'edges': [],
            'view': {'x': 0, 'y': 0, 'zoom': 1}, 'src': {'app': 'freeform', 'name': name, 'hash': hashlib.md5(raw).hexdigest()}}


def main():
    src, out = sys.argv[1], sys.argv[2]
    pdfs = sorted(os.path.join(src, f) for f in os.listdir(src) if f.lower().endswith('.pdf'))
    boards = []
    for p in pdfs:
        try:
            b = convert(p)
            boards.append(b)
            print('✓', b['name'], len(b['items']), 'عنصر', file=sys.stderr)
        except Exception as e:
            print('✗', p, e, file=sys.stderr)
    json.dump({'format': 'ibrahimsaud-boards', 'version': 1, 'source': 'Apple Freeform', 'boards': boards}, open(out, 'w'), ensure_ascii=False)
    print(out, os.path.getsize(out) // 1024, 'KB', file=sys.stderr)


if __name__ == '__main__':
    main()
