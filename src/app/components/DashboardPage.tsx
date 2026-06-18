import React, { useState, useEffect } from 'react';
import { MessageSquare, Upload, MessageCircle, ChevronRight, Sparkles, Heart, BarChart2 } from 'lucide-react';
import { HeatMeter, StageBadge, AIInsightCard } from './GlassUI';
import { AnimatedCard } from './AnimatedCard';
import { CountUp } from './CountUp';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';

interface DashboardPageProps {
  onNavigate: (page: PageName) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [heroVisible, setHeroVisible] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const heroAnim = (delay: number): React.CSSProperties => ({
    opacity: heroVisible ? 1 : 0,
    transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.7s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms, transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
  });

  return (
    <div style={{ padding: '32px 36px 48px', maxWidth: 960, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ ...heroAnim(80), marginBottom: 28 }}>
        {/* BlurText 标注: animateBy="words" direction="bottom" delay={90} */}
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--deep-plum)', letterSpacing: '-0.04em', lineHeight: 1.2 }}>
          <BlurText text={`${greeting}，今天想解决什么？`} delay={90} startDelay={100} />
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--graphite-rose)', opacity: 0.75 }}>
          好的回复，不是赢得对方，而是让沟通更舒服。
        </p>
      </div>

      {/* ── Hero Relationship Card ─────────────────────────────────────────── */}
      <div style={heroAnim(200)}>
        <div
          className="glass-card"
          style={{
            borderRadius: 32,
            padding: '28px 32px',
            marginBottom: 20,
            background: 'linear-gradient(135deg, rgba(255,252,255,0.72) 0%, rgba(255,245,250,0.58) 100%)',
            boxShadow: '0 20px 60px rgba(180,120,150,0.2), 0 4px 16px rgba(180,120,150,0.1), inset 0 1px 0 rgba(255,255,255,0.85)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative gradient blob inside card */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,96,122,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: '#7B5C6E', opacity: 0.6, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>当前关系状态</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#F2BDCC,#C8A8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 14px rgba(212,96,122,0.2)' }}>🌸</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#4A2E38', letterSpacing: '-0.03em' }}>她 · 小林</h2>
                  <div style={{ marginTop: 4 }}>
                    <span className="stage-badge stage-badge-active">暧昧观察期</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('relationship-portrait')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#D4607A', fontWeight: 600 }}
            >
              查看完整画像 <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              {/* CountUp 标注: <CountUp from={0} to={68} duration={1.2} className="metric-number" /> */}
              <HeatMeter value={68} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--graphite-rose)', opacity: 0.6, marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI 当前建议</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {['保持轻松互动，不要催促', '用具体的低压力邀约推进'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 5, height: 5, borderRadius: 999, background: 'linear-gradient(135deg,#D4607A,#BF8E6E)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#4A2E38', lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions Bento ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
        {[
          { icon: <MessageSquare size={22} color="#D4607A" />, title: '她这句话是什么意思？', desc: '输入消息，AI 解析含义', page: 'reply-assist' as PageName, gradient: 'rgba(212,96,122,0.08), rgba(242,189,204,0.12)' },
          { icon: <Sparkles size={22} color="#C8A8D4" />, title: '帮我生成回复', desc: '三种风格，一键复制', page: 'reply-assist' as PageName, gradient: 'rgba(200,168,212,0.08), rgba(220,190,240,0.1)' },
          { icon: <MessageCircle size={22} color="#BF8E6E" />, title: '模拟一次对话', desc: '练习真实场景，即时反馈', page: 'simulation' as PageName, gradient: 'rgba(191,142,110,0.08), rgba(240,184,160,0.1)' },
        ].map((a, i) => (
          <AnimatedCard key={a.title} delay={i * 80} enable3d>
            <div
              className="glass-card hoverable-card"
              onClick={() => onNavigate(a.page)}
              style={{
                borderRadius: 24,
                padding: '20px',
                background: `linear-gradient(135deg, ${a.gradient})`,
                cursor: 'pointer',
                height: '100%',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)' }}>
                {a.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#4A2E38', marginBottom: 5, lineHeight: 1.3 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: '#7B5C6E', opacity: 0.75, lineHeight: 1.5 }}>{a.desc}</div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14, marginBottom: 14 }}>
        {/* Recent analysis */}
        <AnimatedCard delay={80}>
          <div className="glass-card" style={{ borderRadius: 24, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.38)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <BarChart2 size={15} color="#D4607A" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38' }}>最近分析</span>
              </div>
              <button onClick={() => onNavigate('ai-analysis')} style={{ fontSize: 12, color: '#D4607A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>查看全部</button>
            </div>
            {[
              { time: '今天 14:32', text: '"那天没看到消息" 含义解析', heat: 68 },
              { time: '昨天 21:15', text: '上周末聊天记录综合分析', heat: 65 },
            ].map((item, i) => (
              <div key={i} onClick={() => onNavigate('ai-analysis')} style={{ padding: '14px 20px', borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.3)' : undefined, cursor: 'pointer', transition: 'background 0.15s' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#4A2E38', marginBottom: 4 }}>{item.text}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#7B5C6E', opacity: 0.6 }}>{item.time}</span>
                  <span style={{ fontSize: 11, color: '#D4607A', fontWeight: 500 }}>热度 {item.heat}</span>
                </div>
              </div>
            ))}
            <div style={{ padding: '12px 20px' }}>
              <button onClick={() => onNavigate('chat-import')} style={{ fontSize: 12, color: '#D4607A', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                <Upload size={13} /> 导入新聊天记录
              </button>
            </div>
          </div>
        </AnimatedCard>

        {/* Health principles */}
        <AnimatedCard delay={140} enable3d>
          <div className="glass-card" style={{ borderRadius: 24, padding: '20px', height: '100%', background: 'linear-gradient(145deg, rgba(255,252,255,0.65), rgba(255,245,250,0.52))' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              <Heart size={15} color="#D4607A" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38' }}>健康沟通原则</span>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#5E4A60', lineHeight: 1.7, fontStyle: 'italic' }}>
              "先理解，再表达；先尊重，再靠近。"
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {['不操控', '不施压', '不侵犯边界', '不制造焦虑'].map(p => (
                <div key={p} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 5, height: 5, borderRadius: 999, background: 'linear-gradient(135deg,#D4607A,#BF8E6E)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#7B5C6E' }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* AI Insight */}
      <AnimatedCard delay={200}>
        <div style={{ borderRadius: 22, padding: '16px 20px', background: 'rgba(240,184,160,0.1)', border: '1px solid rgba(191,142,110,0.2)', display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#BF8E6E', marginBottom: 4 }}>AI 分析仅供参考</div>
            <p style={{ margin: 0, fontSize: 12, color: '#5E4A60', lineHeight: 1.6 }}>
              如果她明确表示不感兴趣，请认真对待这个信号。尊重对方真实意愿，比获得回复更重要。
            </p>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
