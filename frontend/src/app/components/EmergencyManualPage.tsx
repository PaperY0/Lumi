import { useMemo, useState } from 'react';
import { Copy, Search, ShieldAlert } from 'lucide-react';
import { emergencyManualItems } from '@/data/emergencyManualItems';
import { BlurText } from './BlurText';

const categories = ['全部', '冷场', '道歉', '误会', '边界', '邀约', '降温'] as const;

export function EmergencyManualPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('全部');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return emergencyManualItems.filter((item) => {
      const categoryOk = category === '全部' || item.category === category;
      const queryOk = !normalized || [item.title, item.trigger, item.doFirst, item.suggestedReply, item.avoid]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
      return categoryOk && queryOk;
    });
  }, [category, query]);

  const copyReply = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <div style={{ padding: '28px 32px 48px', maxWidth: 1180, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <BlurText text="应急手册" startDelay={60} style={{ fontSize: 26, fontWeight: 700, color: '#4A2E38', letterSpacing: '-0.04em', display: 'block' }} />
        <p style={{ margin: '5px 0 0', fontSize: 14, color: '#7B5C6E', opacity: 0.75 }}>
          常见高压沟通场景的即时处理卡片，先稳住关系，再慢慢说清楚。
        </p>
      </div>

      <div className="glass-card" style={{ borderRadius: 24, padding: 18, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 13, color: '#9B7B8A' }} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索：冷淡、道歉、误会、邀约..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: 999,
                border: '1px solid rgba(212,96,122,0.22)',
                background: 'rgba(255,248,252,0.7)',
                padding: '11px 16px 11px 40px',
                outline: 'none',
                color: '#4A2E38',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((item) => {
              const active = item === category;
              return (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  style={{
                    border: active ? 'none' : '1px solid rgba(212,96,122,0.22)',
                    background: active ? 'linear-gradient(135deg,#D4607A,#C5956C)' : 'rgba(255,248,252,0.55)',
                    color: active ? 'white' : '#7B5C6E',
                    borderRadius: 999,
                    padding: '9px 15px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((item) => (
          <article key={item.id} className="glass-card hoverable-card" style={{ borderRadius: 20, padding: 20, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: 'linear-gradient(135deg,#D4607A,#BF8E6E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={16} color="white" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#D4607A', fontWeight: 700 }}>{item.category}</div>
                <h3 style={{ margin: 0, fontSize: 16, color: '#4A2E38' }}>{item.title}</h3>
              </div>
            </div>

            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#7B5C6E', lineHeight: 1.6 }}>触发：{item.trigger}</p>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#4A2E38', lineHeight: 1.6 }}>先做：{item.doFirst}</p>

            <div style={{ borderRadius: 16, padding: 14, background: 'rgba(212,96,122,0.07)', border: '1px solid rgba(212,96,122,0.18)', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#D4607A', fontWeight: 700, marginBottom: 6 }}>可直接参考</div>
              <p style={{ margin: 0, fontSize: 14, color: '#4A2E38', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{item.suggestedReply}</p>
            </div>

            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#9A5E68', lineHeight: 1.55 }}>避免：{item.avoid}</p>

            <button
              onClick={() => copyReply(item.id, item.suggestedReply)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                border: 'none',
                borderRadius: 999,
                padding: '8px 14px',
                background: copiedId === item.id ? 'linear-gradient(135deg,#D4607A,#C5956C)' : 'rgba(255,248,252,0.75)',
                color: copiedId === item.id ? 'white' : '#D4607A',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Copy size={13} />
              {copiedId === item.id ? '已复制' : '复制建议'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
