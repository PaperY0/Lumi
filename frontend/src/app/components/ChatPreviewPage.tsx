/**
 * 聊天预览页 — 用户确认每条消息的发言人。
 *
 * 流程：
 *   ChatImportPage 解析清洗 → chatImportStore.draftMessages
 *   → 本页展示每条草稿，用户点 我/她/不确定 按钮
 *   → 满足校验（至少 1 条 me + 1 条 her）后保存
 *   → 映射成 ChatMessage（me→user, her→other, unknown→other 兜底）写入 IndexedDB
 *
 * 布局：
 *   - me 靠右、her 靠左、unknown 居中灰色
 *   - 顶部统计：总数 / 我 / 她 / 未确定
 *   - 每条消息：文本 + 三个角色按钮 + 编辑/删除/合并到上一条
 */

import { useMemo, useState } from 'react';
import { ArrowLeft, Check, Edit2, Trash2, Merge } from 'lucide-react';
import { GlassCard, LiquidButton } from './GlassUI';
import type { PageName } from './GlassUI';
import { useChatImportStore } from '@/stores/chatImportStore';
import { useUserStore } from '@/stores';
import { chatRepository } from '@/lib/db/repositories/chatRepo';
import type { ChatMessageDraft, SenderRole } from '@/types/chatImport';

interface Props {
  onNavigate: (page: PageName) => void;
}

export function ChatPreviewPage({ onNavigate }: Props) {
  const {
    draftMessages,
    importResult,
    updateMessageSender,
    updateMessageText,
    deleteMessage,
    mergeWithPrevious,
    clearImportResult,
  } = useChatImportStore();

  const { currentUser, currentGirl } = useUserStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saveError, setSaveError] = useState<string | null>( null);
  const [saving, setSaving] = useState(false);

  // 统计
  const stats = useMemo(() => {
    const me = draftMessages.filter((m) => m.senderRole === 'me').length;
    const her = draftMessages.filter((m) => m.senderRole === 'her').length;
    const unknown = draftMessages.filter((m) => m.senderRole === 'unknown').length;
    return { total: draftMessages.length, me, her, unknown };
  }, [draftMessages]);

  // 保存校验：至少 1 me + 1 her
  const canSave = stats.me >= 1 && stats.her >= 1;

  const startEdit = (m: ChatMessageDraft) => {
    setEditingId(m.id);
    setEditText(m.cleanedText);
  };

  const commitEdit = () => {
    if (editingId) updateMessageText(editingId, editText.trim());
    setEditingId(null);
    setEditText('');
  };

  const handleSave = async () => {
    setSaveError(null);
    if (!canSave) {
      setSaveError('至少需要 1 条"我"和 1 条"她"的消息才能保存');
      return;
    }
    if (!currentUser?.id) {
      setSaveError('请先完成资料建档');
      return;
    }

    // 映射草稿 → ChatMessage 输入（unknown 兜底为 other，保留提示）
    const messagesToSave = draftMessages
      .filter((m) => m.cleanedText.trim())
      .map((m) => ({
        sender: (m.senderRole === 'me' ? 'user' : 'other') as 'user' | 'other',
        content: m.cleanedText.trim(),
        sentAt: new Date(),
        senderName: m.senderName,
      }));

    if (messagesToSave.length === 0) {
      setSaveError('没有可保存的消息');
      return;
    }

    console.log('✅ [ChatPreviewPage] 用户确认后的消息:', messagesToSave);

    setSaving(true);
    try {
      const girlId = currentGirl?.id ?? 'default-girl';
      const sourceMethod = importResult?.rawText ? 'paste' : 'paste';
      await chatRepository.createSessionWithMessages(
        currentUser.id,
        girlId,
        messagesToSave,
        sourceMethod as 'paste' | 'ocr' | 'file',
        `与 ${currentGirl?.nickname || '她'} 的聊天记录`,
      );
      clearImportResult();
      onNavigate('ai-analysis');
    } catch (err) {
      console.error('[ChatPreviewPage] 保存失败:', err);
      setSaveError(err instanceof Error ? err.message : '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    onNavigate('chat-import');
  };

  // 没有草稿数据（用户直接跳到本页）→ 提示回导入页
  if (draftMessages.length === 0) {
    return (
      <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
        <GlassCard style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <p style={{ color: 'var(--text-rose)', marginBottom: 20 }}>
            还没有待预览的聊天内容，请先回到导入页粘贴并点击"预览(清洗)"。
          </p>
          <LiquidButton onClick={handleBack} variant="secondary">
            <ArrowLeft size={16} /> 返回导入页
          </LiquidButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>
      {/* 顶部：返回 + 标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={handleBack}
          style={{
            border: 'none', background: 'rgba(200,200,200,0.2)', cursor: 'pointer',
            borderRadius: 999, padding: 8, display: 'inline-flex',
          }}
        >
          <ArrowLeft size={18} color="var(--text-rose)" />
        </button>
        <h2 style={{ margin: 0, fontSize: 22, color: 'var(--text-rose)' }}>确认发言人</h2>
      </div>

      {/* 清洗统计 */}
      {importResult && (
        <GlassCard style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-purple)' }}>
            <span>原始行数：{importResult.rawText.split('\n').filter((l) => l.trim()).length}</span>
            <span>清洗后消息数：{stats.total}</span>
            <span>删除噪声：{importResult.removedNoiseCount}</span>
          </div>
          {importResult.warnings.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#D97706', lineHeight: 1.6 }}>
              {importResult.warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
            </div>
          )}
        </GlassCard>
      )}

      {/* 角色统计 */}
      <GlassCard style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 14 }}>
          <Stat label="总数" value={stats.total} color="var(--text-rose)" />
          <Stat label="我" value={stats.me} color="#D4607A" />
          <Stat label="她" value={stats.her} color="#7A9EBF" />
          <Stat label="未确定" value={stats.unknown} color="#999" />
        </div>
      </GlassCard>

      {/* 消息列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {draftMessages.map((m, idx) => (
          <MessageRow
            key={m.id}
            message={m}
            index={idx}
            editing={editingId === m.id}
            editText={editText}
            onSetEditText={setEditText}
            onStartEdit={() => startEdit(m)}
            onCommitEdit={commitEdit}
            onCancelEdit={() => setEditingId(null)}
            onSetRole={(r) => updateMessageSender(m.id, r)}
            onDelete={() => deleteMessage(m.id)}
            onMerge={() => mergeWithPrevious(m.id)}
          />
        ))}
      </div>

      {/* 保存区 */}
      <GlassCard style={{ padding: 16, position: 'sticky', bottom: 16 }}>
        {saveError && (
          <div style={{ marginBottom: 10, padding: 10, borderRadius: 10, background: 'rgba(220,80,80,0.1)', border: '1px solid rgba(220,80,80,0.3)', fontSize: 12, color: '#C0392B' }}>
            {saveError}
          </div>
        )}
        {stats.unknown > 0 && canSave && (
          <div style={{ marginBottom: 10, fontSize: 12, color: '#D97706' }}>
            ⚠️ 还有 {stats.unknown} 条未确定的消息，保存时会归为"她"。
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7 }}>
            {canSave ? '✅ 满足保存条件' : '需要至少 1 条"我"和 1 条"她"'}
          </span>
          <LiquidButton onClick={handleSave} disabled={!canSave || saving}>
            {saving ? '保存中...' : '保存并去分析'} <Check size={16} />
          </LiquidButton>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── 统计小块 ──────────────────────────────────────────
function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 20, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.7 }}>{label}</span>
    </div>
  );
}

