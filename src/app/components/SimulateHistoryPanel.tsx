import { useEffect, useState } from 'react';
import { Trash2, Eye, X, MessageSquare, AlertCircle, Zap, ShieldCheck, Lightbulb } from 'lucide-react';
import { useSimulateHistory } from '@/hooks/useSimulateHistory';
import { userProfileRepository, girlProfileRepository } from '@/lib/db';
import type { SimulateHistoryRecord } from '@/types';

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export function SimulateHistoryPanel() {
  const {
    records, selectedRecord, loading, deletingId, error,
    loadByGirlId, selectRecord, clearSelectedRecord, deleteRecord,
  } = useSimulateHistory();

  const [girlId, setGirlId] = useState<string | null>(null);
  const [noGirl, setNoGirl] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await userProfileRepository.getCurrent();
      if (!user) { setNoGirl(true); return; }
      const girls = await girlProfileRepository.getByUserId(user.id);
      if (!girls.length) { setNoGirl(true); return; }
      setGirlId(girls[0].id);
    })();
  }, []);

  useEffect(() => {
    if (girlId) loadByGirlId(girlId);
  }, [girlId, loadByGirlId]);

  const handleDelete = async (record: SimulateHistoryRecord) => {
    const confirmed = window.confirm('确定要删除这条模拟练习历史吗？删除后不可恢复。');
    if (!confirmed) return;
    await deleteRecord(record.id);
  };

  if (noGirl) {
    return (
      <div className="glass-card" style={{ borderRadius: 24, padding: '40px 24px', textAlign: 'center' }}>
        <MessageSquare size={32} color="var(--soft-rose)" style={{ opacity: 0.4, marginBottom: 12 }} />
        <p style={{ margin: 0, fontSize: 14, color: 'var(--graphite-rose)', opacity: 0.7 }}>
          请先完成她的资料后再查看模拟练习历史
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card" style={{ borderRadius: 24, padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(200,96,122,0.15)', borderTopColor: 'var(--soft-rose)', borderRadius: 999, animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ margin: 0, fontSize: 14, color: 'var(--graphite-rose)', opacity: 0.7 }}>正在加载练习历史...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ borderRadius: 24, padding: '24px', background: 'rgba(255,235,235,0.5)', border: '1px solid rgba(200,150,150,0.3)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertCircle size={20} color="#C96A6A" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 13, color: '#C96A6A', lineHeight: 1.6 }}>{error}</p>
        </div>
      </div>
    );
  }

  // Detail view
  if (selectedRecord) {
    return <HistoryDetail record={selectedRecord} onClose={clearSelectedRecord} />;
  }

  // Empty state
  if (records.length === 0) {
    return (
      <div className="glass-card" style={{ borderRadius: 28, padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <MessageSquare size={40} color="var(--soft-rose)" style={{ opacity: 0.3 }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--deep-plum)' }}>还没有模拟练习历史</div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--graphite-rose)', opacity: 0.65, lineHeight: 1.6, maxWidth: 320 }}>
          完成一次练习并点击"结束练习并保存"后，这里会出现你的练习记录。
        </p>
      </div>
    );
  }

  // List
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {records.map(record => (
        <div key={record.id} className="glass-card hoverable-card" style={{ borderRadius: 22, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--deep-plum)', marginBottom: 4 }}>
                {record.scenario} · {record.difficulty}
              </div>
              <div style={{ fontSize: 11, color: 'var(--graphite-rose)', opacity: 0.6 }}>
                {formatDateTime(record.createdAt)}
              </div>
            </div>
            {record.finalScore != null && (
              <div style={{ padding: '4px 12px', borderRadius: 999, background: 'linear-gradient(135deg,rgba(200,96,122,0.12),rgba(196,160,112,0.12))', fontSize: 13, fontWeight: 700, color: 'var(--deep-plum)' }}>
                {record.finalScore} 分
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, color: 'var(--graphite-rose)', marginBottom: 10 }}>
            共 {record.messageCount} 条消息
            {record.finalScore != null && ` · 最终评分 ${record.finalScore}`}
          </div>

          <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--graphite-rose)', lineHeight: 1.55, opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {record.summary}
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => selectRecord(record)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: 'linear-gradient(135deg,rgba(200,96,122,0.12),rgba(196,160,112,0.12))',
                border: '1px solid rgba(200,96,122,0.2)', color: 'var(--deep-plum)',
                transition: 'all 0.2s ease',
              }}
            >
              <Eye size={13} /> 查看详情
            </button>
            <button
              onClick={() => handleDelete(record)}
              disabled={deletingId === record.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                borderRadius: 999, cursor: deletingId === record.id ? 'default' : 'pointer', fontSize: 12, fontWeight: 500,
                background: 'rgba(255,235,235,0.5)', border: '1px solid rgba(200,150,150,0.25)',
                color: '#C96A6A', opacity: deletingId === record.id ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <Trash2 size={13} /> {deletingId === record.id ? '删除中...' : '删除'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Detail sub-component ──────────────────────────────────── */
function HistoryDetail({ record, onClose }: { record: SimulateHistoryRecord; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--deep-plum)' }}>练习详情</div>
        <button onClick={onClose} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
          borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 500,
          background: 'rgba(255,250,252,0.6)', border: '1px solid rgba(200,96,122,0.2)',
          color: 'var(--soft-rose)', transition: 'all 0.2s ease',
        }}>
          <X size={13} /> 关闭详情
        </button>
      </div>

      {/* Meta */}
      <div className="glass-card" style={{ borderRadius: 22, padding: '16px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <MetaField label="场景" value={record.scenario} />
          <MetaField label="难度" value={record.difficulty} />
          <MetaField label="保存时间" value={formatDateTime(record.createdAt)} />
          <MetaField label="消息数" value={`${record.messageCount} 条`} />
          <MetaField label="你的消息" value={`${record.userMessageCount} 条`} />
          <MetaField label="她的消息" value={`${record.girlMessageCount} 条`} />
          {record.finalScore != null && <MetaField label="最终评分" value={`${record.finalScore}`} />}
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card" style={{ borderRadius: 20, padding: '16px 18px', background: 'linear-gradient(135deg,rgba(200,96,122,0.06),rgba(196,160,112,0.06))' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--graphite-rose)', opacity: 0.6, marginBottom: 6 }}>简单复盘</div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--deep-plum)', lineHeight: 1.6 }}>{record.summary}</p>
      </div>

      {/* Conversation */}
      <div className="glass-card" style={{ borderRadius: 24, padding: '20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--graphite-rose)', opacity: 0.6, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>完整对话</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {record.conversation.map((msg) => {
            const isUser = msg.role === 'user';
            const isGirl = msg.role === 'girl';
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                {isGirl && (
                  <div style={{ width: 28, height: 28, borderRadius: 999, background: 'linear-gradient(135deg,#F2BDCC,#C8A8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🌸</div>
                )}
                <div style={{ maxWidth: '75%' }}>
                  <div style={{
                    padding: '9px 13px', fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-line',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser ? 'linear-gradient(135deg,#C8607A,#C4A070)' : 'rgba(255,250,252,0.8)',
                    color: isUser ? 'white' : 'var(--deep-plum)',
                    border: isUser ? 'none' : '1px solid rgba(255,255,255,0.42)',
                    boxShadow: isUser ? '0 2px 6px rgba(200,96,122,0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                  }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--graphite-rose)', opacity: 0.35, marginTop: 2, textAlign: isUser ? 'right' : 'left' }}>
                    {new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last feedback */}
      {record.feedback && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--deep-plum)', marginBottom: 10 }}>最终反馈</div>

          {record.feedback.score != null && (
            <div className="glass-card" style={{ borderRadius: 18, padding: '14px', marginBottom: 10, textAlign: 'center', background: 'linear-gradient(135deg,rgba(200,96,122,0.07),rgba(196,160,112,0.09))' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--deep-plum)', lineHeight: 1 }}>{record.feedback.score}</div>
              <div style={{ fontSize: 10, color: 'var(--graphite-rose)', opacity: 0.6, marginTop: 3 }}>表达评分 / 100</div>
            </div>
          )}

          {record.feedback.strengths.length > 0 && (
            <div className="glass-card" style={{ borderRadius: 16, padding: '13px', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--soft-mint)', marginBottom: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
                <Zap size={11} /> 做得好的地方
              </div>
              {record.feedback.strengths.map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                  <span style={{ color: 'var(--soft-mint)', fontSize: 11, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: 'var(--graphite-rose)', lineHeight: 1.4 }}>{g}</span>
                </div>
              ))}
            </div>
          )}

          {record.feedback.risks.length > 0 && (
            <div className="glass-card" style={{ borderRadius: 16, padding: '13px', marginBottom: 8, background: 'rgba(196,160,112,0.06)', border: '1px solid rgba(196,160,112,0.15)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--champagne-gold)', marginBottom: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
                <ShieldCheck size={11} /> 需要注意
              </div>
              {record.feedback.risks.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                  <span style={{ color: 'var(--champagne-gold)', fontSize: 11, flexShrink: 0 }}>!</span>
                  <span style={{ fontSize: 12, color: 'var(--graphite-rose)', lineHeight: 1.4 }}>{r}</span>
                </div>
              ))}
            </div>
          )}

          {record.feedback.suggestion && (
            <div className="glass-card" style={{ borderRadius: 16, padding: '13px', background: 'linear-gradient(135deg,rgba(200,96,122,0.05),rgba(196,160,112,0.06))' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--soft-rose)', marginBottom: 5, display: 'flex', gap: 4, alignItems: 'center' }}>
                <Lightbulb size={11} /> 建议
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--deep-plum)', lineHeight: 1.5 }}>{record.feedback.suggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ fontSize: 12, color: 'var(--graphite-rose)' }}>
      <span style={{ opacity: 0.55 }}>{label}：</span>{value}
    </div>
  );
}
