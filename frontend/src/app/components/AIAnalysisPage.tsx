import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, RefreshCw, Lightbulb, Ban, AlertCircle, History, FileText, MessageCircle } from 'lucide-react';
import { GlassCard, LiquidButton, HeatMeter, StageBadge, AIInsightCard, WarningNotice, GlassInput } from './GlassUI';
import { CountUp } from './CountUp';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';
import { useAnalyzeChat } from '@/hooks/useAnalyzeChat';
import { useAnalysisRequestStore } from '@/stores/analysisRequestStore';
import { useUserStore } from '@/stores';
import { chatRepository } from '@/lib/db/repositories/chatRepo';
import { AIAnalysisHistoryPanel } from './AIAnalysisHistoryPanel';
import type { ChatSession, ChatMessage } from '@/types';
import { formatDateTime } from '@/utils/date';

type ActiveView = 'current' | 'history';

interface Props { onNavigate: (page: PageName) => void; }

const ANALYSIS_FORM_MAX_WIDTH = 800;
const ANALYSIS_REPORT_MAX_WIDTH = ANALYSIS_FORM_MAX_WIDTH;
const ANALYSIS_HISTORY_MAX_WIDTH = ANALYSIS_FORM_MAX_WIDTH;

export function AIAnalysisPage({ onNavigate }: Props) {
  const [userQuestion, setUserQuestion] = useState('');
  const [currentFocusQuestion, setCurrentFocusQuestion] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('current');
  const { data, loading, error, analyze, loadCached, setData } = useAnalyzeChat();

  const { pendingSessionId, pendingFocusQuestion, clearPending } = useAnalysisRequestStore();
  const autoAnalyzeStartedRef = useRef(false);

  // ── 聊天记录选择器 ──────────────────────────────────────────
  const [chatRecords, setChatRecords] = useState<ChatSession[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [previewMessages, setPreviewMessages] = useState<ChatMessage[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  const { currentUser } = useUserStore();

  const loadChatRecords = async () => {
    if (!currentUser?.id) return;
    setLoadingRecords(true);
    setRecordsError(null);
    try {
      const sessions = await chatRepository.listSessions(currentUser.id);
      setChatRecords(sessions);
      console.log('📚 [AIAnalysisPage] 已加载聊天记录数量:', sessions.length);
    } catch (e: any) {
      console.error('[AIAnalysisPage] 加载聊天记录失败:', e);
      setRecordsError('加载聊天记录失败');
    } finally {
      setLoadingRecords(false);
    }
  };

  const selectChatRecord = async (sessionId: string) => {
    console.log('📌 [AIAnalysisPage] 当前选中聊天记录:', sessionId);
    setCurrentSessionId(sessionId);
    setLoadingPreview(true);
    try {
      const msgs = await chatRepository.getMessages(sessionId);
      setPreviewMessages(msgs);
    } catch {
      setPreviewMessages([]);
    } finally {
      setLoadingPreview(false);
    }
  };

  // 挂载时加载聊天记录列表
  useEffect(() => {
    loadChatRecords();
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 页面挂载时：检查待分析请求或加载缓存
  useEffect(() => {
    if (pendingSessionId && !autoAnalyzeStartedRef.current) {
      // 有待分析的聊天记录，自动触发分析
      autoAnalyzeStartedRef.current = true;
      const fq = pendingFocusQuestion;
      const sid = pendingSessionId;
      setCurrentFocusQuestion(fq);
      setCurrentSessionId(sid);
      clearPending();

      console.log('🎯 [AIAnalysisPage] 检测到待分析聊天记录', {
        sessionId: sid,
        hasFocusQuestion: Boolean(fq),
      });
      console.log('🚀 [AIAnalysisPage] 自动开始分析导入的聊天记录');

      // 自动选中 + 加载消息 + 分析
      selectChatRecord(sid).then(() => {
        analyze({
          sessionId: sid,
          userQuestion: fq || undefined,
        });
      });
    } else if (!pendingSessionId) {
      // 没有待分析请求，加载缓存报告
      loadCached();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnalyze = () => {
    if (loading) return;
    if (!currentSessionId) {
      setRecordsError('请先选择一段聊天记录');
      return;
    }
    console.log('🖱️ [AIAnalysisPage] 用户点击开始分析');
    analyze({
      sessionId: currentSessionId,
      userQuestion: currentFocusQuestion || userQuestion || undefined,
    });
  };

  const handleBackToCurrentAnalysis = () => {
    setData(null);
    setActiveView('current');
  };

  // 判断是否为聊天记录不足的错误
  const isChatInsufficient = error && (
    error.includes('聊天记录') || error.includes('导入')
  );

  // 互动热度映射
  const heatValue = data ? (
    data.interactionHeat === 'hot' ? 90 :
    data.interactionHeat === 'warm' ? 65 : 30
  ) : 0;

  const pageMaxWidth =
    activeView === 'history'
      ? ANALYSIS_HISTORY_MAX_WIDTH
      : data && !loading
        ? ANALYSIS_REPORT_MAX_WIDTH
        : ANALYSIS_FORM_MAX_WIDTH;

  return (
    <div style={{ padding: '32px', maxWidth: pageMaxWidth, margin: '0 auto', width: '100%' }} className="page-enter">
      {/* 标题 */}
      <div style={{ marginBottom: 28 }}>
        <BlurText text="AI 聊天分析" startDelay={60} className="gradient-text" style={{ fontSize: 28, letterSpacing: '-0.03em', fontWeight: 700, display: 'block' }} />
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          从聊天记录里提取关系信号、互动节奏和下一步建议
        </p>
      </div>

      {/* 当前分析 / 历史报告 切换 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setActiveView('current')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: activeView === 'current' ? 'rgba(232,116,138,0.15)' : 'rgba(255,255,255,0.05)',
            border: activeView === 'current' ? '1px solid rgba(232,116,138,0.3)' : '1px solid rgba(139,92,246,0.2)',
            borderRadius: 999,
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: activeView === 'current' ? 600 : 400,
            color: activeView === 'current' ? 'var(--pink-primary)' : 'var(--text-purple)',
            transition: 'all 0.2s',
          }}
        >
          <FileText size={16} />
          当前分析
        </button>
        <button
          onClick={() => setActiveView('history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: activeView === 'history' ? 'rgba(232,116,138,0.15)' : 'rgba(255,255,255,0.05)',
            border: activeView === 'history' ? '1px solid rgba(232,116,138,0.3)' : '1px solid rgba(139,92,246,0.2)',
            borderRadius: 999,
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: activeView === 'history' ? 600 : 400,
            color: activeView === 'history' ? 'var(--pink-primary)' : 'var(--text-purple)',
            transition: 'all 0.2s',
          }}
        >
          <History size={16} />
          历史报告
        </button>
      </div>

      {/* 历史报告面板 */}
      {activeView === 'history' && (
        <AIAnalysisHistoryPanel
          onUseReport={(report) => {
            setData(report);
            setActiveView('current');
          }}
        />
      )}

      {/* 当前分析视图 */}
      {activeView === 'current' && (
        <>
          {/* 本次关注点 */}
          {currentFocusQuestion && (
            <GlassCard style={{ marginBottom: 20, background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
              <div style={{ fontSize: 12, color: '#8B5CF6', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                🎯 本次关注点
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-rose)', lineHeight: 1.6 }}>
                {currentFocusQuestion}
              </div>
            </GlassCard>
          )}

          {/* 聊天记录选择器 */}
          {!data && !loading && (
            <GlassCard style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 4 }}>
                <MessageCircle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                聊天记录分析
              </div>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-purple)', opacity: 0.7, lineHeight: 1.6 }}>
                选择一段已保存的聊天记录进行分析，也可以先预览内容再开始。
              </p>

              {recordsError && (
                <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 10, background: 'rgba(220,80,80,0.1)', border: '1px solid rgba(220,80,80,0.2)', fontSize: 12, color: '#C0392B' }}>
                  {recordsError}
                </div>
              )}

              {loadingRecords ? (
                <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.7, padding: '16px 0', textAlign: 'center' }}>
                  正在加载聊天记录...
                </div>
              ) : chatRecords.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.7, padding: '16px 0', textAlign: 'center', lineHeight: 1.8 }}>
                  还没有已保存的聊天记录，请先导入或粘贴聊天内容。
                </div>
              ) : (
                <>
                  <select
                    value={currentSessionId || ''}
                    onChange={(e) => {
                      const sid = e.target.value;
                      if (sid) {
                        selectChatRecord(sid);
                        setRecordsError(null);
                      } else {
                        setCurrentSessionId(null);
                        setPreviewMessages([]);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid rgba(200,168,212,0.3)',
                      background: 'rgba(255,255,255,0.4)',
                      fontSize: 14,
                      color: 'var(--text-rose)',
                      outline: 'none',
                      marginBottom: 12,
                    }}
                  >
                    <option value="">请选择要分析的聊天记录</option>
                    {chatRecords.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title || '未命名聊天记录'} — {r.messageCount} 条消息 — {formatDateTime(r.importedAt)}
                      </option>
                    ))}
                  </select>

                  {/* 预览 */}
                  {loadingPreview && (
                    <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.7, padding: '12px 0', textAlign: 'center' }}>
                      正在加载消息预览...
                    </div>
                  )}

                  {!loadingPreview && currentSessionId && previewMessages.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-purple)', marginBottom: 8, opacity: 0.7 }}>
                        预览（前 10 条，共 {previewMessages.length} 条）
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                        {previewMessages.slice(0, 10).map((msg) => {
                          const isMe = msg.sender === 'user';
                          return (
                            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                              <div style={{ maxWidth: '75%' }}>
                                <div style={{ fontSize: 10, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 2 }}>
                                  {isMe ? '我' : '她'}
                                </div>
                                <div style={{
                                  padding: '8px 12px',
                                  borderRadius: 12,
                                  background: isMe ? 'rgba(232,116,138,0.1)' : 'rgba(139,92,246,0.08)',
                                  border: isMe ? '1px solid rgba(232,116,138,0.2)' : '1px solid rgba(139,92,246,0.15)',
                                  fontSize: 13,
                                  color: 'var(--text-rose)',
                                  lineHeight: 1.5,
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}>
                                  {msg.content}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {previewMessages.length > 10 && (
                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-purple)', opacity: 0.6, textAlign: 'center' }}>
                          还有 {previewMessages.length - 10} 条未展示
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </GlassCard>
          )}

          {/* 输入框 */}
          {!data && !loading && (
            <GlassCard style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8 }}>
                你想重点分析什么？（可选）
              </label>
              <GlassInput
                placeholder="例如：她是不是对我冷淡了？我哪里说错了吗？"
                value={userQuestion}
                onChange={setUserQuestion}
              />
              <div style={{ marginTop: 16 }}>
                <LiquidButton onClick={handleAnalyze} disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'AI 正在分析聊天记录...' : '开始分析'}
                  {!loading && <ArrowRight size={16} />}
                </LiquidButton>
              </div>
            </GlassCard>
          )}

          {/* 错误状态 */}
          {error && (
            <GlassCard style={{ marginBottom: 20, background: isChatInsufficient ? 'rgba(255,243,224,0.5)' : 'rgba(255,235,235,0.5)', border: isChatInsufficient ? '1px solid rgba(200,180,130,0.3)' : '1px solid rgba(200,150,150,0.3)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <AlertCircle size={20} color={isChatInsufficient ? '#C99A6A' : '#C96A6A'} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: isChatInsufficient ? '#C99A6A' : '#C96A6A', marginBottom: 6 }}>
                    {isChatInsufficient ? '聊天记录不足，暂时不能分析' : '出了一点小问题'}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.6 }}>
                    {currentSessionId && !data
                      ? `聊天记录已导入，但 AI 分析暂时失败：${error}`
                      : error
                    }
                  </p>
                  {isChatInsufficient ? (
                    <LiquidButton onClick={() => onNavigate('chat-import')} style={{ marginTop: 12 }}>
                      去导入聊天记录 <ArrowRight size={14} />
                    </LiquidButton>
                  ) : (
                    <LiquidButton variant="secondary" onClick={handleAnalyze} style={{ marginTop: 12 }}>
                      <RefreshCw size={14} /> 重试
                    </LiquidButton>
                  )}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Loading 状态 */}
          {loading && (
            <GlassCard style={{ marginBottom: 20, textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🤖</div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--pink-primary)' }}>正在分析聊天内容...</p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>正在结合你们的资料和聊天记录生成分析</p>
            </GlassCard>
          )}

          {/* 报告内容 */}
          {data && !loading && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <LiquidButton
                    variant="secondary"
                    onClick={handleBackToCurrentAnalysis}
                    style={{ minHeight: 38, padding: '8px 16px', fontSize: 13 }}
                  >
                    <ArrowLeft size={14} /> 返回 AI 分析页面
                  </LiquidButton>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', opacity: 0.75 }}>
                  分析于 {new Date(data.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                </div>
                <LiquidButton
                  variant="secondary"
                  onClick={handleAnalyze}
                  style={{ minHeight: 38, padding: '8px 16px', fontSize: 13 }}
                >
                  <RefreshCw size={14} /> 重新分析
                </LiquidButton>
              </div>

              {/* 一句话结论 */}
              <GlassCard style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(232,116,138,0.08), rgba(212,165,201,0.08))' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#E8748A,#C5956C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={22} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI 简答</div>
                    <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-rose)', lineHeight: 1.55, letterSpacing: '-0.01em' }}>
                      {data.simpleAnswer}
                    </p>
                  </div>
                </div>
              </GlassCard>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* 关系阶段 & 互动热度 */}
                <GlassCard>
                  <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>关系阶段</div>
                  <div style={{ marginBottom: 18 }}>
                    <StageBadge stage={data.relationshipStage} active />
                  </div>
                  <HeatMeter value={heatValue} />
                  <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-purple)', opacity: 0.8 }}>
                    她的情绪：{data.girlEmotion}
                  </div>
                </GlassCard>

                {/* 女生视角 */}
                <GlassCard>
                  <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>女生视角解释</div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.7 }}>
                    {data.girlPerspective}
                  </p>
                </GlassCard>
              </div>

              {/* 信号 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <AIInsightCard
                  icon="✅"
                  title="积极信号"
                  variant="positive"
                  content={
                    <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
                      {data.positiveSignals.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  }
                />
                <AIInsightCard
                  icon="⚠️"
                  title="风险信号"
                  variant="risk"
                  content={
                    <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
                      {data.riskSignals.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  }
                />
              </div>

              {/* 我的表达问题 */}
              {data.boyIssues.length > 0 && (
                <AIInsightCard
                  icon="💬"
                  title="你的表达分析"
                  content={
                    <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
                      {data.boyIssues.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  }
                  variant="default"
                />
              )}

              {/* 推荐回复 */}
              {data.recommendedReplies.length > 0 && (
                <GlassCard style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12 }}>推荐回复</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.recommendedReplies.map((reply, i) => (
                      <div key={i} style={{ borderRadius: 14, padding: '12px 14px', background: 'rgba(212,165,201,0.1)', border: '1px solid rgba(212,165,201,0.2)' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--champagne-gold)', marginBottom: 4 }}>{reply.style}</div>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.6 }}>{reply.text}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* 下一步 & 避免 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, marginBottom: 16 }}>
                <GlassCard>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Lightbulb size={14} color="var(--champagne-gold)" /> 下一步建议
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
                    {data.nextStep}
                  </p>
                </GlassCard>
                <GlassCard style={{ background: 'rgba(255,235,235,0.3)', border: '1px solid rgba(200,150,150,0.2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#C96A6A', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Ban size={14} color="#C96A6A" /> 不建议的回复
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
                    {data.avoidReplies.map((s, i) => <li key={i} style={{ color: 'var(--text-purple)', opacity: 0.9 }}>{s}</li>)}
                  </ul>
                </GlassCard>
              </div>

              <WarningNotice text="AI 分析仅供参考，不代表对方真实想法。请结合现实互动，尊重对方表达和边界。" />

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <LiquidButton variant="secondary" onClick={() => onNavigate('chat-import')}>
                  导入聊天记录
                </LiquidButton>
                <LiquidButton onClick={() => onNavigate('reply-assist')}>
                  帮我回复她的消息 <ArrowRight size={16} />
                </LiquidButton>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
