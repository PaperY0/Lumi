import { ArrowRight, Sparkles, RefreshCw, Lightbulb, Ban } from 'lucide-react';
import { GlassCard, LiquidButton, HeatMeter, StageBadge, AIInsightCard, WarningNotice } from './GlassUI';
import { CountUp } from './CountUp';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';

interface Props { onNavigate: (page: PageName) => void; }

export function AIAnalysisPage({ onNavigate }: Props) {
  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <BlurText text="AI 聊天分析报告" startDelay={60} className="gradient-text" style={{ fontSize: 28, letterSpacing: '-0.03em', fontWeight: 700, display: 'block' }} />
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
            基于 15 条聊天记录 · 分析于今天 14:45
          </p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(232,116,138,0.3)', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: 'var(--pink-primary)' }}>
          <RefreshCw size={14} /> 重新分析
        </button>
      </div>

      {/* Summary Card */}
      <GlassCard style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(232,116,138,0.08), rgba(212,165,201,0.08))' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#E8748A,#C5956C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI 简单答案</div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-rose)', lineHeight: 1.55, letterSpacing: '-0.01em' }}>
              目前更像是暧昧观察期，互动有窗口，但不适合过快推进。她在观察你，你也有机会。
            </p>
          </div>
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Stage & Heat */}
        <GlassCard>
          <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>关系阶段</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
            {['追求期', '暧昧观察期', '升温期', '恋爱期'].map((s, i) => (
              <StageBadge key={s} stage={s} active={i === 1} />
            ))}
          </div>

          <HeatMeter value={68} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            <div style={{ background: 'rgba(255,245,248,0.5)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
              <CountUp from={0} to={72} duration={1.4} suffix="%" style={{ fontSize: 20, fontWeight: 700, color: 'var(--pink-primary)' }} />
              <div style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.7, marginTop: 2 }}>判断置信度</div>
            </div>
            <div style={{ background: 'rgba(255,245,248,0.5)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
              <CountUp from={0} to={15} duration={1.2} style={{ fontSize: 20, fontWeight: 700, color: 'var(--pink-primary)' }} />
              <div style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.7, marginTop: 2 }}>分析消息数</div>
            </div>
          </div>
        </GlassCard>

        {/* Female perspective */}
        <GlassCard>
          <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>女生视角解释</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { msg: '"看情况吧"', explain: '不是拒绝，但也没有明确确认。她在观察你的后续反应，你当时的"嗯好，不着急"是好的回应。' },
              { msg: '"你去忙吧"', explain: '带有轻微关心意味，说明她不希望打扰你，同时也在结束话题。' },
              { msg: '"加油哦"', explain: '主动给予鼓励，是积极信号——她在乎你的状态。' },
            ].map((item, i) => (
              <div key={i} style={{ borderRadius: 14, padding: '12px 14px', background: 'rgba(212,165,201,0.1)', border: '1px solid rgba(212,165,201,0.2)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pink-primary)', marginBottom: 4 }}>她说：{item.msg}</div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-rose)', lineHeight: 1.6, opacity: 0.9 }}>{item.explain}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Signals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <AIInsightCard
          icon="✅"
          title="积极信号"
          variant="positive"
          content={
            <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
              <li>她主动问起了你最近的状态</li>
              <li>"加油哦"表达了关心</li>
              <li>话题转换自然，没有刻意冷淡</li>
              <li>提到了奶茶，呼应了你的话题</li>
            </ul>
          }
        />
        <AIInsightCard
          icon="⚠️"
          title="谨慎信号"
          variant="risk"
          content={
            <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
              <li>"看情况吧"未给明确回应</li>
              <li>回复节奏偏慢（间隔 5-12 分钟）</li>
              <li>主动话题较少，多为回应</li>
            </ul>
          }
        />
      </div>

      {/* Your expression issues */}
      <AIInsightCard
        icon="💬"
        title="你的表达分析"
        content={'你的"不着急"回应很棒——避免了施压。建议：邀约时可以更具体（比如给出时间和地点选项），而不是笼统说"一起去"，这样对方更容易给出回应。'}
        variant="default"
      />

      {/* Next steps & don'ts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, marginBottom: 16 }}>
        <GlassCard>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Lightbulb size={14} color="var(--champagne-gold)" /> 下一步建议
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['下次聊天时分享一件有趣的生活事', '给出具体的低压力邀约选项', '继续保持不催促的节奏'].map(s => (
              <div key={s} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: '#E8748A', marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard style={{ background: 'rgba(255,235,235,0.3)', border: '1px solid rgba(200,150,150,0.2)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#C96A6A', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Ban size={14} color="#C96A6A" /> 不建议的行为
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['连续发送多条消息等待回复', '在她回复慢时追问"你看到了吗"', '此阶段直接表白，节奏过快'].map(s => (
              <div key={s} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: '#C96A6A', marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.5, opacity: 0.9 }}>{s}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <WarningNotice text="AI 分析仅供参考，不代表对方真实想法。请结合现实互动，尊重对方表达和边界。如果她明确表示不感兴趣，请认真对待这个信号。" />

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <LiquidButton variant="secondary" onClick={() => onNavigate('chat-import')}>
          重新导入分析
        </LiquidButton>
        <LiquidButton onClick={() => onNavigate('reply-assist')}>
          帮我回复她的消息 <ArrowRight size={16} />
        </LiquidButton>
      </div>
    </div>
  );
}
