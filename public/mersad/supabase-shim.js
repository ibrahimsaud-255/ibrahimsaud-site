// ═══════════════════════════════════════════════════════════════════
//  Supabase shim — طبقة توافق تعوّض Firebase (Auth + Firestore + Storage)
//  بقاعدة بيانات إبراهيم (Supabase) — نفس واجهات Firebase التي يستوردها مرصاد،
//  فيبقى كود التطبيق الأصلي دون تغيير تقريباً.
//
//  البيانات تُخزَّن في جدول واحد: mersad_docs (path, parent, data jsonb)
//  كل "مستند" فايرستور = صف، ومساره الكامل هو المفتاح.
//  شغّل mersad-setup.sql في Supabase SQL Editor مرة واحدة قبل الاستخدام.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPA_URL = 'https://rrerwhhxrjyzmnnjsfev.supabase.co';
const SUPA_KEY = 'sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13';
const TABLE    = 'mersad_docs';
const BUCKET   = 'task-images'; // نفس bucket نظام حروف ودروس

export const sb = createClient(SUPA_URL, SUPA_KEY);

// ── App ──────────────────────────────────────────────────────────────
const _app = { name: 'mersad-supabase' };
export function initializeApp() { return _app; }
export function getApp() { return _app; }

// ── Auth ─────────────────────────────────────────────────────────────
function _mapUser(su) {
  if (!su) return null;
  const md = su.user_metadata || {};
  return {
    uid: su.id,
    email: su.email || null,
    displayName: md.displayName || md.full_name || md.name || null,
    photoURL: md.photoURL || md.avatar_url || null,
    emailVerified: !!su.email_confirmed_at,
  };
}

const _auth = { currentUser: null, app: _app };
export const indexedDBLocalPersistence   = 'indexedDB';
export const browserLocalPersistence     = 'local';
export const browserPopupRedirectResolver = 'popup';
export function initializeAuth() { return _auth; }
export function getAuth() { return _auth; }

function _authError(error) {
  const m = (error && error.message) || 'خطأ غير معروف';
  let code = 'auth/error';
  if (/invalid login credentials/i.test(m)) code = 'auth/invalid-credential';
  if (/already registered/i.test(m))        code = 'auth/email-already-in-use';
  if (/at least|password/i.test(m))         code = 'auth/weak-password';
  if (/rate|too many/i.test(m))             code = 'auth/too-many-requests';
  const err = new Error(m); err.code = code;
  return err;
}

export function onAuthStateChanged(auth, cb) {
  let lastUid;         // undefined = لم يُستدعَ بعد
  const emit = (su) => {
    const u = _mapUser(su);
    const uid = u ? u.uid : null;
    if (lastUid !== undefined && lastUid === uid) return; // تجاهل TOKEN_REFRESHED وأمثاله
    lastUid = uid;
    _auth.currentUser = u;
    cb(u);
  };
  sb.auth.getSession().then(({ data }) => emit(data?.session?.user || null));
  const { data: sub } = sb.auth.onAuthStateChange((_event, session) => emit(session?.user || null));
  return () => sub.subscription.unsubscribe();
}

export async function signInWithEmailAndPassword(auth, email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw _authError(error);
  _auth.currentUser = _mapUser(data.user);
  return { user: _auth.currentUser };
}

export async function createUserWithEmailAndPassword(auth, email, password) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw _authError(error);
  if (!data.session) {
    const err = new Error('تم إنشاء الحساب — أكّد بريدك الإلكتروني ثم سجّل الدخول.');
    err.code = 'auth/confirm-email';
    throw err;
  }
  _auth.currentUser = _mapUser(data.user);
  return { user: _auth.currentUser };
}

export async function signOut() { await sb.auth.signOut(); _auth.currentUser = null; }

export async function updateProfile(user, { displayName, photoURL } = {}) {
  const patch = {};
  if (displayName !== undefined) patch.displayName = displayName;
  if (photoURL    !== undefined) patch.photoURL = photoURL;
  const { error } = await sb.auth.updateUser({ data: patch });
  if (error) throw _authError(error);
}

export async function updateEmail(user, newEmail) {
  const { error } = await sb.auth.updateUser({ email: newEmail });
  if (error) throw _authError(error);
}

