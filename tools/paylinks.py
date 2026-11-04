#!/usr/bin/env python3
"""روابط الدفع (تلر) للباقات — جدول إكسل يعبّيه إبراهيم، ثمّ يُقرأ إلى src/lib/paylinks.json.

  make   <ملف.xlsx>   يصنع الجدول الفارغ (سطر لكلّ رابط)
  import <ملف.xlsx|.numbers>   يقرأ الروابط المعبّأة ويكتب src/lib/paylinks.json

الخدمات اللي تُدفع على دفعتين لها رابطان: «كامل» و«نصف». جلسة التشخيص وحضور+ والإعلانات رابط واحد.
النظام والنظام Pro سعرهما «من …» فما لهما رابط ثابت (عرض سعر ثمّ رابط بمبلغه).
يحتاج: pip install openpyxl (وnumbers-parser لو الملف محفوظ من Numbers)
"""
import json, os, sys
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_JSON = os.path.join(ROOT, 'src', 'lib', 'paylinks.json')

# (المعرّف في الموقع، الخدمة، الطريقة full|half، المبلغ، اسم الرابط في تلر)
ROWS = [
    ('session',     'جلسة التشخيص',      'full', 300,   'جلسة التشخيص — إبراهيم سعود'),
    ('podcast',     'حلقة بودكاست',      'full', 2750,  'حلقة بودكاست — المبلغ كامل'),
    ('podcast',     'حلقة بودكاست',      'half', 1375,  'حلقة بودكاست — الدفعة الأولى ٥٠٪'),
    ('film',        'فيلم الخدمة',       'full', 3400,  'فيلم الخدمة — المبلغ كامل'),
    ('film',        'فيلم الخدمة',       'half', 1700,  'فيلم الخدمة — الدفعة الأولى ٥٠٪'),
    ('hudoor',      'حضور',             'full', 4900,  'حضور — المبلغ كامل'),
    ('hudoor',      'حضور',             'half', 2450,  'حضور — الدفعة الأولى ٥٠٪'),
    ('hudoor-pro',  'حضور Pro',         'full', 14900, 'حضور Pro — المبلغ كامل'),
    ('hudoor-pro',  'حضور Pro',         'half', 7450,  'حضور Pro — الدفعة الأولى ٥٠٪'),
    ('hudoor-plus', 'حضور+ (شهريّاً)',    'full', 6500,  'حضور+ — اشتراك شهر'),
    ('hawiya',      'هويّة',             'full', 1490,  'هويّة — المبلغ كامل'),
    ('hawiya',      'هويّة',             'half', 745,   'هويّة — الدفعة الأولى ٥٠٪'),
    ('publish',     'حزمة النشر',        'full', 3900,  'حزمة النشر — المبلغ كامل'),
    ('publish',     'حزمة النشر',        'half', 1950,  'حزمة النشر — الدفعة الأولى ٥٠٪'),
    ('build',       'ابنِ نظامك بنفسك',  'full', 1500,  'ابنِ نظامك بنفسك — المبلغ كامل'),
    ('build',       'ابنِ نظامك بنفسك',  'half', 750,   'ابنِ نظامك بنفسك — دفعة ٥٠٪'),
    ('ad-single',   'إعلانات المتاجر: الإعلان الواحد', 'full', 750,  'إعلان المتجر — الإعلان الواحد'),
    ('ad-review',   'إعلانات المتاجر: المراجعة الكاملة', 'full', 1000, 'إعلان المتجر — المراجعة الكاملة'),
    ('ad-triple',    'إعلانات المتاجر: ٣ إعلانات', 'full', 1500, 'إعلان المتجر — ٣ إعلانات'),
]
MODE = {'full': 'المبلغ كامل', 'half': 'نصف المبلغ (الدفعة الأولى)'}


def make(path):
    wb = Workbook(); ws = wb.active; ws.title = 'روابط الدفع'
    ws.sheet_view.rightToLeft = True
    head = ['الخدمة', 'طريقة الدفع', 'المبلغ (ريال)', 'اسم الرابط في تلر', 'الصق رابط الدفع هنا', 'المعرّف (لا تعدّله)']
    ws.append(head)
    thin = Side(style='thin', color='D2D2D7')
    for c in ws[1]:
        c.font = Font(bold=True, color='FFFFFF', size=12); c.fill = PatternFill('solid', fgColor='2F66FF')
        c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    for i, (pid, name, mode, amount, telr) in enumerate(ROWS, start=2):
        ws.append([name, MODE[mode], amount, telr, '', f'{pid}/{mode}'])
        for c in ws[i]:
            c.alignment = Alignment(vertical='center', wrap_text=True)
            c.border = Border(bottom=thin)
        ws.cell(i, 3).number_format = '#,##0'
        ws.cell(i, 5).fill = PatternFill('solid', fgColor='FFF8E1')
        ws.cell(i, 6).font = Font(color='A1A1A6', size=9)
    for col, w in zip('ABCDEF', (30, 26, 14, 34, 60, 18)):
        ws.column_dimensions[col].width = w
    ws.row_dimensions[1].height = 30
    ws.freeze_panes = 'A2'
    n = len(ROWS) + 3
    ws.cell(n, 1, 'ملاحظات').font = Font(bold=True)
    notes = [
        'أنشئ كلّ رابط من لوحة تلر بالمبلغ والاسم المكتوبين، والصقه في العمود الأصفر.',
        'الخدمات اللي لها سطران: الأوّل للمبلغ كامل، والثاني للدفعة الأولى (نصف المبلغ). الموقع يعرض الخيارين.',
        'جلسة التشخيص وحضور+ وإعلانات المتاجر رابط واحد بالمبلغ كامل.',
        'النظام والنظام Pro ما لهما رابط ثابت: بعد عرض السعر ترسل للعميل رابطاً بمبلغه.',
        'السطر اللي تتركه فاضي يبقى زرّه «اطلبها» على الواتساب.',
    ]
    for k, t in enumerate(notes, start=1):
        ws.cell(n + k, 1, f'{k}. {t}')
        ws.merge_cells(start_row=n + k, start_column=1, end_row=n + k, end_column=5)
    wb.save(path); print(f'✓ {path} ({len(ROWS)} رابط)')


def rows_of(path):
    if path.endswith('.numbers'):
        from numbers_parser import Document
        return Document(path).sheets[0].tables[0].rows(values_only=True)[1:]
    return load_workbook(path).active.iter_rows(min_row=2, values_only=True)


def imp(path):
    links = {}
    for row in rows_of(path):
        if not row or not row[5] or '/' not in str(row[5]): continue
        url = (row[4] or '').strip()
        if not url: continue
        if not url.startswith('https://'): sys.exit(f'✗ رابط غير صالح في «{row[0]}»: {url}')
        pid, mode = str(row[5]).split('/', 1)
        links.setdefault(pid, {})[mode] = url
    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(links, f, ensure_ascii=False, indent=2); f.write('\n')
    print(f'✓ {OUT_JSON}: {sum(len(v) for v in links.values())} رابط لـ{len(links)} خدمة')


if __name__ == '__main__':
    if len(sys.argv) != 3 or sys.argv[1] not in ('make', 'import'): sys.exit(__doc__)
    (make if sys.argv[1] == 'make' else imp)(sys.argv[2])
