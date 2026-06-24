import { useState } from 'react';
import { Sparkles, ArrowRight, MessageSquare, AlertCircle, Ban, BookOpen, Copy } from 'lucide-react';
import { GlassCard, GlassTextarea, WarningNotice } from './GlassUI';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';
import { useGenerateReply } from '@/hooks/useGenerateReply';

interface Props { onNavigate: (page: PageName) => void; }

const sceneOptions = ['日常聊天', '邀约', '道歉', '冷淡', '争吵', '升温', '安慰'];
const intentOptions = ['继续聊天', '表达关心', '邀约', '道歉', '解释误会'];

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

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 18px',
    borderRadius: 999,
    fontSize: 13,
    cursor: 'pointer',
    border: active ? 'none' : '1px solid rgba(212,96,122,0.22)',
    background: active
      ? 'linear-gradient(135deg,#D4607A,#C5956C)'
      : 'rgba(255,248,252,0.55)',
    color: active ? 'white' : '#7B5C6E',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.2s ease',
    boxShadow: active
      ? '0 4px 14px rgba(212,96,122,0.35), 0 1px 3px rgba(212,96,122,0.2)'
      : '0 1px 3px rgba(0,0,0,0.04)',
    transform: active ? 'translateY(-1px)' : 'translateY(0)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };
}

