/*
 * products.js — منتجات الاستوديو وروابطها وتوزيعها على المخطط
 * ─────────────────────────────────────────────────────────────
 * ① روابط أمازون: ضع معرّف المسوّق (Store ID) في AMAZON.tag مرّة واحدة فتصير كلّ الروابط روابطك.
 *    وإن أخذت رابطاً مخصّصاً من SiteStripe (amzn.to/…) لمنتج بعينه ضعه في حقل url له — يتقدّم على البحث.
 *    img: معرّف صورة أمازون (m.media-amazon.com/images/I/<img>) أو رابط صورة كامل.
 * ② LAYOUT: مكان كلّ قطعة بالمتر على المخطط (x يميناً، z للأسفل في الرسم، ry دوران بالراديان).
 *    الترتيب يتعدّل من داخل العالم (زرّ «انقل») ويُنسخ بزرّ «نسخ الترتيب» ليُلصق هنا.
 */
export const AMAZON={store:'www.amazon.sa',tag:''}; // ← tag مثل 'ibrahimsaud-21'

export const ITEMS={
  // ── الصوت ──
  rodecaster:{name:'RØDECaster Pro II',en:'RODE RODECaster Pro II',cat:'audio',q:'RODECaster Pro II',note:'مكسر البودكاست: ٤ مداخل مايك، تسجيل مباشر على كرت، ومؤثّرات صوتيّة. واحد لكلّ استوديو.'},
  sm7b:{name:'مايك Shure SM7B',en:'Shure SM7B',cat:'audio',q:'Shure SM7B',note:'مايك البودكاست المعتمد عالميّاً — يعزل صوت الغرفة. الرودكاستر برو ٢ يكفي لتشغيله بلا مقوٍّ خارجيّ.'},
  psa1:{name:'ذراع RØDE PSA1+',en:'RODE PSA1+ Boom Arm',cat:'audio',q:'RODE PSA1+',note:'ذراع مايك يُثبّت على حافّة الطاولة، حركته صامتة.'},
  floorstand:{name:'ستاند مايك أرضي بذراع',en:'Boom microphone floor stand',cat:'audio',q:'boom microphone floor stand heavy duty',note:'لجلسة الكنب حيث لا طاولة يُثبّت عليها الذراع.'},
  headphones:{name:'سماعة Audio-Technica ATH-M50x',en:'Audio-Technica ATH-M50x',cat:'audio',q:'Audio-Technica ATH-M50x',note:'سماعة مراقبة مغلقة لكلّ متحدّث.'},
  xlr:{name:'كيبل XLR ٣ متر',en:'XLR cable 3m',cat:'audio',q:'XLR microphone cable 3m',note:'لكلّ مايك كيبل.'},
  panels:{name:'ألواح عزل صوتي (حزمة)',en:'Acoustic panels pack',cat:'audio',q:'acoustic panels sound absorbing',note:'تقلّل صدى الغرفة — على الجدران الجانبيّة ومقابل المتحدّثين.'},
  // ── التصوير ──
  fx30:{name:'كاميرا Sony FX30 (اللقطة الواسعة)',en:'Sony FX30',cat:'video',q:'Sony FX30',note:'الكاميرا الرئيسيّة للّقطة الواسعة، تصوّر ساعات بلا انقطاع.'},
  zve10:{name:'كاميرا Sony ZV-E10 II (اللقطات القريبة)',en:'Sony ZV-E10 II',cat:'video',q:'Sony ZV-E10 II',note:'كاميرا لكلّ متحدّث (لقطة قريبة).'},
  lens:{name:'عدسة Sigma 18-50mm f/2.8',en:'Sigma 18-50mm F2.8 DC DN Sony E',cat:'video',q:'Sigma 18-50mm f2.8 Sony E',note:'عدسة خفيفة بفتحة ثابتة لكلّ كاميرا.'},
  tripod:{name:'ترايبود فيديو',en:'Video tripod with fluid head',cat:'video',q:'video tripod fluid head',note:'ترايبود برأس سلس لكلّ كاميرا.'},
  atem:{name:'مبدّل Blackmagic ATEM Mini Pro',en:'Blackmagic ATEM Mini Pro',cat:'video',q:'Blackmagic ATEM Mini Pro',note:'يبدّل بين الكاميرات مباشرةً ويبثّ ويسجّل.'},
  // ── الإضاءة ──
  keylight:{name:'إضاءة Amaran 200x S',en:'Aputure Amaran 200x S',cat:'light',q:'Aputure Amaran 200x S',note:'الإضاءة الرئيسيّة — اثنتان لكلّ استوديو.'},
  softbox:{name:'سوفت بوكس Aputure Light Dome',en:'Aputure Light Dome SE',cat:'light',q:'Aputure Light Dome SE',note:'ينعّم الضوء على الوجوه.'},
  cstand:{name:'ستاند إضاءة ٢٫٨ م',en:'Light stand 2.8m',cat:'light',q:'light stand 280cm heavy duty',note:'لكلّ إضاءة ستاند.'},
  tube:{name:'إضاءة أنبوبيّة Amaran PT2c',en:'Aputure Amaran PT2c',cat:'light',q:'Aputure Amaran PT2c',note:'إضاءة خلفيّة ملوّنة تعطي عمقاً للّقطة.'},
  // ── المخزن ──
  case:{name:'حقيبة معدات صلبة',en:'Hard equipment case',cat:'storage',q:'hard case camera equipment waterproof',note:'لنقل الكاميرات والمايكات.'},
  greenscreen:{name:'شاشة خضراء Elgato (قابلة للطيّ)',en:'Elgato Green Screen',cat:'storage',q:'Elgato Green Screen',note:'اختياريّة — تُفرد عند الحاجة وتُطوى في المخزن.'},
  // ── الأثاث (نماذج أمازون ثلاثيّة الأبعاد — ABO) ──
  B07B7DL32P:{name:'طاولة البودكاست (خشب جوز)',en:'Rivet Anne Mid-Century Modern Wood Desk, 62"W, Walnut',cat:'furniture',img:'81DV+dV0+5L',model:1},
  B075Z8769G:{name:'كرسي دوّار بذراعين منحنية',en:'Rivet Swope Curved Arm Swivel Office Chair, Felt Grey',cat:'furniture',img:'918OhgZ71BL',model:1},
  B0735RJPDH:{name:'سجادة صوف رمادية ١٦٠×٢٤٠',en:'Rivet Linear Distressed Wool Area Rug, 5x8, Grey',cat:'furniture',img:'A1qPkQ+JdFL',model:1,flat:1},
  B075Z6YS1Z:{name:'مكتبة صناعية ٤ رفوف (خلفيّة التصوير)',en:'Stone & Beam Larson Industrial 4-Shelf Bookcase, Walnut',cat:'furniture',img:'81G6aQrK0GL',model:1},
  B07HKF59YX:{name:'أباجورة أرضيّة Henley',en:'Stone & Beam Henley Mid-Century Floor Lamp',cat:'furniture',img:'41yzx8pNH6L',model:1},
  B07QB8L3M9:{name:'أصيص نبات بحامل خشبي',en:'Rivet Stoneware Planter with Wood Stand',cat:'decor',img:'71glQGmP8pL',model:1},
  B07HSJZZNY:{name:'لوحة جداريّة هندسيّة',en:'Rivet Thick-Texture Geometric Print Wall Art',cat:'decor',img:'917dKsL+zFL',model:1,wall:1},
  B07HK5CDRQ:{name:'إضاءة جداريّة (سكونس)',en:'Stone & Beam Modern Wall Mount Sconce',cat:'decor',img:'81pwfl0WDoL',model:1,wall:1},
  B07P5LMFPN:{name:'كنبة جلد سوداء لشخصين',en:'Rivet Revolve Modern Leather Loveseat, 56"W, Black',cat:'furniture',img:'714UI+BKqQL',model:1},
  B072PZVYC2:{name:'كرسي جلد أسود Huxley',en:'Rivet Huxley Leather Mid-Century Accent Chair, Black',cat:'furniture',img:'91nnEzCk8hL',model:1},
  B072ZMVR53:{name:'طاولة وسط خشب ومعدن',en:'Rivet Hairpin Wood and Metal Coffee Table, Walnut',cat:'furniture',img:'71YKYSYUzGL',model:1},
  B07HSHG84W:{name:'سجادة صوف رماديّة ١٥٠×٢٤٠',en:'Rivet Wool Blend Area Rug, 5x8, Grey & Charcoal',cat:'furniture',img:'A1mKIHuO4xL',model:1,flat:1},
  B072ZLCB3M:{name:'طاولة جانبيّة خشب طبيعي',en:'Rivet Bristol Natural Edge Side Table, Walnut',cat:'furniture',img:'81Xh+yZvD1L',model:1},
  B073755HVS:{name:'أباجورة قوسيّة',en:'Stone & Beam Modern Arc Floor Lamp',cat:'furniture',img:'71J5bsr1KtL',model:1},
  B073P1BJ8J:{name:'لوحة أشجار أبيض وأسود',en:'Rivet Black and White Tree Line Wall Art',cat:'decor',img:'81t+j3HIOpL',model:1,wall:1},
  B0831PH1MB:{name:'أصيص نبات صغير',en:'Rivet Global Stoneware Planter, Black Glaze',cat:'decor',img:'61o23JO2vVL',model:1},
  B0754K96NJ:{name:'رفّ مكعّبات للمعدات',en:'Furniture 247 4-Cube Shelving Unit, Black Oak',cat:'storage',img:'713GZuV53qL',model:1},
  B072ZNMKGM:{name:'خزانة معدات صناعيّة',en:'Rivet King Street Industrial Cabinet',cat:'storage',img:'81cmXGpwJ8L',model:1},
  // ── المكاتب والقاعة والاستقبال (تصوّر مبدئيّ على أثاث المخطط) ──
  B07MNYTYR4:{name:'كرسي اجتماعات دوّار',en:'AmazonBasics Low-Back Swivel Task Chair',cat:'office',img:'71ognFgoRAL',model:1},
  trainingtable:{name:'طاولة تدريب ١٥٠×٧٠',en:'Training / conference table 150x70',cat:'office',q:'training table 150x70 office'},
  ovaltable:{name:'طاولة اجتماعات بيضاويّة',en:'Oval conference table 8-12 seats',cat:'office',q:'oval conference table'},
  receptiondesk:{name:'مكتب استقبال',en:'Modern reception desk',cat:'office',q:'reception desk modern'},
  plant:{name:'نبتة صناعيّة كبيرة',en:'Large artificial indoor plant',cat:'office',q:'artificial plant large indoor'},
};

