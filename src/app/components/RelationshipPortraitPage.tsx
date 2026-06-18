import { ArrowRight, TrendingUp, AlertTriangle, Lightbulb, Heart } from 'lucide-react';
import { GlassCard, LiquidButton, HeatMeter, StageBadge, AIInsightCard, ProgressStepper, WarningNotice } from './GlassUI';
import { BlurText } from './BlurText';
import { IconBadge, type IconToken } from './IconBadge';
import type { PageName } from './GlassUI';

interface Props { onNavigate: (page: PageName) => void; }

const steps = ['资料建档', '男生问卷', '女生问卷', '关系画像', '聊天导入'];

const stages = ['追求期', '暧昧观察期', '升温期', '恋爱期'];

export function RelationshipPortraitPage({ onNavigate }: Props) {
  const currentStage = 1; // 暧昧观察期

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">
      <GlassCard hover={false} style={{ marginBottom: 32 }} padding="20px 24px">
        <ProgressStepper steps={steps} current={3} />
      </GlassCard>

      <div style={{ marginBottom: 28 }}>
        <BlurText text="关系画像" startDelay={60} className="gradient-text" style={{ fontSize: 28, letterSpacing: '-0.03em', fontWeight: 700, display: 'block' }} />
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          基于你填写的信息综合生成，不代表对方真实想法的绝对结论。
        </p>
      </div>

      {/* Relationship Stage Dashboard */}
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.65, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>关系阶段仪表盘</div>

        <div style={{ display: 'flex', gap: 0, marginBottom: 20, position: 'relative' }}>
          {/* Track line */}
          <div style={{
            position: 'absolute', top: 20, left: '8%', right: '8%', height: 2,
            background: 'rgba(232,116,138,0.15)', zIndex: 0,
          }} />
          <div style={{
            position: 'absolute', top: 20, left: '8%',
            width: `${(currentStage / (stages.length - 1)) * 84}%`,
            height: 2,
            background: 'linear-gradient(90deg,#E8748A,#C5956C)',
            zIndex: 0,
          }} />

          {stages.map((stage, i) => (
            <div key={stage} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 999,
                background: i <= currentStage ? 'linear-gradient(135deg,#E8748A,#C5956C)' : 'rgba(255,245,248,0.6)',
                border: i === currentStage ? '3px solid white' : i < currentStage ? '2px solid rgba(232,116,138,0.5)' : '2px solid rgba(200,150,180,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: i === currentStage ? '0 4px 16px rgba(232,116,138,0.4)' : undefined,
                transition: 'all 0.3s ease',
              }}>
                <span style={{ fontSize: i <= currentStage ? 16 : 14 }}>
                  {i === 0 ? '💌' : i === 1 ? '🌸' : i === 2 ? '🔥' : '❤️'}
                </span>
              </div>
              <span style={{
                fontSize: 12, fontWeight: i === currentStage ? 600 : 400,
                color: i === currentStage ? 'var(--pink-primary)' : 'var(--text-purple)',
                opacity: i > currentStage ? 0.5 : 1, textAlign: 'center',
              }}>
                {stage}
              </span>
              {i === currentStage && (
                <span style={{
                  fontSize: 10, color: 'white', fontWeight: 600,
                  background: 'linear-gradient(135deg,#E8748A,#C5956C)',
                  padding: '2px 8px', borderRadius: 999,
                }}>
                  当前
                </span>
              )}
            </div>
          ))}
        </div>

        <HeatMeter value={68} />
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* 我的类型卡片 */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <IconBadge token="respect" size={32} tone="rose" />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>你的沟通类型</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <StageBadge stage="过度分析型" active />
            <StageBadge stage="表达保守型" active />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'rgba(212,255,220,0.25)', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#4A9E6A', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>优点</div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.6 }}>认真、重视关系、愿意学习和改变</p>
            </div>
            <div style={{ background: 'rgba(255,230,200,0.25)', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#B07040', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>注意点</div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.6 }}>容易脑补过度、回复前压力过大</p>
            </div>
            <div style={{ background: 'rgba(232,116,138,0.08)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(232,116,138,0.15)' }}>
              <div style={{ fontSize: 11, color: 'var(--pink-primary)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>沟通建议</div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.6 }}>先确认事实，再表达感受</p>
            </div>
          </div>
        </GlassCard>

        {/* 她的观察卡片 */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <IconBadge token="flower" size={32} tone="lavender" />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>她的互动画像（基于观察）</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <StageBadge stage="慢热观察型" active />
            <StageBadge stage="边界清晰型" active />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>✅</span>
              <div>
                <div style={{ fontSize: 11, color: '#4A9E6A', fontWeight: 600, marginBottom: 2 }}>积极信号</div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.5 }}>愿意回复、偶尔分享生活</p>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.4)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 11, color: '#B07040', fontWeight: 600, marginBottom: 2 }}>谨慎信号</div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.5 }}>较少主动邀约、私人话题较克制</p>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.4)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 2, fontWeight: 600 }}>当前可能阶段</div>
              <StageBadge stage="暧昧观察期" active />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Next Steps */}
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Lightbulb size={18} color="var(--pink-primary)" />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>下一步建议</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {([
            { token: 'chat' as IconToken, text: '保持轻松互动，不要太刻意' },
            { token: 'patience' as IconToken, text: '不要过快表白，让关系自然升温' },
            { token: 'invite' as IconToken, text: '用低压力邀约增加线下相处' },
          ]).map((item, i) => (
            <div key={item.text} style={{
              background: 'rgba(255,245,248,0.5)', borderRadius: 16,
              padding: '14px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.4)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <IconBadge token={item.token} size={40} tone={(['rose', 'lavender', 'gold'] as const)[i % 3]} style={{ marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <WarningNotice text="关系画像基于你提供的信息生成，置信度受限于观察样本量。请结合现实感受判断，AI 结论不是事实，只是辅助参考。" />

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <LiquidButton variant="secondary" onClick={() => onNavigate('female-questionnaire')}>
          重新填写问卷
        </LiquidButton>
        <LiquidButton onClick={() => onNavigate('chat-import')}>
          导入聊天记录获取更精准分析 <ArrowRight size={16} />
        </LiquidButton>
      </div>
    </div>
  );
}
