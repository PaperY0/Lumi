import React, { useState, useEffect } from 'react';
import { MessageSquare, Upload, MessageCircle, ChevronRight, Sparkles, Heart, BarChart2, AlertCircle } from 'lucide-react';
import { HeatMeter, StageBadge, AIInsightCard } from './GlassUI';
import { AnimatedCard } from './AnimatedCard';
import { CountUp } from './CountUp';
import { BlurText } from './BlurText';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { PageName } from './GlassUI';

interface DashboardPageProps {
  onNavigate: (page: PageName) => void;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [heroVisible, setHeroVisible] = useState(false);
  const { loading, error, data, reload } = useDashboardData();
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

  if (loading) {
    return (
      <div style={{ padding: '32px 36px 48px', maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--graphite-rose)', opacity: 0.7 }}>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px 36px 48px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ borderRadius: 16, padding: '16px 20px', background: 'rgba(240,184,160,0.1)', border: '1px solid rgba(191,142,110,0.2)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <AlertCircle size={18} color="#BF8E6E" />
          <span style={{ fontSize: 13, color: '#5E4A60' }}>{error}</span>
        </div>
        <button onClick={reload} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #D4607A, #BF8E6E)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>重试</button>
      </div>
    );
  }

  const d = data!;

  return (
    <div style={{ padding: '32px 36px 48px', maxWidth: 960, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ ...heroAnim(80), marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--deep-plum)', letterSpacing: '-0.04em', lineHeight: 1.2 }}>
          <BlurText text={d.userName ? `${greeting}，${d.userName}` : `${greeting}，今天想解决什么？`} delay={90} startDelay={100} />
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--graphite-rose)', opacity: 0.75 }}>
          {d.girlName
            ? `今天也可以继续了解 ${d.girlName}`
            : '完善她的资料后，我可以给你更准确的建议'}
        </p>
      </div>

      {/* ── Profile Completion Card ──────────────────────────────────── */}
      <div style={heroAnim(140)}>
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
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,96,122,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: '#7B5C6E', opacity: 0.6, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>资料完成度</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#F2BDCC,#C8A8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 14px rgba(212,96,122,0.2)' }}>🌸</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#4A2E38', letterSpacing: '-0.03em' }}>
                    {d.profileCompletion}%
                  </h2>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#7B5C6E', opacity: 0.7 }}>
                    {d.profileCompletion < 100
                      ? '完善双方资料和问卷后，AI 建议会更贴合你们的情况'
                      : '资料已完善，AI 可以给出更精准的建议'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(212,96,122,0.1)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, width: `${d.profileCompletion}%`, background: 'linear-gradient(90deg, #D4607A, #C8A8D4)', transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--graphite-rose)', opacity: 0.6, marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {d.girlName ? `${d.girlName} · 当前状态` : '当前关系状态'}
              </div>
              {d.girlName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="stage-badge stage-badge-active">观察中</span>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#7B5C6E', opacity: 0.6 }}>完善她的资料后显示</div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--graphite-rose)', opacity: 0.6, marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>最后活跃</div>
              <div style={{ fontSize: 13, color: '#4A2E38' }}>
                {d.lastActiveAt
                  ? formatDateTime(d.lastActiveAt)
                  : '还没有使用记录，先从一次聊天分析开始吧'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
        {[
          { icon: <BarChart2 size={22} color="#D4607A" />, title: 'AI 分析', count: d.analysisReportCount, unit: '次', gradient: 'rgba(212,96,122,0.08), rgba(242,189,204,0.12)', page: 'ai-analysis' as PageName },
          { icon: <Sparkles size={22} color="#C8A8D4" />, title: '帮我回复', count: d.replyHistoryCount, unit: '次', gradient: 'rgba(200,168,212,0.08), rgba(220,190,240,0.1)', page: 'reply-assist' as PageName },
          { icon: <MessageCircle size={22} color="#BF8E6E" />, title: '模拟对话', count: d.simulateHistoryCount, unit: '次', gradient: 'rgba(191,142,110,0.08), rgba(240,184,160,0.1)', page: 'simulation' as PageName },
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
              <div style={{ fontSize: 24, fontWeight: 700, color: '#4A2E38', lineHeight: 1.2 }}>
                <CountUp from={0} to={a.count} duration={1} />
              </div>
              <div style={{ fontSize: 12, color: '#7B5C6E', opacity: 0.75, lineHeight: 1.5 }}>{a.unit}</div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14, marginBottom: 14 }}>
        {/* Recent Activity */}
        <AnimatedCard delay={80}>
          <div className="glass-card" style={{ borderRadius: 24, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.38)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <BarChart2 size={15} color="#D4607A" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38' }}>最近动态</span>
              </div>
            </div>
            {/* Latest Analysis */}
            {d.latestAnalysisReport ? (
              <div onClick={() => onNavigate('ai-analysis')} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'background 0.15s' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#4A2E38', marginBottom: 4 }}>
                  AI 分析：{d.latestAnalysisReport.simpleAnswer?.slice(0, 30) || '分析报告'}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#7B5C6E', opacity: 0.6 }}>{formatDateTime(d.latestAnalysisReport.createdAt)}</span>
                  <span style={{ fontSize: 11, color: '#D4607A', fontWeight: 500 }}>互动热度 {d.latestAnalysisReport.interactionHeat === 'hot' ? '🔥' : d.latestAnalysisReport.interactionHeat === 'warm' ? '🌤️' : '❄️'}</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: 13, color: '#7B5C6E', opacity: 0.5 }}>暂无 AI 分析记录</div>
              </div>
            )}
            {/* Latest Reply */}
            {d.latestReplyHistory ? (
              <div onClick={() => onNavigate('reply-assist')} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'background 0.15s' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#4A2E38', marginBottom: 4 }}>
                  帮我回复：{d.latestReplyHistory.userMessage?.slice(0, 30) || '回复建议'}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#7B5C6E', opacity: 0.6 }}>{formatDateTime(d.latestReplyHistory.createdAt)}</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: 13, color: '#7B5C6E', opacity: 0.5 }}>暂无回复建议记录</div>
              </div>
            )}
            {/* Latest Simulate */}
            {d.latestSimulateHistory ? (
              <div onClick={() => onNavigate('simulation')} style={{ padding: '14px 20px', cursor: 'pointer', transition: 'background 0.15s' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#4A2E38', marginBottom: 4 }}>
                  模拟练习：{d.latestSimulateHistory.scenario} · {d.latestSimulateHistory.difficulty}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#7B5C6E', opacity: 0.6 }}>{formatDateTime(d.latestSimulateHistory.createdAt)}</span>
                  {d.latestSimulateHistory.finalScore != null && (
                    <span style={{ fontSize: 11, color: '#D4607A', fontWeight: 500 }}>评分 {d.latestSimulateHistory.finalScore}</span>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px 20px' }}>
                <div style={{ fontSize: 13, color: '#7B5C6E', opacity: 0.5 }}>暂无模拟练习记录</div>
              </div>
            )}
            <div style={{ padding: '12px 20px' }}>
              <button onClick={() => onNavigate('chat-import')} style={{ fontSize: 12, color: '#D4607A', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                <Upload size={13} /> 导入新聊天记录
              </button>
            </div>
          </div>
        </AnimatedCard>

        {/* Simulate Practice Overview */}
        <AnimatedCard delay={140} enable3d>
          <div className="glass-card" style={{ borderRadius: 24, padding: '20px', height: '100%', background: 'linear-gradient(145deg, rgba(255,252,255,0.65), rgba(255,245,250,0.52))' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              <MessageCircle size={15} color="#BF8E6E" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4A2E38' }}>模拟练习概览</span>
            </div>
            {d.simulateHistoryCount > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#7B5C6E' }}>累计练习消息</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#4A2E38' }}>{d.totalPracticeMessages} 条</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#7B5C6E' }}>平均评分</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#4A2E38' }}>{d.averageSimulateScore ?? '暂无评分'}</span>
                  </div>
                  {d.latestSimulateHistory && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#7B5C6E' }}>最近场景</span>
                        <span style={{ fontSize: 13, color: '#4A2E38' }}>{d.latestSimulateHistory.scenario}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#7B5C6E' }}>最近难度</span>
                        <span style={{ fontSize: 13, color: '#4A2E38' }}>{d.latestSimulateHistory.difficulty}</span>
                      </div>
                    </>
                  )}
                </div>
                <button onClick={() => onNavigate('simulation')} style={{ fontSize: 12, color: '#BF8E6E', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                  继续练习 <ChevronRight size={13} />
                </button>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#5E4A60', lineHeight: 1.7 }}>
                  完成一次模拟对话练习后，这里会展示你的练习数据。
                </p>
                <button onClick={() => onNavigate('simulation')} style={{ fontSize: 12, color: '#BF8E6E', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                  开始练习 <ChevronRight size={13} />
                </button>
              </>
            )}
          </div>
        </AnimatedCard>
      </div>

      {/* ── Quick Actions Bento ──────────────────────────────────────── */}
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

      {/* Health principles */}
      <AnimatedCard delay={200}>
        <div className="glass-card" style={{ borderRadius: 24, padding: '20px', background: 'linear-gradient(145deg, rgba(255,252,255,0.65), rgba(255,245,250,0.52))' }}>
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

      {/* AI Insight */}
      <AnimatedCard delay={260}>
        <div style={{ borderRadius: 22, padding: '16px 20px', background: 'rgba(240,184,160,0.1)', border: '1px solid rgba(191,142,110,0.2)', display: 'flex', gap: 12, marginTop: 14 }}>
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