export const CATS={audio:'الصوت',video:'التصوير',light:'الإضاءة',furniture:'الأثاث',decor:'الديكور',storage:'المخزن',office:'المكاتب والقاعة'};

// الغرف (من المخطط EX.OF.KSA.5024 — بالمتر)
export const ROOMS={
  A:{name:'استوديو A — طاولة البودكاست',x0:6.63,z0:.14,x1:13.23,z1:4.80},
  B:{name:'استوديو B — جلسة الضيوف',x0:13.32,z0:.14,x1:19.90,z1:4.80},
  S:{name:'المخزن — معدّات التصوير',x0:4.02,z0:1.02,x1:6.53,z1:3.62},
};

const P=Math.PI,H=P/2;
// [المنتج, x, z, ry, y?] — y للأشياء المعلّقة أو فوق غيرها
export const LAYOUT=[
  // ═══ استوديو A: طاولة بودكاست لثلاثة، الكاميرات من جهة الباب ═══
  ['B0735RJPDH',9.93,2.15,0],
  ['B07B7DL32P',9.93,2.05,0],
  ['B075Z8769G',8.85,2.05,H],['B075Z8769G',11.01,2.05,-H],['B075Z8769G',9.93,1.35,0],
  ['rodecaster',9.93,2.15,0,.762],
  ['psa1',9.2,2.05,H,.762],['psa1',10.66,2.05,-H,.762],['psa1',9.93,1.72,0,.762],
  ['headphones',9.4,2.25,0,.762],['headphones',10.45,2.25,0,.762],['headphones',9.6,1.82,0,.762],
  ['B075Z6YS1Z',8.2,.34,0],['B075Z6YS1Z',11.66,.34,0],
  ['B07QB8L3M9',8.2,.34,0,1.86],['B0831PH1MB',11.66,.34,0,1.86],
  ['B07HSJZZNY',9.93,.16,0,1.55],
  ['B07HK5CDRQ',9.05,.16,0,2.0],['B07HK5CDRQ',10.81,.16,0,2.0],
  ['B07HKF59YX',7.15,.6,0],
  ['tube',7.0,.45,0],['tube',12.85,.45,0],
  ['keylight',8.1,3.55,P-.75],['keylight',11.76,3.55,P+.75],
  ['fx30',9.93,4.35,P],['zve10',8.75,3.75,P-.45],['zve10',11.11,3.75,P+.45],
  ['atem',12.6,4.45,P,0],
  ['panels',6.66,2.2,H,1.2],['panels',13.2,2.2,-H,1.2],
  // ═══ استوديو B: جلسة كنب وكرسيّين ═══
  ['B07HSHG84W',16.61,2.0,0],
  ['B07P5LMFPN',16.61,.9,0],
  ['B072PZVYC2',15.05,2.15,H-.45],['B072PZVYC2',18.17,2.15,-H+.45],
  ['B072ZMVR53',16.61,2.1,0],
  ['rodecaster',16.9,2.1,0,.468],
  ['B072ZLCB3M',14.55,.75,0],['B0831PH1MB',14.55,.75,0,.476],
  ['B073755HVS',18.75,.85,-H],
  ['B073P1BJ8J',16.61,.16,0,1.75],
  ['floorstand',16.2,1.75,0],['floorstand',17.0,1.75,0],['floorstand',15.5,2.75,H],['floorstand',17.7,2.75,-H],
  ['tube',13.7,.45,0],['tube',19.5,.45,0],
  ['keylight',14.6,3.75,P-.7],['keylight',18.6,3.75,P+.7],
  ['fx30',16.61,4.4,P],['zve10',15.4,4.0,P-.4],['zve10',17.8,4.0,P+.4],
  ['panels',13.35,2.4,H,1.2],['panels',19.87,2.4,-H,1.2],
  // ═══ المخزن ═══
  ['B0754K96NJ',4.25,1.6,H],['B0754K96NJ',4.25,2.45,H],
  ['B072ZNMKGM',5.35,1.25,0],
  ['case',5.6,2.4,.3],['case',6.0,2.0,-.2],
  ['greenscreen',6.25,1.35,0],
];

