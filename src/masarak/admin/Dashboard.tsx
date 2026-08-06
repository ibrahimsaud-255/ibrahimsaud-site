"use client";

import { useCallback, useEffect, useState } from "react";
import { BRAND } from "../config";
import { loadBackend, rpc } from "../lib/access";
import {
  IconAlert,
  IconCheckCircle,
  IconChart,
  IconCompass,
  IconDocument,
  IconInfo,
  IconLock,
  IconRefresh,
  IconSearch,
  IconShare,
  IconXmark,
} from "../components/Icons";

const KEY_STORE = "masarak.adminkey.v1";

type Stats = {
  total: number;
  new: number;
  used: number;
  revoked: number;
  today: number;
  week: number;
  results: number;
};

type CodeRow = {
  code: string;
  batch: string | null;
  note: string | null;
  status: "new" | "used" | "revoked";
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
};

type BatchRow = { batch: string; total: number; used: number };

const STATUS_TEXT: Record<CodeRow["status"], string> = {
  new: "جاهز للبيع",
  used: "مُفعَّل",
  revoked: "ملغى",
};

const STATUS_TONE: Record<CodeRow["status"], string> = {
  new: "likely",
  used: "strong",
  revoked: "unlikely",
};

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("ar-SA", { dateStyle: "medium" }) : "—";