export class GoogleAuthProvider {
  static credential() { const e = new Error('غير مدعوم'); e.code = 'auth/unsupported'; throw e; }
}
export class EmailAuthProvider {
  static credential() { const e = new Error('غير مدعوم'); e.code = 'auth/unsupported'; throw e; }
}
async function _oauthGoogle() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin + location.pathname },
  });
  if (error) throw _authError(error);
  return new Promise(() => {}); // سيُعاد تحميل الصفحة عبر التحويل
}
export function signInWithPopup()    { return _oauthGoogle(); }
export function signInWithRedirect() { return _oauthGoogle(); }
export async function signInWithCredential() { const e = new Error('غير مدعوم'); e.code = 'auth/unsupported'; throw e; }
export async function linkWithCredential()   { const e = new Error('غير مدعوم'); e.code = 'auth/unsupported'; throw e; }
export async function getRedirectResult()    { return null; }

// ── Firestore ────────────────────────────────────────────────────────
export function getFirestore() { return { _db: true }; }

function _segsFrom(base, segs) {
  // doc(db, 'a','b') أو doc(colRef,'id') أو collection(docRef,'sub')
  if (base && base._db) return segs;
  if (base && base._path) return [...base._path.split('/'), ...segs];
  throw new Error('مرجع غير صالح');
}

export function doc(base, ...segs) {
  const parts = _segsFrom(base, segs).filter(Boolean);
  if (parts.length % 2 !== 0) throw new Error('مسار مستند غير صالح: ' + parts.join('/'));
  const path = parts.join('/');
  return { _type: 'doc', _path: path, id: parts[parts.length - 1], parent: parts.slice(0, -1).join('/') };
}

export function collection(base, ...segs) {
  const parts = _segsFrom(base, segs).filter(Boolean);
  if (parts.length % 2 !== 1) throw new Error('مسار مجموعة غير صالح: ' + parts.join('/'));
  return { _type: 'col', _path: parts.join('/') };
}

export function where(field, op, value) {
  if (op !== '==') throw new Error('الشيم يدعم == فقط');
  return { _type: 'where', field, value };
}
export function orderBy(field, dir = 'asc') { return { _type: 'orderBy', field, dir }; }
export function query(col, ...constraints) {
  const q = { _type: 'query', _col: col._type === 'query' ? col._col : col, _wheres: [...(col._wheres || [])], _order: col._order || null };
  for (const c of constraints) {
    if (c._type === 'where') q._wheres.push(c);
    if (c._type === 'orderBy') q._order = c;
  }
  return q;
}

export function serverTimestamp() { return { _ts: new Date().toISOString() }; }
export function arrayUnion()  { throw new Error('arrayUnion غير مدعوم في الشيم'); }
export function arrayRemove() { throw new Error('arrayRemove غير مدعوم في الشيم'); }

// إحياء الطوابع الزمنية: {_ts} → كائن فيه toDate()
function _revive(v) {
  if (v === null || typeof v !== 'object') return v;
  if (typeof v._ts === 'string') return { _ts: v._ts, toDate: () => new Date(v._ts) };
  if (Array.isArray(v)) return v.map(_revive);
  const out = {};
  for (const k of Object.keys(v)) out[k] = _revive(v[k]);
  return out;
}
// تنظيف قبل التخزين: إسقاط undefined والدوال، وتحويل Date إلى {_ts}
function _clean(v) {
  if (v === null) return null;
  if (v instanceof Date) return { _ts: v.toISOString() };
  if (Array.isArray(v)) return v.filter(x => x !== undefined && typeof x !== 'function').map(_clean);
  if (typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) {
      const x = v[k];
      if (x === undefined || typeof x === 'function') continue;
      out[k] = _clean(x);
    }
    return out;
  }
  return typeof v === 'function' ? null : v;
}

function _docSnap(id, path, data) {
  return { id, ref: { _type: 'doc', _path: path, id }, exists: () => data !== null && data !== undefined, data: () => (data == null ? undefined : _revive(data)) };
}

// إشعار محلي للمستمعين بعد كل كتابة (نفس التبويب + التبويبات الأخرى)
const _localBus = new EventTarget();
const _bc = 'BroadcastChannel' in window ? new BroadcastChannel('mersad-sb-shim') : null;
function _notify(path, parent) {
  const detail = { path, parent };
  _localBus.dispatchEvent(new CustomEvent('write', { detail }));
  if (_bc) _bc.postMessage(detail);
}

export async function getDoc(ref) {
  const { data, error } = await sb.from(TABLE).select('data').eq('path', ref._path).maybeSingle();
  if (error) throw error;
  return _docSnap(ref.id, ref._path, data ? data.data : null);
}