export function ReplyAssistPage({ onNavigate }: Props) {
  const { data, loading, error, generate } = useGenerateReply();

  const [userMessage, setUserMessage] = useState('');
  const [selectedScene, setSelectedScene] = useState<string>('日常聊天');
  const [selectedIntent, setSelectedIntent] = useState<string>('继续聊天');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      console.log('📋 [ReplyAssistPage] 已复制回复:', text);
      setTimeout(() => setCopiedText(null), 1800);
    } catch (err) {
      console.error('❌ [ReplyAssistPage] 复制失败:', err);
    }
  };

  const handleGenerate = async () => {
    if (loading) return;
    const trimmed = userMessage.trim();
    if (!trimmed) return;

    console.log('🖱️ [ReplyAssistPage] 用户点击分析并生成回复', {
      userMessage: trimmed,
      selectedScene,
      selectedIntent,
    });

    await generate(trimmed, selectedIntent, selectedScene);
  };

  const canGenerate = userMessage.trim().length > 0 && !loading;

  return (
    <div style={{ padding: '28px 32px 48px', maxWidth: 1140, margin: '0 auto', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <BlurText text="帮我回复" startDelay={60} style={{ fontSize: 26, fontWeight: 700, color: '#4A2E38', letterSpacing: '-0.04em', display: 'block' }} />
        <p style={{ margin: '5px 0 0', fontSize: 14, color: '#7B5C6E', opacity: 0.75 }}>
          不知道怎么回时，先生成几个自然、不冒犯的表达参考
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start', minWidth: 0 }}>
        {/* ── Left Panel: Input ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {/* Message input */}
          <div className="glass-card hoverable-card" style={{ borderRadius: 28, padding: '22px' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#D4607A,#BF8E6E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={14} color="white" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#4A2E38' }}>她发来的消息</span>
            </div>
            <GlassTextarea
              placeholder={'输入她发的消息...\n\n例如："那天没看到消息，忘了回了"'}
              value={userMessage}
              onChange={setUserMessage}
              rows={5}
            />
            {!userMessage && (
              <button
                onClick={() => setUserMessage('那天没看到消息，忘了回了')}
                style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#D4607A', padding: 0 }}
              >
                试试：「那天没看到消息，忘了回了」→
              </button>
            )}
          </div>

          {/* Scene selection */}
          <div className="glass-card hoverable-card" style={{ borderRadius: 24, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38', marginBottom: 10 }}>当前场景</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {sceneOptions.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedScene(s)}
                  onMouseEnter={e => { if (selectedScene !== s) { e.currentTarget.style.borderColor = 'rgba(212,96,122,0.45)'; e.currentTarget.style.color = '#D4607A'; e.currentTarget.style.background = 'rgba(255,240,245,0.8)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(212,96,122,0.2)'; } else { e.currentTarget.style.boxShadow = '0 6px 18px rgba(212,96,122,0.4)'; } }}
                  onMouseLeave={e => { if (selectedScene !== s) { e.currentTarget.style.borderColor = 'rgba(212,96,122,0.22)'; e.currentTarget.style.color = '#7B5C6E'; e.currentTarget.style.background = 'rgba(255,248,252,0.55)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; } else { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(212,96,122,0.35), 0 1px 3px rgba(212,96,122,0.2)'; } }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = selectedScene === s ? 'translateY(-1px)' : 'translateY(0)'; }}
                  style={pillStyle(selectedScene === s)}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Intent selection */}
          <div className="glass-card hoverable-card" style={{ borderRadius: 24, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38', marginBottom: 10 }}>我的目标</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {intentOptions.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedIntent(g)}
                  onMouseEnter={e => { if (selectedIntent !== g) { e.currentTarget.style.borderColor = 'rgba(212,96,122,0.45)'; e.currentTarget.style.color = '#D4607A'; e.currentTarget.style.background = 'rgba(255,240,245,0.8)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(212,96,122,0.2)'; } else { e.currentTarget.style.boxShadow = '0 6px 18px rgba(212,96,122,0.4)'; } }}
                  onMouseLeave={e => { if (selectedIntent !== g) { e.currentTarget.style.borderColor = 'rgba(212,96,122,0.22)'; e.currentTarget.style.color = '#7B5C6E'; e.currentTarget.style.background = 'rgba(255,248,252,0.55)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; } else { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(212,96,122,0.35), 0 1px 3px rgba(212,96,122,0.2)'; } }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = selectedIntent === g ? 'translateY(-1px)' : 'translateY(0)'; }}
                  style={pillStyle(selectedIntent === g)}
                >{g}</button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{
              borderRadius: 999, padding: '15px', fontSize: 15, width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontWeight: 600, minHeight: 52,
              opacity: canGenerate ? 1 : 0.42, cursor: canGenerate ? 'pointer' : 'default',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: 999, animation: 'spin 0.8s linear infinite' }} />
                AI 正在思考回复策略...
              </>
            ) : (
              <><Sparkles size={16} /> 分析并生成回复</>
            )}
          </button>

          {/* Error on left */}
          {error && !loading && !data && (
            <div className="glass-card" style={{ borderRadius: 20, padding: '16px 18px', background: 'rgba(255,235,235,0.5)', border: '1px solid rgba(200,150,150,0.3)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertCircle size={18} color="#C96A6A" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 13, color: '#C96A6A', lineHeight: 1.5, ...SAFE_TEXT }}>{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel: Results ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0, overflow: 'hidden' }}>
          {/* State A: Empty */}
          {!data && !loading && !error && (
            <div className="glass-card" style={{ borderRadius: 28, padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(212,96,122,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(212,96,122,0.15)' }}>
                <MessageSquare size={28} color="#D4607A" style={{ opacity: 0.5 }} />
              </div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#4A2E38' }}>
                输入消息后，AI 为你分析
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#7B5C6E', opacity: 0.65, lineHeight: 1.6 }}>
                不急着判断她的想法，先看见真实的互动。
              </p>
            </div>
          )}

          {/* State B: Loading */}
          {loading && (
            <div className="glass-card" style={{ borderRadius: 28, padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(212,96,122,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(212,96,122,0.15)', animation: 'breathe 1.5s ease-in-out infinite' }}>
                <MessageSquare size={28} color="#D4607A" style={{ opacity: 0.5 }} />
              </div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#4A2E38' }}>
                AI 正在思考回复策略...
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#7B5C6E', opacity: 0.65, lineHeight: 1.6 }}>
                正在结合你的资料、她的资料和最近聊天上下文生成建议。
              </p>
            </div>
          )}

          {/* State C: Error (right side, when data already exists) */}
          {error && !loading && data && (
            <div className="glass-card" style={{ ...CARD_BASE, background: 'rgba(255,235,235,0.5)', border: '1px solid rgba(200,150,150,0.3)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <AlertCircle size={20} color="#C96A6A" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: 13, color: '#C96A6A', lineHeight: 1.6, ...SAFE_TEXT }}>{error}</p>
              </div>
            </div>
          )}

          {/* State D: Full results */}
          {data && !loading && (
            <>
              {/* Simple Answer */}
              <div className="glass-card hoverable-card" style={{ ...CARD_BASE, background: 'linear-gradient(135deg,rgba(212,96,122,0.08),rgba(200,168,212,0.08))' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#D4607A,#BF8E6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(212,96,122,0.3)' }}>
                    <Sparkles size={16} color="white" />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#D4607A', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI 简答</div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#4A2E38', ...SAFE_TEXT }}>
                      {data.simpleAnswer || '暂无简答'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis */}
              {data.analysis && (
                <div className="glass-card hoverable-card" style={CARD_BASE}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <BookOpen size={14} color="#9B7DB5" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38' }}>详细分析</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#5E4A60', ...SAFE_TEXT }}>
                    {data.analysis}
                  </p>
                </div>
              )}

              {/* Recommended Replies */}
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38', marginTop: 4, marginBottom: 2 }}>推荐回复</div>
              {data.recommendedReplies.length > 0 ? (
                data.recommendedReplies.map((item, i) => {
                  const accents = [
                    { accent: '#D4607A', bg: 'rgba(212,96,122,0.07)', border: 'rgba(212,96,122,0.2)' },
                    { accent: '#9B7DB5', bg: 'rgba(200,168,212,0.08)', border: 'rgba(200,168,212,0.25)' },
                    { accent: '#BF8E6E', bg: 'rgba(191,142,110,0.07)', border: 'rgba(191,142,110,0.22)' },
                  ];
                  const c = accents[i % accents.length];
                  const isCopied = copiedText === item.text;
                  return (
                    <div key={i} className="reply-card" style={{ ...CARD_BASE, background: c.bg, border: `1px solid ${c.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.accent, padding: '3px 10px', borderRadius: 999, background: c.bg, border: `1px solid ${c.border}` }}>
                          {item.style}
                        </span>
                        <button
                          onClick={() => handleCopy(item.text)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                            background: isCopied ? 'linear-gradient(135deg,#D4607A,#C5956C)' : 'rgba(255,248,252,0.75)',
                            border: `1px solid ${isCopied ? 'transparent' : c.border}`,
                            borderRadius: 999, padding: '5px 14px', cursor: 'pointer',
                            color: isCopied ? 'white' : c.accent,
                            transition: 'all 0.2s ease',
                            fontWeight: 500,
                          }}
                        >
                          <Copy size={12} />{isCopied ? '已复制' : '复制'}
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: '#4A2E38', ...SAFE_TEXT }}>{item.text}</p>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 13, color: '#7B5C6E', opacity: 0.6 }}>暂无推荐回复</div>
              )}

              {/* Avoid Replies */}
              {data.avoidReplies.length > 0 && (
                <div className="hoverable-card" style={{ ...CARD_BASE, background: 'rgba(240,200,200,0.15)', border: '1px solid rgba(200,140,140,0.2)' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                    <Ban size={14} color="#C07070" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#C07070' }}>不建议这样回</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {data.avoidReplies.map((text, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#7B5C6E', display: 'flex', gap: 8, ...SAFE_TEXT }}>
                        <span style={{ color: '#C07070', flexShrink: 0 }}>×</span>{text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom tip */}
              <WarningNotice text="AI 回复建议仅供参考，请结合你们真实关系调整语气。不要用回复技巧施压或操控对方，尊重对方真实意愿更重要。" />

              {/* Simulation link */}
              <button
                className="btn-primary"
                onClick={() => onNavigate('simulation')}
                style={{ borderRadius: 999, padding: '13px 28px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, cursor: 'pointer', justifyContent: 'center', width: '100%' }}
              >
                去模拟对话练习 <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
