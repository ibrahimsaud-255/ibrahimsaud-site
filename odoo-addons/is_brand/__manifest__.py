{
    'name': 'هوية إبراهيم سعود',
    'summary': 'هوية بصرية عربية لنظام إبراهيم سعود — ألوان وخطوط وشعار',
    'description': """
هوية إبراهيم سعود داخل أودو
===========================
- ألوان الهوية: حبري ‎#0a0a0c‎ + ذهبي ‎#e7b24c‎ + كريمي ‎#f5f2ea‎
- خطوط ثمانية (Sans للنصوص، Serif Display للعناوين)
- شعار الشركة والأيقونة المفضّلة
- عنوان المتصفح: نظام إبراهيم سعود بدل Odoo
- تحسينات عربية RTL
""",
    'author': 'إبراهيم سعود',
    'website': 'https://ibrahimsaud.com',
    'category': 'Theme/Backend',
    'version': '19.0.1.0.0',
    'license': 'LGPL-3',
    'depends': ['web', 'base', 'mail'],
    'data': [
        'data/debranding_data.xml',
        'views/webclient_templates.xml',
        'views/debranding_templates.xml',
        'views/debranding_mail.xml',
    ],
    'assets': {
        # متغيّرات الهوية لازم تسبق متغيّرات أودو (لأنها معرّفة بـ !default)
        'web._assets_primary_variables': [
            ('prepend', 'is_brand/static/src/scss/primary_variables.scss'),
        ],
        'web.assets_backend': [
            'is_brand/static/src/scss/fonts.scss',
            'is_brand/static/src/scss/backend.scss',
            'is_brand/static/src/js/brand_title.js',
            'is_brand/static/src/js/debrand_menu.js',
        ],
        'web.assets_frontend': [
            'is_brand/static/src/scss/fonts.scss',
            'is_brand/static/src/scss/frontend.scss',
        ],
    },
    'post_init_hook': 'post_init_hook',
    'installable': True,
    'application': False,
    'auto_install': False,
}
