import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GlassCard, LiquidButton } from './GlassUI';
import type { PageName } from './GlassUI';
import { evaluatePursuitSelfAssessment, pursuitSelfQuestions } from '@/data/pursuitSelfQuestions';
import { evaluateInitialContactSelf, initialContactSelfQuestions } from '@/data/initialContactSelfQuestions';
import { evaluateWarmingSelf, warmingSelfQuestions } from '@/data/warmingSelfQuestions';
import { evaluateAmbiguousSelf, ambiguousSelfQuestions } from '@/data/ambiguousSelfQuestions';
import { girlProfileRepository, stageQuestionnaireRepository } from '@/lib/db';
import { useUiStore, useUserStore } from '@/stores';
import { getRelationshipStageLabel, getRelationshipStageValue, type RelationshipStageValue } from '@/lib/relationshipStage';
import { getNextStageAssessment } from '@/lib/stageAssessmentNavigation';

interface Props {
  onNavigate: (page: PageName) => void;
}

export function PursuitSelfAssessmentPage({ onNavigate }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [relationshipStage, setRelationshipStage] = useState<RelationshipStageValue>('observing');

  const questions = relationshipStage === 'observing' ? initialContactSelfQuestions : relationshipStage === 'warming' ? warmingSelfQuestions : relationshipStage === 'ambiguous' ? ambiguousSelfQuestions : pursuitSelfQuestions;
  const result = useMemo(() => relationshipStage === 'observing' ? evaluateInitialContactSelf(answers) : relationshipStage === 'warming' ? evaluateWarmingSelf(answers) : relationshipStage === 'ambiguous' ? evaluateAmbiguousSelf(answers) : evaluatePursuitSelfAssessment(answers), [answers, relationshipStage]);

  useEffect(() => {
    async function loadExistingAnswers() {
      await useUserStore.getState().loadCurrentUser();
      const user = useUserStore.getState().currentUser;
      if (!user) return;
      const girl = (await girlProfileRepository.getByUserId(user.id))[0];
      const stage = girl ? getRelationshipStageValue(getRelationshipStageLabel(girl)) : 'observing';
      setRelationshipStage(stage);
      const existing = await stageQuestionnaireRepository.getLatest(user.id, stage, 'self')
        ?? (stage === 'observing' ? await stageQuestionnaireRepository.getLatest(user.id, 'pursuing', 'self') : undefined);
      if (!existing) return;
      setAnswers(Object.fromEntries(existing.answers.map((answer) => [answer.questionId, answer.optionId])));
    }

    loadExistingAnswers();
  }, []);

  const question = questions[current];
  const selected = answers[question.id];

  const save = async () => {
    const ui = useUiStore.getState();
    const user = useUserStore.getState().currentUser;
    if (!user) {
      ui.showToast('请先完成资料建档', 'error');
      onNavigate('profile');
      return;
    }

    try {
      ui.showLoading('保存问卷结果...');
      const girl = (await girlProfileRepository.getByUserId(user.id))[0];
      await stageQuestionnaireRepository.save({
        userId: user.id,
        girlId: girl?.id,
        relationshipStage,
        audience: 'self',
        answers: questions.map((item) => ({
          questionId: item.id,
          optionId: answers[item.id],
        })),
        summary: [
          ...result.strengths.map((item) => `优势：${item}`),
          ...result.practiceSuggestions.map((item) => `练习：${item}`),
          ...(result.needsPause ? [result.pauseMessage] : []),
        ],
      });
      setSaved(true);
      setSaveMessage('已保存：这份自我理解问卷会用于后续关系画像和 AI 建议。');
      ui.showToast('自我理解问卷已保存', 'success');
    } catch (error) {
      setSaveMessage('保存失败，请稍后重试。');
      ui.showToast(`保存失败：${(error as Error).message}`, 'error');
    } finally {
      ui.hideLoading();
    }
  };

  if (showResult) {
    return (
      <div style={{ padding: '32px', maxWidth: 760, margin: '0 auto' }} className="page-enter">
        <LiquidButton variant="secondary" onClick={() => setShowResult(false)} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} /> 返回题目
        </LiquidButton>
        <h1 style={{ margin: '0 0 10px', fontSize: 28, color: 'var(--text-rose)' }}>{relationshipStage === 'observing' ? '初识接触期自我观察' : relationshipStage === 'warming' ? '升温期自我观察' : relationshipStage === 'ambiguous' ? '暧昧观察期自我观察' : '追求期自我观察'}</h1>
        <p style={{ margin: '0 0 22px', fontSize: 14, color: 'var(--text-purple)', lineHeight: 1.7 }}>
          这不是人格诊断，而是帮助你选择更尊重彼此节奏的下一步。
        </p>

        {result.needsPause && (
          <GlassCard hover={false} style={{ marginBottom: 18, background: 'rgba(255,236,218,0.7)', border: '1px solid rgba(196,160,112,0.35)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <ShieldAlert size={22} color="var(--champagne-gold)" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-rose)', marginBottom: 6 }}>先暂停推进</div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>{result.pauseMessage}</p>
              </div>
            </div>
          </GlassCard>
        )}

        <GlassCard hover={false} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-rose)', marginBottom: 12 }}>你已经具备的资源</div>
          {result.strengths.length > 0 ? result.strengths.map((item) => (
            <div key={item} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 14, color: 'var(--text-purple)' }}><CheckCircle2 size={17} color="#4A9E6A" />{item}</div>
          )) : <p style={{ margin: 0, fontSize: 14, color: 'var(--text-purple)' }}>目前更适合从一项小练习开始，不必急着给自己下结论。</p>}
        </GlassCard>

        <GlassCard hover={false} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-rose)', marginBottom: 12 }}>本阶段可以练习</div>
          {result.practiceSuggestions.map((item) => <p key={item} style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--text-purple)', lineHeight: 1.7 }}>{item}</p>)}
        </GlassCard>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <LiquidButton onClick={save} disabled={saved}>{saved ? '已保存' : '保存我的观察'}</LiquidButton>
          <LiquidButton variant="secondary" onClick={() => onNavigate('stage-questionnaires')}>返回专项问卷</LiquidButton>
          {saved && <LiquidButton onClick={() => onNavigate(getNextStageAssessment('self'))}>下一步：互动观察 <ArrowRight size={16} /></LiquidButton>}
        </div>
        {saveMessage && <p role="status" style={{ margin: '14px 0 0', color: saveMessage.startsWith('已保存') ? '#4A9E6A' : '#C96A6A', fontSize: 13, lineHeight: 1.6 }}>{saveMessage}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: 720, margin: '0 auto' }} className="page-enter">
      <LiquidButton variant="secondary" onClick={() => onNavigate('stage-questionnaires')} style={{ marginBottom: 24 }}>
        <ArrowLeft size={16} /> 返回专项问卷
      </LiquidButton>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 26, color: 'var(--text-rose)' }}>我在关系中的样子</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-purple)', lineHeight: 1.7 }}>{relationshipStage === 'observing' ? '初识接触期自我理解' : relationshipStage === 'warming' ? '升温期自我理解' : relationshipStage === 'ambiguous' ? '暧昧观察期自我理解' : '追求期自我理解'} · 第 {current + 1} / {questions.length} 题</p>
      </div>
      <div style={{ height: 5, borderRadius: 999, overflow: 'hidden', background: 'rgba(232,116,138,0.12)', marginBottom: 24 }}>
          <div style={{ width: `${((current + 1) / questions.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#E8748A,#C5956C)', transition: 'width .25s ease' }} />
      </div>
      <GlassCard hover={false} style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 19, color: 'var(--text-rose)', lineHeight: 1.55 }}>{question.text}</h2>
        {question.hint && <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>{question.hint}</p>}
      </GlassCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          return <button key={option.id} type="button" onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: option.id }))} style={{ borderRadius: 18, border: isSelected ? '1px solid rgba(232,116,138,0.65)' : '1px solid rgba(232,116,138,0.16)', background: isSelected ? 'rgba(232,116,138,0.12)' : 'rgba(255,255,255,0.44)', color: 'var(--text-rose)', padding: '15px 18px', fontSize: 14, textAlign: 'left', cursor: 'pointer', lineHeight: 1.6 }}>{option.text}</button>;
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <LiquidButton variant="secondary" onClick={() => setCurrent((value) => Math.max(0, value - 1))} disabled={current === 0}><ArrowLeft size={16} /> 上一题</LiquidButton>
        <LiquidButton disabled={!selected} onClick={() => current === questions.length - 1 ? setShowResult(true) : setCurrent((value) => value + 1)}>{current === questions.length - 1 ? '查看我的观察' : <>下一题 <ArrowRight size={16} /></>}</LiquidButton>
      </div>
    </div>
  );
}
