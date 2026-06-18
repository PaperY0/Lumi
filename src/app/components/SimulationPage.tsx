import { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Star, Zap, BarChart3, Lightbulb, ShieldCheck } from 'lucide-react';
import { BlurText } from './BlurText';
import { CountUp } from './CountUp';
import { IconBadge } from './IconBadge';
import type { PageName } from './GlassUI';
import { BRAND_NAME } from '../brand';

interface Props { onNavigate: (page: PageName) => void; }

const scenarios = [
  { id: 'daily',  label: '日常聊天',  emoji: '💬', token: 'chat' as const,       desc: '从日常话题切入，保持轻松感' },
  { id: 'invite', label: '邀约吃饭',  emoji: '🍜', token: 'invite' as const,     desc: '如何提出邀约而不显得突然' },
  { id: 'like',   label: '表达好感',  emoji: '💗', token: 'love' as const,       desc: '在合适时机自然表达喜欢' },
  { id: 'sorry',  label: '道歉',      emoji: '🙏', token: 'apology' as const,    desc: '真诚道歉而不让对方觉得烦' },
  { id: 'cold',   label: '对方冷淡',  emoji: '❄️', token: 'cold' as const,       desc: '对方变冷淡时如何应对' },
  { id: 'repair', label: '争吵后修复',emoji: '🌱', token: 'grow' as const,       desc: '吵架后如何温和修复关系' },
];
const difficulties = ['轻松', '普通', '有挑战'];

const aiReplies: Record<string, string[]> = {
  daily:  ['哦，真的吗', '哈哈，你也关注这个', '还好，有点累', '不确定，看情况', '你今天怎么突然聊这个'],
  invite: ['不确定，最近比较忙', '吃什么呢', '看情况吧', '你好突然哈哈', '那家啊'],
  like:   ['哦，这样啊', '为什么突然说这个', '谢谢你说', '嗯…', '有点不知道怎么回'],
  sorry:  ['嗯', '知道了', '还好啦', '下次注意就行', '算了'],
  cold:   ['哦', '嗯', '。', '在', '什么事'],
  repair: ['嗯', '知道了', '还需要时间', '先这样吧', '你说'],
};

interface Msg { id: number; role: 'user' | 'ai'; text: string; time: string; }
interface Feedback { score: number; good: string[]; tips: string[]; next: string; }

function getTime() {
  return `${new Date().getHours().toString().padStart(2,'0')}:${new Date().getMinutes().toString().padStart(2,'0')}`;
}

const goodPool = ['语气自然，没有给压力', '话题切入轻松，不刻意', '没有催促，给了对方空间', '表达真诚，不油腻'];
const tipPool  = ['可以加一个问句引导对方开口', '适当分享自己的感受会更真诚', '语速（回复节奏）可以更稳'];

