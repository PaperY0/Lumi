import { useEffect, useState } from 'react';
import { MessageSquare, Clock, Copy, ChevronLeft, AlertCircle, CheckCircle, Zap, Target } from 'lucide-react';
import { useReplyHistory } from '@/hooks/useReplyHistory';
import { userProfileRepository, girlProfileRepository } from '@/lib/db';
import { formatDateTime } from '@/utils/date';
import type { ReplyHistory } from '@/types';

// ── 适配工具函数 ──────────────────────────────────────────────────────────────

function getInputMessage(record: ReplyHistory): string {
  return record.userMessage || '';
}

function getReplies(record: ReplyHistory): Array<{ text: string; label?: string }> {
  if (!record.recommendedReplies || record.recommendedReplies.length === 0) return [];
  return record.recommendedReplies.map((r) => ({
    text: r.text,
    label: r.style,
  }));
}

function getScenario(record: ReplyHistory): string | undefined {
  return record.scene || undefined;
}

function getGoal(record: ReplyHistory): string | undefined {
  return record.userIntent || undefined;
}

// ── 样式常量 ──────────────────────────────────────────────────────────────────

const SAFE_TEXT: React.CSSProperties = {
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  whiteSpace: 'pre-line',
  lineHeight: 1.65,
};

const CARD_BASE: React.CSSProperties = {
  borderRadius: 24,
  padding: '18px 20px',
  overflow: 'hidden',
  minWidth: 0,
};

// ── 主组件 ────────────────────────────────────────────────────────────────────

