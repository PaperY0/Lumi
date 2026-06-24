import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, HelpCircle, AlertCircle } from 'lucide-react';
import { GlassCard, LiquidButton } from './GlassUI';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';
import { parseChatText, type ChatImportParseResult } from '@/lib/chatImportParser';
import { chatRepository } from '@/lib/db/repositories/chatRepo';
import { useUserStore, useUiStore } from '@/stores';
import { useAnalysisRequestStore } from '@/stores/analysisRequestStore';

interface Props {
  onNavigate: (page: PageName) => void;
}

export function ChatImportPage({ onNavigate }: Props) {
  const { currentUser, currentGirl, loadCurrentUser } = useUserStore();
  const { showToast } = useUiStore();

  const { setPending } = useAnalysisRequestStore();

  const [rawText, setRawText] = useState('');
  const [parseResult, setParseResult] = useState<ChatImportParseResult | null>(null);
  const [focusQuestion, setFocusQuestion] = useState('');
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [helpExpanded, setHelpExpanded] = useState(true);

  // ── 解析 ──────────────────────────────────────────────
  const handleParse = () => {
    if (!rawText.trim()) {
      setError('请输入聊天记录后再解析');
      return;
    }

    setError(null);
    setParseResult(null);
    setImported(false);

    console.log('📥 [ChatImportPage] 开始解析聊天记录', { rawLength: rawText.length });

    const result = parseChatText(rawText, {
      userName: currentUser?.nickname,
      girlName: currentGirl?.nickname,
    });

    console.log('✅ [ChatImportPage] 解析完成', {
      messageCount: result.messages.length,
      skippedCount: result.skippedLines.length,
      detectedFormat: result.detectedFormat,
    });

    if (result.messages.length === 0) {
      setError('没有识别到有效聊天消息，请检查是否使用了"昵称：消息内容"的格式。');
      return;
    }

    setParseResult(result);
    setImported(false);
  };

  // ── 保存聊天记录（内部共用） ──────────────────────────
  const saveChatSession = async () => {
    if (!parseResult || parseResult.messages.length === 0) {
      throw new Error('没有可导入的聊天消息');
    }
    if (!currentUser?.id) {
      throw new Error('请先完成资料建档后再导入聊天记录');
    }

    const girlId = currentGirl?.id ?? 'default-girl';
    const title = `与 ${currentGirl?.nickname || '她'} 的聊天记录`;

    const session = await chatRepository.createSessionWithMessages(
      currentUser.id,
      girlId,
      parseResult.messages.map((m) => ({
        sender: m.role === 'user' ? ('user' as const) : ('other' as const),
        content: m.content,
        sentAt: new Date(m.createdAt),
        senderName: m.senderName,
      })),
      'paste',
      title,
    );

    return session;
  };

  // ── 仅保存聊天记录 ────────────────────────────────────
  const handleSaveOnly = async () => {
    if (importing) return;

    setImporting(true);
    setError(null);

    console.log('💾 [ChatImportPage] 保存聊天记录', {
      messageCount: parseResult?.messages.length ?? 0,
      mode: 'save-only',
      hasFocusQuestion: Boolean(focusQuestion.trim()),
    });

    try {
      const session = await saveChatSession();

      console.log('✅ [ChatImportPage] 聊天记录保存成功', {
        sessionId: session.id,
        messageCount: parseResult?.messages.length ?? 0,
      });

      setSuccessCount(parseResult?.messages.length ?? 0);
      setImported(true);
      setParseResult(null);
      showToast(`成功导入 ${parseResult?.messages.length ?? 0} 条消息`, 'success');
    } catch (err) {
      console.error('❌ [ChatImportPage] 聊天记录保存失败:', err);
      setError(err instanceof Error ? err.message : '聊天记录保存失败，请稍后重试');
    } finally {
      setImporting(false);
    }
  };

  // ── 确认导入并分析 ────────────────────────────────────
  const handleImportAndAnalyze = async () => {
    if (importing) return;

    setImporting(true);
    setError(null);

    console.log('💾 [ChatImportPage] 保存聊天记录', {
      messageCount: parseResult?.messages.length ?? 0,
      mode: 'save-and-analyze',
      hasFocusQuestion: Boolean(focusQuestion.trim()),
    });

    try {
      const session = await saveChatSession();

      console.log('✅ [ChatImportPage] 聊天记录保存成功', {
        sessionId: session.id,
        messageCount: parseResult?.messages.length ?? 0,
      });

      // 写入待分析请求，由 AIAnalysisPage 负责触发分析
      setPending(session.id, focusQuestion || undefined);

      setSuccessCount(parseResult?.messages.length ?? 0);
      setImported(true);
      setParseResult(null);
      showToast(`成功导入 ${parseResult?.messages.length ?? 0} 条消息，正在跳转分析...`, 'success');

      // 跳转到 AI 分析页
      onNavigate('ai-analysis');
    } catch (err) {
      console.error('❌ [ChatImportPage] 聊天记录保存失败:', err);
      setError(err instanceof Error ? err.message : '聊天记录保存失败，请稍后重试');
    } finally {
      setImporting(false);
    }
  };

  // ── 重置 ──────────────────────────────────────────────
  const handleClear = () => {
    setRawText('');
    setParseResult(null);
    setFocusQuestion('');
    setError(null);
    setImported(false);
    setSuccessCount(0);
  };

  // ── 渲染：帮助面板 ────────────────────────────────────
  const renderHelpPanel = () => (
    <GlassCard style={{ marginBottom: 24, background: 'rgba(255, 243, 224, 0.3)' }}>
      <div
        onClick={() => setHelpExpanded(!helpExpanded)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: helpExpanded ? 16 : 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HelpCircle size={18} color="#F59E0B" />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)' }}>📌 如何导出微信聊天记录？</span>
        </div>
        {helpExpanded ? <ChevronUp size={18} color="var(--text-purple)" /> : <ChevronDown size={18} color="var(--text-purple)" />}
      </div>

      {helpExpanded && (
        <div style={{ fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.7 }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px 14px', borderRadius: 12, marginBottom: 12, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: '#D97706' }}>
                微信限制：单次复制最多 100 条消息，且无法直接粘贴到 QQ 等其他 App。
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <strong>推荐方法：</strong>
          </div>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>
              <strong>单条复制：</strong>长按消息 → 复制
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>多选复制（推荐）：</strong>长按任意一条消息 → 选择"多选" → 勾选要导入的消息（最多 100 条）→ 点底部"复制"
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>中转粘贴：</strong>复制后先粘贴到手机备忘录 / 备忘 App，再从备忘录复制完整内容，最后粘贴到本页面
              <span style={{ opacity: 0.7 }}> （直接从微信粘贴到 QQ/邮件等可能丢失内容）</span>
            </li>
            <li>
              <strong>超过 100 条：</strong>分多次复制粘贴拼接即可
            </li>
          </ol>
        </div>
      )}
    </GlassCard>
  );

  // ── 渲染：格式示例 ────────────────────────────────────
  const renderFormatExamples = () => (
    <GlassCard style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 16 }}>
        ✨ 支持的格式示例
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 格式 1：冒号格式 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-purple)', marginBottom: 6, opacity: 0.7 }}>
            格式一：昵称 + 冒号
          </div>
          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '10px 14px', borderRadius: 12, fontSize: 13, color: 'var(--text-rose)', fontFamily: 'monospace', lineHeight: 1.8 }}>
            小明：今天吃饭了吗？<br />
            小红：吃啦，你呢？
          </div>
        </div>

        {/* 格式 2：括号时间 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-purple)', marginBottom: 6, opacity: 0.7 }}>
            格式二：括号时间 + 昵称
          </div>
          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '10px 14px', borderRadius: 12, fontSize: 13, color: 'var(--text-rose)', fontFamily: 'monospace', lineHeight: 1.8 }}>
            [2026/06/24 18:30] 小明：今天吃饭了吗？<br />
            [2026/06/24 18:31] 小红：吃啦，你呢？
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-purple)', opacity: 0.6, lineHeight: 1.6 }}>
        目前建议使用"昵称：消息内容"的格式。导入前会先显示解析预览，你确认后才会保存。
      </div>
    </GlassCard>
  );

  // ── 渲染：统计卡片 ────────────────────────────────────
  const renderStatsCard = () => {
    if (!parseResult) return null;
    return (
      <GlassCard style={{ marginBottom: 20, background: 'rgba(232, 116, 138, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 32 }}>✅</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-rose)' }}>
              共识别 {parseResult.messages.length} 条消息
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7 }}>
              格式：{parseResult.detectedFormat}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13 }}>
          <span style={{ color: 'var(--pink-primary)' }}>你 {parseResult.userMessageCount} 条</span>
          <span style={{ color: '#8B5CF6' }}>她 {parseResult.girlMessageCount} 条</span>
          {parseResult.unknownMessageCount > 0 && (
            <span style={{ color: 'var(--text-purple)', opacity: 0.6 }}>未识别 {parseResult.unknownMessageCount} 条</span>
          )}
          {parseResult.skippedLines.length > 0 && (
            <span style={{ color: 'var(--text-purple)', opacity: 0.6 }}>跳过 {parseResult.skippedLines.length} 行</span>
          )}
        </div>
      </GlassCard>
    );
  };

  // ── 渲染：警告 ──────────────────────────────────────────
  const renderWarnings = () => {
    if (!parseResult || parseResult.warnings.length === 0) return null;
    return (
      <GlassCard style={{ marginBottom: 20, background: 'rgba(245, 158, 11, 0.08)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#D97706', marginBottom: 8 }}>
          ⚠️ 有些行无法识别，建议检查格式
        </div>
        <div style={{ fontSize: 12, color: '#D97706', opacity: 0.8, lineHeight: 1.8 }}>
          {parseResult.warnings.slice(0, 3).map((w, i) => (
            <div key={i}>• {w}</div>
          ))}
          {parseResult.warnings.length > 3 && (
            <div>…还有 {parseResult.warnings.length - 3} 条提醒</div>
          )}
        </div>
      </GlassCard>
    );
  };

  // ── 渲染：选择"我" ────────────────────────────────────
  const renderNameSelection = () => {
    if (!parseResult) return null;
    const allNames = [...new Set(parseResult.messages.map((m) => m.senderName))];
    return (
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12 }}>
          请选择哪个昵称是你自己
        </div>

        {allNames.length < 2 && (
          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, marginBottom: 12, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span style={{ fontSize: 13, color: '#D97706' }}>
              消息中只检测到一个发送者，请检查格式是否正确
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allNames.map((name) => {
            const isMe = parseResult.messages.find((m) => m.senderName === name)?.role === 'user';
            const count = parseResult.messages.filter((m) => m.senderName === name).length;
            return (
              <label
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: isMe ? '2px solid var(--pink-primary)' : '1px solid rgba(255,255,255,0.3)',
                  background: isMe ? 'rgba(232, 116, 138, 0.08)' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: isMe ? '2px solid var(--pink-primary)' : '2px solid rgba(255,255,255,0.4)',
                  background: isMe ? 'var(--pink-primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isMe && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-rose)' }}>{name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7, marginLeft: 'auto' }}>
                  ({count} 条消息)
                </span>
              </label>
            );
          })}
        </div>
      </GlassCard>
    );
  };

  // ── 渲染：预览 ──────────────────────────────────────────
  const renderPreview = () => {
    if (!parseResult) return null;
    const preview = parseResult.messages.slice(0, 20);
    return (
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12 }}>
          预览（前 20 条）
        </div>
        <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {preview.map((msg) => {
            const isMe = msg.role === 'user';
            const isUnknown = msg.role === 'unknown';
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

            const ts = msg.timestamp
              ? new Date(msg.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 4, textAlign: isMe ? 'right' : 'left' }}>
                    {msg.senderName}{ts ? ` · ${ts}` : ''} {!isMe && !isUnknown && '(她)'}{isUnknown && '(未识别)'}
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
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {parseResult.messages.length > 20 && (
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-purple)', opacity: 0.6, textAlign: 'center' }}>
            仅预览前 20 条，导入时会保存全部 {parseResult.messages.length} 条
          </div>
        )}
      </GlassCard>
    );
  };

  // ── 渲染：成功卡片 ────────────────────────────────────
  const renderSuccessCard = () => {
    if (!imported) return null;
    return (
      <GlassCard style={{ marginBottom: 24, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 32 }}>✅</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-rose)' }}>
              已导入 {successCount} 条聊天记录
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7 }}>
              数据已保存到本地
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <LiquidButton onClick={() => onNavigate('ai-analysis')}>
            去 AI 分析 <ArrowRight size={16} />
          </LiquidButton>
          <LiquidButton variant="secondary" onClick={handleClear}>
            继续导入
          </LiquidButton>
        </div>
      </GlassCard>
    );
  };

  // ── 渲染：错误卡片 ────────────────────────────────────
  const renderError = () => {
    if (!error) return null;
    return (
      <GlassCard style={{ marginBottom: 20, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>❌</span>
          <span style={{ fontSize: 14, color: '#EF4444' }}>{error}</span>
        </div>
      </GlassCard>
    );
  };

  // ── 主渲染 ────────────────────────────────────────────
  return (
    <div style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }} className="page-enter">
      {/* 标题 */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, letterSpacing: '-0.03em' }}>
          <BlurText text="聊天导入" startDelay={60} className="gradient-text" style={{ fontWeight: 700, display: 'inline' }} />
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          粘贴你们的聊天记录，我会先在本地解析成对话，再用于后续 AI 分析。
        </p>
      </div>

      {/* 导入帮助面板 */}
      {renderHelpPanel()}

      {/* 格式示例 */}
      {renderFormatExamples()}

      {/* 错误 */}
      {renderError()}

      {/* 成功 */}
      {renderSuccessCard()}

      {/* 输入区域 */}
      {!parseResult && !imported && (
        <GlassCard style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12 }}>
            粘贴聊天内容
          </div>
          <textarea
            className="glass-input"
            placeholder={`请粘贴聊天记录，例如：\n你：今天还顺利吗？\n她：还可以，就是有点累\n你：那早点休息，别太辛苦～`}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setImported(false);
            }}
            style={{
              width: '100%',
              minHeight: 240,
              borderRadius: 18,
              padding: '14px 16px',
              fontSize: 14,
              color: 'var(--text-rose)',
              resize: 'vertical',
            }}
          />
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.6 }}>
              建议至少 20 条消息以获得更准确的分析
            </span>
            <span style={{ fontSize: 12, color: rawText.length > 50 ? 'var(--pink-primary)' : 'var(--text-purple)', opacity: 0.6 }}>
              {rawText.length} 字符
            </span>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <LiquidButton onClick={handleParse} disabled={!rawText.trim()}>
              解析聊天记录 <ArrowRight size={16} />
            </LiquidButton>
          </div>
        </GlassCard>
      )}

      {/* 解析结果 */}
      {parseResult && !imported && (
        <>
          {renderStatsCard()}
          {renderWarnings()}
          {renderNameSelection()}
          {renderPreview()}

          {/* 分析侧重点 */}
          <GlassCard style={{ marginBottom: 20, background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>
              💡 分析侧重点（可选）
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7, marginBottom: 12, lineHeight: 1.6 }}>
              如果你这次特别想确认某个问题，可以写在这里。AI 会在完整聊天记录分析基础上重点回应它，不填也可以正常分析。
            </div>
            <textarea
              className="glass-input"
              placeholder={`例如：她是不是真的生我气了？\n她是不是对我没兴趣？\n我刚才那句话是不是太急了？`}
              value={focusQuestion}
              onChange={(e) => setFocusQuestion(e.target.value)}
              style={{
                width: '100%',
                minHeight: 80,
                borderRadius: 14,
                padding: '12px 14px',
                fontSize: 13,
                color: 'var(--text-rose)',
                resize: 'vertical',
              }}
            />
          </GlassCard>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 20, flexWrap: 'wrap' }}>
            <LiquidButton variant="secondary" onClick={handleClear} disabled={importing}>
              清空
            </LiquidButton>
            <div style={{ display: 'flex', gap: 12 }}>
              <LiquidButton
                variant="secondary"
                onClick={handleSaveOnly}
                disabled={importing || parseResult.messages.length === 0}
              >
                {importing ? '正在保存...' : '仅保存聊天记录'}
              </LiquidButton>
              <LiquidButton
                onClick={handleImportAndAnalyze}
                disabled={importing || parseResult.messages.length === 0}
              >
                {importing ? '正在保存并准备分析...' : `确认导入并分析 ${parseResult.messages.length} 条`} <ArrowRight size={16} />
              </LiquidButton>
            </div>
          </div>
        </>
      )}

      {/* 底部导航 */}
      {!parseResult && !imported && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <LiquidButton variant="secondary" onClick={() => onNavigate('relationship-portrait')}>
            返回画像
          </LiquidButton>
        </div>
      )}
    </div>
  );
}