/* ─── Scene Selector ────────────────────────────────────────── */
function SceneSelection({ onStart }: { onStart: (s: string, d: string) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [diff, setDiff] = useState('普通');

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <BlurText text="模拟对话练习" startDelay={60} style={{ fontSize: 24, fontWeight: 700, color: 'var(--deep-plum)', letterSpacing: '-0.03em', display: 'block' }} />
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--graphite-rose)', opacity: 0.75 }}>AI 模拟女生口吻陪你练习，每次对话都有即时反馈</p>
        </div>

        <div className="glass-card hoverable-card" style={{ borderRadius: 28, padding: '22px', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--deep-plum)', marginBottom: 14 }}>选择练习场景</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {scenarios.map(s => (
              <div key={s.id} onClick={() => setSel(s.id)} style={{
                borderRadius: 18, padding: '14px', cursor: 'pointer',
                background: sel === s.id ? 'linear-gradient(135deg,rgba(200,96,122,0.14),rgba(196,160,112,0.16))' : 'rgba(255,250,252,0.5)',
                border: sel === s.id ? '1.5px solid rgba(200,96,122,0.4)' : '1px solid rgba(255,255,255,0.42)',
                transition: 'all 0.22s var(--ease-hover)',
                boxShadow: sel === s.id ? '0 4px 16px rgba(200,96,122,0.18)' : undefined,
              }}>
                <IconBadge token={s.token} size={40} tone={sel === s.id ? 'rose' : 'lavender'} style={{ marginBottom: 7 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--deep-plum)', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--graphite-rose)', opacity: 0.75, lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card hoverable-card" style={{ borderRadius: 24, padding: '18px 22px', marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--deep-plum)', marginBottom: 12 }}>难度设置</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {difficulties.map(d => (
              <button key={d} onClick={() => setDiff(d)} style={{
                flex: 1, padding: '11px', borderRadius: 14, cursor: 'pointer',
                border: diff === d ? 'none' : '1px solid rgba(200,96,122,0.18)',
                background: diff === d ? 'linear-gradient(135deg,#C8607A,#C4A070)' : 'rgba(255,250,252,0.6)',
                color: diff === d ? 'white' : 'var(--graphite-rose)',
                fontSize: 13, fontWeight: diff === d ? 600 : 400,
                transition: 'all 0.22s ease',
                boxShadow: diff === d ? '0 3px 12px rgba(200,96,122,0.3)' : undefined,
              }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={() => sel && onStart(sel, diff)} disabled={!sel} style={{
          borderRadius: 999, padding: '15px', fontSize: 15, width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontWeight: 600, cursor: sel ? 'pointer' : 'default',
          opacity: sel ? 1 : 0.42, minHeight: 52,
        }}>
          开始练习
        </button>
      </div>
    </div>
  );
}

/* ─── Chat Practice — FULL HEIGHT, 3-column ─────────────────── */
function ChatPractice({ sceneId, difficulty, onReset }: { sceneId: string; difficulty: string; onReset: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [msgCount, setMsgCount] = useState(0);
  const [score, setScore] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scene = scenarios.find(s => s.id === sceneId)!;

  useEffect(() => {
    const openings: Record<string, string> = {
      daily: '哈，今天怎么样', invite: '你在干嘛呢', like: '你今天找我有什么事',
      sorry: '昨天的事我还没想清楚', cold: '嗯', repair: '你好',
    };
    const t = setTimeout(() => setMessages([{ id: 1, role: 'ai', text: openings[sceneId] || '你好', time: getTime() }]), 400);
    return () => clearTimeout(t);
  }, [sceneId]);

  // Auto-scroll the message list only (scrollTop on the container itself can
  // never bubble to ancestors/window — prevents the whole page from shifting).
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  const handleSend = () => {
    if (!input.trim() || thinking) return;
    const userMsg: Msg = { id: Date.now(), role: 'user', text: input, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const newCount = msgCount + 1;
    setMsgCount(newCount);
    setThinking(true);

    const delay = difficulty === '轻松' ? 600 : difficulty === '普通' ? 900 + Math.random() * 500 : 1200 + Math.random() * 700;
    setTimeout(() => {
      const replies = aiReplies[sceneId] || aiReplies.daily;
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', text: replies[Math.floor(Math.random() * replies.length)], time: getTime() }]);
      setThinking(false);

      if (newCount % 3 === 0) {
        const s = 68 + Math.floor(Math.random() * 27);
        setScore(s);
        const shuffleGood = [...goodPool].sort(() => 0.5 - Math.random()).slice(0, 2);
        const shuffleTip  = [...tipPool].sort(() => 0.5 - Math.random()).slice(0, 1);
        setFeedback({ score: s, good: shuffleGood, tips: shuffleTip, next: '可以分享一件今天发生的有趣事，话题自然过渡' });
      }
      inputRef.current?.focus({ preventScroll: true });
    }, delay);
  };

  return (
    /* Outer = fills the flex column from App.tsx's main */
    <div className="sim-shell" style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

      {/* ── LEFT: scene panel ─── */}
      <div className="sim-left" style={{
        width: 240, flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: 12,
        padding: '20px 14px', overflowY: 'auto',
        borderRight: '1px solid rgba(255,255,255,0.32)',
        background: 'linear-gradient(180deg,rgba(250,244,252,0.5),rgba(244,238,248,0.45))',
      }}>
        {/* Scene info */}
        <div className="glass-card hoverable-card" style={{ borderRadius: 20, padding: '16px' }}>
          <IconBadge token={scene.token} size={42} tone="rose" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--deep-plum)', marginBottom: 4 }}>{scene.label}</div>
          <div style={{ fontSize: 11, color: 'var(--graphite-rose)', opacity: 0.75, lineHeight: 1.5, marginBottom: 10 }}>{scene.desc}</div>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--soft-rose)', background: 'rgba(200,96,122,0.1)', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(200,96,122,0.2)' }}>
            {difficulty}模式
          </span>
        </div>

        {/* Tips */}
        <div className="glass-card" style={{ borderRadius: 20, padding: '14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--deep-plum)', marginBottom: 10 }}>练习技巧</div>
          {([['insight','语气自然，不刻意'],['chat','适当问问题'],['patience','等她回再发'],['calm','接受冷淡回复']] as const).map(([tok,t]) => (
            <div key={t} style={{ display: 'flex', gap: 8, marginBottom: 9, alignItems: 'center' }}>
              <IconBadge token={tok} size={26} tone="lavender" />
              <span style={{ fontSize: 11, color: 'var(--graphite-rose)', lineHeight: 1.4 }}>{t}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="glass-card" style={{ borderRadius: 18, padding: '12px 14px', textAlign: 'center', background: 'linear-gradient(135deg,rgba(200,96,122,0.06),rgba(196,160,112,0.06))' }}>
          <div className="metric-number" style={{ fontSize: 28, lineHeight: 1 }}>
            {/* CountUp 标注: <CountUp from={0} to={msgCount} duration={0.4} /> */}
            {msgCount}
          </div>
          <div style={{ fontSize: 10, color: 'var(--graphite-rose)', opacity: 0.6, marginTop: 3 }}>条消息</div>
        </div>

        <button onClick={onReset} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '10px', borderRadius: 14, cursor: 'pointer',
          background: 'rgba(255,250,252,0.6)', border: '1px solid rgba(200,96,122,0.2)',
          fontSize: 12, color: 'var(--soft-rose)', fontWeight: 500,
          transition: 'all 0.2s ease',
        }}>
          <RotateCcw size={13} /> 重新选择
        </button>
      </div>

      {/* ── CENTER: chat window ─── */}
      <div className="sim-center" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', minWidth: 0,
      }}>
        {/* Header */}
        <div style={{
          flexShrink: 0, padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.34)',
          background: 'rgba(255,250,252,0.48)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg,#F2BDCC,#C8A8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🌸</div>
          <div>
            <BlurText text="AI 练习伙伴" startDelay={100} style={{ fontSize: 14, fontWeight: 600, color: 'var(--deep-plum)', display: 'block' }} />
            <div style={{ fontSize: 11, color: '#5AAA80', marginTop: 1 }}>● 模拟女生视角 · {BRAND_NAME}</div>
          </div>
        </div>

        {/* Messages — scrollable */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map(msg => {
            const isMe = msg.role === 'user';
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                {!isMe && (
                  <div style={{ width: 30, height: 30, borderRadius: 999, background: 'linear-gradient(135deg,#F2BDCC,#C8A8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🌸</div>
                )}
                <div style={{ maxWidth: '68%' }}>
                  <div className={isMe ? 'chat-bubble-mine' : 'chat-bubble-hers'} style={{ padding: '10px 14px', fontSize: 14, lineHeight: 1.55, display: 'inline-block' }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--graphite-rose)', opacity: 0.45, marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>{msg.time}</div>
                </div>
              </div>
            );
          })}
          {thinking && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 30, height: 30, borderRadius: 999, background: 'linear-gradient(135deg,#F2BDCC,#C8A8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🌸</div>
              <div className="chat-bubble-hers" style={{ padding: '10px 16px' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--soft-rose)', opacity: 0.5, animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite` }} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input — fixed at bottom */}
        <div style={{
          flexShrink: 0, padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.34)',
          background: 'rgba(255,250,252,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <input
            ref={inputRef}
            className="glass-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="输入你的回复... (Enter 发送)"
            style={{ flex: 1, borderRadius: 999, padding: '11px 18px', fontSize: 14, color: 'var(--deep-plum)' }}
          />
          <button onClick={handleSend} disabled={!input.trim() || thinking} style={{
            width: 44, height: 44, borderRadius: 999, flexShrink: 0,
            background: input.trim() && !thinking ? 'linear-gradient(135deg,#C8607A,#C4A070)' : 'rgba(200,96,122,0.18)',
            border: 'none', cursor: input.trim() && !thinking ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.22s ease',
            boxShadow: input.trim() && !thinking ? '0 4px 12px rgba(200,96,122,0.3)' : undefined,
          }}>
            <Send size={16} color="white" />
          </button>
        </div>
      </div>

      {/* ── RIGHT: feedback panel ─── */}
      <div className="sim-right" style={{
        width: 280, flexShrink: 0, overflowY: 'auto',
        padding: '20px 14px',
        borderLeft: '1px solid rgba(255,255,255,0.32)',
        background: 'linear-gradient(180deg,rgba(248,244,252,0.5),rgba(242,236,248,0.45))',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--deep-plum)' }}>AI 表达反馈</div>

        {!feedback ? (
          <div className="glass-card" style={{ borderRadius: 20, padding: '28px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconBadge icon={BarChart3} size={48} tone="lavender" style={{ marginBottom: 12, opacity: 0.85 }} />
            <p style={{ margin: 0, fontSize: 12, color: 'var(--graphite-rose)', lineHeight: 1.6, opacity: 0.75 }}>
              发送 3 条消息后<br />获得 AI 表达反馈
            </p>
          </div>
        ) : (
          <>
            {/* Score with CountUp */}
            <div className="glass-card hoverable-card" style={{ borderRadius: 20, padding: '18px', textAlign: 'center', background: 'linear-gradient(135deg,rgba(200,96,122,0.07),rgba(196,160,112,0.09))' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 8 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={14} color="var(--soft-rose)" fill={s <= Math.round(score/20) ? 'var(--soft-rose)' : 'none'} />)}
              </div>
              {/* CountUp 标注: <CountUp from={0} to={score} duration={1.2} className="metric-number" /> */}
              <CountUp from={0} to={score} duration={1.2} className="metric-number" style={{ fontSize: 36, display: 'block', lineHeight: 1 }} />
              <div style={{ fontSize: 11, color: 'var(--graphite-rose)', opacity: 0.6, marginTop: 4 }}>表达评分 / 100</div>
            </div>

            {/* Good */}
            <div className="glass-card hoverable-card" style={{ borderRadius: 18, padding: '14px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--soft-mint)', marginBottom: 8, display: 'flex', gap: 5, alignItems: 'center' }}>
                <Zap size={11} /> 做得好的地方
              </div>
              {feedback.good.map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                  <span style={{ color: 'var(--soft-mint)', fontSize: 12, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: 'var(--graphite-rose)', lineHeight: 1.45 }}>{g}</span>
                </div>
              ))}
            </div>

            {/* Tip */}
            {feedback.tips.length > 0 && (
              <div className="glass-card hoverable-card" style={{ borderRadius: 18, padding: '14px', background: 'rgba(196,160,112,0.08)', border: '1px solid rgba(196,160,112,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--champagne-gold)', marginBottom: 8, display: 'flex', gap: 5, alignItems: 'center' }}>
                  <Lightbulb size={11} /> 可以优化
                </div>
                {feedback.tips.map((t, i) => <div key={i} style={{ fontSize: 12, color: 'var(--graphite-rose)', lineHeight: 1.5 }}>{t}</div>)}
              </div>
            )}

            {/* Next */}
            <div className="glass-card hoverable-card" style={{ borderRadius: 18, padding: '14px', background: 'linear-gradient(135deg,rgba(200,96,122,0.06),rgba(176,160,204,0.08))' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--soft-rose)', marginBottom: 6 }}>建议下一句</div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--deep-plum)', lineHeight: 1.55 }}>{feedback.next}</p>
            </div>

            {/* Boundary */}
            <div style={{ borderRadius: 16, padding: '12px 14px', background: 'rgba(176,160,204,0.12)', border: '1px solid rgba(176,160,204,0.25)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <ShieldCheck size={14} color="var(--lavender-mist)" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 11, color: 'var(--graphite-rose)', lineHeight: 1.6 }}>边界感提醒：尊重对方节奏，不催促，不施压。</p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1} }
      `}</style>
    </div>
  );
}

export function SimulationPage({ onNavigate }: Props) {
  const [started, setStarted] = useState(false);
  const [sceneId, setSceneId] = useState('');
  const [difficulty, setDifficulty] = useState('普通');

  if (!started) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <SceneSelection onStart={(s, d) => { setSceneId(s); setDifficulty(d); setStarted(true); }} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      <ChatPractice sceneId={sceneId} difficulty={difficulty} onReset={() => setStarted(false)} />
    </div>
  );
}
