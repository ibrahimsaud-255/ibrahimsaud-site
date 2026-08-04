"use client";

// نموذج الطلب — تجربة شبيهة بالمتجر لكن بلا بوابة دفع:
// اختيار المنتج ← الخامة واللون ← المقاس (عالمي / طول / تفصيل) ← الإضافات
// ← البيانات والعنوان ← الملخّص ← إرسال الطلب في واتساب + تحويل بنكي.

import { useEffect, useMemo, useState } from "react";
import SlotImage from "./SlotImage";
import { IconCheck, IconMinus, IconPlus, IconWhatsApp } from "./icons";
import {
  addOns as allAddOns,
  addOnById,
  alphaSizes,
  bank,
  customMeasures,
  fabricById,
  fabrics as allFabrics,
  freeShippingOver,
  lengthSizes,
  products,
  productById,
  regions,
  sar,
  sarah,
  shippingFee,
  suggestLength,
  suggestSize,
  waLink,
} from "@/lib/sarah";

// رسوم التفصيل على المقاس للقطع التي تُباع بمقاسات عالمية
const CUSTOM_FIT_FEE = 80;

type SizeMode = "alpha" | "length" | "custom";

export default function OrderForm({ initialProduct }: { initialProduct?: string }) {
  const [productId, setProductId] = useState(initialProduct ?? products[0].id);
  const product = productById(productId) ?? products[0];

  const productFabrics = useMemo(
    () => allFabrics.filter((f) => product.fabrics.includes(f.id)),
    [product],
  );

  const [fabricId, setFabricId] = useState(product.fabrics[0] ?? "");
  const [color, setColor] = useState("");
  const [sizeMode, setSizeMode] = useState<SizeMode>(product.sizing);
  const [alpha, setAlpha] = useState("M");
  const [lengthSize, setLengthSize] = useState("56");
  const [measures, setMeasures] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState(regions[0].name);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [pay, setPay] = useState<"bank" | "later">("bank");
  const [sent, setSent] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // حاسبة المقاس
  const [calc, setCalc] = useState({ bust: "", waist: "", hips: "", height: "" });

  const fabric = fabricById(fabricId);

  // الموقع ثابت (static export)، فنقرأ ?product=... من المتصفح بعد التحميل
  useEffect(() => {
    if (initialProduct) return;
    const q = new URLSearchParams(window.location.search).get("product");
    if (q && productById(q)) changeProduct(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // عند تبديل المنتج: أعِد ضبط الخامة واللون والمقاس بما يناسبه
  function changeProduct(id: string) {
    const p = productById(id);
    if (!p) return;
    setProductId(id);
    setFabricId(p.fabrics[0] ?? "");
    setColor("");
    setSizeMode(p.sizing);
    setPicked((prev) => prev.filter((a) => p.addOns.includes(a)));
  }

  // ------------------------- الحساب -------------------------
  const fabricDelta = fabric?.priceDelta ?? 0;
  const addOnsTotal = picked.reduce((s, id) => s + (addOnById(id)?.price ?? 0), 0);
  const customFee = sizeMode === "custom" && product.sizing !== "custom" ? CUSTOM_FIT_FEE : 0;
  const unit = product.price + fabricDelta + addOnsTotal + customFee;
  const subtotal = unit * qty;
  const ship = shippingFee(region, subtotal);
  const total = subtotal + ship;

  const suggested = useMemo(() => {
    const b = Number(calc.bust), w = Number(calc.waist), h = Number(calc.hips);
    if (!b || !w || !h) return null;
    return suggestSize(b, w, h);
  }, [calc.bust, calc.waist, calc.hips]);

  const suggestedLen = useMemo(() => {
    const h = Number(calc.height);
    if (!h) return null;
    return suggestLength(h);
  }, [calc.height]);

  // ------------------------- التحقق -------------------------
  function validate() {
    const e: string[] = [];
    if (!name.trim()) e.push("الاسم مطلوب");
    if (!/^(?:\+?966|0)?5\d{8}$/.test(phone.replace(/[\s-]/g, "")))
      e.push("رقم جوال سعودي غير صحيح (مثال: 0512345678)");
    if (productFabrics.length > 0 && !fabricId) e.push("اختاري الخامة");
    if (productFabrics.length > 0 && !color) e.push("اختاري اللون");
    if (sizeMode === "custom") {
      const missing = customMeasures
        .filter((m) => m.required && !measures[m.key])
        .map((m) => m.label);
      if (missing.length) e.push(`قياسات ناقصة: ${missing.join("، ")}`);
    }
    if (!city.trim()) e.push("المدينة مطلوبة");
    if (!address.trim()) e.push("العنوان مطلوب");
    setErrors(e);
    return e.length === 0;
  }

  // ------------------- نص رسالة واتساب -------------------
  function buildMessage(orderNo: string) {
    const L: string[] = [];
    L.push(`طلب جديد من موقع ${sarah.name}`);
    L.push(`رقم الطلب: ${orderNo}`);
    L.push("");
    L.push(`• المنتج: ${product.name} (${sar(product.price)})`);
    if (fabric) L.push(`• الخامة: ${fabric.name}${fabricDelta ? ` (+${sar(fabricDelta)})` : ""}`);
    if (color) L.push(`• اللون: ${color}`);

    if (sizeMode === "alpha") {
      const s = alphaSizes.find((x) => x.intl === alpha);
      L.push(`• المقاس: ${alpha} (EU ${s?.eu} / UK ${s?.uk} / US ${s?.us})`);
    } else if (sizeMode === "length") {
      const l = lengthSizes.find((x) => x.size === lengthSize);
      L.push(`• الطول: ${lengthSize}" (${l?.cm} سم)`);
    } else {
      L.push(`• تفصيل على المقاس${customFee ? ` (+${sar(customFee)})` : ""}:`);
      customMeasures.forEach((m) => {
        if (measures[m.key]) L.push(`   - ${m.label}: ${measures[m.key]} سم`);
      });
    }

    if (picked.length) {
      L.push(`• الإضافات: ${picked.map((id) => `${addOnById(id)?.label} (+${sar(addOnById(id)?.price ?? 0)})`).join("، ")}`);
    }
    L.push(`• الكمية: ${qty}`);
    L.push("");
    L.push(`الإجمالي قبل الشحن: ${sar(subtotal)}`);
    L.push(`الشحن (${region}): ${ship === 0 ? "مجاني" : sar(ship)}`);
    L.push(`الإجمالي النهائي: ${sar(total)}`);
    L.push("");
    L.push(`الاسم: ${name}`);
    L.push(`الجوال: ${phone}`);
    L.push(`المنطقة: ${region} — المدينة: ${city}`);
    L.push(`العنوان: ${address}`);
    if (notes.trim()) L.push(`ملاحظات: ${notes}`);
    L.push("");
    L.push(
      pay === "bank"
        ? "طريقة الدفع: تحويل بنكي — بأرسل صورة الإيصال هنا ✅"
        : "طريقة الدفع: أحب أتواصل وأتأكد من التفاصيل أولاً",
    );
    return L.join("\n");
  }

  function submit() {
    if (!validate()) {
      document.getElementById("sarah-errors")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const d = new Date();
    const orderNo = `IS-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`;
    setSent(orderNo);
    window.open(waLink(buildMessage(orderNo)), "_blank", "noopener");
  }

  async function copyOrder() {
    const orderNo = sent ?? "IS-مسودة";
    try {
      await navigator.clipboard.writeText(buildMessage(orderNo));
      alert("تم نسخ تفاصيل الطلب ✅");
    } catch {
      alert("تعذّر النسخ — انسخي التفاصيل من رسالة واتساب.");
    }
  }

  const step = "mb-3 flex items-center gap-2 text-sm font-black text-espresso";
  const num =
    "flex size-7 shrink-0 items-center justify-center rounded-full bg-clay text-xs font-black text-white";
  const card = "rounded-3xl border border-ecru bg-white/70 p-5 sm:p-6";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      {/* ============ العمود الأيمن: الخطوات ============ */}
      <div className="space-y-5">
        {/* ١ — المنتج */}
        <section className={card}>
          <h3 className={step}>
            <span className={num}>١</span> اختاري القطعة
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((p) => {
              const on = p.id === productId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => changeProduct(p.id)}
                  className={`group overflow-hidden rounded-2xl border text-right transition ${
                    on
                      ? "border-clay ring-2 ring-clay"
                      : "border-ecru hover:border-clay/60 hover:shadow-md hover:shadow-clay/10"
                  }`}
                >
                  <span className="relative block">
                    <SlotImage
                      src={p.images[0]}
                      alt={p.name}
                      ratio="aspect-square"
                      rounded="rounded-none"
                      fit="contain"
                      className="w-full"
                      slot="صورة"
                    />
                    {on ? (
                      <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-clay text-white shadow">
                        <IconCheck className="size-4" />
                      </span>
                    ) : null}
                  </span>
                  <span className={`block px-3 py-2.5 ${on ? "bg-clay/10" : "bg-white"}`}>
                    <span className="block truncate text-sm font-bold text-espresso">{p.name}</span>
                    <span className="mt-0.5 flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-bold text-clay">من {sar(p.price)}</span>
                      <span className="text-cocoa/70">{p.days}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ٢ — الخامة واللون */}
        {productFabrics.length > 0 ? (
          <section className={card}>
            <h3 className={step}>
              <span className={num}>٢</span> الخامة واللون
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {productFabrics.map((f) => {
                const on = f.id === fabricId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setFabricId(f.id);
                      setColor("");
                    }}
                    className={`overflow-hidden rounded-2xl border text-right transition ${
                      on
                        ? "border-clay ring-2 ring-clay"
                        : "border-ecru hover:border-clay/60 hover:shadow-md hover:shadow-clay/10"
                    }`}
                  >
                    <span className="relative block">
                      <SlotImage
                        src={f.image}
                        alt={f.name}
                        ratio="aspect-square"
                        rounded="rounded-none"
                        className="w-full"
                        slot="خامة"
                      />
                      {on ? (
                        <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-clay text-white shadow">
                          <IconCheck className="size-3.5" />
                        </span>
                      ) : null}
                    </span>
                    <span className={`block px-3 py-2.5 ${on ? "bg-clay/10" : "bg-white"}`}>
                      <span className="block text-sm font-bold text-espresso">{f.name}</span>
                      <span className="mt-0.5 block text-[11px] font-bold text-clay">
                        {f.priceDelta ? `+ ${sar(f.priceDelta)}` : "مشمول بالسعر"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {fabric ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-bold text-cocoa">الألوان المتوفرة في {fabric.name}:</p>
                <div className="flex flex-wrap gap-2">
                  {fabric.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                        color === c
                          ? "border-clay bg-clay text-white"
                          : "border-ecru bg-white text-espresso hover:border-clay/60"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* ٣ — المقاس */}
        <section className={card} id="size">
          <h3 className={step}>
            <span className={num}>٣</span> المقاس
          </h3>

          <div className="mb-4 flex flex-wrap gap-2">
            {([
              ["alpha", "مقاس عالمي (XS–4XL)"],
              ["length", "طول العباية (٥٢–٦٠)"],
              ["custom", "تفصيل على مقاسي"],
            ] as [SizeMode, string][]).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setSizeMode(m)}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                  sizeMode === m
                    ? "border-clay bg-clay text-white"
                    : "border-ecru bg-white text-espresso hover:border-clay/60"
                }`}
              >
                {label}
                {m === "custom" && product.sizing !== "custom" ? ` (+${CUSTOM_FIT_FEE} ر.س)` : ""}
              </button>
            ))}
          </div>

          {sizeMode === "alpha" ? (
            <>
              <div className="flex flex-wrap gap-2">
                {alphaSizes.map((s) => (
                  <button
                    key={s.intl}
                    type="button"
                    onClick={() => setAlpha(s.intl)}
                    className={`min-w-16 rounded-xl border px-3 py-2 text-center transition ${
                      alpha === s.intl
                        ? "border-clay bg-clay text-white"
                        : "border-ecru bg-white text-espresso hover:border-clay/60"
                    }`}
                  >
                    <span className="block text-sm font-black">{s.intl}</span>
                    <span className="block text-[10px] opacity-80">EU {s.eu}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-cocoa">
                {(() => {
                  const s = alphaSizes.find((x) => x.intl === alpha)!;
                  return `${alpha}: صدر ${s.bust[0]}–${s.bust[1]} سم · خصر ${s.waist[0]}–${s.waist[1]} سم · ورك ${s.hips[0]}–${s.hips[1]} سم — يعادل EU ${s.eu} / UK ${s.uk} / US ${s.us}`;
                })()}
              </p>

              <div className="mt-4 rounded-2xl bg-sand-deep/70 p-4">
                <p className="text-xs font-black text-espresso">ما تعرفين مقاسك؟ اكتبي قياساتك:</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {([["bust", "الصدر"], ["waist", "الخصر"], ["hips", "الورك"]] as const).map(
                    ([k, label]) => (
                      <input
                        key={k}
                        type="number"
                        inputMode="numeric"
                        placeholder={`${label} (سم)`}
                        value={calc[k]}
                        onChange={(e) => setCalc({ ...calc, [k]: e.target.value })}
                        className="sarah-field"
                      />
                    ),
                  )}
                </div>
                {suggested ? (
                  <p className="mt-3 text-sm">
                    مقاسك المقترح:{" "}
                    <button
                      type="button"
                      onClick={() => setAlpha(suggested.intl)}
                      className="rounded-full bg-clay px-3 py-1 text-xs font-black text-white"
                    >
                      {suggested.intl} — اعتمديه
                    </button>{" "}
                    <span className="text-xs text-cocoa">
                      (EU {suggested.eu} / UK {suggested.uk} / US {suggested.us})
                    </span>
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          {sizeMode === "length" ? (
            <>
              <div className="flex flex-wrap gap-2">
                {lengthSizes.map((l) => (
                  <button
                    key={l.size}
                    type="button"
                    onClick={() => setLengthSize(l.size)}
                    className={`min-w-20 rounded-xl border px-3 py-2 text-center transition ${
                      lengthSize === l.size
                        ? "border-clay bg-clay text-white"
                        : "border-ecru bg-white text-espresso hover:border-clay/60"
                    }`}
                  >
                    <span className="block text-sm font-black">{l.size}&quot;</span>
                    <span className="block text-[10px] opacity-80">{l.cm} سم</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-cocoa">
                المقاس هنا = الطول من أعلى الكتف حتى الطرف السفلي، ويُختار حسب طولك.
              </p>
              <div className="mt-4 rounded-2xl bg-sand-deep/70 p-4">
                <p className="text-xs font-black text-espresso">اكتبي طولك ونقترح لك المقاس:</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="طولك (سم)"
                    value={calc.height}
                    onChange={(e) => setCalc({ ...calc, height: e.target.value })}
                    className="sarah-field max-w-40"
                  />
                  {suggestedLen ? (
                    <button
                      type="button"
                      onClick={() => setLengthSize(suggestedLen.size)}
                      className="rounded-full bg-clay px-4 py-2 text-xs font-black text-white"
                    >
                      المقترح: {suggestedLen.size}&quot; — اعتمديه
                    </button>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}

          {sizeMode === "custom" ? (
            <>
              <p className="mb-3 text-xs text-cocoa">
                القياسات بالسنتيمتر على الجسم مباشرة (بملابس خفيفة). الحقول المعلّمة بـ
                <span className="text-clay"> * </span> مطلوبة، والباقي يساعدنا في الدقة.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {customMeasures.map((m) => (
                  <label key={m.key} className="block">
                    <span className="mb-1 block text-xs font-bold text-espresso">
                      {m.label} {m.required ? <span className="text-clay">*</span> : null}
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder={m.hint}
                      value={measures[m.key] ?? ""}
                      onChange={(e) => setMeasures({ ...measures, [m.key]: e.target.value })}
                      className="sarah-field"
                    />
                  </label>
                ))}
              </div>
            </>
          ) : null}
        </section>

        {/* ٤ — الإضافات */}
        {product.addOns.length > 0 ? (
          <section className={card}>
            <h3 className={step}>
              <span className={num}>٤</span> إضافات (اختياري)
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {allAddOns
                .filter((a) => product.addOns.includes(a.id))
                .map((a) => {
                  const on = picked.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() =>
                        setPicked((prev) =>
                          prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id],
                        )
                      }
                      className={`flex items-start gap-3 rounded-2xl border p-3 text-right transition ${
                        on ? "border-clay bg-clay/10" : "border-ecru bg-white hover:border-clay/50"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border text-[11px] ${
                          on ? "border-clay bg-clay text-white" : "border-ecru bg-white"
                        }`}
                      >
                        {on ? <IconCheck className="size-3.5" /> : null}
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-espresso">
                          {a.label} <span className="text-clay">+{sar(a.price)}</span>
                        </span>
                        <span className="block text-[11px] text-cocoa">{a.desc}</span>
                      </span>
                    </button>
                  );
                })}
            </div>
          </section>
        ) : null}

        {/* ٥ — البيانات والعنوان */}
        <section className={card}>
          <h3 className={step}>
            <span className={num}>٥</span> بياناتك وعنوان الشحن
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-espresso">الاسم *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="sarah-field" placeholder="الاسم الكامل" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-espresso">رقم الجوال (واتساب) *</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="sarah-field"
                placeholder="05XXXXXXXX"
                inputMode="tel"
                dir="ltr"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-espresso">المنطقة *</span>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="sarah-field">
                {regions.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name} — {r.fee} ر.س / {r.days}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-espresso">المدينة *</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="sarah-field" placeholder="مثال: الرياض" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-bold text-espresso">العنوان (الحي والشارع) *</span>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="sarah-field" placeholder="الحي، الشارع، رقم المبنى" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-bold text-espresso">ملاحظات (اختياري)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="sarah-field"
                placeholder="تفاصيل القَصّة، طول الكم، موعد المناسبة…"
              />
            </label>
          </div>
        </section>

        {/* ٦ — طريقة الدفع */}
        <section className={card}>
          <h3 className={step}>
            <span className={num}>٦</span> طريقة الدفع
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ["bank", "تحويل بنكي", "أحوّل المبلغ وأرسل صورة الإيصال في واتساب."],
              ["later", "أتواصل أولاً", "أبغى أتأكد من التفاصيل قبل التحويل."],
            ] as const).map(([v, label, desc]) => (
              <button
                key={v}
                type="button"
                onClick={() => setPay(v)}
                className={`rounded-2xl border p-4 text-right transition ${
                  pay === v ? "border-clay bg-clay/10 ring-1 ring-clay" : "border-ecru bg-white hover:border-clay/50"
                }`}
              >
                <span className="block text-sm font-black text-espresso">{label}</span>
                <span className="block text-xs text-cocoa">{desc}</span>
              </button>
            ))}
          </div>

          {pay === "bank" ? (
            <div className="mt-4 rounded-2xl border border-ecru bg-sand-deep/70 p-4 text-sm">
              <p className="font-black text-espresso">بيانات التحويل</p>
              <ul className="mt-2 space-y-1 text-cocoa">
                <li>البنك: {bank.bankName}</li>
                <li>اسم الحساب: {bank.accountName}</li>
                <li dir="ltr" className="text-right font-bold text-espresso">
                  IBAN: {bank.iban}
                </li>
              </ul>
              <p className="mt-2 text-xs text-cocoa/80">{bank.note}</p>
            </div>
          ) : null}
        </section>

        {errors.length ? (
          <div id="sarah-errors" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-bold">قبل الإرسال، صحّحي التالي:</p>
            <ul className="mt-1 list-disc pr-5">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* ============ العمود الجانبي: الملخّص ============ */}
      <aside className="lg:sticky lg:top-24">
        <div className="rounded-3xl border border-ecru bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-espresso">ملخّص الطلب</p>

          <div className="mt-4 flex gap-3">
            <SlotImage
              src={product.images[0]}
              alt={product.name}
              ratio="aspect-square"
              rounded="rounded-xl"
              className="w-20 shrink-0"
              slot="صورة"
            />
            <div className="min-w-0 text-sm">
              <p className="font-bold text-espresso">{product.name}</p>
              <p className="text-xs text-cocoa">{fabric ? fabric.name : "بدون خامة"}{color ? ` — ${color}` : ""}</p>
              <p className="text-xs text-cocoa">
                {sizeMode === "alpha"
                  ? `مقاس ${alpha}`
                  : sizeMode === "length"
                    ? `طول ${lengthSize}"`
                    : "تفصيل على المقاس"}
              </p>
              <p className="text-xs text-cocoa">التنفيذ: {product.days}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-sand-deep/70 px-3 py-2">
            <span className="text-xs font-bold text-espresso">الكمية</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex size-7 items-center justify-center rounded-full border border-ecru bg-white text-espresso transition hover:border-clay hover:text-clay"
                aria-label="إنقاص الكمية"
              >
                <IconMinus className="size-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-black">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                className="flex size-7 items-center justify-center rounded-full border border-ecru bg-white text-espresso transition hover:border-clay hover:text-clay"
                aria-label="زيادة الكمية"
              >
                <IconPlus className="size-3.5" />
              </button>
            </div>
          </div>

          <dl className="mt-4 space-y-1.5 text-sm">
            <Row label="سعر القطعة" value={sar(product.price)} />
            {fabricDelta ? <Row label={`خامة ${fabric?.name}`} value={`+ ${sar(fabricDelta)}`} /> : null}
            {customFee ? <Row label="تفصيل على المقاس" value={`+ ${sar(customFee)}`} /> : null}
            {picked.map((id) => (
              <Row key={id} label={addOnById(id)?.label ?? ""} value={`+ ${sar(addOnById(id)?.price ?? 0)}`} />
            ))}
            {qty > 1 ? <Row label={`× ${qty} قطع`} value={sar(subtotal)} /> : null}
            <Row label={`الشحن — ${region}`} value={ship === 0 ? "مجاني" : sar(ship)} />
          </dl>

          {freeShippingOver > 0 && subtotal < freeShippingOver ? (
            <p className="mt-2 rounded-lg bg-sage/10 px-3 py-2 text-[11px] text-sage">
              باقي {sar(freeShippingOver - subtotal)} ويصير الشحن مجاني.
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between border-t border-ecru pt-4">
            <span className="text-sm font-bold text-espresso">الإجمالي</span>
            <span className="text-2xl font-black text-clay">{sar(total)}</span>
          </div>

          <button
            type="button"
            onClick={submit}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-black text-white transition hover:brightness-95"
          >
<IconWhatsApp className="size-5 text-white" />
            إرسال الطلب في واتساب
          </button>
          <button
            type="button"
            onClick={copyOrder}
            className="mt-2 w-full rounded-full border border-ecru px-5 py-2.5 text-xs font-bold text-cocoa transition hover:border-clay hover:text-clay"
          >
            نسخ تفاصيل الطلب
          </button>

          {sent ? (
            <div className="mt-4 rounded-2xl border border-sage/40 bg-sage/10 p-4 text-xs leading-relaxed text-espresso">
              <p className="font-black">تم تجهيز طلبك ✅ رقم الطلب: {sent}</p>
              <p className="mt-1 text-cocoa">
                لو ما فتح واتساب تلقائياً، اضغطي «إرسال الطلب» مرة ثانية أو انسخي التفاصيل وأرسليها على{" "}
                <span dir="ltr">+{sarah.whatsapp}</span>. الطلب يُعتمد بعد تأكيد السعر والتحويل.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-center text-[11px] leading-relaxed text-cocoa/80">
              ما فيه دفع إلكتروني — نستلم طلبك في واتساب، نؤكّد السعر النهائي، ثم تحوّلين بنكياً.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-cocoa">{label}</dt>
      <dd className="font-bold text-espresso">{value}</dd>
    </div>
  );
}