/* ═══ باقي المكان — تصوّر مبدئيّ يتبع أثاث المخطط (المواقع مقروءة من ملفّ PDF) ═══ */
const CH='B07MNYTYR4',DESK='B07B7DL32P',BOSS='B075Z8769G',GUEST='B072PZVYC2',SOFA='B07P5LMFPN',COFFEE='B072ZMVR53',SIDE='B072ZLCB3M';
const add=(...r)=>LAYOUT.push(r);
// الاستقبال
add('receptiondesk',4.1,7.3,-H);add(BOSS,4.8,7.3,-H);
add(GUEST,1.7,5.65,0);add(GUEST,2.5,5.65,0);add(SIDE,1.05,5.6,0);add(SIDE,3.15,5.6,0);add('plant',.6,8.2,0);
// القاعة الكبرى: طاولات على شكل U وطاولة وسطى، ومنصّة المقدّم
for(let i=0;i<5;i++){const x=10.25+i*1.5;add('trainingtable',x,6.15,0);add(CH,x-.38,5.45,0);add(CH,x+.38,5.45,0);
  add('trainingtable',x,12.7,0);add(CH,x-.38,13.4,P);add(CH,x+.38,13.4,P)}
for(let i=0;i<4;i++){const z=7.4+i*1.5;add('trainingtable',9.15,z,H);add(CH,8.45,z-.38,H);add(CH,8.45,z+.38,H)}
for(const [x,z] of[[12.0,8.95],[13.5,8.95],[12.0,9.65],[13.5,9.65]])add('trainingtable',x,z,0);
for(const x of[11.6,12.4,13.1,13.9]){add(CH,x,8.2,0);add(CH,x,10.4,P)}
add(DESK,16.6,9.3,H);add(BOSS,17.35,9.3,-H);add('plant',18.2,5.4,0);add('plant',18.2,13.3,0);
// مكتب المدير (يسار القاعة)
add(SOFA,2.05,11.3,H);add(COFFEE,3.0,11.3,H);add(GUEST,4.35,10.75,-H);add(GUEST,4.35,11.85,-H);
add(DESK,3.55,12.7,0);add(BOSS,3.55,13.45,P);add('plant',4.9,9.4,0);
// المكاتب الزجاجيّة الثلاثة
add(DESK,8.0,15.0,-H);add(BOSS,7.2,15.0,H);add(GUEST,8.95,14.6,-H);
add(DESK,11.9,15.0,H);add(BOSS,12.6,15.0,-H);add(GUEST,11.0,14.6,H);
add(DESK,15.5,15.0,H);add(BOSS,16.2,15.0,-H);add(GUEST,14.6,14.6,H);
// المكتب الأيمن
add(DESK,18.25,15.3,P);add(BOSS,18.25,14.55,0);add(SOFA,19.35,16.6,-H);add(GUEST,17.4,16.2,H);add(SIDE,18.4,16.3,0);
// الصفّ السفليّ: مكتبان + غرفة الاجتماعات + مكتبان
for(const x of[7.8,16.5,18.7]){add(DESK,x,19.4,0);add(BOSS,x,20.15,P);add(GUEST,x-.5,18.55,0);add(GUEST,x+.5,18.55,0)}
add('ovaltable',12.35,19.45,0);
for(let i=0;i<6;i++){const x=10.75+i*.64;add(CH,x,18.65,0);add(CH,x,20.25,P)}
add(CH,10.0,19.45,H);add(CH,14.7,19.45,-H);
// المكتب السفليّ الأيسر
add(DESK,3.2,17.85,P);add(BOSS,3.2,17.1,0);add(SOFA,2.05,19.1,H);add(GUEST,4.1,18.6,-H);add('plant',1.9,20.3,0);

// كمّيّات قائمة المشتريات لما لا يظهر مجسّماً (يُضاف لعدّ القطع في LAYOUT)
export const EXTRA={sm7b:7,xlr:7,headphones:4,lens:6,tripod:6,softbox:4,cstand:4};
