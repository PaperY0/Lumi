import React from 'react';
import { CountUp } from './CountUp';

export type PageName =
  | 'dashboard'
  | 'profile'
  | 'male-questionnaire'
  | 'female-questionnaire'
  | 'relationship-portrait'
  | 'chat-import'
  | 'chat-preview'
  | 'ai-analysis'
  | 'reply-assist'
  | 'simulation'
  | 'love-code'
  | 'settings';

// ─── Glass Card ────────────────────────────────────────────────────────────────
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  padding?: string;
  /** VisionOS 上浮 hover 效果，默认开启。纯布局容器（如步骤条外框）可传 false 关闭。 */
  hover?: boolean;
}

export function GlassCard({ children, className = '', style = {}, onClick, padding = '24px', hover = true }: GlassCardProps) {
  const hoverClass = hover ? 'hoverable-card' : '';
  return (
    <div
      className={`glass-card ${hoverClass} ${className}`.trim()}
      style={{ borderRadius: 28, padding, cursor: onClick ? 'pointer' : undefined, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Liquid Button ──────────────────────────────────────────────────────────────
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}

export function LiquidButton({ children, onClick, variant = 'primary', style = {}, className = '', disabled }: ButtonProps) {
  return (
    <button
      className={`${variant === 'primary' ? 'btn-primary' : 'btn-secondary'} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: 999,
        padding: '13px 32px',
        fontSize: 15,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontWeight: 500,
        letterSpacing: '-0.01em',
        minHeight: 44,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Glass Input ────────────────────────────────────────────────────────────────
interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  label?: string;
  type?: string;
  style?: React.CSSProperties;
}

export function GlassInput({ placeholder, value, onChange, label, type = 'text', style = {} }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, paddingLeft: 4 }}>
          {label}
        </label>
      )}
      <input
        type={type}
        className="glass-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          borderRadius: 18,
          padding: '11px 16px',
          fontSize: 14,
          color: 'var(--text-rose)',
          width: '100%',
          ...style,
        }}
      />
    </div>
  );
}

// ─── Glass Textarea ─────────────────────────────────────────────────────────────
export function GlassTextarea({ placeholder, value, onChange, label, rows = 3 }: {
  placeholder?: string; value?: string; onChange?: (v: string) => void; label?: string; rows?: number;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, paddingLeft: 4 }}>
          {label}
        </label>
      )}
      <textarea
        className="glass-input"
        placeholder={placeholder}
        value={value}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          borderRadius: 18,
          padding: '11px 16px',
          fontSize: 14,
          color: 'var(--text-rose)',
          width: '100%',
          resize: 'vertical',
        }}
      />
    </div>
  );
}

// ─── Privacy Notice ─────────────────────────────────────────────────────────────
export function PrivacyNotice({ text }: { text: string }) {
  return (
    <div className="privacy-notice" style={{ borderRadius: 16, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

// ─── Warning Notice ─────────────────────────────────────────────────────────────
export function WarningNotice({ text }: { text: string }) {
  return (
    <div className="warning-notice" style={{ borderRadius: 16, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>💜</span>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

// ─── Stage Badge ────────────────────────────────────────────────────────────────
export function StageBadge({ stage, active = false }: { stage: string; active?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 14px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        background: active
          ? 'linear-gradient(135deg, rgba(232,116,138,0.18), rgba(212,165,201,0.22))'
          : 'rgba(255,245,248,0.5)',
        border: active ? '1px solid rgba(232,116,138,0.4)' : '1px solid rgba(200,150,180,0.2)',
        color: active ? 'var(--pink-primary)' : 'var(--text-purple)',
      }}
    >
      {stage}
    </span>
  );
}

// ─── Progress Stepper ────────────────────────────────────────────────────────────
export function ProgressStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
            <div
              className={i < current ? 'step-completed' : i === current ? 'step-active' : 'step-pending'}
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 11, color: i <= current ? 'var(--pink-primary)' : 'var(--text-purple)', textAlign: 'center', opacity: i <= current ? 1 : 0.6 }}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              height: 1,
              flex: 1,
              marginBottom: 20,
              background: i < current
                ? 'linear-gradient(90deg, #E8748A, #C5956C)'
                : 'rgba(232,116,138,0.2)',
              maxWidth: 60,
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Heat Meter ─────────────────────────────────────────────────────────────────
export function HeatMeter({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
        <span style={{ fontSize: 13, color: 'var(--graphite-rose)' }}>互动热度</span>
        {/* CountUp 标注: <CountUp from={0} to={value} duration={1.2} className="metric-number" suffix="/100" /> */}
        <CountUp from={0} to={value} duration={1.2} className="metric-number" suffix="/100" style={{ fontSize: 22 }} />
      </div>
      <div style={{ height: 8, borderRadius: 999, background: 'rgba(249,200,213,0.3)', overflow: 'hidden' }}>
        <div className="heat-meter-fill" style={{ width: `${pct}%`, height: '100%' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.6 }}>冷淡</span>
        <span style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.6 }}>热烈</span>
      </div>
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 className="gradient-text" style={{ margin: 0, marginBottom: subtitle ? 6 : 0, lineHeight: 1.2 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-purple)', opacity: 0.8, lineHeight: 1.6 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Pill Tag Selector ──────────────────────────────────────────────────────────
export function PillTagSelector({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onToggle(opt)}
          className={`pill-tag ${selected.includes(opt) ? 'pill-tag-selected' : ''}`}
          style={{ padding: '6px 16px', fontSize: 13, fontWeight: 400, border: 'none', cursor: 'pointer' }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── AI Insight Card ────────────────────────────────────────────────────────────
export function AIInsightCard({
  icon,
  title,
  content,
  variant = 'default',
}: {
  icon: string;
  title: string;
  content: string | React.ReactNode;
  variant?: 'default' | 'positive' | 'risk' | 'warning';
}) {
  const variantStyles = {
    default: { bg: 'rgba(255,245,248,0.5)', border: 'rgba(255,255,255,0.4)', accent: 'var(--pink-primary)' },
    positive: { bg: 'rgba(212,255,230,0.3)', border: 'rgba(100,200,150,0.25)', accent: '#4CAF82' },
    risk: { bg: 'rgba(255,240,200,0.3)', border: 'rgba(220,180,100,0.3)', accent: '#C9875A' },
    warning: { bg: 'rgba(255,235,235,0.35)', border: 'rgba(220,150,150,0.3)', accent: '#C96A6A' },
  }[variant];

  return (
    <div
      style={{
        background: variantStyles.bg,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: `1px solid ${variantStyles.border}`,
        borderRadius: 22,
        padding: '18px 20px',
        boxShadow: '0 4px 16px rgba(200,150,175,0.08)',
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: variantStyles.accent, marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.65, opacity: 0.9 }}>{content}</div>
        </div>
      </div>
    </div>
  );
}
