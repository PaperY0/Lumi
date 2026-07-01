/**
 * 聊天预览页 — 用户确认每条消息的发言人。
 *
 * 两条管线共存，互不干扰：
 *   A. 通用导入管线（me/her） → store.importResult/draftMessages
 *   B. MinerU A/B 管线          → store.minerUImportResult/minerUMessages
 *
 * 页面根据 store 里哪条管线有数据来决定展示哪种预览。
 *
 * MinerU 分支保存前让用户选择：A 是我 B 是她 / A 是她 B 是我 → 映射成 user/other 落库。
 */

import { useMemo, useState } from 'react';
import { ArrowLeft, Check, Edit2, Trash2, Merge, AlertTriangle, Save } from 'lucide-react';
import { GlassCard, LiquidButton } from './GlassUI';
import type { PageName } from './GlassUI';
import { useChatImportStore } from '@/stores/chatImportStore';
import { useUserStore } from '@/stores';
import { useUiStore } from '@/stores/uiStore';
import { useAnalysisRequestStore } from '@/stores/analysisRequestStore';
import { chatRepository } from '@/lib/db/repositories/chatRepo';
import type { ChatMessageDraft, SenderRole } from '@/types/chatImport';
import type { MinerUParsedMessage, DraftSpeakerRole } from '@/types/minerUChatImport';

interface Props {
  onNavigate: (page: PageName) => void;
}

export function ChatPreviewPage({ onNavigate }: Props) {
  const store = useChatImportStore();
  const { currentUser, currentGirl } = useUserStore();

  // 判断是 MinerU 分支还是通用分支
  const isMinerU = !!store.minerUImportResult;

  // ── MinerU A/B 分支 ─────────────────────────────────────
  if (isMinerU) {
    return <MinerUPreview store={store} currentUser={currentUser} currentGirl={currentGirl} onNavigate={onNavigate} />;
  }

  // ── 通用 me/her 分支（原有逻辑不变）──────────────────────
  return <StandardPreview store={store} currentUser={currentUser} currentGirl={currentGirl} onNavigate={onNavigate} />;
}

// ═════════════════════════════════════════════════════════════
// 通用 me/her 分支
// ═════════════════════════════════════════════════════════════

function StandardPreview({ store, currentUser, currentGirl, onNavigate }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useUiStore();
  const { setPending } = useAnalysisRequestStore();

  const stats = useMemo(() => {
    const me = store.draftMessages.filter((m: any) => m.senderRole === 'me').length;
    const her = store.draftMessages.filter((m: any) => m.senderRole === 'her').length;
    const unknown = store.draftMessages.filter((m: any) => m.senderRole === 'unknown').length;
    return { total: store.draftMessages.length, me, her, unknown };
  }, [store.draftMessages]);

  const canSave = stats.me >= 1 && stats.her >= 1;

  const doSave = async (): Promise<string> => {
    const messagesToSave = store.draftMessages
      .filter((m: any) => m.cleanedText.trim())
      .map((m: any) => ({
        sender: (m.senderRole === 'me' ? 'user' : 'other') as 'user' | 'other',
        content: m.cleanedText.trim(),
        sentAt: new Date(),
        senderName: m.senderName,
      }));

    console.log('💾 [ChatPreviewPage] 开始保存确认后的聊天记录');
    console.log('💾 [ChatPreviewPage] 保存消息数:', messagesToSave.length);

    const session = await chatRepository.createSessionWithMessages(
      currentUser.id, currentGirl?.id ?? 'default-girl',
      messagesToSave, 'paste',
      `与 ${currentGirl?.nickname || '她'} 的聊天记录`,
    );

    console.log('✅ [ChatPreviewPage] 保存成功 chatRecordId:', session.id);
    return session.id;
  };

  const handleSaveOnly = async () => {
    setSaveError(null);
    if (!canSave) { setSaveError('至少需要 1 条"我"和 1 条"她"的消息才能保存'); return; }
    if (!currentUser?.id) { setSaveError('请先完成资料建档'); return; }

    setSaving(true);
    try {
      await doSave();
      store.clearImportResult();
      showToast('聊天记录已保存', 'success');
      onNavigate('chat-import');
    } catch (err: any) {
      setSaveError(err.message || '保存失败，请重试');
    } finally { setSaving(false); }
  };

  const handleSaveAndAnalyze = async () => {
    setSaveError(null);
    if (!canSave) { setSaveError('至少需要 1 条"我"和 1 条"她"的消息才能保存'); return; }
    if (!currentUser?.id) { setSaveError('请先完成资料建档'); return; }

    setSaving(true);
    try {
      const chatRecordId = await doSave();
      console.log('🚀 [ChatPreviewPage] 保存并分析，chatRecordId:', chatRecordId);
      store.clearImportResult();
      setPending(chatRecordId, undefined);
      showToast('聊天记录已保存，正在跳转分析...', 'success');
      onNavigate('ai-analysis');
    } catch (err: any) {
      setSaveError(err.message || '保存失败，请重试');
    } finally { setSaving(false); }
  };

  if (store.draftMessages.length === 0) return <EmptyState onNavigate={onNavigate} />;

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>
      <Header onNavigate={onNavigate} title="确认发言人" />
      {store.importResult && (
        <GlassCard style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-purple)' }}>
            <span>原始行数：{store.importResult.rawText.split('\n').filter((l: string) => l.trim()).length}</span>
            <span>清洗后消息数：{stats.total}</span>
            <span>删除噪声：{store.importResult.removedNoiseCount}</span>
          </div>
          {store.importResult.warnings.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#D97706' }}>
              {store.importResult.warnings.map((w: string, i: number) => <div key={i}>⚠️ {w}</div>)}
            </div>
          )}
        </GlassCard>
      )}
      <StatsCard stats={stats} labelMe="我" labelHer="她" />
      <MessageList mode="standard" store={store} editingId={editingId} editText={editText} setEditText={setEditText}
        onStartEdit={(id: string, text: string) => { setEditingId(id); setEditText(text); }}
        onCommitEdit={() => { if (editingId) store.updateMessageText(editingId, editText.trim()); setEditingId(null); setEditText(''); }}
        onCancelEdit={() => setEditingId(null)} />
      <SaveBar mode="standard" canSave={canSave} saving={saving} saveError={saveError} unknownCount={stats.unknown}
        onSaveOnly={handleSaveOnly} onSaveAndAnalyze={handleSaveAndAnalyze} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// MinerU A/B 分支
