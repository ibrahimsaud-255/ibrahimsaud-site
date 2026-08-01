import base64
import logging
from pathlib import Path

from . import models

_logger = logging.getLogger(__name__)

BRAND_NAME = 'إبراهيم سعود'


def _read_asset(filename):
    path = Path(__file__).parent / 'static' / 'src' / 'img' / filename
    if not path.exists():
        _logger.warning('is_brand: ملف الهوية غير موجود %s', path)
        return None
    return base64.b64encode(path.read_bytes())


def post_init_hook(env):
    """يضبط شعار الشركة والأيقونة المفضّلة بهوية إبراهيم سعود."""
    logo = _read_asset('logo.png')
    if not logo:
        return
    # حقل الأيقونة المفضّلة يوجد فقط عند تثبيت وحدة الموقع
    has_favicon = 'favicon' in env['res.company']._fields
    for company in env['res.company'].search([]):
        values = {'logo': logo}
        if has_favicon:
            values['favicon'] = _read_asset('favicon.png') or logo
        company.write(values)
    _logger.info('is_brand: طُبّقت هوية %s على %s شركة', BRAND_NAME,
                 env['res.company'].search_count([]))
