import { useEffect } from 'react';
import { ArrowRight, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import { GlassCard, LiquidButton, HeatMeter, StageBadge, ProgressStepper, WarningNotice } from './GlassUI';
import { BlurText } from './BlurText';
import { IconBadge } from './IconBadge';
import type { PageName } from './GlassUI';
import { useSettingsStore } from '@/stores';
import { useGeneratePortrait } from '@/hooks/useGeneratePortrait';

interface Props { onNavigate: (page: PageName) => void; }

const steps = ['资料建档', '男生问卷', '女生问卷', '关系画像', '聊天导入'];

const stages = ['追求期', '暧昧观察期', '升温期', '恋爱期'];

export function RelationshipPortraitPage({ onNavigate }: Props) {
  // ✅ 使用 AI 画像生成 hook
  const { data, loading, error, generate, loadCached } = useGeneratePortrait();

  // ✅ 进页面时加载缓存
  useEffect(() => {
    loadCached();
  }, [loadCached]);

  // ✅ 引导完成：标记 onboardingCompleted 并跳转首页
  const handleFinish = () => {
    useSettingsStore.getState().setOnboardingCompleted(true);
    console.log('✅ [RelationshipPortraitPage] 已标记 onboardingCompleted=true，跳转首页');
    onNavigate('dashboard');
  };

  // ✅ 计算热度值（基于 AI 返回的 interactionHeat）
  const getHeatValue = (heat: string): number => {
    switch (heat) {
      case 'cold':
        return 30;
      case 'cool':
        return 50;
      case 'warm':
        return 70;
      case 'hot':
        return 90;
      default:
        return 50;
    }
  };

  // ✅ 根据 possibleStage 映射到 stages 数组的索引
  const getCurrentStageIndex = (stage: string): number => {
    const stageMap: Record<string, number> = {
      '关系冷淡期': 0,
      '初识接触期': 0,
      '追求期': 0,
      '暧昧观察期': 1,
      '暧昧推进期': 1,
      '升温期': 2,
      '关系明确期': 3,
      '恋爱期': 3,
    };
    return stageMap[stage] ?? 1;
  };

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">
      <GlassCard hover={false} style={{ marginBottom: 32 }} padding="20px 24px">
        <ProgressStepper steps={steps} current={3} />
      </GlassCard>

      <div style={{ marginBottom: 28 }}>
        <BlurText
          text="关系画像"
          startDelay={60}
          className="gradient-text"
          style={{ fontSize: 28, letterSpacing: '-0.03em', fontWeight: 700, display: 'block' }}
        />
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          基于资料、问卷和最近聊天综合生成；没有聊天记录时，也可以先生成基础画像。
        </p>
      </div>

      <GlassCard style={{ marginBottom: 20, background: 'rgba(255,245,248,0.48)' }} padding="14px 18px">
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
          重新生成时会优先参考最近一次已保存聊天的最多 40 条消息，用来判断当前阶段、互动热度和风险信号。AI 只做辅助判断，不替代真实沟通。
        </p>
      </GlassCard>

      {/* 生成按钮 */}
      <div style={{ marginBottom: 20 }}>
        <LiquidButton
          onClick={generate}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="spin" />
              AI 正在思考...
            </>
          ) : data ? (
            <>
              <RefreshCw size={16} />
              重新生成画像
            </>
          ) : (
            <>
              生成关系画像
              <ArrowRight size={16} />
            </>
          )}
        </LiquidButton>
      </div>

      {/* 错误提示 */}
      {error && (
        <GlassCard style={{ marginBottom: 20, background: 'rgba(232, 116, 138, 0.1)', border: '1px solid rgba(232, 116, 138, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={20} color="#E8748A" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#E8748A', marginBottom: 4 }}>生成失败</div>
              <div style={{ fontSize: 13, color: 'var(--text-rose)', opacity: 0.85 }}>{error}</div>
            </div>
            <LiquidButton variant="secondary" onClick={generate}>
              重试
            </LiquidButton>
          </div>
        </GlassCard>
      )}

      {/* 加载态 */}
      {loading && (
        <GlassCard style={{ marginBottom: 20, textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🤖</div>
          <BlurText
            text="AI 正在分析你们的关系..."
            startDelay={0}
            style={{ fontSize: 16, color: 'var(--text-rose)', marginBottom: 8 }}
          />
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', opacity: 0.6 }}>
            预计需要 1-2 秒
          </p>
        </GlassCard>
      )}

      {/* 空态 */}
      {!loading && !data && !error && (
        <GlassCard style={{ marginBottom: 20, textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: 'var(--text-rose)' }}>
            还没有生成画像
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--text-purple)', opacity: 0.7 }}>
            点击上方按钮，AI 将基于资料、问卷和最近聊天生成关系画像
          </p>
        </GlassCard>
      )}

      {/* 画像内容 */}
      {data && !loading && (
        <>
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
                width: `${(getCurrentStageIndex(data.possibleStage) / (stages.length - 1)) * 84}%`,
                height: 2,
                background: 'linear-gradient(90deg,#E8748A,#C5956C)',
                zIndex: 0,
              }} />

              {stages.map((stage, i) => {
                const currentStage = getCurrentStageIndex(data.possibleStage);
                return (
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
                );
              })}
            </div>

            <HeatMeter value={getHeatValue(data.interactionHeat)} />
          </GlassCard>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* 我的类型卡片 */}
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <IconBadge token="respect" size={32} tone="rose" />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>你的沟通类型</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {data.maleTypeTags.map(tag => (
                  <StageBadge key={tag} stage={tag} active />
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.maleWeaknesses.length > 0 && (
                  <div style={{ background: 'rgba(255,230,200,0.25)', borderRadius: 12, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#B07040', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>注意点</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {data.maleWeaknesses.map((w, i) => (
                        <p key={i} style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.6 }}>{w}</p>
                      ))}
                    </div>
                  </div>
                )}
                {data.maleSuggestions.length > 0 && (
                  <div style={{ background: 'rgba(232,116,138,0.08)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(232,116,138,0.15)' }}>
                    <div style={{ fontSize: 11, color: 'var(--pink-primary)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>沟通建议</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {data.maleSuggestions.slice(0, 2).map((s, i) => (
                        <p key={i} style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.6 }}>{s}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* 她的观察卡片 */}
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <IconBadge token="flower" size={32} tone="lavender" />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>她的互动画像（基于观察）</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {data.femalePersonalityTags.slice(0, 3).map(tag => (
                  <StageBadge key={tag} stage={tag} active />
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.positiveSignals.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>✅</span>
                    <div>
                      <div style={{ fontSize: 11, color: '#4A9E6A', fontWeight: 600, marginBottom: 2 }}>积极信号</div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.5 }}>
                        {data.positiveSignals.slice(0, 3).join('、')}
                      </p>
                    </div>
                  </div>
                )}
                {data.cautionSignals.length > 0 && (
                  <>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.4)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>⚠️</span>
                      <div>
                        <div style={{ fontSize: 11, color: '#B07040', fontWeight: 600, marginBottom: 2 }}>谨慎信号</div>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.5 }}>
                          {data.cautionSignals.slice(0, 3).join('、')}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.4)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 2, fontWeight: 600 }}>当前可能阶段</div>
                  <StageBadge stage={data.possibleStage} active />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* 下一步建议 */}
          <GlassCard style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Lightbulb size={18} color="var(--pink-primary)" />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>下一步建议</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.suggestions.slice(0, 4).map((suggestion, i) => (
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
        </>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <LiquidButton variant="secondary" onClick={() => onNavigate('female-questionnaire')}>
          重新填写问卷
        </LiquidButton>
        <LiquidButton onClick={handleFinish} disabled={!data}>
          开始使用 Lumi <ArrowRight size={16} />
        </LiquidButton>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
