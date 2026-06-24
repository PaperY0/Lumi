import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, RefreshCw, Lightbulb, Ban, AlertCircle } from 'lucide-react';
import { GlassCard, LiquidButton, HeatMeter, StageBadge, AIInsightCard, WarningNotice, GlassInput } from './GlassUI';
import { CountUp } from './CountUp';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';
import { useAnalyzeChat } from '@/hooks/useAnalyzeChat';

interface Props { onNavigate: (page: PageName) => void; }

export function AIAnalysisPage({ onNavigate }: Props) {
  console.log('📄 [AIAnalysisPage] 页面加载');

  const [userQuestion, setUserQuestion] = useState('');
  const { data, loading, error, analyze, loadCached } = useAnalyzeChat();

  // 页面挂载时加载缓存
  useEffect(() => {
    loadCached();
  }, [loadCached]);

  const handleAnalyze = () => {
    if (loading) return;
    console.log('🖱️ [AIAnalysisPage] 用户点击开始分析');
    analyze({ userQuestion: userQuestion || undefined });
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

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">
      {/* 标题 */}
      <div style={{ marginBottom: 28 }}>
        <BlurText text="AI 聊天分析" startDelay={60} className="gradient-text" style={{ fontSize: 28, letterSpacing: '-0.03em', fontWeight: 700, display: 'block' }} />
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          基于资料、问卷和聊天记录，帮你判断当前互动状态。
        </p>
      </div>

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
                {isChatInsufficient ? '聊天记录不足，暂时不能分析' : '分析失败'}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.6 }}>{error}</p>
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
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--pink-primary)' }}>AI 正在分析聊天记录...</p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>这可能需要几秒钟</p>
        </GlassCard>
      )}

      {/* 报告内容 */}
      {data && !loading && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', opacity: 0.75 }}>
              分析于 {new Date(data.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            <button
              onClick={handleAnalyze}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(232,116,138,0.3)', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: 'var(--pink-primary)' }}
            >
              <RefreshCw size={14} /> 重新分析
            </button>
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
    </div>
  );
}
