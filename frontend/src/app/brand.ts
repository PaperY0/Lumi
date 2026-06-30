/**
 * Lumi 恋语 — 品牌配置中心
 * ──────────────────────────────────────────────
 * 全局唯一的品牌命名来源。想替换产品名时，只改这里即可。
 * 请勿在页面里硬编码 "男生手册 / 慕语 / 恋语" 等散落命名，
 * 一律从这里引用。
 */

export const BRAND_NAME = 'Lumi 恋语';
export const BRAND_SUBTITLE = 'AI 恋爱沟通陪伴工具';
export const BRAND_TAGLINE = '先理解，再表达；先尊重，再靠近。';

/** 版本号（用于设置页等展示） */
export const BRAND_VERSION = 'v1.0.0';

/** 侧边栏等空间受限处使用的简短副标题 */
export const BRAND_SUBTITLE_SHORT = 'AI 恋爱沟通陪伴';

export const BRAND = {
  name: BRAND_NAME,
  subtitle: BRAND_SUBTITLE,
  subtitleShort: BRAND_SUBTITLE_SHORT,
  tagline: BRAND_TAGLINE,
  version: BRAND_VERSION,
} as const;

export default BRAND;
