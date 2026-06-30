/**
 * AI 服务配置
 * 从环境变量读取后端服务地址
 */

export const AI_API_BASE = import.meta.env.VITE_AI_API_BASE || 'http://localhost:3001';
