import { CheckCircle, Info, XCircle } from 'lucide-react';
import { useUiStore } from '@/stores';

const toastMeta = {
  success: {
    Icon: CheckCircle,
    color: '#2E9D68',
    border: 'rgba(46,157,104,0.28)',
    background: 'rgba(240,255,247,0.78)',
  },
  error: {
    Icon: XCircle,
    color: '#C96A6A',
    border: 'rgba(201,106,106,0.28)',
    background: 'rgba(255,240,240,0.82)',
  },
  info: {
    Icon: Info,
    color: 'var(--pink-primary)',
    border: 'rgba(200,96,122,0.24)',
    background: 'rgba(255,248,252,0.82)',
  },
};

export function GlobalToast() {
  const toast = useUiStore((s) => s.toast);

  if (!toast) return null;

  const meta = toastMeta[toast.type];
  const Icon = meta.Icon;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 60,
        maxWidth: 360,
        minHeight: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 999,
        border: `1px solid ${meta.border}`,
        background: meta.background,
        color: meta.color,
        boxShadow: '0 14px 40px rgba(120,70,100,0.18), inset 0 1px 0 rgba(255,255,255,0.72)',
        backdropFilter: 'blur(18px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.5)',
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.5,
      }}
    >
      <Icon size={17} />
      <span>{toast.message}</span>
    </div>
  );
}
