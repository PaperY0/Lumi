import { useState } from 'react';
import { Sparkles, Copy, ChevronDown, ChevronUp, ArrowRight, MessageSquare } from 'lucide-react';
import { GlassCard, GlassTextarea, WarningNotice, AIInsightCard } from './GlassUI';
import { AnimatedCard } from './AnimatedCard';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';

interface Props { onNavigate: (page: PageName) => void; }

const scenes = ['日常聊天', '邀约', '道歉', '冷淡', '争吵', '升温', '安慰'];
const goals = ['继续聊天', '表达关心', '邀约', '道歉', '解释误会'];

const replySuggestions = [
  {
    style: '自然真诚',
    emoji: '💬',
    text: '哈哈看来你那天也特别忙，没事的，我也是差不多状态。最近有什么开心的事吗？',
    reason: '轻松带过冷场，不追责，主动引导新话题，给对方回应空间。',
    accent: '#D4607A',
    bg: 'rgba(212,96,122,0.07)',
    border: 'rgba(212,96,122,0.2)',
  },
  {
    style: '轻松幽默',
    emoji: '😄',
    text: '估计你那天也没消音手机哈哈，我懂那种状态。诶你上次说的那家奶茶，有机会一起去？',
    reason: '幽默化解尴尬，自然转向具体邀约，语气轻松不施压。',
    accent: '#9B7DB5',
    bg: 'rgba(200,168,212,0.08)',
    border: 'rgba(200,168,212,0.25)',
  },
  {
    style: '稳重关心',
    emoji: '🤗',
    text: '没关系，你最近听起来挺忙的，好好休息。有空了再聊。',
    reason: '展示成熟和不依赖，让她感受到你的体贴，适合想维持好感又不想给压力的阶段。',
    accent: '#BF8E6E',
    bg: 'rgba(191,142,110,0.07)',
    border: 'rgba(191,142,110,0.22)',
  },
];

