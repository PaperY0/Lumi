import React from 'react';
import {
  Shield, MessageCircle, Coffee, HeartHandshake, Hourglass, Sprout,
  Eye, Waves, Heart, Megaphone, Flower2, Handshake,
  Sparkles, Lightbulb, Hand, Bird, Ear, Smile, Send,
  Snowflake, AlertTriangle, type LucideIcon,
} from 'lucide-react';

/**
 * IconBadge — Liquid Glass 风格图标徽章
 * ──────────────────────────────────────────────
 * 用半透明玻璃底 + 雾紫/玫瑰金描边 + 内发光 + lucide 线性图标，
 * 替换裸露的彩色系统 emoji，保持 Apple-like 克制高级感。
 *
 * 两种用法：
 *  1. 直接传 icon：<IconBadge icon={Shield} />
 *  2. 传语义 token：<IconBadge token="boundary" />（内部映射到图标）
 */

export type IconToken =
  | 'boundary' | 'chat' | 'invite' | 'apology' | 'patience' | 'grow'
  | 'perspective' | 'repair' | 'love' | 'express' | 'flower' | 'respect'
  | 'insight' | 'tip' | 'no-control' | 'no-pressure' | 'listen'
  | 'calm' | 'send' | 'cold' | 'notice';

/** 语义 token → lucide 图标 */
const TOKEN_ICON: Record<IconToken, LucideIcon> = {
  boundary: Shield,
  chat: MessageCircle,
  invite: Coffee,
  apology: HeartHandshake,
  patience: Hourglass,
  grow: Sprout,
  perspective: Eye,
  repair: Waves,
  love: Heart,
  express: Megaphone,
  flower: Flower2,
  respect: Handshake,
  insight: Sparkles,
  tip: Lightbulb,
  'no-control': Hand,
  'no-pressure': Bird,
  listen: Ear,
  calm: Smile,
  send: Send,
  cold: Snowflake,
  notice: AlertTriangle,
};

/** 常见 emoji → token，便于批量替换旧数据 */
export const EMOJI_TOKEN: Record<string, IconToken> = {
  '🛡️': 'boundary', '💬': 'chat', '☕': 'invite', '🍜': 'invite',
  '🙏': 'apology', '⏳': 'patience', '🌱': 'grow', '👁️': 'perspective',
  '🌊': 'repair', '❤️': 'love', '💗': 'love', '💌': 'love',
  '🗣️': 'express', '🌸': 'flower', '🤝': 'respect', '✨': 'insight',
  '💡': 'tip', '✋': 'no-control', '🕊️': 'no-pressure', '👂': 'listen',
  '😌': 'calm', '😊': 'calm', '🙂': 'calm', '😤': 'notice',
  '❄️': 'cold', '🔥': 'love',
};

type Tone = 'rose' | 'gold' | 'lavender' | 'mint';

const TONE: Record<Tone, { bg: string; border: string; glow: string; icon: string }> = {
  rose: {
    bg: 'linear-gradient(135deg, rgba(200,96,122,0.14), rgba(240,192,208,0.10))',
    border: 'rgba(200,96,122,0.30)',
    glow: 'inset 0 1px 0 rgba(255,255,255,0.55), 0 2px 10px rgba(200,96,122,0.14)',
    icon: 'var(--soft-rose)',
  },
  gold: {
    bg: 'linear-gradient(135deg, rgba(196,160,112,0.16), rgba(250,240,228,0.12))',
    border: 'rgba(196,160,112,0.32)',
    glow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 10px rgba(196,160,112,0.16)',
    icon: 'var(--champagne-gold)',
  },
  lavender: {
    bg: 'linear-gradient(135deg, rgba(176,160,204,0.16), rgba(232,224,244,0.10))',
    border: 'rgba(176,160,204,0.34)',
    glow: 'inset 0 1px 0 rgba(255,255,255,0.55), 0 2px 10px rgba(176,160,204,0.16)',
    icon: 'var(--lavender-mist)',
  },
  mint: {
    bg: 'linear-gradient(135deg, rgba(128,192,168,0.16), rgba(224,244,236,0.10))',
    border: 'rgba(128,192,168,0.32)',
    glow: 'inset 0 1px 0 rgba(255,255,255,0.55), 0 2px 10px rgba(128,192,168,0.16)',
    icon: 'var(--soft-mint)',
  },
};

interface IconBadgeProps {
  icon?: LucideIcon;
  token?: IconToken;
  /** 传 emoji 字符，自动映射到对应图标（找不到时回退为 insight 图标） */
  emoji?: string;
  size?: number;
  tone?: Tone;
  style?: React.CSSProperties;
  className?: string;
}

export function IconBadge({
  icon,
  token,
  emoji,
  size = 40,
  tone = 'rose',
  style = {},
  className = '',
}: IconBadgeProps) {
  const resolved: LucideIcon =
    icon ||
    (token ? TOKEN_ICON[token] : undefined) ||
    (emoji ? TOKEN_ICON[EMOJI_TOKEN[emoji] ?? 'insight'] : undefined) ||
    Sparkles;

  const t = TONE[tone];
  const iconSize = Math.round(size * 0.48);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: t.bg,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${t.border}`,
        boxShadow: t.glow,
        ...style,
      }}
    >
      {React.createElement(resolved, { size: iconSize, color: t.icon, strokeWidth: 1.8 })}
    </div>
  );
}

export default IconBadge;