// ─── 单条消息行 ────────────────────────────────────────
function MessageRow({
  message,
  index,
  editing,
  editText,
  onSetEditText,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onSetRole,
  onDelete,
  onMerge,
}: {
  message: ChatMessageDraft;
  index: number;
  editing: boolean;
  editText: string;
  onSetEditText: (s: string) => void;
  onStartEdit: () => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onSetRole: (r: SenderRole) => void;
  onDelete: () => void;
  onMerge: () => void;
}) {
  const { senderRole, cleanedText, rawText } = message;

  // 布局：me 靠右、her 靠左、unknown 居中
  const align =
    senderRole === 'me' ? 'flex-end' :
    senderRole === 'her' ? 'flex-start' : 'center';
  const bubbleBg =
    senderRole === 'me' ? 'rgba(212,96,122,0.12)' :
    senderRole === 'her' ? 'rgba(122,158,191,0.12)' :
    'rgba(180,180,180,0.1)';
  const borderColor =
    senderRole === 'me' ? 'rgba(212,96,122,0.3)' :
    senderRole === 'her' ? 'rgba(122,158,191,0.3)' :
    'rgba(180,180,180,0.25)';

  return (
    <div style={{ display: 'flex', justifyContent: align, width: '100%' }}>
      <div style={{ maxWidth: '78%', width: '100%' }}>
        {/* 气泡 */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 14,
            background: bubbleBg,
            border: `1px solid ${borderColor}`,
            fontSize: 14,
            color: 'var(--text-rose)',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {editing ? (
            <textarea
              value={editText}
              onChange={(e) => onSetEditText(e.target.value)}
              autoFocus
              rows={Math.min(6, editText.split('\n').length + 1)}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-rose)', outline: 'none', resize: 'vertical' }}
            />
          ) : (
            cleanedText || <span style={{ color: '#999' }}>(空)</span>
          )}
          {rawText !== cleanedText && !editing && (
            <div style={{ marginTop: 4, fontSize: 10, color: '#aaa' }}>原文：{rawText.slice(0, 60)}</div>
          )}
        </div>

        {/* 操作栏 */}
        <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: align }}>
          {/* 角色按钮 */}
          <RoleBtn label="我" active={senderRole === 'me'} activeColor="#D4607A" onClick={() => onSetRole('me')} />
          <RoleBtn label="她" active={senderRole === 'her'} activeColor="#7A9EBF" onClick={() => onSetRole('her')} />
          <RoleBtn label="不确定" active={senderRole === 'unknown'} activeColor="#999" onClick={() => onSetRole('unknown')} />

          {/* 编辑/删除/合并 */}
          {editing ? (
            <>
              <IconBtn title="确认" onClick={onCommitEdit}><Check size={14} /></IconBtn>
              <IconBtn title="取消" onClick={onCancelEdit}><ArrowLeft size={14} /></IconBtn>
            </>
          ) : (
            <>
              <IconBtn title="编辑" onClick={onStartEdit}><Edit2 size={14} /></IconBtn>
              <IconBtn title="合并到上一条" onClick={onMerge} disabled={index === 0}><Merge size={14} /></IconBtn>
              <IconBtn title="删除" onClick={onDelete}><Trash2 size={14} /></IconBtn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleBtn({ label, active, activeColor, onClick }: { label: string; active: boolean; activeColor: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '3px 10px',
        borderRadius: 999,
        border: `1px solid ${active ? activeColor : 'rgba(180,180,180,0.3)'}`,
        background: active ? activeColor : 'transparent',
        color: active ? '#fff' : 'var(--text-purple)',
        fontSize: 11,
        cursor: 'pointer',
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </button>
  );
}

function IconBtn({ title, onClick, disabled, children }: { title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: 4, borderRadius: 8, border: '1px solid rgba(180,180,180,0.25)',
        background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1, color: 'var(--text-purple)', display: 'inline-flex',
      }}
    >
      {children}
    </button>
  );
}
