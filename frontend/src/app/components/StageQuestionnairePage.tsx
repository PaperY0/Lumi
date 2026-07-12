import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpenCheck, CheckCircle2, HeartHandshake, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { GlassCard, LiquidButton, ProgressStepper } from './GlassUI';
import type { PageName } from './GlassUI';
import { getStageAssessmentCatalog, type StageAssessmentCatalogItem } from '@/lib/pursuitAssessmentCatalog';
import { getRelationshipStageLabel, getRelationshipStageValue } from '@/lib/relationshipStage';
import { userProfileRepository, girlProfileRepository } from '@/lib/db';
import type { RelationshipStageLabel } from '@/lib/relationshipStage';
import type { RelationshipStageValue } from '@/lib/relationshipStage';
import type { QuestionnaireCompletionState } from '@/lib/questionnaireCompletion';
import { useUiStore } from '@/stores';
import { loadOnboardingProgress } from '@/lib/onboardingProgress';

interface Props {
  onNavigate: (page: PageName) => void;
}

const iconForAudience: Record<StageAssessmentCatalogItem['audience'], typeof UserRoundCheck> = {
  self: UserRoundCheck,
  observation: HeartHandshake,
  relationship: ShieldCheck,
};
const steps = ['资料建档', '男生问卷', '女生问卷', '阶段问卷', '关系画像'];

export function StageQuestionnairePage({ onNavigate }: Props) {
  const [stage, setStage] = useState<RelationshipStageLabel | null>(null);
  const [completion, setCompletion] = useState<QuestionnaireCompletionState>({
    male: false,
    female: false,
    stage: { self: false, observation: false, relationship: false },
  });
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    async function loadStage() {
      const progress = await loadOnboardingProgress();
      setIsReturningUser(progress.isReturningUser || progress.isComplete);
      const user = await userProfileRepository.getCurrent();
      if (!user) return;
      const girl = (await girlProfileRepository.getByUserId(user.id))[0];
      if (!girl || girl.currentStage === 'stranger') {
        useUiStore.getState().showToast('请先在资料建档中选择当前关系阶段', 'error');
        onNavigate('profile');
        return;
      }
      const currentStage = getRelationshipStageValue(getRelationshipStageLabel(girl));
      setStage(getRelationshipStageLabel(girl));
      setCompletion({ male: progress.male, female: progress.female, stage: progress.stage });
    }

    loadStage();
  }, []);

  const value = stage === '暧昧观察期' ? 'ambiguous' : stage === '升温期' ? 'warming' : 'observing';
  const catalog = getStageAssessmentCatalog(value);

  return (
    <div style={{ padding: '32px', maxWidth: 820, margin: '0 auto' }} className="page-enter">
      <LiquidButton variant="secondary" onClick={() => onNavigate('profile')} style={{ marginBottom: 24 }}>
        <ArrowLeft size={16} /> 返回资料建档
      </LiquidButton>
      <GlassCard hover={false} style={{ marginBottom: 28 }} padding="20px 24px">
        <ProgressStepper steps={steps} current={3} />
      </GlassCard>

      <div style={{ marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <BookOpenCheck size={24} color="var(--pink-primary)" />
          <h1 style={{ margin: 0, fontSize: 28, color: 'var(--text-rose)' }}>阶段专项问卷</h1>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-purple)', lineHeight: 1.7 }}>
          当前资料设定：{stage ?? '正在读取'}。问卷帮助你看见互动节奏与边界，不替你判断对方的内心。
        </p>
      </div>

      {catalog.available ? (
        <>
          <div style={{ marginBottom: 18, fontSize: 15, fontWeight: 700, color: 'var(--text-rose)' }}>追求期 · {stage ?? '当前阶段'}专项观察</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {catalog.items.map((item) => {
              const Icon = iconForAudience[item.audience];
              const isSelfAssessment = item.audience === 'self';
              const isObservationAssessment = item.audience === 'observation';
              const isRelationshipAssessment = item.audience === 'relationship';
              const isCompleted = item.audience === 'self'
                ? completion.stage.self
                : item.audience === 'observation'
                  ? completion.stage.observation
                  : completion.stage.relationship;
              return (
                <GlassCard key={item.audience} hover={false} style={{ display: 'flex', flexDirection: 'column', minHeight: 246 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <Icon size={28} color="var(--pink-primary)" />
                    {isCompleted && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#4A9E6A', fontSize: 12, fontWeight: 700 }}><CheckCircle2 size={15} /> 已完成</span>}
                  </div>
                  <h2 style={{ margin: '16px 0 8px', fontSize: 18, color: 'var(--text-rose)' }}>{item.title}</h2>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7, flex: 1 }}>{item.description}</p>
                  <p style={{ margin: '16px 0 0', fontSize: 12, color: 'var(--champagne-gold)', lineHeight: 1.6 }}>{item.boundary}</p>
                  {isSelfAssessment ? (
                    <LiquidButton onClick={() => onNavigate('pursuit-self-assessment')} style={{ marginTop: 16, justifyContent: 'center' }}>{isCompleted ? (isReturningUser ? '重新填写' : '已完成') : '开始填写'}</LiquidButton>
                  ) : isObservationAssessment ? (
                    <LiquidButton onClick={() => onNavigate('pursuit-observation-assessment')} style={{ marginTop: 16, justifyContent: 'center' }}>{isCompleted ? (isReturningUser ? '重新填写' : '已完成') : '开始填写'}</LiquidButton>
                  ) : isRelationshipAssessment ? (
                    <LiquidButton onClick={() => onNavigate('pursuit-relationship-assessment')} style={{ marginTop: 16, justifyContent: 'center' }}>{isCompleted ? (isReturningUser ? '重新填写' : '已完成') : '开始填写'}</LiquidButton>
                  ) : (
                    <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-purple)', opacity: 0.62 }}>题库准备中</div>
                  )}
                </GlassCard>
              );
            })}
          </div>
          <div style={{ marginTop: 22, borderRadius: 18, padding: '15px 18px', background: 'rgba(232,116,138,0.08)', border: '1px solid rgba(232,116,138,0.18)', fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            初识接触期题目会记录真实行为和互动事实，并提供“不确定”选项；结果用于帮助你调整节奏，不替你判断对方的内心。
          </div>
        </>
      ) : (
        <GlassCard hover={false} style={{ textAlign: 'center', padding: '48px 28px' }}>
          <ShieldCheck size={34} color="var(--champagne-gold)" />
          <h2 style={{ margin: '16px 0 8px', fontSize: 20, color: 'var(--text-rose)' }}>{stage ?? '当前阶段'}题库正在准备</h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            当前问卷属于追求期总模式，并会根据初识接触期、升温期或暧昧观察期逐步替换为对应题库，不会把恋爱期内容混入。
          </p>
        </GlassCard>
      )}
    </div>
  );
}
