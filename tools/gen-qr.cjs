// أكواد QR لنسخ العرض (تُفتح من الجوال). تحتاج حزمة qrcode خارج المشروع:
//   npm i qrcode && node tools/gen-qr.cjs public/v2/qr
const QR = require('qrcode'); const fs = require('fs');
const out = process.argv[2];
const items = { nasaq: 'https://ibrahimsaud.com/demo/nasaq/index.html', ruso: 'https://ibrahimsaud.com/demo/ruso/website/index.html', manabir: 'https://ibrahimsaud.com/demo/manabir/index.html?login=1', takamul: 'https://ibrahimsaud.com/demo/takamul/index.html' };
(async () => { for (const [k, u] of Object.entries(items)) { const svg = await QR.toString(u, { type: 'svg', margin: 0, color: { dark: '#1D1D1F', light: '#0000' }, errorCorrectionLevel: 'M' }); fs.writeFileSync(`${out}/${k}.svg`, svg); console.log(k, svg.length); } })();