export function ReplyHistoryPanel() {
  const {
    records,
    selectedRecord,
    loading,
    deletingId,
    copyingText,
    error,
    successMessage,
    loadByGirlId,
    loadByUserId,
    selectRecord,
    clearSelectedRecord,
    deleteRecord,
    copyReply,
    clearMessage,
  } = useReplyHistory();

  const [resolvedIds, setResolvedIds] = useState<{ userId?: string; girlId?: string }>({});

  // 自动加载 user/girl 并查询历史
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const user = await userProfileRepository.getCurrent();
        if (!user) {
          console.log('📚 [ReplyHistoryPanel] 没有用户信息，跳过加载');
          return;
        }

        const girls = await girlProfileRepository.getByUserId(user.id);
        if (girls.length > 0) {
          console.log('📚 [ReplyHistoryPanel] 加载回复历史', { userId: user.id, girlId: girls[0].id });
          setResolvedIds({ userId: user.id, girlId: girls[0].id });
          await loadByGirlId(girls[0].id);
        } else {
          console.log('📚 [ReplyHistoryPanel] 无女生资料，按 userId 加载', { userId: user.id });
          setResolvedIds({ userId: user.id });
          await loadByUserId(user.id);
        }
      } catch (e) {
        console.error('❌ [ReplyHistoryPanel] 加载失败:', e);
      }
    };

    loadHistory();
  }, [loadByGirlId, loadByUserId]);

  // 删除确认
  const handleDelete = async (record: ReplyHistory) => {
    const confirmed = window.confirm('确定要删除这条回复历史吗？删除后不可恢复。');
    if (!confirmed) return;
    await deleteRecord(record.id);
  };

  // 无用户信息
  if (!loading && !resolvedIds.userId && records.length === 0) {
    return (
      <div className="glass-card" style={{ borderRadius: 28, padding: '60px 32px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(212,96,122,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(212,96,122,0.15)' }}>
          <MessageSquare size={28} color="#D4607A" style={{ opacity: 0.5 }} />
        </div>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#4A2E38' }}>请先完成资料建档</p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#7B5C6E', opacity: 0.65 }}>
          完成个人资料和她的资料后，再查看回复历史
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      {/* 成功提示 */}
      {successMessage && (
        <div
          className="glass-card"
          style={{ ...CARD_BASE, background: 'rgba(220,252,231,0.6)', border: '1px solid rgba(134,239,172,0.4)', cursor: 'pointer' }}
          onClick={clearMessage}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle size={16} color="#16A34A" />
            <p style={{ margin: 0, fontSize: 13, color: '#16A34A', fontWeight: 500 }}>{successMessage}</p>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div
          className="glass-card"
          style={{ ...CARD_BASE, background: 'rgba(255,235,235,0.5)', border: '1px solid rgba(200,150,150,0.3)', cursor: 'pointer' }}
          onClick={clearMessage}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <AlertCircle size={16} color="#C96A6A" />
            <p style={{ margin: 0, fontSize: 13, color: '#C96A6A' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card" style={{ borderRadius: 28, padding: '60px 32px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(212,96,122,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(212,96,122,0.15)', animation: 'breathe 1.5s ease-in-out infinite' }}>
            <MessageSquare size={22} color="#D4607A" style={{ opacity: 0.5 }} />
          </div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#4A2E38' }}>正在加载回复历史...</p>
        </div>
      )}

      {/* 空状态 */}
      {!loading && records.length === 0 && !error && (
        <div className="glass-card" style={{ borderRadius: 28, padding: '60px 32px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(212,96,122,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(212,96,122,0.15)' }}>
            <MessageSquare size={28} color="#D4607A" style={{ opacity: 0.5 }} />
          </div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#4A2E38' }}>还没有回复历史</p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#7B5C6E', opacity: 0.65, lineHeight: 1.6 }}>
            当你生成一次回复建议后，这里会保存你的历史记录，方便之后回看和复制。
          </p>
        </div>
      )}

      {/* 详情视图 */}
      {selectedRecord && (
        <ReplyHistoryDetailView
          record={selectedRecord}
          onClose={clearSelectedRecord}
          onCopy={copyReply}
          copyingText={copyingText}
        />
      )}

      {/* 历史列表 */}
      {!loading && records.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {records.map((record) => (
            <ReplyHistoryCard
              key={record.id}
              record={record}
              isDeleting={deletingId === record.id}
              isExpanded={selectedRecord?.id === record.id}
              onView={selectRecord}
              onDelete={handleDelete}
              onCopyFirst={copyReply}
              copyingText={copyingText}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── 历史卡片 ──────────────────────────────────────────────────────────────────

interface ReplyHistoryCardProps {
  record: ReplyHistory;
  isDeleting: boolean;
  isExpanded: boolean;
  onView: (record: ReplyHistory) => void;
  onDelete: (record: ReplyHistory) => void;
  onCopyFirst: (text: string) => void;
  copyingText: string | null;
}

function ReplyHistoryCard({ record, isDeleting, isExpanded, onView, onDelete, onCopyFirst, copyingText }: ReplyHistoryCardProps) {
  const inputMsg = getInputMessage(record);
  const replies = getReplies(record);
  const scenario = getScenario(record);
  const goal = getGoal(record);
  const firstReply = replies[0];
  const isCopyingFirst = copyingText === firstReply?.text;

  return (
    <div
      className="glass-card hoverable-card"
      style={{
        ...CARD_BASE,
        border: isExpanded ? '1px solid rgba(212,96,122,0.4)' : undefined,
        opacity: isDeleting ? 0.5 : 1,
        pointerEvents: isDeleting ? 'none' : 'auto',
        transition: 'all 0.2s ease',
      }}
    >
      {/* 头部：时间和场景 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#D4607A,#BF8E6E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={13} color="white" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38' }}>回复建议</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#7B5C6E', opacity: 0.7 }}>
          <Clock size={12} />
          {formatDateTime(record.createdAt)}
        </div>
      </div>

      {/* 对方消息 */}
      {inputMsg && (
        <div style={{ fontSize: 13, color: '#5E4A60', marginBottom: 8, ...SAFE_TEXT }}>
          <span style={{ fontWeight: 600, color: '#4A2E38' }}>她说：</span>
          <span style={{ opacity: 0.85 }}>{inputMsg.length > 60 ? inputMsg.slice(0, 60) + '...' : inputMsg}</span>
        </div>
      )}

      {/* 场景 + 目标 */}
      {(scenario || goal) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {scenario && (
            <span style={{ fontSize: 11, color: '#9B7DB5', background: 'rgba(200,168,212,0.12)', padding: '3px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Zap size={10} />场景：{scenario}
            </span>
          )}
          {goal && (
            <span style={{ fontSize: 11, color: '#BF8E6E', background: 'rgba(191,142,110,0.12)', padding: '3px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Target size={10} />目标：{goal}
            </span>
          )}
        </div>
      )}

      {/* 推荐回复数量 + 第一条摘要 */}
      {replies.length > 0 ? (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#7B5C6E', marginBottom: 4 }}>推荐回复 {replies.length} 条</div>
          <div
            style={{
              fontSize: 13,
              color: '#4A2E38',
              background: 'rgba(212,96,122,0.04)',
              borderRadius: 12,
              padding: '10px 14px',
              border: '1px solid rgba(212,96,122,0.1)',
              ...SAFE_TEXT,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            "{firstReply.text}"
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#7B5C6E', opacity: 0.6, marginBottom: 12 }}>
          这条历史里没有保存推荐回复内容
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onView(record)}
          style={{
            flex: 1,
            padding: '9px 0',
            borderRadius: 12,
            border: '1px solid rgba(212,96,122,0.22)',
            background: 'rgba(255,248,252,0.65)',
            color: '#D4607A',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          查看详情
        </button>
        {firstReply && (
          <button
            onClick={() => onCopyFirst(firstReply.text)}
            disabled={!!copyingText}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 12,
              border: '1px solid rgba(191,142,110,0.22)',
              background: isCopyingFirst ? 'linear-gradient(135deg,#D4607A,#C5956C)' : 'rgba(255,248,252,0.65)',
              color: isCopyingFirst ? 'white' : '#BF8E6E',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              transition: 'all 0.2s ease',
            }}
          >
            <Copy size={12} />{isCopyingFirst ? '已复制' : '复制第一条'}
          </button>
        )}
        <button
          onClick={() => onDelete(record)}
          disabled={isDeleting}
          style={{
            padding: '9px 16px',
            borderRadius: 12,
            border: '1px solid rgba(200,130,130,0.22)',
            background: 'rgba(255,235,235,0.4)',
            color: '#C07070',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isDeleting ? '删除中...' : '删除'}
        </button>
      </div>
    </div>
  );
}

// ── 详情视图 ──────────────────────────────────────────────────────────────────

interface ReplyHistoryDetailViewProps {
  record: ReplyHistory;
  onClose: () => void;
  onCopy: (text: string) => void;
  copyingText: string | null;
}

function ReplyHistoryDetailView({ record, onClose, onCopy, copyingText }: ReplyHistoryDetailViewProps) {
  const inputMsg = getInputMessage(record);
  const replies = getReplies(record);
  const scenario = getScenario(record);
  const goal = getGoal(record);

  const accents = [
    { accent: '#D4607A', bg: 'rgba(212,96,122,0.07)', border: 'rgba(212,96,122,0.2)' },
    { accent: '#9B7DB5', bg: 'rgba(200,168,212,0.08)', border: 'rgba(200,168,212,0.25)' },
    { accent: '#BF8E6E', bg: 'rgba(191,142,110,0.07)', border: 'rgba(191,142,110,0.22)' },
  ];

  return (
    <div className="glass-card" style={{ ...CARD_BASE, border: '1px solid rgba(212,96,122,0.3)', background: 'rgba(255,252,253,0.8)' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#4A2E38' }}>回复历史详情</span>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 14px', borderRadius: 999,
            border: '1px solid rgba(212,96,122,0.2)',
            background: 'rgba(255,248,252,0.6)',
            color: '#D4607A', fontSize: 12, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={14} />关闭详情
        </button>
      </div>

      {/* 基本信息 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#7B5C6E', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={12} />
          生成时间：{formatDateTime(record.createdAt)}
        </div>
        {inputMsg && (
          <div style={{ fontSize: 13, color: '#5E4A60', ...SAFE_TEXT }}>
            <span style={{ fontWeight: 600, color: '#4A2E38' }}>对方消息：</span>{inputMsg}
          </div>
        )}
        {scenario && (
          <div style={{ fontSize: 12, color: '#9B7DB5', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={11} />场景：{scenario}
          </div>
        )}
        {goal && (
          <div style={{ fontSize: 12, color: '#BF8E6E', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Target size={11} />目标：{goal}
          </div>
        )}
      </div>

      {/* 简答 */}
      {record.simpleAnswer && (
        <div style={{ marginBottom: 14, padding: '14px 16px', borderRadius: 16, background: 'linear-gradient(135deg,rgba(212,96,122,0.06),rgba(200,168,212,0.06))', border: '1px solid rgba(212,96,122,0.12)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#D4607A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI 简答</div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#4A2E38', ...SAFE_TEXT }}>{record.simpleAnswer}</p>
        </div>
      )}

      {/* 详细分析 */}
      {record.analysis && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38', marginBottom: 6 }}>详细分析</div>
          <p style={{ margin: 0, fontSize: 13, color: '#5E4A60', ...SAFE_TEXT }}>{record.analysis}</p>
        </div>
      )}

      {/* 推荐回复列表 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38', marginBottom: 8 }}>推荐回复</div>
        {replies.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {replies.map((reply, i) => {
              const c = accents[i % accents.length];
              const isCopied = copyingText === reply.text;
              return (
                <div key={i} style={{ padding: '14px 16px', borderRadius: 16, background: c.bg, border: `1px solid ${c.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c.accent }}>推荐回复 {i + 1}</span>
                      {reply.label && (
                        <span style={{ fontSize: 11, color: c.accent, padding: '2px 8px', borderRadius: 999, background: c.bg, border: `1px solid ${c.border}` }}>
                          {reply.label}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onCopy(reply.text)}
                      disabled={!!copyingText}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 12, padding: '5px 14px', borderRadius: 999,
                        background: isCopied ? 'linear-gradient(135deg,#D4607A,#C5956C)' : 'rgba(255,248,252,0.75)',
                        border: `1px solid ${isCopied ? 'transparent' : c.border}`,
                        color: isCopied ? 'white' : c.accent,
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Copy size={12} />{isCopied ? '已复制' : '复制这条'}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#4A2E38', ...SAFE_TEXT }}>{reply.text}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#7B5C6E', opacity: 0.6 }}>这条历史里没有保存推荐回复内容</div>
        )}
      </div>

      {/* 不建议的回复 */}
      {record.avoidReplies && record.avoidReplies.length > 0 && (
        <div style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(240,200,200,0.12)', border: '1px solid rgba(200,140,140,0.18)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#C07070', marginBottom: 6 }}>不建议这样回</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {record.avoidReplies.map((text, i) => (
              <div key={i} style={{ fontSize: 13, color: '#7B5C6E', display: 'flex', gap: 8, ...SAFE_TEXT }}>
                <span style={{ color: '#C07070', flexShrink: 0 }}>×</span>{text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
