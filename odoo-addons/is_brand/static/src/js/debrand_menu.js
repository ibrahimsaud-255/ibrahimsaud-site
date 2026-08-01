/** @odoo-module **/

import { registry } from "@web/core/registry";

/**
 * حذف عناصر قائمة المستخدم التي تشير إلى أودو
 * (الدعم، حساب أودو، التوثيق) — لا وجود لأودو في الواجهة.
 */
const userMenu = registry.category("user_menuitems");
for (const key of ["documentation", "support", "odoo_account", "odoo_referral"]) {
    if (userMenu.contains(key)) {
        userMenu.remove(key);
    }
}
