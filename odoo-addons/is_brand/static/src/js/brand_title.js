/** @odoo-module **/

import { registry } from "@web/core/registry";

/**
 * يجعل عنوان تبويب المتصفح «نظام إبراهيم سعود» بدل Odoo،
 * ويبقى اسم الشاشة الحالية ظاهراً قبله.
 */
const brandTitleService = {
    dependencies: ["title"],
    start(env, { title }) {
        title.setParts({ zopenerp: "نظام إبراهيم سعود" });
    },
};

registry.category("services").add("is_brand.title", brandTitleService);
