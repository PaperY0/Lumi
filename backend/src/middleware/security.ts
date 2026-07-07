import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'node:crypto';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_GLOBAL_MAX = 100;
const DEFAULT_AI_MAX = 30;

function numberFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return ['http://localhost:5173', 'http://localhost:5174'];
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const globalRateLimiter = rateLimit({
  windowMs: numberFromEnv('RATE_LIMIT_WINDOW_MS', DEFAULT_WINDOW_MS),
  limit: numberFromEnv('RATE_LIMIT_MAX', DEFAULT_GLOBAL_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: '请求过于频繁，请稍后再试',
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: numberFromEnv('RATE_LIMIT_WINDOW_MS', DEFAULT_WINDOW_MS),
  limit: numberFromEnv('AI_RATE_LIMIT_MAX', DEFAULT_AI_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI_RATE_LIMITED',
    message: 'AI 请求过于频繁，请稍后再试',
  },
});

export function attachRequestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-request-id');
  const requestId = incoming || randomUUID();
  res.locals.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

export function getRequestId(res: Response): string {
  return String(res.locals.requestId || 'unknown');
}

export function summarizeRequestBody(body: any) {
  if (!body || typeof body !== 'object') {
    return { bodyType: typeof body };
  }

  return {
    keys: Object.keys(body),
    hasUserProfile: !!body.userProfile,
    hasGirlProfile: !!body.girlProfile,
    hasMaleQuestionnaire: !!body.maleQuestionnaire,
    hasFemaleQuestionnaire: !!body.femaleQuestionnaire,
    messagesCount: Array.isArray(body.messages) ? body.messages.length : undefined,
    recentMessagesCount: Array.isArray(body.recentMessages) ? body.recentMessages.length : undefined,
    conversationCount: Array.isArray(body.conversation) ? body.conversation.length : undefined,
    originalMarkdownLength: typeof body.originalMarkdown === 'string' ? body.originalMarkdown.length : undefined,
    userMessageLength: typeof body.userMessage === 'string' ? body.userMessage.length : undefined,
    userReplyLength: typeof body.userReply === 'string' ? body.userReply.length : undefined,
    scenario: typeof body.scenario === 'string' ? body.scenario : undefined,
    difficulty: typeof body.difficulty === 'string' ? body.difficulty : undefined,
    scene: typeof body.scene === 'string' ? body.scene : undefined,
  };
}

export function logRouteEvent(res: Response, route: string, event: string, details: Record<string, unknown> = {}) {
  console.log(`[${getRequestId(res)}] ${route} ${event}`, details);
}
