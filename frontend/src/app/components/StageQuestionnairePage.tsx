import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpenCheck, HeartHandshake, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { GlassCard, LiquidButton } from './GlassUI';
import type { PageName } from './GlassUI';
import { getStageAssessmentCatalog, type StageAssessmentCatalogItem } from '@/lib/pursuitAssessmentCatalog';
import { getRelationshipStageLabel } from '@/lib/relationshipStage';
import { girlProfileRepository, userProfileRepository } from '@/lib/db';
import type { RelationshipStageLabel } from '@/lib/relationshipStage';

interface Props {
  onNavigate: (page: PageName) => void;
}

const iconForAudience: Record<StageAssessmentCatalogItem['audience'], typeof UserRoundCheck> = {
  self: UserRoundCheck,
  observation: HeartHandshake,
  relationship: ShieldCheck,
};

export function StageQuestionnairePage({ onNavigate }: Props) {
  const [stage, setStage] = useState<RelationshipStageLabel | null>(null);

  useEffect(() => {
    async function loadStage() {
      const user = await userProfileRepository.getCurrent();
      if (!user) return;
      const girl = (await girlProfileRepository.getByUserId(user.id))[0];
      if (girl) setStage(getRelationshipStageLabel(girl));
    }

    loadStage();
  }, []);

  const value = stage === '追求期' ? 'pursuing' : stage === '暧昧观察期' ? 'ambiguous' : stage === '升温期' ? 'warming' : 'observing';
  const catalog = getStageAssessmentCatalog(value);

  return (
    <div style={{ padding: '32px', maxWidth: 820, margin: '0 auto' }} className="page-enter">
      <LiquidButton variant="secondary" onClick={() => onNavigate('profile')} style={{ marginBottom: 24 }}>
        <ArrowLeft size={16} /> 返回资料建档
      </LiquidButton>

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
          <div style={{ marginBottom: 18, fontSize: 15, fontWeight: 700, color: 'var(--text-rose)' }}>追求期的三份观察</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {catalog.items.map((item) => {
              const Icon = iconForAudience[item.audience];
              const isSelfAssessment = item.audience === 'self';
              const isObservationAssessment = item.audience === 'observation';
              const isRelationshipAssessment = item.audience === 'relationship';
              return (
                <GlassCard key={item.audience} hover={false} style={{ display: 'flex', flexDirection: 'column', minHeight: 246 }}>
                  <Icon size={28} color="var(--pink-primary)" />
                  <h2 style={{ margin: '16px 0 8px', fontSize: 18, color: 'var(--text-rose)' }}>{item.title}</h2>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7, flex: 1 }}>{item.description}</p>
                  <p style={{ margin: '16px 0 0', fontSize: 12, color: 'var(--champagne-gold)', lineHeight: 1.6 }}>{item.boundary}</p>
                  {isSelfAssessment ? (
                    <LiquidButton onClick={() => onNavigate('pursuit-self-assessment')} style={{ marginTop: 16, justifyContent: 'center' }}>开始填写</LiquidButton>
                  ) : isObservationAssessment ? (
                    <LiquidButton onClick={() => onNavigate('pursuit-observation-assessment')} style={{ marginTop: 16, justifyContent: 'center' }}>开始填写</LiquidButton>
                  ) : isRelationshipAssessment ? (
                    <LiquidButton onClick={() => onNavigate('pursuit-relationship-assessment')} style={{ marginTop: 16, justifyContent: 'center' }}>开始填写</LiquidButton>
                  ) : (
                    <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-purple)', opacity: 0.62 }}>题库准备中</div>
                  )}
                </GlassCard>
              );
            })}
          </div>
          <div style={{ marginTop: 22, borderRadius: 18, padding: '15px 18px', background: 'rgba(232,116,138,0.08)', border: '1px solid rgba(232,116,138,0.18)', fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            本轮先完成问卷底座和入口。下一步会逐题上线原创题库、作答保存和结果反馈；题目会按具体行为描述，并提供“不确定/不适用”选项。
          </div>
        </>
      ) : (
        <GlassCard hover={false} style={{ textAlign: 'center', padding: '48px 28px' }}>
          <ShieldCheck size={34} color="var(--champagne-gold)" />
          <h2 style={{ margin: '16px 0 8px', fontSize: 20, color: 'var(--text-rose)' }}>{stage ?? '当前阶段'}题库正在准备</h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            现在先开放追求期专项问卷。初识接触期、暧昧观察期和升温期会在各自题库完成后独立上线，不会混用同一套问题。
          </p>
        </GlassCard>
      )}
    </div>
  );
}
