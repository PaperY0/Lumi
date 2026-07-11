import { useState, type KeyboardEventHandler } from 'react';
import { Sparkles, RotateCcw, MessageSquare, AlertCircle, Lightbulb, Zap, ShieldCheck, Send, CheckCircle, History } from 'lucide-react';
import { BlurText } from './BlurText';
import { IconBadge } from './IconBadge';
import type { PageName } from './GlassUI';
import { useSimulateChat } from '@/hooks/useSimulateChat';
import { SimulateHistoryPanel } from './SimulateHistoryPanel';
import { PageBackButton } from './PageBackButton';

interface Props { onNavigate: (page: PageName) => void; }

const scenarios = [
  { id: '日常聊天',   label: '日常聊天',   token: 'chat' as const,     desc: '从日常话题切入，保持轻松感' },
  { id: '邀约吃饭',   label: '邀约吃饭',   token: 'invite' as const,   desc: '如何提出邀约而不显得突然' },
  { id: '表达好感',   label: '表达好感',   token: 'love' as const,     desc: '在合适时机自然表达喜欢' },
  { id: '道歉',       label: '道歉',       token: 'apology' as const,  desc: '真诚道歉而不让对方觉得烦' },
  { id: '对方冷淡',   label: '对方冷淡',   token: 'cold' as const,     desc: '对方变冷淡时如何应对' },
  { id: '争吵后修复', label: '争吵后修复', token: 'grow' as const,     desc: '吵架后如何温和修复关系' },
];
const difficultyOptions = ['轻松', '普通', '有挑战'];