// ═════════════════════════════════════════════════════════════

function MinerUPreview({ store, currentUser, currentGirl, onNavigate }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // A→me 映射：true = A是我B是她，false = A是她B是我
  const [aIsMe, setAIsMe] = useState<boolean | null>(null);
  const { showToast } = useUiStore();
  const { setPending } = useAnalysisRequestStore();

  const result = store.minerUImportResult;
  const stats = useMemo(() => {
    const A = store.minerUMessages.filter((m: any) => m.speakerRole === 'A').length;
    const B = store.minerUMessages.filter((m: any) => m.speakerRole === 'B').length;
    const unknown = store.minerUMessages.filter((m: any) => m.speakerRole === 'unknown').length;
    return { total: store.minerUMessages.length, A, B, unknown };
  }, [store.minerUMessages]);

  const messagesReady = stats.A >= 1 && stats.B >= 1;
  const canSave = messagesReady && aIsMe !== null;

  const validateBeforeSave = (): boolean => {
    if (aIsMe === null) {
      console.warn('⚠️ [ChatPreviewPage] 未选择 A/B 对应关系，阻止保存');
      setSaveError('请先选择说话角色：A/B 分别是谁');
      return false;
    }
    if (!messagesReady) {
      setSaveError('至少需要 1 条 A 和 1 条 B 的消息才能保存');
      return false;
    }
    if (!currentUser?.id) {
      setSaveError('请先完成资料建档');
      return false;
    }
    setSaveError(null);
    return true;
  };

  const doSave = async (): Promise<string> => {
    const messagesToSave = store.minerUMessages
      .filter((m: any) => m.cleanedText.trim())
      .map((m: any) => {
        let sender: 'user' | 'other';
        const role = m.speakerRole ?? (m.role === 'A' ? 'A' : m.role === 'B' ? 'B' : 'unknown');
        if (role === 'A') sender = aIsMe ? 'user' : 'other';
        else if (role === 'B') sender = aIsMe ? 'other' : 'user';
        else sender = 'other'; // unknown → other 兜底
        return { sender, content: m.cleanedText.trim(), sentAt: new Date(), senderName: role };
      });

    console.log('💾 [ChatPreviewPage] 开始保存确认后的聊天记录 (MinerU)');
    console.log('💾 [ChatPreviewPage] 保存消息数:', messagesToSave.length);

    const session = await chatRepository.createSessionWithMessages(
      currentUser.id, currentGirl?.id ?? 'default-girl',
      messagesToSave, 'ocr',
    );

    console.log('✅ [ChatPreviewPage] 保存成功 chatRecordId:', session.id);
    return session.id;
  };

  const handleSaveOnly = async () => {
    setSaveError(null);
    if (!validateBeforeSave()) return;

    setSaving(true);
    try {
      await doSave();
      store.clearMinerUImportResult();
      showToast('聊天记录已保存', 'success');
      onNavigate('chat-import');
    } catch (err: any) {
      setSaveError(err.message || '保存失败，请重试');
    } finally { setSaving(false); }
  };

  const handleSaveAndAnalyze = async () => {
    setSaveError(null);
    if (!validateBeforeSave()) return;

    setSaving(true);
    try {
      const chatRecordId = await doSave();
      console.log('🚀 [ChatPreviewPage] 保存并分析 (MinerU)，chatRecordId:', chatRecordId);
      store.clearMinerUImportResult();
      setPending(chatRecordId, undefined);
      showToast('聊天记录已保存，正在跳转分析...', 'success');
      onNavigate('ai-analysis');
    } catch (err: any) {
      setSaveError(err.message || '保存失败，请重试');
    } finally { setSaving(false); }
  };

  if (store.minerUMessages.length === 0) return <EmptyState onNavigate={onNavigate} />;

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>
      <Header onNavigate={onNavigate} title="确认发言人 (MinerU A/B)" />

      {/* 提示 */}
      <GlassCard style={{ marginBottom: 16, padding: 14, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.6 }}>
        系统已根据头像位置进行初步判断，请你检查并手动修正。
      </GlassCard>

      {/* 统计 */}
      {result && (
        <GlassCard style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-purple)' }}>
            <span>原始字符数：{result.originalMarkdown.length}</span>
            <span>清洗后行数：{result.cleanedRawText.split('\n').filter((l: string) => l.trim()).length}</span>
            <span>删除噪声：{result.removedNoiseCount}</span>
          </div>
          {result.warnings.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#D97706' }}>
              {result.warnings.map((w: string, i: number) => <div key={i}>⚠️ {w}</div>)}
            </div>
          )}
        </GlassCard>
      )}
      <StatsCard stats={stats} labelMe="A" labelHer="B" />

      {/* 输出格式按钮 */}
      <GlassCard style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>📋 调试输出（点击复制）</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <CopyBtn label="清洗结果"
            text={result ? `rawText:\n${result.cleanedRawText}\n\n已完成云端高精度识别，请检查后点击解析。` : ''} />
          <CopyBtn label="A/B 初筛"
            text={result ? `rawText:\n${result.roleParsedText}\n\n已完成云端高精度识别，请检查后点击解析。` : ''} />
        </div>
      </GlassCard>

      {/* 消息列表 */}
      <MessageList mode="mineru" store={store} editingId={editingId} editText={editText} setEditText={setEditText}
        onStartEdit={(id: string, text: string) => { setEditingId(id); setEditText(text); }}
        onCommitEdit={() => { if (editingId) store.updateMinerUMessageText(editingId, editText.trim()); setEditingId(null); setEditText(''); }}
        onCancelEdit={() => setEditingId(null)} />

      {/* 保存区 — 含 A/B→me/her 映射选择 */}
      <GlassCard style={{ padding: 16, position: 'sticky', bottom: 16 }}>
        {/* A/B → me/her 映射 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>
            A 和 B 分别是谁？
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <MapBtn label="A 是我，B 是她" active={aIsMe === true} onClick={() => { setAIsMe(true); setSaveError(null); console.log('✅ [ChatPreviewPage] 已选择 A/B 对应关系: A是我B是她'); }} />
            <MapBtn label="A 是她，B 是我" active={aIsMe === false} onClick={() => { setAIsMe(false); setSaveError(null); console.log('✅ [ChatPreviewPage] 已选择 A/B 对应关系: A是她B是我'); }} />
          </div>
        </div>
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
            {canSave ? '✅ 满足保存条件' : aIsMe === null ? '请先选择 A/B 对应关系' : messagesReady ? '' : '需要至少 1 条 A 和 1 条 B'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <LiquidButton variant="secondary" onClick={handleSaveOnly} disabled={saving}>
              {saving ? '保存中...' : '保存'} <Save size={16} />
            </LiquidButton>
            <LiquidButton onClick={handleSaveAndAnalyze} disabled={saving}>
              {saving ? '保存中...' : '保存并分析'} <Check size={16} />
            </LiquidButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 共享子组件
// ═════════════════════════════════════════════════════════════

function EmptyState({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <GlassCard style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
        <p style={{ color: 'var(--text-rose)', marginBottom: 20 }}>
          还没有待预览的聊天内容，请先回到导入页粘贴并点击"解析"。
        </p>
        <LiquidButton onClick={() => onNavigate('chat-import')} variant="secondary">
          <ArrowLeft size={16} /> 返回导入页
        </LiquidButton>
      </GlassCard>
    </div>
  );
}

function Header({ onNavigate, title }: { onNavigate: (page: PageName) => void; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <button onClick={() => onNavigate('chat-import')} style={{ border: 'none', background: 'rgba(200,200,200,0.2)', cursor: 'pointer', borderRadius: 999, padding: 8, display: 'inline-flex' }}>
        <ArrowLeft size={18} color="var(--text-rose)" />
      </button>
      <h2 style={{ margin: 0, fontSize: 22, color: 'var(--text-rose)' }}>{title}</h2>
    </div>
  );
}

function StatsCard({ stats, labelMe, labelHer }: { stats: any; labelMe: string; labelHer: string }) {
  return (
    <GlassCard style={{ marginBottom: 16, padding: 16 }}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 14 }}>
        <MiniStat label="总数" value={stats.total} color="var(--text-rose)" />
        <MiniStat label={labelMe} value={stats.me ?? stats.A} color="#D4607A" />
        <MiniStat label={labelHer} value={stats.her ?? stats.B} color="#7A9EBF" />
        <MiniStat label="未确定" value={stats.unknown} color="#999" />
      </div>
    </GlassCard>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 20, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.7 }}>{label}</span>
    </div>
  );
}

function MessageList({ mode, store, editingId, editText, setEditText, onStartEdit, onCommitEdit, onCancelEdit }: any) {
  const msgs = mode === 'mineru' ? store.minerUMessages : store.draftMessages;
  if (!msgs || msgs.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
      {msgs.map((m: any, idx: number) => {
        const role = mode === 'mineru' ? (m.speakerRole ?? (m.role ?? 'unknown')) : m.senderRole;
        const confidence = mode === 'mineru' ? (m.confidence ?? 1) : 1;
        const align = role === 'A' || role === 'me' ? 'flex-start' :
                      role === 'B' || role === 'her' ? 'flex-end' : 'center';
        const bubbleBg = role === 'A' || role === 'me' ? 'rgba(122,158,191,0.12)' :
                         role === 'B' || role === 'her' ? 'rgba(212,96,122,0.12)' :
                         'rgba(180,180,180,0.1)';
        const borderColor = role === 'A' || role === 'me' ? 'rgba(122,158,191,0.3)' :
                            role === 'B' || role === 'her' ? 'rgba(212,96,122,0.3)' :
                            'rgba(180,180,180,0.25)';

        const isEditing = editingId === m.id;
        const handleSetRole = (r: string) => {
          if (mode === 'mineru') store.updateMinerUMessageRole(m.id, r as DraftSpeakerRole);
          else store.updateMessageSender(m.id, r as SenderRole);
        };
        const handleDelete = () => {
          if (mode === 'mineru') store.deleteMinerUMessage(m.id);
          else store.deleteMessage(m.id);
        };
        const handleMerge = () => {
          if (mode === 'mineru') store.mergeMinerUWithPrevious(m.id);
          else store.mergeWithPrevious(m.id);
        };

        return (
          <div key={m.id} style={{ display: 'flex', justifyContent: align, width: '100%' }}>
            <div style={{ maxWidth: '78%', width: '100%' }}>
              <div style={{ padding: '10px 14px', borderRadius: 14, background: bubbleBg, border: `1px solid ${borderColor}`, fontSize: 14, color: 'var(--text-rose)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {isEditing ? (
                  <textarea value={editText} onChange={(e: any) => setEditText(e.target.value)} autoFocus
                    rows={Math.min(6, editText.split('\n').length + 1)}
                    style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-rose)', outline: 'none', resize: 'vertical' }} />
                ) : (
                  m.cleanedText || <span style={{ color: '#999' }}>(空)</span>
                )}
                {m.rawText !== m.cleanedText && !isEditing && (
                  <div style={{ marginTop: 4, fontSize: 10, color: '#aaa' }}>原文：{(m.rawText || '').slice(0, 60)}</div>
                )}
                {mode === 'mineru' && confidence < 0.6 && (
                  <div style={{ marginTop: 4, fontSize: 10, color: '#D97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertTriangle size={12} /> 建议检查 (conf={confidence.toFixed(1)})
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: align }}>
                {mode === 'mineru' ? (
                  <>
                    <RoleBtn label="A" active={role === 'A'} activeColor="#7A9EBF" onClick={() => handleSetRole('A')} />
                    <RoleBtn label="B" active={role === 'B'} activeColor="#D4607A" onClick={() => handleSetRole('B')} />
                    <RoleBtn label="不确定" active={role === 'unknown'} activeColor="#999" onClick={() => handleSetRole('unknown')} />
                  </>
                ) : (
                  <>
                    <RoleBtn label="我" active={role === 'me'} activeColor="#D4607A" onClick={() => handleSetRole('me')} />
                    <RoleBtn label="她" active={role === 'her'} activeColor="#7A9EBF" onClick={() => handleSetRole('her')} />
                    <RoleBtn label="不确定" active={role === 'unknown'} activeColor="#999" onClick={() => handleSetRole('unknown')} />
                  </>
                )}
                {isEditing ? (
                  <>
                    <SmallIconBtn title="确认" onClick={onCommitEdit}><Check size={14} /></SmallIconBtn>
                    <SmallIconBtn title="取消" onClick={onCancelEdit}><ArrowLeft size={14} /></SmallIconBtn>
                  </>
                ) : (
                  <>
                    <SmallIconBtn title="编辑" onClick={() => onStartEdit(m.id, m.cleanedText)}><Edit2 size={14} /></SmallIconBtn>
                    <SmallIconBtn title="合并到上一条" onClick={handleMerge} disabled={idx === 0}><Merge size={14} /></SmallIconBtn>
                    <SmallIconBtn title="删除" onClick={handleDelete}><Trash2 size={14} /></SmallIconBtn>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoleBtn({ label, active, activeColor, onClick }: { label: string; active: boolean; activeColor: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '3px 10px', borderRadius: 999, border: `1px solid ${active ? activeColor : 'rgba(180,180,180,0.3)'}`, background: active ? activeColor : 'transparent', color: active ? '#fff' : 'var(--text-purple)', fontSize: 11, cursor: 'pointer', fontWeight: active ? 600 : 400 }}>
      {label}
    </button>
  );
}

function SmallIconBtn({ title, onClick, disabled, children }: { title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button title={title} onClick={onClick} disabled={disabled} style={{ padding: 4, borderRadius: 8, border: '1px solid rgba(180,180,180,0.25)', background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.3 : 1, color: 'var(--text-purple)', display: 'inline-flex' }}>
      {children}
    </button>
  );
}

function SaveBar({ mode, canSave, saving, saveError, unknownCount, onSaveOnly, onSaveAndAnalyze, aIsMe }: any) {
  return (
    <GlassCard style={{ padding: 16, position: 'sticky', bottom: 16 }}>
      {saveError && (
        <div style={{ marginBottom: 10, padding: 10, borderRadius: 10, background: 'rgba(220,80,80,0.1)', border: '1px solid rgba(220,80,80,0.3)', fontSize: 12, color: '#C0392B' }}>
          {saveError}
        </div>
      )}
      {(unknownCount > 0 && canSave) && (
        <div style={{ marginBottom: 10, fontSize: 12, color: '#D97706' }}>
          ⚠️ 还有 {unknownCount} 条未确定的消息，保存时会归为"她"。
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7 }}>
          {canSave ? '✅ 满足保存条件' : mode === 'mineru' && aIsMe === null ? '请先选择 A/B 对应关系' : '需要至少 1 条有效消息'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <LiquidButton variant="secondary" onClick={onSaveOnly} disabled={!canSave || saving}>
            {saving ? '保存中...' : '保存'} <Save size={16} />
          </LiquidButton>
          <LiquidButton onClick={onSaveAndAnalyze} disabled={!canSave || saving}>
            {saving ? '保存中...' : '保存并分析'} <Check size={16} />
          </LiquidButton>
        </div>
      </div>
    </GlassCard>
  );
}

function CopyBtn({ label, text }: { label: string; text: string }) {
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); }}
      style={{ padding: '6px 14px', borderRadius: 999, border: '1px solid rgba(180,180,180,0.3)', background: 'rgba(255,255,255,0.4)', color: 'var(--text-purple)', fontSize: 12, cursor: 'pointer' }}>
      📋 {label}
    </button>
  );
}

function MapBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 999, border: `1px solid ${active ? 'rgba(212,96,122,0.5)' : 'rgba(180,180,180,0.3)'}`,
      background: active ? 'rgba(212,96,122,0.15)' : 'transparent', color: active ? '#D4607A' : 'var(--text-purple)',
      fontSize: 13, cursor: 'pointer', fontWeight: active ? 600 : 400,
    }}>
      {label}
    </button>
  );
}
