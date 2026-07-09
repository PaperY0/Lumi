import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

export function PageBackButton({ label = '返回' }: { label?: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        padding: '8px 16px',
        border: '1px solid rgba(212,96,122,0.22)',
        background: 'rgba(255,248,252,0.62)',
        color: 'var(--pink-primary)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  );
}