export function SimulationPage({ onNavigate }: Props) {
  const {
    conversation,
    feedback,
    loading,
    error,
    started,
    scenario,
    difficulty,
    finished,
    savedRecord,
    saving,
    saveError,
    startPractice,
    sendUserReply,
    finishPractice,
    resetPractice,
  } = useSimulateChat();

  const [selectedScenario, setSelectedScenario] = useState<string>('日常聊天');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('普通');
  const [replyText, setReplyText] = useState('');
  const [activeView, setActiveView] = useState<'practice' | 'history'>('practice');

  const handleStart = async () => {
    if (loading) return;
    console.log('🖱️ [SimulationPage] 用户点击开始练习', { selectedScenario, selectedDifficulty });
    await startPractice(selectedScenario, selectedDifficulty);
  };

  const handleSendReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || loading || finished) return;
    console.log('🖱️ [SimulationPage] 用户发送模拟回复:', trimmed);
    setReplyText('');
    await sendUserReply(trimmed);
  };

  const handleReplyKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault();
      void handleSendReply();
    }
  };

  const handleFinishPractice = async () => {
    if (saving || loading) return;
    console.log('🏁 [SimulationPage] 用户点击结束练习并保存');
    await finishPractice();
  };

  const handleReset = () => {
    console.log('🔄 [SimulationPage] 用户点击重新选择场景');
    resetPractice();
    setReplyText('');
  };

  const scenarioMeta = scenarios.find(s => s.id === (scenario ?? selectedScenario));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* ── Header ──────────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <PageBackButton />
            </div>
            <BlurText text="模拟对话练习" startDelay={60} style={{ fontSize: 24, fontWeight: 700, color: 'var(--deep-plum)', letterSpacing: '-0.03em', display: 'block' }} />
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--graphite-rose)', opacity: 0.75 }}>
              追求期模式：结合双方资料、问卷和最近互动，检查你的表达是否尊重节奏与拒绝空间
            </p>
          </div>

          {/* ── Tab switcher ────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {([
              { key: 'practice' as const, label: '开始练习', icon: Sparkles },
              { key: 'history' as const, label: '历史记录', icon: History },
            ]).map(tab => {
              const active = activeView === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
                    borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
                    background: active ? 'linear-gradient(135deg,#C8607A,#C4A070)' : 'rgba(255,250,252,0.6)',
                    border: active ? 'none' : '1px solid rgba(200,96,122,0.18)',
                    color: active ? 'white' : 'var(--graphite-rose)',
                    transition: 'all 0.22s ease',
                    boxShadow: active ? '0 3px 12px rgba(200,96,122,0.3)' : undefined,
                  }}
                >
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── History view ────────────────────────────────────── */}
          {activeView === 'history' && <SimulateHistoryPanel />}

          {/* ── Practice view ──────────────────────────────────── */}
          {activeView === 'practice' && (
          <>
          {/* ── Not started: scene & difficulty selection ─────── */}
          {!started && !loading && (
            <>
              {/* Scene grid */}
              <div className="glass-card hoverable-card" style={{ borderRadius: 28, padding: '22px', marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--deep-plum)', marginBottom: 14 }}>选择练习场景</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {scenarios.map(s => {
                    const active = selectedScenario === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedScenario(s.id)}
                        style={{
                          borderRadius: 18, padding: '14px', cursor: 'pointer',
                          background: active ? 'linear-gradient(135deg,rgba(200,96,122,0.14),rgba(196,160,112,0.16))' : 'rgba(255,250,252,0.5)',
                          border: active ? '1.5px solid rgba(200,96,122,0.4)' : '1px solid rgba(255,255,255,0.42)',
                          transition: 'all 0.22s var(--ease-hover)',
                          boxShadow: active ? '0 4px 16px rgba(200,96,122,0.18)' : undefined,
                          transform: active ? 'translateY(-2px)' : undefined,
                        }}
                      >
                        <IconBadge token={s.token} size={40} tone={active ? 'rose' : 'lavender'} style={{ marginBottom: 7 }} />
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--deep-plum)', marginBottom: 3 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--graphite-rose)', opacity: 0.75, lineHeight: 1.4 }}>{s.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty */}
              <div className="glass-card hoverable-card" style={{ borderRadius: 24, padding: '18px 22px', marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--deep-plum)', marginBottom: 12 }}>难度设置</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {difficultyOptions.map(d => {
                    const active = selectedDifficulty === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(d)}
                        style={{
                          flex: 1, padding: '11px', borderRadius: 14, cursor: 'pointer',
                          border: active ? 'none' : '1px solid rgba(200,96,122,0.18)',
                          background: active ? 'linear-gradient(135deg,#C8607A,#C4A070)' : 'rgba(255,250,252,0.6)',
                          color: active ? 'white' : 'var(--graphite-rose)',
                          fontSize: 13, fontWeight: active ? 600 : 400,
                          transition: 'all 0.22s ease',
                          boxShadow: active ? '0 3px 12px rgba(200,96,122,0.3)' : undefined,
                          transform: active ? 'translateY(-1px)' : undefined,
                        }}
                      >{d}</button>
                    );
                  })}
                </div>
              </div>

              {/* Start button */}
              <button className="btn-primary" onClick={handleStart} disabled={loading} style={{
                borderRadius: 999, padding: '15px', fontSize: 15, width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.6 : 1, minHeight: 52,
              }}>
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: 999, animation: 'spin 0.8s linear infinite' }} />
                    AI 正在准备练习场景...
                  </>
                ) : (
                  <><Sparkles size={16} /> 开始练习</>
                )}
              </button>
            </>
          )}

          {/* ── Loading state (initial start) ──────────────────── */}
          {loading && started && conversation.length === 0 && (
            <div className="glass-card" style={{ borderRadius: 28, padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(212,96,122,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(212,96,122,0.15)', animation: 'breathe 1.5s ease-in-out infinite' }}>
                <MessageSquare size={28} color="var(--soft-rose)" style={{ opacity: 0.5 }} />
              </div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--deep-plum)' }}>AI 正在准备练习场景...</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--graphite-rose)', opacity: 0.65, lineHeight: 1.6 }}>
                正在结合你们的资料和关系状态，模拟一个更真实的开场。
              </p>
            </div>
          )}

          {/* ── Error ──────────────────────────────────────────── */}
          {error && (
            <div className="glass-card" style={{ borderRadius: 24, padding: '24px', background: 'rgba(255,235,235,0.5)', border: '1px solid rgba(200,150,150,0.3)', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <AlertCircle size={20} color="#C96A6A" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#C96A6A', marginBottom: 6 }}>出了一点小问题</div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--graphite-rose)', lineHeight: 1.6 }}>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Save error ─────────────────────────────────────── */}
          {saveError && (
            <div className="glass-card" style={{ borderRadius: 24, padding: '20px', background: 'rgba(255,243,224,0.5)', border: '1px solid rgba(200,180,130,0.3)', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <AlertCircle size={18} color="#C99A6A" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: 13, color: '#C99A6A', lineHeight: 1.6 }}>{saveError}</p>
              </div>
            </div>
          )}

          {/* ── Started: chat practice ─────────────────────────── */}
          {started && conversation.length > 0 && (
            <>
              {/* Scene & difficulty header */}
              <div className="glass-card hoverable-card" style={{ borderRadius: 24, padding: '18px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                {scenarioMeta && <IconBadge token={scenarioMeta.token} size={42} tone="rose" />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--deep-plum)' }}>{finished ? '练习已完成' : '练习进行中'}</div>
                  <div style={{ fontSize: 12, color: 'var(--graphite-rose)', marginTop: 2 }}>
                    场景：{scenario} · 难度：{difficulty}
                  </div>
                </div>
                <button onClick={handleReset} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                  borderRadius: 999, cursor: 'pointer',
                  background: 'rgba(255,250,252,0.6)', border: '1px solid rgba(200,96,122,0.2)',
                  fontSize: 12, color: 'var(--soft-rose)', fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}>
                  <RotateCcw size={13} /> 重新选择场景
                </button>
              </div>

              {/* Conversation messages */}
              <div className="glass-card" style={{ borderRadius: 24, padding: '20px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--graphite-rose)', opacity: 0.6, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>对话</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {conversation.map((msg) => {
                    const isGirl = msg.role === 'girl';
                    const isUser = msg.role === 'user';
                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                        {isGirl && (
                          <div style={{ width: 30, height: 30, borderRadius: 999, background: 'linear-gradient(135deg,#F2BDCC,#C8A8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🌸</div>
                        )}
                        <div style={{ maxWidth: '75%' }}>
                          <div style={{
                            padding: '10px 14px',
                            fontSize: 14,
                            lineHeight: 1.55,
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-line',
                            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isUser
                              ? 'linear-gradient(135deg,#C8607A,#C4A070)'
                              : 'rgba(255,250,252,0.8)',
                            color: isUser ? 'white' : 'var(--deep-plum)',
                            border: isUser ? 'none' : '1px solid rgba(255,255,255,0.42)',
                            boxShadow: isUser
                              ? '0 2px 8px rgba(200,96,122,0.2)'
                              : '0 1px 4px rgba(0,0,0,0.04)',
                          }}>
                            {msg.content}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--graphite-rose)', opacity: 0.4, marginTop: 3, textAlign: isUser ? 'right' : 'left' }}>
                            {new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Typing indicator */}
                  {loading && !finished && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 999, background: 'linear-gradient(135deg,#F2BDCC,#C8A8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🌸</div>
                      <div style={{ padding: '10px 16px', borderRadius: '18px 18px 18px 4px', background: 'rgba(255,250,252,0.8)', border: '1px solid rgba(255,255,255,0.42)' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[0,1,2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--soft-rose)', opacity: 0.5, animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite` }} />)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat input */}
              {!finished && (
                <div className="glass-card" style={{ borderRadius: 24, padding: '16px 18px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--graphite-rose)', opacity: 0.6, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>你的回复</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <textarea
                      className="glass-input"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={handleReplyKeyDown}
                      placeholder="试着自然回应她，比如：辛苦啦，今天早点休息～"
                      rows={2}
                      disabled={loading || saving}
                      style={{ flex: 1, borderRadius: 16, padding: '11px 16px', fontSize: 14, color: 'var(--deep-plum)', resize: 'none', minHeight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={loading || saving || !replyText.trim()}
                      style={{
                        width: 44, height: 44, borderRadius: 999, flexShrink: 0,
                        background: !loading && !saving && replyText.trim() ? 'linear-gradient(135deg,#C8607A,#C4A070)' : 'rgba(200,96,122,0.18)',
                        border: 'none', cursor: !loading && !saving && replyText.trim() ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.22s ease',
                        boxShadow: !loading && !saving && replyText.trim() ? '0 4px 12px rgba(200,96,122,0.3)' : undefined,
                      }}
                    >
                      <Send size={16} color={!loading && !saving && replyText.trim() ? 'white' : 'rgba(200,96,122,0.4)'} />
                    </button>
                  </div>
                  {loading && (
                    <div style={{ fontSize: 11, color: 'var(--soft-rose)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 12, height: 12, border: '2px solid rgba(200,96,122,0.2)', borderTopColor: 'var(--soft-rose)', borderRadius: 999, animation: 'spin 0.8s linear infinite' }} />
                      AI 正在回应...
                    </div>
                  )}
                </div>
              )}

              {/* Finished hint */}
              {finished && (
                <div style={{ borderRadius: 16, padding: '12px 14px', background: 'rgba(80,180,120,0.1)', border: '1px solid rgba(80,180,120,0.25)', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <CheckCircle size={14} color="#50B478" style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--graphite-rose)', lineHeight: 1.5 }}>
                    本次练习已保存，如需继续请重新选择场景开始新练习。
                  </p>
                </div>
              )}

              {/* Finish button */}
              {started && !finished && (
                <button
                  className="btn-primary"
                  onClick={handleFinishPractice}
                  disabled={saving || loading || conversation.length === 0}
                  style={{
                    borderRadius: 999, padding: '14px', fontSize: 14, width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontWeight: 600, cursor: saving || loading || conversation.length === 0 ? 'default' : 'pointer',
                    opacity: saving || loading || conversation.length === 0 ? 0.5 : 1, minHeight: 48,
                    marginBottom: 16,
                    background: 'linear-gradient(135deg,#50B478,#3D9A68)',
                  }}
                >
                  {saving ? (
                    <>
                      <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: 999, animation: 'spin 0.8s linear infinite' }} />
                      正在保存...
                    </>
                  ) : (
                    <><CheckCircle size={16} /> 结束练习并保存</>
                  )}
                </button>
              )}

              {/* Feedback */}
              {feedback && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--deep-plum)', marginBottom: 10 }}>即时反馈</div>

                  {/* Score */}
                  {feedback.score != null && (
                    <div className="glass-card hoverable-card" style={{ borderRadius: 20, padding: '16px', marginBottom: 10, textAlign: 'center', background: 'linear-gradient(135deg,rgba(200,96,122,0.07),rgba(196,160,112,0.09))' }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--deep-plum)', lineHeight: 1 }}>{feedback.score}</div>
                      <div style={{ fontSize: 11, color: 'var(--graphite-rose)', opacity: 0.6, marginTop: 4 }}>表达评分 / 100</div>
                    </div>
                  )}

                  {/* Suggestion */}
                  {feedback.suggestion && (
                    <div className="glass-card hoverable-card" style={{ borderRadius: 20, padding: '16px', marginBottom: 10, background: 'linear-gradient(135deg,rgba(200,96,122,0.06),rgba(196,160,112,0.08))' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--soft-rose)', marginBottom: 8, display: 'flex', gap: 5, alignItems: 'center' }}>
                        <Lightbulb size={11} /> 建议
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--deep-plum)', lineHeight: 1.6 }}>{feedback.suggestion}</p>
                    </div>
                  )}

                  {/* Strengths */}
                  {feedback.strengths.length > 0 && (
                    <div className="glass-card hoverable-card" style={{ borderRadius: 18, padding: '14px', marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--soft-mint)', marginBottom: 8, display: 'flex', gap: 5, alignItems: 'center' }}>
                        <Zap size={11} /> 做得好的地方
                      </div>
                      {feedback.strengths.map((g, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                          <span style={{ color: 'var(--soft-mint)', fontSize: 12, flexShrink: 0 }}>✓</span>
                          <span style={{ fontSize: 12, color: 'var(--graphite-rose)', lineHeight: 1.45 }}>{g}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Risks */}
                  {feedback.risks.length > 0 && (
                    <div className="glass-card hoverable-card" style={{ borderRadius: 18, padding: '14px', marginBottom: 10, background: 'rgba(196,160,112,0.08)', border: '1px solid rgba(196,160,112,0.2)' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--champagne-gold)', marginBottom: 8, display: 'flex', gap: 5, alignItems: 'center' }}>
                        <ShieldCheck size={11} /> 需要注意
                      </div>
                      {feedback.risks.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                          <span style={{ color: 'var(--champagne-gold)', fontSize: 12, flexShrink: 0 }}>!</span>
                          <span style={{ fontSize: 12, color: 'var(--graphite-rose)', lineHeight: 1.45 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Saved review card */}
              {finished && savedRecord && (
                <div className="glass-card" style={{ borderRadius: 24, padding: '20px', marginBottom: 16, background: 'linear-gradient(135deg,rgba(80,180,120,0.08),rgba(61,154,104,0.06))', border: '1px solid rgba(80,180,120,0.2)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                    <CheckCircle size={18} color="#50B478" />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--deep-plum)' }}>练习已保存</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: 'var(--graphite-rose)' }}>
                      <span style={{ opacity: 0.6 }}>场景：</span>{savedRecord.scenario}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--graphite-rose)' }}>
                      <span style={{ opacity: 0.6 }}>难度：</span>{savedRecord.difficulty}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--graphite-rose)' }}>
                      <span style={{ opacity: 0.6 }}>对话轮数：</span>{savedRecord.messageCount} 条消息
                    </div>
                    {savedRecord.finalScore != null && (
                      <div style={{ fontSize: 12, color: 'var(--graphite-rose)' }}>
                        <span style={{ opacity: 0.6 }}>最终评分：</span>{savedRecord.finalScore}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.4)', borderRadius: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--graphite-rose)', opacity: 0.6, marginBottom: 6 }}>简单复盘</div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--deep-plum)', lineHeight: 1.6 }}>{savedRecord.summary}</p>
                  </div>

                  {savedRecord.lastUserReply && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--graphite-rose)', opacity: 0.6, marginBottom: 4 }}>你最后说：</div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--deep-plum)', lineHeight: 1.5, padding: '8px 12px', background: 'linear-gradient(135deg,rgba(200,96,122,0.08),rgba(196,160,112,0.08))', borderRadius: 12 }}>{savedRecord.lastUserReply}</p>
                    </div>
                  )}

                  {savedRecord.lastGirlReply && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--graphite-rose)', opacity: 0.6, marginBottom: 4 }}>她最后回复：</div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--deep-plum)', lineHeight: 1.5, padding: '8px 12px', background: 'rgba(255,250,252,0.6)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.42)' }}>{savedRecord.lastGirlReply}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Boundary reminder */}
              <div style={{ borderRadius: 16, padding: '12px 14px', background: 'rgba(176,160,204,0.12)', border: '1px solid rgba(176,160,204,0.25)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <ShieldCheck size={14} color="var(--lavender-mist)" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 11, color: 'var(--graphite-rose)', lineHeight: 1.6 }}>
                  边界感提醒：尊重对方节奏，不催促，不施压。
                </p>
              </div>
            </>
          )}
          </>
          )}

        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1} }
      `}</style>
    </div>
  );
}