export default function Dashboard() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [linked, setLinked] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [batches, setBatches] = useState<BatchRow[]>([]);

  // مولّد الأكواد
  const [count, setCount] = useState(50);
  const [batchName, setBatchName] = useState("");
  const [validDays, setValidDays] = useState(365);
  const [fresh, setFresh] = useState<string[] | null>(null);

  // تصفية
  const [filterBatch, setFilterBatch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    let alive = true;
    loadBackend().then((b) => {
      if (!alive) return;
      setLinked(b !== null);
      try {
        const saved = localStorage.getItem(KEY_STORE);
        if (saved) setKey(saved);
      } catch {
        /* لا شيء */
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  /** يعيد تحميل كل بيانات اللوحة. التصفية تُمرَّر صراحةً حتى تُستخدم
   *  القيمة الجديدة فوراً بلا انتظار دورة عرض. */
  const refresh = useCallback(
    async (k: string, batch = filterBatch, status = filterStatus) => {
      const [s, c, b] = await Promise.all([
        rpc<Stats>("masarak_admin_stats", { p_key: k }),
        rpc<CodeRow[]>("masarak_admin_codes", {
          p_key: k,
          p_batch: batch || null,
          p_status: status || null,
          p_limit: 500,
        }),
        rpc<BatchRow[]>("masarak_admin_batches", { p_key: k }),
      ]);
      setStats(s);
      setCodes(c);
      setBatches(b);
    },
    [filterBatch, filterStatus]
  );

  /** تغيير التصفية يعيد التحميل مباشرةً — بلا effect */
  function applyFilter(batch: string, status: string) {
    setFilterBatch(batch);
    setFilterStatus(status);
    refresh(key, batch, status).catch(() => setError("تعذّر تحديث القائمة."));
  }

  async function signIn() {
    if (!key.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await refresh(key);
      setAuthed(true);
      try {
        localStorage.setItem(KEY_STORE, key);
      } catch {
        /* لا شيء */
      }
    } catch (e) {
      setError(
        String(e).includes("مفتاح")
          ? "المفتاح غير صحيح."
          : "تعذّر الاتصال بالقاعدة. تأكّد من تشغيل ملف masarak.sql."
      );
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const out = await rpc<string[]>("masarak_admin_generate", {
        p_key: key,
        p_count: count,
        p_batch: batchName || null,
        p_valid_days: validDays,
      });
      setFresh(out);
      await refresh(key);
    } catch {
      setError("تعذّر توليد الأكواد.");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(code: string, status: CodeRow["status"]) {
    setBusy(true);
    try {
      await rpc("masarak_admin_set_status", {
        p_key: key,
        p_code: code,
        p_status: status,
      });
      await refresh(key);
    } catch {
      setError("تعذّر تغيير حالة الكود.");
    } finally {
      setBusy(false);
    }
  }

  function download(list: string[], name: string) {
    // سلة تستورد الأكواد الرقمية من ملف بعمود واحد
    const csv = "code\n" + list.join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ───────── غير مربوط ───────── */
  if (linked === false) {
    return (
      <Shell>
        <section className="mk-glass mk-sheen" style={{ padding: 24 }}>
          <div className="mk-row" style={{ marginBottom: 14 }}>
            <IconAlert size={22} />
            <h2 className="mk-h2">القاعدة غير مربوطة</h2>
          </div>
          <ol className="mk-steps">
            <li>أنشئ مشروعاً جديداً في Supabase (الحساب الذي ستملك عليه المنصّة).</li>
            <li>
              افتح <b>SQL Editor</b> وشغّل ملف{" "}
              <code>supabase/masarak.sql</code> كاملاً.
            </li>
            <li>
              اضبط مفتاح اللوحة:{" "}
              <code>select public.masarak_set_admin_key(&apos;مفتاحك&apos;);</code>
            </li>
            <li>
              أنشئ الملف <code>public/masarak/backend.json</code> بمحتوى:{" "}
              <code>{`{"url":"https://xxx.supabase.co","key":"sb_publishable_..."}`}</code>
            </li>
            <li>أعد تحميل هذه الصفحة.</li>
          </ol>
        </section>
      </Shell>
    );
  }

  /* ───────── تسجيل الدخول ───────── */
  if (!authed) {
    return (
      <Shell>
        <section className="mk-glass mk-sheen" style={{ padding: 24, maxWidth: 460, margin: "0 auto" }}>
          <div className="mk-row" style={{ marginBottom: 16 }}>
            <span className="mk-major-icon" style={{ width: 40, height: 40 }}>
              <IconLock size={19} />
            </span>
            <span>
              <div style={{ fontWeight: 700, fontSize: 17 }}>لوحة التحكم</div>
              <div className="mk-faint" style={{ fontSize: 12.5 }}>
                أدخل مفتاح المالك
              </div>
            </span>
          </div>

          <input
            className="mk-code-input"
            style={{ fontSize: 18, letterSpacing: "0.05em" }}
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && signIn()}
            placeholder="••••••••••"
            dir="ltr"
            aria-label="مفتاح المالك"
          />

          {error && (
            <div className="mk-note" style={{ marginTop: 12, borderColor: "rgba(255,95,109,.35)" }}>
              <IconInfo size={18} />
              <span style={{ color: "#ffa8ae" }}>{error}</span>
            </div>
          )}

          <button
            type="button"
            className="mk-btn mk-btn-primary mk-btn-block"
            style={{ marginTop: 16 }}
            onClick={signIn}
            disabled={busy || !key.trim()}
          >
            {busy ? "جارٍ التحقّق…" : "دخول"}
          </button>
        </section>
      </Shell>
    );
  }

  /* ───────── اللوحة ───────── */
  return (
    <Shell>
      {/* الإحصاءات */}
      <section className="mk-stats">
        {[
          { n: stats?.total ?? 0, t: "إجمالي الأكواد", c: undefined },
          { n: stats?.new ?? 0, t: "جاهزة للبيع", c: "var(--mk-accent)" },
          { n: stats?.used ?? 0, t: "مُفعَّلة", c: "var(--mk-green)" },
          { n: stats?.week ?? 0, t: "تفعيل هذا الأسبوع", c: "var(--mk-amber)" },
        ].map((s) => (
          <div key={s.t} className="mk-glass-sm mk-stat">
            <b style={{ color: s.c }}>{s.n}</b>
            <span>{s.t}</span>
          </div>
        ))}
      </section>

      {/* المولّد */}
      <section className="mk-glass mk-sheen mk-mt" style={{ padding: 22 }}>
        <div className="mk-row" style={{ marginBottom: 16 }}>
          <span className="mk-major-icon" style={{ width: 40, height: 40 }}>
            <IconDocument size={19} />
          </span>
          <span>
            <div style={{ fontWeight: 700, fontSize: 17 }}>توليد أكواد جديدة</div>
            <div className="mk-faint" style={{ fontSize: 12.5 }}>
              نزّلها CSV وارفعها في منتج سلة الرقمي
            </div>
          </span>
        </div>

        <div className="mk-admin-grid">
          <label>
            <span className="mk-label">العدد</span>
            <input
              className="mk-field"
              type="number"
              min={1}
              max={2000}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(2000, +e.target.value || 1)))}
            />
          </label>
          <label>
            <span className="mk-label">اسم الدفعة</span>
            <input
              className="mk-field"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="مثال: سلة-يناير"
            />
          </label>
          <label>
            <span className="mk-label">الصلاحية (أيام)</span>
            <input
              className="mk-field"
              type="number"
              min={1}
              value={validDays}
              onChange={(e) => setValidDays(Math.max(1, +e.target.value || 365))}
            />
          </label>
        </div>

        <button
          type="button"
          className="mk-btn mk-btn-primary mk-btn-block"
          style={{ marginTop: 16 }}
          onClick={generate}
          disabled={busy}
        >
          {busy ? "جارٍ التوليد…" : `ولّد ${count} كوداً`}
        </button>

        {fresh && (
          <div className="mk-note" style={{ marginTop: 16, display: "block" }}>
            <div className="mk-between mk-wrap" style={{ marginBottom: 10 }}>
              <span className="mk-row">
                <IconCheckCircle size={18} />
                <b style={{ color: "var(--mk-ink)" }}>تم توليد {fresh.length} كوداً</b>
              </span>
              <span className="mk-row" style={{ gap: 8 }}>
                <button
                  type="button"
                  className="mk-filter"
                  onClick={() => navigator.clipboard?.writeText(fresh.join("\n"))}
                >
                  نسخ الكل
                </button>
                <button
                  type="button"
                  className="mk-filter"
                  data-on
                  onClick={() =>
                    download(fresh, `masarak-${batchName || "batch"}-${fresh.length}.csv`)
                  }
                >
                  <IconShare size={16} />
                  تنزيل CSV
                </button>
              </span>
            </div>
            <div className="mk-codes" dir="ltr">
              {fresh.map((c) => (
                <code key={c}>{c}</code>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* الدفعات */}
      {batches.length > 0 && (
        <section className="mk-glass mk-sheen mk-mt" style={{ padding: 22 }}>
          <div className="mk-row" style={{ marginBottom: 14 }}>
            <IconChart size={18} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>الدفعات</span>
          </div>
          <div className="mk-grid" style={{ gap: 8 }}>
            {batches.map((b) => (
              <div key={b.batch} className="mk-uni" style={{ gridTemplateColumns: "1fr auto" }}>
                <div>
                  <div className="mk-uni-name">{b.batch}</div>
                  <div className="mk-uni-meta">
                    <bdi>{b.used}</bdi> مُفعَّل من <bdi>{b.total}</bdi>
                  </div>
                  <div className="mk-gauge" style={{ marginTop: 8, color: "var(--mk-green)" }}>
                    <i style={{ width: `${b.total ? (b.used / b.total) * 100 : 0}%` }} />
                  </div>
                </div>
                <button
                  type="button"
                  className="mk-filter"
                  onClick={() => applyFilter(b.batch === "—" ? "" : b.batch, filterStatus)}
                >
                  <IconSearch size={16} />
                  عرض
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* القائمة */}
      <section className="mk-glass mk-sheen mk-mt" style={{ padding: 22 }}>
        <div className="mk-between mk-wrap" style={{ marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>الأكواد</span>
          <span className="mk-row" style={{ gap: 8 }}>
            <button
              type="button"
              className="mk-filter"
              onClick={() => download(codes.map((c) => c.code), "masarak-codes.csv")}
            >
              <IconShare size={16} />
              تصدير المعروض
            </button>
            <button type="button" className="mk-filter" onClick={() => refresh(key)}>
              <IconRefresh size={16} />
              تحديث
            </button>
          </span>
        </div>

        <div className="mk-filters" style={{ marginBottom: 12 }}>
          {["", "new", "used", "revoked"].map((s) => (
            <button
              key={s || "all"}
              type="button"
              className="mk-filter"
              data-on={filterStatus === s}
              onClick={() => applyFilter(filterBatch, s)}
            >
              {s === "" ? "الكل" : STATUS_TEXT[s as CodeRow["status"]]}
            </button>
          ))}
          {filterBatch && (
            <button
              type="button"
              className="mk-filter"
              data-on
              onClick={() => applyFilter("", filterStatus)}
            >
              <IconXmark size={15} />
              دفعة: {filterBatch}
            </button>
          )}
        </div>

        {error && (
          <div className="mk-note" style={{ marginBottom: 12 }}>
            <IconInfo size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="mk-grid" style={{ gap: 8 }}>
          {codes.length === 0 && (
            <p className="mk-faint" style={{ textAlign: "center", padding: 20 }}>
              لا توجد أكواد ضمن هذه التصفية.
            </p>
          )}
          {codes.map((c) => (
            <div key={c.code} className="mk-uni" style={{ gridTemplateColumns: "1fr auto" }}>
              <div style={{ minWidth: 0 }}>
                <code
                  dir="ltr"
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    display: "block",
                  }}
                >
                  {c.code}
                </code>
                <div className="mk-uni-meta">
                  <span className="mk-chip" data-tone={STATUS_TONE[c.status]}>
                    {STATUS_TEXT[c.status]}
                  </span>
                  {c.batch && <span>{c.batch}</span>}
                  <span className="mk-dot">·</span>
                  <span>
                    {c.status === "used"
                      ? `فُعِّل ${fmtDate(c.activated_at)}`
                      : `أُنشئ ${fmtDate(c.created_at)}`}
                  </span>
                </div>
              </div>
              <span className="mk-row" style={{ gap: 6 }}>
                {c.status !== "revoked" ? (
                  <button
                    type="button"
                    className="mk-filter"
                    onClick={() => setStatus(c.code, "revoked")}
                  >
                    إلغاء
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mk-filter"
                    onClick={() => setStatus(c.code, "new")}
                  >
                    إعادة تفعيل
                  </button>
                )}
                {c.status === "used" && (
                  <button
                    type="button"
                    className="mk-filter"
                    title="يفكّ ربط الكود بالجهاز ليُستخدم من جديد"
                    onClick={() => setStatus(c.code, "new")}
                  >
                    تصفير
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      <p className="mk-faint mk-center mk-mt" style={{ fontSize: 12.5, lineHeight: 1.9 }}>
        {stats?.results ?? 0} نتيجة اختبار محفوظة (مجهّلة الهوية، للإحصاء فقط).
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="masarak">
      <div className="mk-bgfx" aria-hidden>
        <span className="mk-orb a" />
        <span className="mk-orb b" />
        <span className="mk-grain" />
      </div>
      <div className="mk-shell">
        <header className="mk-topbar">
          <span className="mk-brand">
            <IconCompass size={24} />
            {BRAND.name}
          </span>
          <span className="mk-chip">
            <IconLock size={14} />
            لوحة التحكم
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}
