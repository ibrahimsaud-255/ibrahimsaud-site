from odoo import api, models

# استبدالات المصطلحات: أي ذكر لاسم المنصّة يتحوّل لمصطلح محايد بهويتك.
# ملاحظة: الأحرف الصغيرة odoo (روابط ومعرّفات تقنية) تُترك كما هي عمداً
# حتى لا تنكسر الروابط أو أسماء الوحدات.
BRAND_REPLACEMENTS = (
    ('أودو إنتربرايز', 'النسخة المؤسسية'),
    ('Odoo Enterprise', 'النسخة المؤسسية'),
    ('Odoo Community', 'النظام'),
    ('Odoo Online', 'النظام'),
    ('Odoo Studio', 'الاستوديو'),
    ('Odoo.sh', 'النظام'),
    ('أودو', 'النظام'),
    ('Odoo', 'النظام'),
    ('ODOO', 'النظام'),
)


def scrub(text):
    """يزيل اسم المنصّة من نص معروض للمستخدم."""
    if not text or not isinstance(text, str):
        return text
    for needle, replacement in BRAND_REPLACEMENTS:
        if needle in text:
            text = text.replace(needle, replacement)
    return text


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    @api.model
    def _get_translations_for_webclient(self, modules, lang):
        """يمرّر ترجمات الواجهة عبر مُنظِّف الهوية قبل إرسالها للمتصفح."""
        translations_per_module, lang_params = super()._get_translations_for_webclient(modules, lang)

        cleaned = {}
        for module, data in translations_per_module.items():
            messages = data.get('messages', ()) if data else ()
            cleaned[module] = {
                'messages': tuple(
                    {'id': msg['id'], 'string': scrub(msg['string'])}
                    for msg in messages
                )
            }
        return cleaned, lang_params
