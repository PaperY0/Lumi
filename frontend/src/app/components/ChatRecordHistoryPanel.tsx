import { useState, useEffect, useCallback } from 'react';
import { GlassCard, LiquidButton } from './GlassUI';
import type { PageName } from './GlassUI';
import { useChatRecordHistory } from '@/hooks/useChatRecordHistory';
import { userProfileRepository } from '@/lib/db/repositories/userProfileRepo';
import { girlProfileRepository } from '@/lib/db/repositories/girlProfileRepo';
import { useAnalysisRequestStore } from '@/stores/analysisRequestStore';
import { formatDateTime } from '@/utils/date';
import type { ChatSession, ChatMessage } from '@/types';

interface Props {
  onNavigate: (page: PageName) => void;
}

// ── 适配工具函数 ──────────────────────────────────────────

function getSessionTitle(session: ChatSession): string {
  return session.title || '未命名聊天记录';
}

function getSessionMessageCount(session: ChatSession): number {
  return session.messageCount ?? 0;
}

function getSourceLabel(sourceMethod?: string): string {
  switch (sourceMethod) {
    case 'paste': return '粘贴导入';
    case 'ocr': return 'OCR 识别';
    case 'file': return '文件导入';
    default: return '未知来源';
  }
}

function getMessageRole(message: ChatMessage): 'user' | 'girl' | 'unknown' {
  if (message.sender === 'user') return 'user';
  if (message.sender === 'other') return 'girl';
  return 'unknown';
}

function getMessageTime(message: ChatMessage): string | undefined {
  return message.sentAt;
}

// ── 消息气泡 ──────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const role = getMessageRole(message);
  const isMe = role === 'user';
  const isUnknown = role === 'unknown';

  const bg = isMe
    ? 'rgba(232, 116, 138, 0.15)'
    : isUnknown
      ? 'rgba(200, 200, 200, 0.2)'
      : 'rgba(255,255,255,0.5)';
  const border = isMe
    ? '1px solid rgba(232, 116, 138, 0.3)'
    : isUnknown
      ? '1px solid rgba(200,200,200,0.3)'
      : '1px solid rgba(255,255,255,0.4)';

  const time = getMessageTime(message);
  const timeStr = time
    ? new Date(time).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
      <div style={{ maxWidth: '80%' }}>
        <div style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 4, textAlign: isMe ? 'right' : 'left' }}>
          {message.senderName || (isMe ? '你' : isUnknown ? '未识别' : '她')}
          {timeStr ? ` · ${timeStr}` : ''}
          {isMe && ' (你)'}{!isMe && !isUnknown && ' (她)'}{isUnknown && ' (未识别)'}
        </div>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            background: bg,
            border,
            fontSize: 13,
            color: 'var(--text-rose)',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

// ── 详情视图 ──────────────────────────────────────────

function DetailView({
  session,
  messages,
  loading,
  onClose,
  onAnalyze,
}: {
  session: ChatSession;
  messages: ChatMessage[];
  loading: boolean;
  onClose: () => void;
  onAnalyze: (sessionId: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-rose)', margin: 0 }}>
          聊天记录详情
        </h2>
        <LiquidButton variant="secondary" onClick={onClose}>
          关闭详情
        </LiquidButton>
      </div>

      {/* 基本信息 */}
      <GlassCard>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12 }}>
          {getSessionTitle(session)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'var(--text-purple)' }}>
          <span>导入时间：{formatDateTime(session.importedAt)}</span>
          <span>消息数量：{getSessionMessageCount(session)} 条</span>
          <span>来源：{getSourceLabel(session.sourceMethod)}</span>
        </div>
      </GlassCard>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 12 }}>
        <LiquidButton onClick={() => onAnalyze(session.id)}>
          分析这段聊天
        </LiquidButton>
      </div>

      {/* 消息列表 */}
      {loading ? (
        <GlassCard>
          <div style={{ textAlign: 'center', color: 'var(--text-purple)', fontSize: 14, opacity: 0.7 }}>
            正在加载聊天消息...
          </div>
        </GlassCard>
      ) : messages.length === 0 ? (
        <GlassCard>
          <div style={{ textAlign: 'center', color: 'var(--text-purple)', fontSize: 14, opacity: 0.7 }}>
            这次聊天记录里没有找到聊天消息
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12 }}>
            完整消息列表（{messages.length} 条）
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 500, overflowY: 'auto' }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ── 主面板 ──────────────────────────────────────────