export async function setDoc(ref, value, opts) {
  let payload = _clean(value);
  if (opts && opts.merge) {
    const existing = await sb.from(TABLE).select('data').eq('path', ref._path).maybeSingle();
    if (existing.data) payload = { ...existing.data.data, ...payload };
  }
  const { error } = await sb.from(TABLE).upsert({
    path: ref._path, parent: ref.parent, data: payload, updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  _notify(ref._path, ref.parent);
}

export async function updateDoc(ref, patch) {
  const existing = await sb.from(TABLE).select('data').eq('path', ref._path).maybeSingle();
  if (existing.error) throw existing.error;
  if (!existing.data) { const e = new Error('المستند غير موجود'); e.code = 'not-found'; throw e; }
  await setDoc(ref, { ...existing.data.data, ..._clean(patch) });
}

export async function deleteDoc(ref) {
  const { error } = await sb.from(TABLE).delete().eq('path', ref._path);
  if (error) throw error;
  _notify(ref._path, ref.parent);
}

export async function addDoc(col, value) {
  const id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2));
  const ref = doc(col, id);
  await setDoc(ref, value);
  return ref;
}

function _tsSortKey(raw, field) {
  const v = raw && raw[field];
  if (v && typeof v === 'object' && v._ts) return v._ts;
  return v == null ? '' : String(v);
}

async function _runQuery(target) {
  const col    = target._type === 'query' ? target._col : target;
  const wheres = target._wheres || [];
  const order  = target._order || null;
  let req = sb.from(TABLE).select('path,data').eq('parent', col._path);
  for (const w of wheres) {
    if (w.value === null) req = req.is(`data->>${w.field}`, null);
    else req = req.eq(`data->>${w.field}`, String(w.value));
  }
  const { data, error } = await req;
  if (error) throw error;
  let rows = data || [];
  if (order) {
    rows = rows.slice().sort((a, b) => {
      const ka = _tsSortKey(a.data, order.field), kb = _tsSortKey(b.data, order.field);
      return (ka < kb ? -1 : ka > kb ? 1 : 0) * (order.dir === 'desc' ? -1 : 1);
    });
  }
  const docs = rows.map(r => _docSnap(r.path.split('/').pop(), r.path, r.data));
  return { docs, empty: docs.length === 0, size: docs.length, forEach: f => docs.forEach(f) };
}

export async function getDocs(target) { return _runQuery(target); }

const POLL_MS = 20000;
export function onSnapshot(target, cb, errCb) {
  const isDoc = target._type === 'doc';
  const colPath = isDoc ? null : (target._type === 'query' ? target._col._path : target._path);
  let stopped = false, lastJson = null;

  const run = async () => {
    if (stopped) return;
    try {
      if (isDoc) {
        const snap = await getDoc(target);
        const j = JSON.stringify(snap.exists() ? snap.data() : null);
        if (j !== lastJson) { lastJson = j; cb(snap); }
      } else {
        const res = await _runQuery(target);
        const j = JSON.stringify(res.docs.map(d => [d.id, d.data()]));
        if (j !== lastJson) { lastJson = j; cb(res); }
      }
    } catch (e) { if (errCb) errCb(e); else console.warn('onSnapshot:', e); }
  };

  const onWrite = (ev) => {
    const d = ev.detail || ev.data || {};
    if (isDoc ? d.path === target._path : d.parent === colPath) run();
  };
  _localBus.addEventListener('write', onWrite);
  if (_bc) _bc.addEventListener('message', onWrite);
  const iv = setInterval(run, POLL_MS);
  run();

  return () => {
    stopped = true;
    clearInterval(iv);
    _localBus.removeEventListener('write', onWrite);
    if (_bc) _bc.removeEventListener('message', onWrite);
  };
}

// ── Storage ──────────────────────────────────────────────────────────
export function getStorage() { return { _storage: true }; }
export function ref(storage, path) { return { _path: 'mersad/' + String(path || '').replace(/^\/+/, '') }; }
export async function uploadBytes(r, bytes, meta) {
  const { error } = await sb.storage.from(BUCKET).upload(r._path, bytes, { upsert: true, contentType: meta?.contentType });
  if (error) throw error;
  return { ref: r };
}
export async function getDownloadURL(r) {
  return sb.storage.from(BUCKET).getPublicUrl(r._path).data.publicUrl;
}
