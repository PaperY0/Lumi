import { useState, useMemo, useCallback } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, HelpCircle, AlertCircle } from 'lucide-react';
import { GlassCard, LiquidButton } from './GlassUI';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';
import { parseChatText, type ChatImportParseResult } from '@/lib/chatImportParser';
import { getSenderCandidates, mapMessagesWithSenderSelection, hasSenderConflict } from '@/lib/chatSenderMapping';
import { parseImportedChatText } from '@/lib/parsers/chatImportPipeline';
import { parseMinerUChatMarkdown } from '@/lib/parsers/minerUImportPipeline';
import { aiClient } from '@/lib/ai/aiClient';
import type { ImageOcrResult } from '@/lib/chatImageOcr';
import { readChatFiles, type ChatFileImportResult } from '@/lib/chatFileImporter';
import { chatRepository } from '@/lib/db/repositories/chatRepo';
import { useUserStore, useUiStore } from '@/stores';
import { useChatImportStore } from '@/stores/chatImportStore';
import { useAnalysisRequestStore } from '@/stores/analysisRequestStore';
import { ChatRecordHistoryPanel } from './ChatRecordHistoryPanel';

interface Props {
  onNavigate: (page: PageName) => void;
}

export function ChatImportPage({ onNavigate }: Props) {
  const { currentUser, currentGirl } = useUserStore();
  const { showToast } = useUiStore();
  const { setPending } = useAnalysisRequestStore();
  const { setImportResult, setMinerUImportResult } = useChatImportStore();

  const [rawText, setRawText] = useState('');
  const [parseResult, setParseResult] = useState<ChatImportParseResult | null>(null);
  const [focusQuestion, setFocusQuestion] = useState('');
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [helpExpanded, setHelpExpanded] = useState(true);
  const [activeView, setActiveView] = useState<'import' | 'history'>('import');

  // OCR 状态
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResults, setOcrResults] = useState<ImageOcrResult[] | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // 文件导入状态
  const [fileWarnings, setFileWarnings] = useState<string[]>([]);
  const [readingFiles, setReadingFiles] = useState(false);
  const [minerULoading, setMinerULoading] = useState(false);

  // 发送人映射状态
  const [userSenderName, setUserSenderName] = useState<string | null>(null);
  const [girlSenderName, setGirlSenderName] = useState<string | null>(null);

  // 从 parseResult 提取 sender candidates
  const senderCandidates = useMemo(() => {
    if (!parseResult) return [];
    return Array.from(
      new Set(
        parseResult.messages
          .map((m) => m.senderName?.trim())
          .filter((name): name is string => Boolean(name))
      )
    );
  }, [parseResult]);

  // 应用映射后的消息
  const mappedMessages = useMemo(() => {
    if (!parseResult) return [];
    return mapMessagesWithSenderSelection(parseResult.messages, userSenderName, girlSenderName);
  }, [parseResult, userSenderName, girlSenderName]);

  // 有效消息（已映射且有内容）
  const validMessages = useMemo(() => {
    return mappedMessages.filter(
      (m) => m.content.trim() && (m.role === 'user' || m.role === 'girl')
    );
  }, [mappedMessages]);

  // 统计
  const userMessageCount = validMessages.filter((m) => m.role === 'user').length;
  const girlMessageCount = validMessages.filter((m) => m.role === 'girl').length;
  const unknownMessageCount = mappedMessages.filter((m) => m.role === 'unknown').length;

  // 冲突检测
  const hasConflict = hasSenderConflict(userSenderName, girlSenderName);
  const canSave = validMessages.length > 0 && userSenderName && girlSenderName && !hasConflict;

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

    // 提取 sender candidates
    const candidates = getSenderCandidates(result.messages);

    console.log('✅ [ChatImportPage] 解析完成', {
      messageCount: result.messages.length,
      senderCandidates: candidates,
      skippedCount: result.skippedLines.length,
      detectedFormat: result.detectedFormat,
    });

    if (result.messages.length === 0) {
      setError('没有识别到有效聊天消息，请检查是否使用了"昵称：消息内容"的格式。');
      return;
    }

    setParseResult(result);

    // 设置默认发送人（第一个为"我"，第二个为"她"）
    setUserSenderName(candidates[0] ?? null);
    setGirlSenderName(candidates[1] ?? null);
    setImported(false);
  };

  // ── 预览（清洗 + 切分流水线）──────────────────────────
  // 走新的 chatImportPipeline：清洗 OCR/Markdown 噪声 → 切成草稿 → 跳预览页确认发言人
  const handlePreviewClean = () => {
    if (!rawText.trim()) {
      setError('请输入聊天记录后再预览');
      return;
    }
    setError(null);
    const result = parseImportedChatText(rawText);
    setImportResult(result);
    onNavigate('chat-preview');
  };

  // ── MinerU 解析 ──────────────────────────────────────
  // 调用后端 /api/parse-mineru-chat → AI 清洗 + A/B 初筛 → 跳预览页
  const handleMinerUParse = async () => {
    if (!rawText.trim()) {
      setError('请输入 MinerU Markdown 后再解析');
      return;
    }
    setError(null);
    setMinerULoading(true);

    console.log('📥 [ChatImportPage] 调用后端 MinerU 解析, 长度:', rawText.length);

    try {
      const result = await aiClient.parseMinerUChat({ originalMarkdown: rawText });
      console.log('📤 [ChatImportPage] 后端返回:', { messages: result.messages?.length, warnings: result.warnings });

      setMinerUImportResult(result);
      onNavigate('chat-preview');
    } catch (err: any) {
      console.error('[ChatImportPage] MinerU 解析失败:', err);
      setError(err.message || '云端识别失败，请检查后端服务是否启动，或稍后重试。');
    } finally {
      setMinerULoading(false);
    }
  };

  // ── 保存聊天记录（内部共用） ──────────────────────────
  const saveChatSession = async () => {
    if (!parseResult || validMessages.length === 0) {
      throw new Error('没有可导入的聊天消息');
    }
    if (!currentUser?.id) {
      throw new Error('请先完成资料建档后再导入聊天记录');
    }
    if (!userSenderName || !girlSenderName) {
      throw new Error('请选择"我"和"她"分别对应的发送人');
    }
    if (hasConflict) {
      throw new Error('不能把同一个发送人同时设为"我"和"她"');
    }

    const girlId = currentGirl?.id ?? 'default-girl';
    const title = `与 ${currentGirl?.nickname || '她'} 的聊天记录`;

    const session = await chatRepository.createSessionWithMessages(
      currentUser.id,
      girlId,
      validMessages.map((m) => ({
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
      validMessageCount: validMessages.length,
      userSenderName,
      girlSenderName,
      userMessageCount,
      girlMessageCount,
      mode: 'save-only',
      hasFocusQuestion: Boolean(focusQuestion.trim()),
    });

    try {
      const session = await saveChatSession();

      console.log('✅ [ChatImportPage] 聊天记录保存成功', {
        sessionId: session.id,
        validMessageCount: validMessages.length,
      });

      setSuccessCount(validMessages.length);
      setImported(true);
      setParseResult(null);
      showToast(`成功导入 ${validMessages.length} 条消息`, 'success');
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
      validMessageCount: validMessages.length,
      userSenderName,
      girlSenderName,
      userMessageCount,
      girlMessageCount,
      mode: 'save-and-analyze',
      hasFocusQuestion: Boolean(focusQuestion.trim()),
    });

    try {
      const session = await saveChatSession();

      console.log('✅ [ChatImportPage] 聊天记录保存成功', {
        sessionId: session.id,
        validMessageCount: validMessages.length,
      });

      // 写入待分析请求，由 AIAnalysisPage 负责触发分析
      setPending(session.id, focusQuestion || undefined);

      setSuccessCount(validMessages.length);
      setImported(true);
      setParseResult(null);
      showToast(`成功导入 ${validMessages.length} 条消息，正在跳转分析...`, 'success');

      // 跳转到 AI 分析页
      onNavigate('ai-analysis');
    } catch (err) {
      console.error('❌ [ChatImportPage] 聊天记录保存失败:', err);
      setError(err instanceof Error ? err.message : '聊天记录保存失败，请稍后重试');
    } finally {
      setImporting(false);
    }
  };

  // ── OCR 图片识别 ──────────────────────────────────────
  const handleOcrFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setOcrLoading(true);
    setOcrProgress(0);
    setOcrResults(null);
    setOcrError(null);

    try {
      const { recognizeChatImages } = await import('@/lib/chatImageOcr');
      const results = await recognizeChatImages(
        Array.from(files),
        (progress) => setOcrProgress(progress),
      );

      setOcrResults(results);

      const successTexts = results
        .filter((r) => (r.normalizedText || r.text) && !r.warning)
        .map((r) => r.normalizedText || r.text)
        .join('\n');

      if (successTexts) {
        setRawText((prev) => {
          const separator = prev.trim() ? '\n' : '';
          return prev + separator + successTexts;
        });
      }

      const hasOcrResult = results.some((r) => r.normalizedText || r.text);
      if (hasOcrResult) {
        setError(null);
      }

      const warnings = results.filter((r) => r.warning);
      if (warnings.length > 0 && successTexts.length === 0) {
        setOcrError(warnings.map((w) => w.warning).join('；'));
      }
    } catch {
      setOcrError('OCR 初始化失败，请改用文本粘贴导入');
    } finally {
      setOcrLoading(false);
      e.target.value = '';
    }
  };

  // ── 文件导入 ──────────────────────────────────────────
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setReadingFiles(true);
    setFileWarnings([]);
    setParseResult(null);
    setUserSenderName(null);
    setGirlSenderName(null);
    setImported(false);

    try {
      const results = await readChatFiles(Array.from(files));
      const warnings = results.filter((r) => r.warning).map((r) => r.warning!);
      setFileWarnings(warnings);

      // 合并文本，文件间用分隔行标记
      const mergedText = results
        .filter((r) => r.text)
        .map((r) => `--- 文件：${r.fileName} ---\n${r.text}`)
        .join('\n\n');

      if (mergedText) {
        setRawText((prev) => {
          const separator = prev.trim() ? '\n\n' : '';
          return prev + separator + mergedText;
        });
      }

      if (warnings.length === results.length && !mergedText) {
        setError('所有文件均无法读取，请检查文件格式和大小');
      }
    } catch {
      setError('文件读取失败，请重试');
    } finally {
      setReadingFiles(false);
      e.target.value = '';
    }
  };

  // ── 重置 ──────────────────────────────────────────────
  const handleClear = () => {
    setRawText('');
    setParseResult(null);
    setFocusQuestion('');
    setUserSenderName(null);
    setGirlSenderName(null);
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
              共识别 {validMessages.length} 条有效消息
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7 }}>
              格式：{parseResult.detectedFormat}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13 }}>
          <span style={{ color: 'var(--pink-primary)' }}>你 {userMessageCount} 条</span>
          <span style={{ color: '#8B5CF6' }}>她 {girlMessageCount} 条</span>
          {unknownMessageCount > 0 && (
            <span style={{ color: 'var(--text-purple)', opacity: 0.6 }}>未识别 {unknownMessageCount} 条</span>
          )}
          {parseResult.skippedLines.length > 0 && (
            <span style={{ color: 'var(--text-purple)', opacity: 0.6 }}>跳过 {parseResult.skippedLines.length} 行</span>
          )}
        </div>

        {unknownMessageCount > 0 && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <span style={{ fontSize: 12, color: '#D97706' }}>
              有 {unknownMessageCount} 条消息没有匹配到"我"或"她"，保存和分析时不会包含这些消息。
            </span>
          </div>
        )}

        {validMessages.length === 0 && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <span style={{ fontSize: 12, color: '#EF4444' }}>
              没有可导入的有效聊天消息，请检查发送人选择或聊天格式。
            </span>
          </div>
        )}
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

  // ── 渲染：发送人确认 ────────────────────────────────────
  const renderSenderSelection = () => {
    if (!parseResult || senderCandidates.length === 0) return null;

    return (
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>
          确认发送人身份
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7, marginBottom: 16, lineHeight: 1.6 }}>
          我会先根据昵称自动猜测，但你可以手动调整。保存和分析时会以这里的选择为准。
        </div>

        {senderCandidates.length < 2 && (
          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, marginBottom: 16, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span style={{ fontSize: 13, color: '#D97706' }}>
              只识别到一个发送人，建议检查聊天格式或手动补充另一方昵称。
            </span>
          </div>
        )}

        {hasConflict && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, marginBottom: 16, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <span style={{ fontSize: 13, color: '#EF4444' }}>
              不能把同一个发送人同时设为"我"和"她"
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* 我是谁 */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--pink-primary)', marginBottom: 10 }}>
              👤 我是谁
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {senderCandidates.map((name) => {
                const count = parseResult.messages.filter((m) => m.senderName === name).length;
                return (
                  <label
                    key={`user-${name}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: userSenderName === name ? '2px solid var(--pink-primary)' : '1px solid rgba(255,255,255,0.3)',
                      background: userSenderName === name ? 'rgba(232, 116, 138, 0.08)' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="userSender"
                      value={name}
                      checked={userSenderName === name}
                      onChange={() => setUserSenderName(name)}
                      style={{ width: 16, height: 16, accentColor: 'var(--pink-primary)' }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-rose)' }}>{name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.6, marginLeft: 'auto' }}>
                      {count}条
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 她是谁 */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#8B5CF6', marginBottom: 10 }}>
              💁 她是谁
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {senderCandidates.map((name) => {
                const count = parseResult.messages.filter((m) => m.senderName === name).length;
                return (
                  <label
                    key={`girl-${name}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: girlSenderName === name ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.3)',
                      background: girlSenderName === name ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="girlSender"
                      value={name}
                      checked={girlSenderName === name}
                      onChange={() => setGirlSenderName(name)}
                      style={{ width: 16, height: 16, accentColor: '#8B5CF6' }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-rose)' }}>{name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.6, marginLeft: 'auto' }}>
                      {count}条
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>
    );
  };

  // ── 渲染：预览 ──────────────────────────────────────────
  const renderPreview = () => {
    if (!parseResult) return null;
    const preview = mappedMessages.slice(0, 20);
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
                    {msg.senderName}{ts ? ` · ${ts}` : ''} {isMe && '(你)'} {!isMe && !isUnknown && '(她)'}{isUnknown && '(未识别)'}
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
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {mappedMessages.length > 20 && (
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-purple)', opacity: 0.6, textAlign: 'center' }}>
            仅预览前 20 条，导入时会保存全部 {validMessages.length} 条有效消息
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

      {/* Tab 切换 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setActiveView('import')}
          style={{
            padding: '8px 20px',
            borderRadius: 10,
            border: activeView === 'import' ? '2px solid var(--pink-primary)' : '1px solid rgba(255,255,255,0.3)',
            background: activeView === 'import' ? 'rgba(232, 116, 138, 0.1)' : 'rgba(255,255,255,0.2)',
            color: activeView === 'import' ? 'var(--pink-primary)' : 'var(--text-purple)',
            fontSize: 14,
            fontWeight: activeView === 'import' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          导入聊天
        </button>
        <button
          onClick={() => setActiveView('history')}
          style={{
            padding: '8px 20px',
            borderRadius: 10,
            border: activeView === 'history' ? '2px solid var(--pink-primary)' : '1px solid rgba(255,255,255,0.3)',
            background: activeView === 'history' ? 'rgba(232, 116, 138, 0.1)' : 'rgba(255,255,255,0.2)',
            color: activeView === 'history' ? 'var(--pink-primary)' : 'var(--text-purple)',
            fontSize: 14,
            fontWeight: activeView === 'history' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          聊天记录
        </button>
      </div>

      {/* 导入聊天视图 */}
      {activeView === 'import' && (
        <>
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
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                <LiquidButton onClick={handleMinerUParse} disabled={!rawText.trim() || minerULoading} variant="secondary">
                  {minerULoading ? '⏳ 云端识别中...' : '🔬 MinerU 解析'} <ArrowRight size={16} />
                </LiquidButton>
                <LiquidButton onClick={handlePreviewClean} disabled={!rawText.trim()} variant="secondary">
                  预览(清洗) <ArrowRight size={16} />
                </LiquidButton>
                <LiquidButton onClick={handleParse} disabled={!rawText.trim()}>
                  解析聊天记录 <ArrowRight size={16} />
                </LiquidButton>
              </div>
            </GlassCard>
          )}

          {/* 文件导入 */}
          {!parseResult && !imported && (
            <GlassCard style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>
                📂 从文件导入聊天记录
              </div>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-purple)', opacity: 0.75, lineHeight: 1.6 }}>
                支持 .txt、.md、.csv、.json 文件。文件只会在浏览器本地读取，不会上传服务器。
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 20px',
                    borderRadius: 999,
                    background: readingFiles
                      ? 'rgba(200,200,200,0.3)'
                      : 'linear-gradient(135deg, rgba(200,168,212,0.1), rgba(176,160,204,0.12))',
                    border: '1px solid rgba(200,168,212,0.3)',
                    color: readingFiles ? 'var(--text-purple)' : '#8B6B9E',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: readingFiles ? 'not-allowed' : 'pointer',
                    opacity: readingFiles ? 0.6 : 1,
                  }}
                >
                  {readingFiles ? '⏳ 读取中...' : '📁 选择文件'}
                  <input
                    type="file"
                    accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json"
                    multiple
                    onChange={handleFileImport}
                    disabled={readingFiles}
                    style={{ display: 'none' }}
                  />
                </label>

                <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.6 }}>
                  单文件 ≤ 2MB，最多 10 个
                </span>
              </div>

              {fileWarnings.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    fontSize: 12,
                    color: '#D97706',
                    lineHeight: 1.6,
                  }}
                >
                  {fileWarnings.map((w, i) => (
                    <div key={i}>{w}</div>
                  ))}
                </div>
              )}

              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(196,160,112,0.08)',
                  border: '1px solid rgba(196,160,112,0.2)',
                  fontSize: 11,
                  color: 'var(--graphite-rose)',
                  lineHeight: 1.6,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                }}
              >
                <span style={{ flexShrink: 0 }}>🔒</span>
                <span>
                  文件内容只会在当前浏览器中读取和解析，不会上传服务器。请不要导入未经允许的敏感聊天记录。
                </span>
              </div>
            </GlassCard>
          )}

          {/* OCR 图片识别 */}
          {!parseResult && !imported && (
            <GlassCard style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>
                📷 从聊天截图识别文字
              </div>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-purple)', opacity: 0.75, lineHeight: 1.6 }}>
                选择聊天截图，通过 Mineru 云端识别文字并填入上方输入框。识别结果请检查后再解析。
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 20px',
                    borderRadius: 999,
                    background: ocrLoading
                      ? 'rgba(200,200,200,0.3)'
                      : 'linear-gradient(135deg, rgba(212,96,122,0.1), rgba(191,142,110,0.15))',
                    border: '1px solid rgba(212,96,122,0.25)',
                    color: ocrLoading ? 'var(--text-purple)' : '#D4607A',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: ocrLoading ? 'not-allowed' : 'pointer',
                    opacity: ocrLoading ? 0.6 : 1,
                  }}
                >
                  {ocrLoading ? '⏳ 识别中...' : '📁 选择图片'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handleOcrFiles}
                    disabled={ocrLoading}
                    style={{ display: 'none' }}
                  />
                </label>

                {ocrLoading && (
                  <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7 }}>
                    识别进度 {ocrProgress}%
                  </span>
                )}

                {ocrResults && !ocrLoading && (
                  <span style={{ fontSize: 12, color: '#4A7A3E' }}>
                    已识别 {ocrResults.filter((r) => r.text).length} 张图片
                  </span>
                )}
              </div>

              {ocrError && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    fontSize: 12,
                    color: '#D97706',
                  }}
                >
                  {ocrError}
                </div>
              )}

              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(196,160,112,0.08)',
                  border: '1px solid rgba(196,160,112,0.2)',
                  fontSize: 11,
                  color: 'var(--graphite-rose)',
                  lineHeight: 1.6,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                }}
              >
                <span style={{ flexShrink: 0 }}>🔒</span>
                <span>
                  图片将通过 Mineru 云端 API 识别。请勿上传包含隐私信息的截图。识别结果请检查后再导入。
                </span>
              </div>
            </GlassCard>
          )}

          {/* 解析结果 */}
          {parseResult && !imported && (
            <>
              {renderStatsCard()}
              {renderWarnings()}
              {renderSenderSelection()}
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
                    disabled={importing || !canSave}
                  >
                    {importing ? '正在保存...' : '仅保存聊天记录'}
                  </LiquidButton>
                  <LiquidButton
                    onClick={handleImportAndAnalyze}
                    disabled={importing || !canSave}
                  >
                    {importing ? '正在保存并准备分析...' : `确认导入并分析 ${validMessages.length} 条`} <ArrowRight size={16} />
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
        </>
      )}

      {/* 聊天记录历史视图 */}
      {activeView === 'history' && (
        <ChatRecordHistoryPanel onNavigate={onNavigate} />
      )}
    </div>
  );
}