export function ReplyAssistPage({ onNavigate }: Props) {
  const [herMessage, setHerMessage] = useState('');
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleAnalyze = () => {
    if (!herMessage.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setAnalyzed(true); }, 1600);
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const canAnalyze = herMessage.trim().length > 2 && !loading;

  return (
    <div style={{ padding: '28px 32px 48px', maxWidth: 1140, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <BlurText text="帮我回复" startDelay={60} style={{ fontSize: 26, fontWeight: 700, color: '#4A2E38', letterSpacing: '-0.04em', display: 'block' }} />
        <p style={{ margin: '5px 0 0', fontSize: 14, color: '#7B5C6E', opacity: 0.75 }}>
          输入她发的消息，AI 理解含义并生成 3 种回复建议
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        {/* ── Left Panel: Input ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Message input */}
          <div className="glass-card" style={{ borderRadius: 28, padding: '22px' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#D4607A,#BF8E6E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={14} color="white" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#4A2E38' }}>她发来的消息</span>
            </div>
            <GlassTextarea
              placeholder={'输入她发的消息...\n\n例如："那天没看到消息，忘了回了"'}
              value={herMessage}
              onChange={setHerMessage}
              rows={5}
            />
            {!herMessage && (
              <button
                onClick={() => setHerMessage('那天没看到消息，忘了回了')}
                style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#D4607A', padding: 0 }}
              >
                试试：「那天没看到消息，忘了回了」→
              </button>
            )}
          </div>

          {/* Scene selection */}
          <div className="glass-card" style={{ borderRadius: 24, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38', marginBottom: 10 }}>当前场景</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {scenes.map(s => (
                <button key={s} onClick={() => setSelectedScene(s)} style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
                  border: selectedScene === s ? 'none' : '1px solid rgba(212,96,122,0.22)',
                  background: selectedScene === s ? 'linear-gradient(135deg,#D4607A,#BF8E6E)' : 'rgba(255,248,252,0.5)',
                  color: selectedScene === s ? 'white' : '#7B5C6E',
                  fontWeight: selectedScene === s ? 600 : 400,
                  transition: 'all 0.2s ease',
                  boxShadow: selectedScene === s ? '0 3px 10px rgba(212,96,122,0.28)' : undefined,
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Goal selection */}
          <div className="glass-card" style={{ borderRadius: 24, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38', marginBottom: 10 }}>我的目标</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {goals.map(g => (
                <button key={g} onClick={() => setSelectedGoal(g)} style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
                  border: selectedGoal === g ? 'none' : '1px solid rgba(200,168,212,0.28)',
                  background: selectedGoal === g ? 'linear-gradient(135deg,#C8A8D4,#D4607A)' : 'rgba(255,248,252,0.5)',
                  color: selectedGoal === g ? 'white' : '#7B5C6E',
                  fontWeight: selectedGoal === g ? 600 : 400,
                  transition: 'all 0.2s ease',
                }}>{g}</button>
              ))}
            </div>
          </div>

          {/* Analyze button */}
          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            style={{
              borderRadius: 999, padding: '15px', fontSize: 15, width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontWeight: 600, minHeight: 52,
              opacity: canAnalyze ? 1 : 0.42, cursor: canAnalyze ? 'pointer' : 'default',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: 999, animation: 'spin 0.8s linear infinite' }} />
                正在理解上下文...
              </>
            ) : (
              <><Sparkles size={16} /> 分析并生成回复</>
            )}
          </button>
        </div>

        {/* ── Right Panel: Results ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!analyzed ? (
            <AnimatedCard delay={0}>
              <div className="glass-card" style={{ borderRadius: 28, padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(212,96,122,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(212,96,122,0.15)', animation: loading ? 'breathe 1.5s ease-in-out infinite' : undefined }}>
                  <MessageSquare size={28} color="#D4607A" style={{ opacity: 0.5 }} />
                </div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#4A2E38' }}>
                  {loading ? '正在理解上下文...' : '输入消息后，AI 为你分析'}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: '#7B5C6E', opacity: 0.65, lineHeight: 1.6 }}>
                  不急着判断她的想法，先看见真实的互动。
                </p>
              </div>
            </AnimatedCard>
          ) : (
            <>
              {/* Simple answer */}
              <AnimatedCard delay={0}>
                <div className="glass-card" style={{ borderRadius: 24, padding: '20px', background: 'linear-gradient(135deg,rgba(212,96,122,0.08),rgba(200,168,212,0.08))' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#D4607A,#BF8E6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(212,96,122,0.3)' }}>
                      <Sparkles size={16} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#D4607A', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI 简单答案</div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#4A2E38', lineHeight: 1.55 }}>
                        这是一个低风险的道歉式解释，回应时保持轻松宽容会加很多分。
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <AnimatedCard delay={80}>
                  <AIInsightCard icon="🌸" title="她可能怎么想" variant="positive"
                    content="她回复了，说明不想让关系僵住。这更像是在修复，而不是解释——说明你们之间有她在意的东西。"
                  />
                </AnimatedCard>
                <AnimatedCard delay={140}>
                  <AIInsightCard icon="🔍" title="你可能误解的点" variant="risk"
                    content={'不要把"忘了回"理解成不在乎。很多人在模糊阶段用这种方式测试你的反应——轻松宽容会加分很多。'}
                  />
                </AnimatedCard>
              </div>

              {/* Reply cards */}
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38', marginTop: 4, marginBottom: 4 }}>📝 推荐回复</div>

              {replySuggestions.map((r, i) => (
                <AnimatedCard key={i} delay={i * 80 + 200}>
                  <div className="reply-card" style={{ borderRadius: 24, padding: '18px 20px', background: r.bg, border: `1px solid ${r.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: r.accent, padding: '4px 12px', borderRadius: 999, background: `${r.bg}`, border: `1px solid ${r.border}` }}>
                        {r.emoji} {r.style}
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setExpandedId(expandedId === i ? null : i)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7B5C6E', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, opacity: 0.7 }}
                        >
                          {expandedId === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          为什么
                        </button>
                        <button
                          onClick={() => handleCopy(r.text, i)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                            background: copiedId === i ? 'linear-gradient(135deg,#D4607A,#BF8E6E)' : 'rgba(255,248,252,0.75)',
                            border: `1px solid ${copiedId === i ? 'transparent' : r.border}`,
                            borderRadius: 999, padding: '5px 14px', cursor: 'pointer',
                            color: copiedId === i ? 'white' : r.accent,
                            transition: 'all 0.2s ease',
                            fontWeight: 500,
                          }}
                        >
                          <Copy size={12} />{copiedId === i ? '已复制！' : '复制'}
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: '#4A2E38', lineHeight: 1.65 }}>{r.text}</p>
                    {expandedId === i && (
                      <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.45)', borderRadius: 14, backdropFilter: 'blur(8px)' }}>
                        <div style={{ fontSize: 10, color: '#7B5C6E', opacity: 0.6, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>为什么这样回</div>
                        <p style={{ margin: 0, fontSize: 12, color: '#5E4A60', lineHeight: 1.65 }}>{r.reason}</p>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              ))}

              {/* Don't say this */}
              <AnimatedCard delay={440}>
                <div style={{ borderRadius: 22, padding: '16px 18px', background: 'rgba(240,200,200,0.15)', border: '1px solid rgba(200,140,140,0.2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#C07070', marginBottom: 8 }}>🚫 不要这样回</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {['"你为什么不看消息"（追责）', '"没事没事"（过于随意，显得不在意）', '"我等了好久"（制造压力）'].map((d, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#7B5C6E', display: 'flex', gap: 8 }}>
                        <span style={{ color: '#C07070', flexShrink: 0 }}>×</span>{d}
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={500}>
                <WarningNotice text="好的回复，不是赢得对方，而是让沟通更舒服。请结合自己的真实感受选择。" />
              </AnimatedCard>

              <AnimatedCard delay={560}>
                <button
                  className="btn-primary"
                  onClick={() => onNavigate('simulation')}
                  style={{ borderRadius: 999, padding: '13px 28px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, cursor: 'pointer', justifyContent: 'center', width: '100%' }}
                >
                  去模拟对话练习 <ArrowRight size={15} />
                </button>
              </AnimatedCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
