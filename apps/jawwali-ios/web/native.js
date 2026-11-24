/*
 * تطبيق «نظام الجمعيات الشبابية» للآيفون (صفحات «جوّالي» نفسها) — الجسر بين صفحات الموقع (jawwali.js كما هي) والميزات الأصليّة.
 * يُحمَّل قبل jawwali.js (build-www.mjs يستبدل وسمه): يسترجع الجلسة من سلسلة المفاتيح ثمّ يحمّل التطبيق.
 *   window.JW_NATIVE.scan(title)        ← ماسح QR أصليّ (AVFoundation) — يُرجع النصّ أو يُرفض عند الإلغاء
 *   window.JW_NATIVE.push.state/enable/sync/off ← إشعارات APNs (الأذان بصوته يصل والجوال مقفل)
 *   window.JW_NATIVE.onOpen(fn)         ← فتح شاشة من إشعار أو رابط عام (?open=pray / ?c=&p= / ?v=)
 * jawwali.js يتحقّق من وجود JW_NATIVE فقط؛ على الويب لا يوجد فيبقى كلّ شيء كما هو.
 */
(function () {
  'use strict';
  const C = window.Capacitor, PL = (C && C.Plugins) || {}, JW = PL.Jawwali, PN = PL.PushNotifications, APP = PL.App;
  const me = document.currentScript, appSrc = me && me.dataset.app;
  if (!C || !JW) { load(); return; }   // معاينة في متصفّح عاديّ: لا جسر

  /* ═════════ الجلسة: مرآة في سلسلة المفاتيح (الآيفون قد يمسح تخزين الويب، والرمز السرّيّ لا يُترك في ملفّ) ═════════ */
  const KEEP = ['jawwali2', 'jw_role', 'jw_wall', 'jw_apns'];
  const set0 = Storage.prototype.setItem, rm0 = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (k, v) { set0.call(this, k, v); if (this === window.localStorage && KEEP.includes(k)) JW.store({ key: k, value: String(v) }).catch(() => {}); };
  Storage.prototype.removeItem = function (k) { rm0.call(this, k); if (this === window.localStorage && KEEP.includes(k)) JW.store({ key: k, value: null }).catch(() => {}); };

  let info = { apnsEnv: 'production', staging: false };
  const opens = []; let openFn = null;
  const route = url => { if (!url) return; if (openFn) openFn(url); else opens.push(url); };

  const N = window.JW_NATIVE = {
    ios: true,
    get staging() { return !!info.staging; },
    scan: title => JW.scan({ title: title || 'امسح الرمز' }).then(r => { JW.haptic({ kind: 'success' }).catch(() => {}); return r.value; }),
    haptic: kind => JW.haptic({ kind: kind || 'light' }).catch(() => {}),
    external: url => JW.external({ url }).catch(() => { location.href = url; }),
    onOpen(fn) { openFn = fn; while (opens.length) fn(opens.shift()); },
    push: {
      /* on | off | denied */
      async state() {
        if (!PN) return 'unsupported';
        const p = (await PN.checkPermissions()).receive;
        if (p === 'denied') return 'denied';
        return p === 'granted' && localStorage.getItem('jw_apns') ? 'on' : 'off';
      },
      /* يطلب الإذن (أوّل مرّة) ويسجّل رمز الجهاز عند الخادم لهذا الحساب */
      async enable(cred, api) {
        let p = (await PN.checkPermissions()).receive;
        if (p !== 'granted') p = (await PN.requestPermissions()).receive;
        if (p !== 'granted') throw new Error(p === 'denied' ? 'الإشعارات ممنوعة — فعّلها من الإعدادات ← نظام الجمعيات ← الإشعارات' : 'لم تُسمح الإشعارات');
        const token = await deviceToken();
        const r = await fetch(api + '/season/push/apns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: cred.code, pin: cred.pin, as: cred.as, token, env: info.apnsEnv }) });
        const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'تعذّر تفعيل الإشعارات');
        localStorage.setItem('jw_apns', token);
        return true;
      },
      /* بعد كلّ دخول: إن كان الإذن ممنوحاً من قبل، جدّد الرمز بصمت (يتغيّر بعد استرجاع الجوال أو تحديث النظام) */
      async sync(cred, api) {
        try { if (PN && (await PN.checkPermissions()).receive === 'granted') await N.push.enable(cred, api); } catch (e) { /* بصمت */ }
      },
      /* الخروج: لا تصل إشعارات هذا الحساب لهذا الجوال بعد اليوم */
      async off(api) {
        const token = localStorage.getItem('jw_apns'); if (!token) return;
        localStorage.removeItem('jw_apns');
        try { await fetch(api + '/season/push/apns/off', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }); } catch (e) { /* */ }
      }
    }
  };

  let tokenWait = null;
  function deviceToken() {
    if (tokenWait) return tokenWait;
    tokenWait = new Promise((res, rej) => {
      const t = setTimeout(() => { tokenWait = null; rej(new Error('تعذّر الاتّصال بخدمة إشعارات آبل — حاول لاحقاً')); }, 20000);
      PN.addListener('registration', x => { clearTimeout(t); tokenWait = null; res(x.value); });
      PN.addListener('registrationError', e => { clearTimeout(t); tokenWait = null; rej(new Error((e && e.error) || 'تعذّر التسجيل للإشعارات')); });
      PN.register();
    });
    return tokenWait;
  }

  // الضغط على إشعار (حتى لو كان التطبيق مغلقاً — الحدث محفوظ حتى نستمع)
  if (PN) PN.addListener('pushNotificationActionPerformed', a => { const d = (a.notification && a.notification.data) || {}; route(d.url || './?open=' + (d.open || '')); });
  // الروابط العامّة (Universal Links): مسح بطاقة بكاميرا الآيفون العاديّة يفتح التطبيق هنا
  if (APP) APP.addListener('appUrlOpen', e => route(e.url));

  Promise.race([
    JW.info().then(i => { info = Object.assign(info, i); return JW.load({ keys: KEEP }); }).then(r => {
      const v = (r && r.values) || {};
      for (const k of KEEP) if (v[k] != null && localStorage.getItem(k) == null) set0.call(localStorage, k, v[k]);
    }),
    new Promise(r => setTimeout(r, 1500))
  ]).catch(() => {}).then(() => {
    // الإدارة (المدير التنفيذي): النظام الكامل من الموقع داخل التطبيق نفسه — يعدّل موقع الجمعيّة ويدير شغله من جواله
    if (localStorage.getItem('jw_role') === 'admin' && !/[?&]role=reset/.test(location.search)) { location.replace('https://ibrahimsaud.com/charity/'); return; }
    load();
  });

  function load() { if (!appSrc) return; const s = document.createElement('script'); s.src = appSrc; document.body.appendChild(s); }
})();
