import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Gift, Heart, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { BlurText } from './BlurText';
import { GlassCard, LiquidButton } from './GlassUI';
import { PageBackButton } from './PageBackButton';
import { girlProfileRepository, importantDateRepository, userProfileRepository } from '@/lib/db/repositories';
import type { GirlProfile, ImportantDate } from '@/types';

type FormState = {
  name: string;
  date: string;
  type: ImportantDate['type'];
};

const EMPTY_FORM: FormState = {
  name: '',
  date: '',
  type: 'birthday',
};

const TYPE_META: Record<ImportantDate['type'], { label: string; icon: string }> = {
  birthday: { label: '生日', icon: '🎂' },
  anniversary: { label: '纪念日', icon: '💞' },
  other: { label: '自定义', icon: '✨' },
};

function dateLabel(value: string): string {
  if (!value) return '未设置日期';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
}

function daysUntilNext(value: string): number | null {
  if (!value) return null;
  const base = new Date(`${value}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), base.getMonth(), base.getDate());
  if (next < today) {
    next = new Date(today.getFullYear() + 1, base.getMonth(), base.getDate());
  }
  return Math.ceil((next.getTime() - today.getTime()) / 86400000);
}

function reminderText(item: ImportantDate): string {
  const days = daysUntilNext(item.date);
  if (days == null) return '日期待确认';
  if (days === 0) return '就是今天';
  if (days === 1) return '明天';
  if (days <= 30) return `${days} 天后`;
  return `${days} 天后`;
}

export function ImportantDatesPage() {
  const [girl, setGirl] = useState<GirlProfile | null>(null);
  const [items, setItems] = useState<ImportantDate[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await userProfileRepository.getCurrent();
      const currentGirl = user ? (await girlProfileRepository.getByUserId(user.id))[0] : undefined;
      setGirl(currentGirl ?? null);
      setItems(currentGirl ? await importantDateRepository.listByGirlId(currentGirl.id) : []);
    } catch (err) {
      console.error('❌ [ImportantDatesPage] 加载失败:', err);
      setError('重要日子读取失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (daysUntilNext(a.date) ?? 9999) - (daysUntilNext(b.date) ?? 9999));
  }, [items]);

  const upcomingCount = sortedItems.filter((item) => {
    const days = daysUntilNext(item.date);
    return days != null && days <= 30;
  }).length;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (item: ImportantDate) => {
    setForm({ name: item.name, date: item.date, type: item.type });
    setEditingId(item.id);
    setMessage(null);
    setError(null);
  };

  const handleSave = async () => {
    setMessage(null);
    setError(null);
    if (!girl) {
      setError('请先完成资料建档，再添加重要日子');
      return;
    }
    if (!form.name.trim() || !form.date) {
      setError('请填写名称和日期');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await importantDateRepository.update(editingId, form);
        setMessage('已更新重要日子');
      } else {
        await importantDateRepository.create({ ...form, girlId: girl.id });
        setMessage('已添加重要日子');
      }
      resetForm();
      setItems(await importantDateRepository.listByGirlId(girl.id));
    } catch (err) {
      console.error('❌ [ImportantDatesPage] 保存失败:', err);
      setError('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个重要日子吗？')) return;
    setMessage(null);
    setError(null);
    try {
      await importantDateRepository.delete(id);
      if (editingId === id) resetForm();
      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage('已删除重要日子');
    } catch (err) {
      console.error('❌ [ImportantDatesPage] 删除失败:', err);
      setError('删除失败，请稍后重试');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: 800, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <PageBackButton />
        </div>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, letterSpacing: '-0.03em' }}>
          <BlurText text="重要日子" startDelay={60} className="gradient-text" style={{ fontWeight: 700, display: 'inline' }} />
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          记录生日、纪念日和需要提前准备的小日子。
        </p>
      </div>

      {message && (
        <div style={{ marginBottom: 16, borderRadius: 16, padding: '12px 16px', color: '#4CAF82', background: 'rgba(76,175,130,0.1)', border: '1px solid rgba(76,175,130,0.22)', fontSize: 13, fontWeight: 600 }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ marginBottom: 16, borderRadius: 16, padding: '12px 16px', color: '#C96A6A', background: 'rgba(201,106,106,0.1)', border: '1px solid rgba(201,106,106,0.22)', fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <GlassCard style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 12, background: 'linear-gradient(135deg,#E8748A,#C5956C)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarDays size={17} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-rose)' }}>{editingId ? '编辑重要日子' : '新增重要日子'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7 }}>暂不做系统通知，只在 App 内提醒。</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12, marginBottom: 12 }}>
          <input
            className="glass-input"
            placeholder="名称，例如：她的生日、第一次见面"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            style={{ borderRadius: 18, padding: '12px 16px', fontSize: 14, color: 'var(--text-rose)' }}
          />
          <input
            className="glass-input"
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            style={{ borderRadius: 18, padding: '12px 16px', fontSize: 14, color: 'var(--text-rose)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {(['birthday', 'anniversary', 'other'] as const).map((type) => {
            const active = form.type === type;
            return (
              <button
                key={type}
                onClick={() => setForm((prev) => ({ ...prev, type }))}
                style={{
                  borderRadius: 999,
                  padding: '9px 16px',
                  border: active ? '1px solid rgba(232,116,138,0.35)' : '1px solid rgba(139,92,246,0.18)',
                  background: active ? 'rgba(232,116,138,0.14)' : 'rgba(255,255,255,0.32)',
                  color: active ? 'var(--pink-primary)' : 'var(--text-purple)',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {TYPE_META[type].icon} {TYPE_META[type].label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <LiquidButton onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
            <Save size={15} />
            {saving ? '保存中...' : editingId ? '保存修改' : '添加日子'}
          </LiquidButton>
          {editingId && (
            <LiquidButton variant="secondary" onClick={resetForm} style={{ justifyContent: 'center' }}>
              <X size={15} />
              取消
            </LiquidButton>
          )}
        </div>
      </GlassCard>

      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-rose)' }}>{girl ? `${girl.nickname || '她'} 的重要日子` : '重要日子列表'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7, marginTop: 3 }}>
              未来 30 天内有 {upcomingCount} 个提醒
            </div>
          </div>
          <Gift size={20} color="var(--pink-primary)" />
        </div>

        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>
            正在读取重要日子...
          </div>
        ) : !girl ? (
          <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>
            请先完成资料建档，再记录重要日子。
          </div>
        ) : sortedItems.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>
            还没有记录，先添加一个生日或纪念日吧。
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sortedItems.map((item) => (
              <div
                key={item.id}
                style={{
                  borderRadius: 18,
                  padding: '14px 16px',
                  background: 'rgba(255,248,252,0.52)',
                  border: '1px solid rgba(232,116,138,0.14)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{TYPE_META[item.type].icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-rose)' }}>{item.name}</span>
                    <span style={{ borderRadius: 999, padding: '3px 9px', background: 'rgba(232,116,138,0.1)', color: 'var(--pink-primary)', fontSize: 11, fontWeight: 600 }}>
                      {TYPE_META[item.type].label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.75 }}>
                    {dateLabel(item.date)} · {reminderText(item)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => startEdit(item)}
                    style={{ width: 34, height: 34, borderRadius: 999, border: '1px solid rgba(212,96,122,0.2)', background: 'rgba(255,255,255,0.45)', color: 'var(--pink-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="编辑"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => void handleDelete(item.id)}
                    style={{ width: 34, height: 34, borderRadius: 999, border: '1px solid rgba(201,106,106,0.18)', background: 'rgba(255,235,235,0.32)', color: '#C96A6A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <div style={{ marginTop: 14, borderRadius: 18, padding: '14px 16px', background: 'rgba(240,184,160,0.1)', border: '1px solid rgba(191,142,110,0.18)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Heart size={16} color="#BF8E6E" style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-purple)', lineHeight: 1.7 }}>
          提醒是为了更细心，不是为了制造压力。适当准备、自然表达，比临时补救更舒服。
        </p>
      </div>
    </div>
  );
}