export function ChatRecordHistoryPanel({ onNavigate }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [girlId, setGirlId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const {
    sessions,
    selectedSession,
    selectedMessages,
    loading,
    loadingDetail,
    deletingId,
    error,
    successMessage,
    loadByGirlId,
    loadByUserId,
    loadAll,
    selectSession,
    clearSelectedSession,
    deleteSession,
    clearMessage,
  } = useChatRecordHistory();

  const { setPending } = useAnalysisRequestStore();

  // 自动加载用户资料
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await userProfileRepository.getCurrent();
        if (!user) {
          setLoadingProfile(false);
          return;
        }
        setUserId(user.id);
        const girls = await girlProfileRepository.getByUserId(user.id);
        if (girls.length > 0) {
          setGirlId(girls[0].id);
        }
      } catch (err) {
        console.error('[ChatRecordHistoryPanel] 加载用户资料失败:', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  // 根据可用 ID 加载历史
  useEffect(() => {
    if (loadingProfile) return;
    console.log('📚 [ChatRecordHistoryPanel] 加载聊天记录历史', { userId, girlId });
    if (girlId) {
      loadByGirlId(girlId);
    } else if (userId) {
      loadByUserId(userId);
    }
  }, [loadingProfile, userId, girlId, loadByGirlId, loadByUserId]);

  // 从历史发起 AI 分析
  const handleAnalyzeFromHistory = useCallback((sessionId: string) => {
    console.log('🚀 [ChatRecordHistoryPanel] 从历史发起 AI 分析', { sessionId });
    setPending(sessionId, undefined);
    onNavigate('ai-analysis');
  }, [setPending, onNavigate]);

  // 删除确认
  const handleConfirmDelete = useCallback(async () => {
    if (!confirmingDeleteId) return;
    await deleteSession(confirmingDeleteId);
    setConfirmingDeleteId(null);
  }, [confirmingDeleteId, deleteSession]);

  // 未建档提示
  if (!loadingProfile && !userId) {
    return (
      <GlassCard>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>
            无法加载聊天记录历史
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>
            请先完成资料建档后再查看聊天记录历史
          </div>
        </div>
      </GlassCard>
    );
  }

  // 加载详情视图
  if (selectedSession) {
    return (
      <DetailView
        session={selectedSession}
        messages={selectedMessages}
        loading={loadingDetail}
        onClose={clearSelectedSession}
        onAnalyze={handleAnalyzeFromHistory}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-rose)', margin: 0 }}>
        聊天记录历史
      </h2>

      {/* 提示消息 */}
      {error && (
        <GlassCard style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: '#EF4444' }}>{error}</span>
            <button
              onClick={clearMessage}
              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13, opacity: 0.7 }}
            >
              关闭
            </button>
          </div>
        </GlassCard>
      )}

      {successMessage && (
        <GlassCard style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <span style={{ fontSize: 14, color: '#10B981' }}>{successMessage}</span>
        </GlassCard>
      )}

      {/* 加载中 */}
      {loading && (
        <GlassCard>
          <div style={{ textAlign: 'center', color: 'var(--text-purple)', fontSize: 14, opacity: 0.7 }}>
            正在加载聊天记录历史...
          </div>
        </GlassCard>
      )}

      {/* 空状态 */}
      {!loading && sessions.length === 0 && (
        <GlassCard>
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>
              还没有聊天记录
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>
              粘贴并保存一段聊天记录后，这里会出现你的导入记录。
            </div>
          </div>
        </GlassCard>
      )}

      {/* 历史列表 */}
      {!loading && sessions.map((session) => (
        <GlassCard key={session.id} style={{ background: 'rgba(232, 116, 138, 0.03)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* 标题行 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 4 }}>
                  {getSessionTitle(session)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7 }}>
                  {formatDateTime(session.importedAt)}
                </div>
              </div>
            </div>

            {/* 信息标签 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12 }}>
              <span style={{
                background: 'rgba(232, 116, 138, 0.08)',
                padding: '2px 8px',
                borderRadius: 6,
                color: 'var(--pink-primary)',
              }}>
                共 {getSessionMessageCount(session)} 条消息
              </span>
              <span style={{
                background: 'rgba(139, 92, 246, 0.08)',
                padding: '2px 8px',
                borderRadius: 6,
                color: '#8B5CF6',
              }}>
                来源：{getSourceLabel(session.sourceMethod)}
              </span>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => selectSession(session)}
                disabled={confirmingDeleteId === session.id || deletingId === session.id}
                style={{
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: 8,
                  padding: '6px 14px',
                  color: '#8B5CF6',
                  fontSize: 13,
                  cursor: (confirmingDeleteId === session.id || deletingId === session.id) ? 'default' : 'pointer',
                  opacity: (confirmingDeleteId === session.id || deletingId === session.id) ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                查看详情
              </button>
              <button
                onClick={() => handleAnalyzeFromHistory(session.id)}
                disabled={confirmingDeleteId === session.id || deletingId === session.id}
                style={{
                  background: 'rgba(232, 116, 138, 0.08)',
                  border: '1px solid rgba(232, 116, 138, 0.2)',
                  borderRadius: 8,
                  padding: '6px 14px',
                  color: 'var(--pink-primary)',
                  fontSize: 13,
                  cursor: (confirmingDeleteId === session.id || deletingId === session.id) ? 'default' : 'pointer',
                  opacity: (confirmingDeleteId === session.id || deletingId === session.id) ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                分析这段聊天
              </button>
              <button
                onClick={() => setConfirmingDeleteId(session.id)}
                disabled={deletingId === session.id}
                style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: 8,
                  padding: '6px 14px',
                  color: deletingId === session.id ? 'rgba(239, 68, 68, 0.4)' : '#EF4444',
                  fontSize: 13,
                  cursor: deletingId === session.id ? 'default' : 'pointer',
                  opacity: deletingId === session.id ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {deletingId === session.id ? '删除中...' : '删除'}
              </button>
            </div>

            {/* 就地删除确认 */}
            {confirmingDeleteId === session.id && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 12,
                padding: '12px 16px',
                marginTop: 4,
              }}>
                <div style={{ fontSize: 13, color: 'var(--text-rose)', marginBottom: 10, lineHeight: 1.6 }}>
                  确定要删除这次聊天记录吗？对应聊天消息也会一起删除，但不会删除已生成的 AI 分析报告。
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setConfirmingDeleteId(null)}
                    style={{
                      background: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: 8,
                      padding: '6px 14px',
                      color: 'var(--text-purple)',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deletingId === session.id}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 8,
                      padding: '6px 14px',
                      color: deletingId === session.id ? 'rgba(239, 68, 68, 0.5)' : '#EF4444',
                      fontSize: 13,
                      cursor: deletingId === session.id ? 'default' : 'pointer',
                      opacity: deletingId === session.id ? 0.7 : 1,
                    }}
                  >
                    {deletingId === session.id ? '删除中...' : '确认删除'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
