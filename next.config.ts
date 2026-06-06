import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // تصدير ثابت (HTML/CSS/JS) لنشره على GitHub Pages
  output: "export",
  // GitHub Pages لا يدعم تحسين الصور التلقائي
  images: { unoptimized: true },
  // روابط بشرطة مائلة في النهاية — أنسب للاستضافة الثابتة
  trailingSlash: true,
};

export default nextConfig;
