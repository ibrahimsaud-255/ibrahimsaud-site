/*
 * collab-calc.js — حساب توزيع مبلغ صفقة «متعاون» (مشترك بين اللوحة index.html
 * وبوابة المتعاون collab.html — نفس الأرقام في الطرفين دائماً).
 *
 * العميل يدفع «الإجمالي» عبر Telr (مدى أو بطاقة/Apple Pay):
 *   الضريبة (إن كانت الفاتورة ضريبيّة) ← للهيئة، خارج التوزيع.
 *   الأساس = الإجمالي − الضريبة.
 *   نسبة المؤسسة = الأساس × النسبة (افتراضياً ١٠٪).
 *   رسوم البوابة = (الإجمالي × النسبة٪ + الثابت) × (١ + ضريبة الرسوم) — على المتعاون افتراضياً.
 *   حصّة المتعاون = الأساس − نسبة المؤسسة − رسوم البوابة.
 *   رسوم الحوالة (STC Pay → Western Union) = الرسم × (١ + ضريبته) — مرّة لكلّ حوالة.
 *   الصافي في جيبه = (الحصّة − رسوم الحوالة) × سعر الصرف.
 * تعريفات فقط (نطاق عامّ)، البادئة collab.
 */
const COLLAB_FEES_DEFAULT={madaPct:1,madaFixed:0,cardPct:2.6,cardFixed:1,feeVat:15,wuFee:20,wuVat:15,fx:2.42,fxCur:'MAD',fxAt:''};
function collabFees(f){return Object.assign({},COLLAB_FEES_DEFAULT,f||{})}
function collabR(n){return Math.round((Number(n)||0)*100+Number.EPSILON*100)/100}
function collabGateway(total,method,fees){const f=collabFees(fees);const mada=method==='mada';
  const pct=Number(mada?f.madaPct:f.cardPct)||0,fixed=Number(mada?f.madaFixed:f.cardFixed)||0;
  return collabR((Number(total||0)*pct/100+fixed)*(1+(Number(f.feeVat)||0)/100))}
function collabWu(fees){const f=collabFees(fees);return collabR((Number(f.wuFee)||0)*(1+(Number(f.wuVat)||0)/100))}
/* d: {total, vat, rate, fee_bearer, pay_method, paid?} · opt.noTransfer: بلا رسوم حوالة (تُحسب على الحوالة المجمّعة) */
function collabCalc(d,fees,opt){
  const f=collabFees(fees);opt=opt||{};
  const total=collabR(d.total),vat=collabR(d.vat),base=collabR(total-vat);
  const actualGw=d.paid&&d.paid.gateway_fee!=null&&d.paid.gateway_fee!==''?collabR(d.paid.gateway_fee):null;
  const gw=actualGw!=null?actualGw:collabGateway(total,d.pay_method,f);
  const rate=Number(d.rate)||0;
  const commission=collabR(base*rate/100);
  const onFoundation=d.fee_bearer==='foundation';
  const gwPartner=onFoundation?0:gw;
  const share=collabR(base-commission-gwPartner);
  const foundationNet=collabR(commission-(onFoundation?gw:0));
  const wu=opt.noTransfer?0:collabWu(f);
  const net=collabR(share-wu);
  const fx=Number(f.fx)||0;
  return {total,vat,base,gw,gwActual:actualGw!=null,gwPartner,commission,foundationNet,share,wu,net,local:collabR(net*fx),fx,cur:f.fxCur||'MAD',rate,method:d.pay_method==='mada'?'mada':'card',onFoundation};
}
/* العكس: كم يُكتب في العرض (قبل الضريبة) حتى يصل المتعاونَ «target» بعملته؟ */
function collabReverse(target,rate,method,feeBearer,vatOn,fees){
  const f=collabFees(fees);const fx=Number(f.fx)||1;
  const net=Number(target||0)/fx;const mada=method==='mada';
  const pct=(Number(mada?f.madaPct:f.cardPct)||0)/100,fixed=Number(mada?f.madaFixed:f.cardFixed)||0,fv=1+(Number(f.feeVat)||0)/100;
  const vr=vatOn?1.15:1;const wu=collabWu(f);const r=(Number(rate)||0)/100;
  const onP=feeBearer!=='foundation';
  const base=(net+wu+(onP?fixed*fv:0))/((1-r)-(onP?vr*pct*fv:0));
  return Math.ceil(base);
}
function collabMethodLabel(m){return m==='mada'?'مدى (أو Apple Pay بمدى)':'بطاقة ائتمانيّة / Apple Pay'}
const COLLAB_STATUS={
  draft:{label:'مسودّة',tone:'mut'},
  submitted:{label:'بانتظار مراجعة إبراهيم',tone:'warn'},
  changes:{label:'مطلوب تعديل',tone:'bad'},
  approved:{label:'معتمد — أُرسل رابط الدفع',tone:'info'},
  paid:{label:'مدفوع — بانتظار الحوالة',tone:'good'},
  settled:{label:'حُوِّل لك ✓',tone:'good'},
  cancelled:{label:'ملغى',tone:'mut'},
};
const COLLAB_ACTIONS={create:'أُنشئت',edit:'عُدّلت',submit:'أُرسلت للمراجعة',cancel:'أُلغيت',evidence:'أُرفق شاهد',evidence_del:'حُذف شاهد',
  approve:'اعتُمدت وأُرفق رابط الدفع',changes:'طُلب تعديل',paid:'سُجّل الدفع وصدرت الفاتورة',settle:'حُوّلت ضمن حوالة',link:'حُدّث رابط الدفع',reopen:'أُعيد فتحها',pin_change:'غُيّر رمز الدخول'};
