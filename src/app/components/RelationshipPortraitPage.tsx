import { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, AlertTriangle, Lightbulb, Heart } from 'lucide-react';
import { GlassCard, LiquidButton, HeatMeter, StageBadge, AIInsightCard, ProgressStepper, WarningNotice } from './GlassUI';
import { BlurText } from './BlurText';
import { IconBadge, type IconToken } from './IconBadge';
import type { PageName } from './GlassUI';
import { useSettingsStore, useUserStore } from '@/stores';
// ✅ 加载真实结果
import { questionnaireRepository } from '@/lib/db';
import type { MaleQuestionnaireResult, FemaleQuestionnaireResult } from '@/types/questionnaire';

interface Props { onNavigate: (page: PageName) => void; }

const steps = ['资料建档', '男生问卷', '女生问卷', '关系画像', '聊天导入'];

const stages = ['追求期', '暧昧观察期', '升温期', '恋爱期'];

export function RelationshipPortraitPage({ onNavigate }: Props) {
  // ✅ 加载真实结果
  const [maleResult, setMaleResult] = useState<MaleQuestionnaireResult | null>(null);
  const [femaleResult, setFemaleResult] = useState<FemaleQuestionnaireResult | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ 修复：挂载时先加载用户数据，再加载问卷结果
  useEffect(() => {
    (async () => {
      console.log('[RelationshipPortrait] 组件挂载，开始加载数据');

      // 先加载用户数据
      await useUserStore.getState().loadCurrentUser();
      const user = useUserStore.getState().currentUser;

      console.log('[RelationshipPortrait] 当前用户:', user);

      if (!user) {
        console.warn('[RelationshipPortrait] 没有用户信息，显示空态');
        setLoading(false);
        return;
      }

      console.log('[RelationshipPortrait] 开始加载问卷结果，userId:', user.id);

      const male = await questionnaireRepository.getLatestMale(user.id);
      const female = await questionnaireRepository.getLatestFemale(user.id);

      console.log('[RelationshipPortrait] 男生问卷结果:', male);
      console.log('[RelationshipPortrait] 女生问卷结果:', female);

      setMaleResult(male ?? null);
      setFemaleResult(female ?? null);
      setLoading(false);

      console.log('[RelationshipPortrait] 数据加载完成');
    })();
  }, []);

  // ✅ 引导完成：标记 onboardingCompleted 并跳转首页
  const handleFinish = () => {
    useSettingsStore.getState().setOnboardingCompleted(true);
    onNavigate('dashboard');
  };

  // ✅ 空态：缺失问卷结果
  if (!loading && (!maleResult || !femaleResult)) {
    console.log('[RelationshipPortrait] 显示空态 - maleResult:', !!maleResult, 'femaleResult:', !!femaleResult);
    return (
      <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">
        <GlassCard hover={false} style={{ marginBottom: 32 }} padding="20px 24px">
          <ProgressStepper steps={steps} current={3} />
        </GlassCard>

        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 600, color: 'var(--text-rose)' }}>
            请先完成两份问卷
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
            需要完成男生问卷和女生观察问卷后才能查看关系画像
          </p>
          <LiquidButton onClick={() => onNavigate('male-questionnaire')}>
            去做问卷 <ArrowRight size={16} />
          </LiquidButton>
        </div>
      </div>
    );
  }

  // ✅ 加载态
  if (loading) {
    console.log('[RelationshipPortrait] 显示加载态');
    return (
      <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">
        <GlassCard hover={false} style={{ marginBottom: 32 }} padding="20px 24px">
          <ProgressStepper steps={steps} current={3} />
        </GlassCard>
        <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: 14, color: 'var(--text-purple)' }}>
          加载中...
        </div>
      </div>
    );
  }

  console.log('[RelationshipPortrait] 渲染关系画像页面');

  // ✅ 计算热度值
  const positiveCount = femaleResult?.positiveSignals.length ?? 0;
  const cautionCount = femaleResult?.cautionSignals.length ?? 0;
  const totalSignals = positiveCount + cautionCount;
  const heatValue = totalSignals > 0 ? Math.floor((positiveCount / totalSignals) * 100) : 0;

  // ✅ 根据 possibleStage 映射到 stages 数组的索引
  const stageMap: Record<string, number> = {
    '关系冷淡期': 0,
    '初识接触期': 0,
    '暧昧观察期': 1,
    '暧昧推进期': 2,
    '关系明确期': 3,
  };
  const currentStage = stageMap[femaleResult?.possibleStage ?? '暧昧观察期'] ?? 1;

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

        <HeatMeter value={heatValue} />
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* ✅ 我的类型卡片 - 渲染真实的 maleResult */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <IconBadge token="respect" size={32} tone="rose" />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>你的沟通类型</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {maleResult?.typeTags.map(tag => (
              <StageBadge key={tag} stage={tag} active />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(maleResult?.weaknesses.length ?? 0) > 0 && (
              <div style={{ background: 'rgba(255,230,200,0.25)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#B07040', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>注意点</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {maleResult?.weaknesses.map((w, i) => (
                    <p key={i} style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.6 }}>{w}</p>
                  ))}
                </div>
              </div>
            )}
            {(maleResult?.suggestions.length ?? 0) > 0 && (
              <div style={{ background: 'rgba(232,116,138,0.08)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(232,116,138,0.15)' }}>
                <div style={{ fontSize: 11, color: 'var(--pink-primary)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>沟通建议</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {maleResult?.suggestions.slice(0, 2).map((s, i) => (
                    <p key={i} style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.6 }}>{s}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* ✅ 她的观察卡片 - 渲染真实的 femaleResult */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <IconBadge token="flower" size={32} tone="lavender" />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>她的互动画像（基于观察）</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {femaleResult?.personalityTags.slice(0, 3).map(tag => (
              <StageBadge key={tag} stage={tag} active />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(femaleResult?.positiveSignals.length ?? 0) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>✅</span>
                <div>
                  <div style={{ fontSize: 11, color: '#4A9E6A', fontWeight: 600, marginBottom: 2 }}>积极信号</div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.5 }}>
                    {femaleResult?.positiveSignals.slice(0, 3).join('、')}
                  </p>
                </div>
              </div>
            )}
            {(femaleResult?.cautionSignals.length ?? 0) > 0 && (
              <>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.4)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#B07040', fontWeight: 600, marginBottom: 2 }}>谨慎信号</div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.5 }}>
                      {femaleResult?.cautionSignals.slice(0, 3).join('、')}
                    </p>
                  </div>
                </div>
              </>
            )}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.4)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 2, fontWeight: 600 }}>当前可能阶段</div>
              <StageBadge stage={femaleResult?.possibleStage ?? '暧昧观察期'} active />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ✅ 下一步建议 - 根据真实结果动态生成 */}
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Lightbulb size={18} color="var(--pink-primary)" />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>下一步建议</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {femaleResult?.suggestions.slice(0, 3).map((suggestion, i) => (
            <div key={i} style={{
              background: 'rgba(255,245,248,0.5)', borderRadius: 12,
              padding: '12px 16px',
              border: '1px solid rgba(255,255,255,0.4)',
            }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.6 }}>{suggestion}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <WarningNotice text="关系画像基于你提供的信息生成，置信度受限于观察样本量。请结合现实感受判断，AI 结论不是事实，只是辅助参考。" />

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <LiquidButton variant="secondary" onClick={() => onNavigate('female-questionnaire')}>
          重新填写问卷
        </LiquidButton>
        <LiquidButton onClick={handleFinish}>
          开始使用 Lumi <ArrowRight size={16} />
        </LiquidButton>
      </div>
    </div>
  );
}
