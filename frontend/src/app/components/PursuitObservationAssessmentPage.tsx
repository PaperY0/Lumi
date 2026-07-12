import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GlassCard, LiquidButton } from './GlassUI';
import type { PageName } from './GlassUI';
import { evaluatePursuitObservation, pursuitObservationQuestions } from '@/data/pursuitObservationQuestions';
import { evaluateInitialContactObservation, initialContactObservationQuestions } from '@/data/initialContactObservationQuestions';
import { evaluateWarmingObservation, warmingObservationQuestions } from '@/data/warmingObservationQuestions';
import { evaluateAmbiguousObservation, ambiguousObservationQuestions } from '@/data/ambiguousObservationQuestions';
import { girlProfileRepository, stageQuestionnaireRepository } from '@/lib/db';
import { useUiStore, useUserStore } from '@/stores';
import { getRelationshipStageLabel, getRelationshipStageValue, type RelationshipStageValue } from '@/lib/relationshipStage';
import { getNextStageAssessment } from '@/lib/stageAssessmentNavigation';

interface Props { onNavigate: (page: PageName) => void; }
type Pick = string;

export function PursuitObservationAssessmentPage({ onNavigate }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Pick>>({});
  const [resultVisible, setResultVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [relationshipStage, setRelationshipStage] = useState<RelationshipStageValue>('observing');
  const questions = relationshipStage === 'observing' ? initialContactObservationQuestions : relationshipStage === 'warming' ? warmingObservationQuestions : relationshipStage === 'ambiguous' ? ambiguousObservationQuestions : pursuitObservationQuestions;
  const question = questions[current];
  const selected = answers[question.id];
  const result = useMemo(() => relationshipStage === 'observing' ? evaluateInitialContactObservation(answers) : relationshipStage === 'warming' ? evaluateWarmingObservation(answers) : relationshipStage === 'ambiguous' ? evaluateAmbiguousObservation(answers) : evaluatePursuitObservation(answers), [answers, relationshipStage]);

  useEffect(() => { (async () => {
    await useUserStore.getState().loadCurrentUser();
    const user = useUserStore.getState().currentUser;
    if (!user) return;
    const girl = (await girlProfileRepository.getByUserId(user.id))[0];
    const stage = girl ? getRelationshipStageValue(getRelationshipStageLabel(girl)) : 'observing';
    setRelationshipStage(stage);
    const existing = await stageQuestionnaireRepository.getLatest(user.id, stage, 'observation', girl?.id)
      ?? (stage === 'observing' ? await stageQuestionnaireRepository.getLatest(user.id, 'pursuing', 'observation', girl?.id) : undefined);
    if (existing) setAnswers(Object.fromEntries(existing.answers.map((item) => [item.questionId, item.optionId])));
  })(); }, []);

  const update = (optionId: string) => setAnswers((previous) => ({ ...previous, [question.id]: optionId }));
  const save = async () => {
    const ui = useUiStore.getState(); const user = useUserStore.getState().currentUser;
    if (!user) { ui.showToast('请先完成资料建档', 'error'); return; }
    try {
      ui.showLoading('保存观察结果...'); const girl = (await girlProfileRepository.getByUserId(user.id))[0];
      await stageQuestionnaireRepository.save({ userId: user.id, girlId: girl?.id, relationshipStage, audience: 'observation', answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })), summary: result.summary });
      setSaved(true); setSaveMessage('已保存：这份互动观察会用于后续关系画像和 AI 建议。'); ui.showToast('互动观察已保存', 'success');
    } catch (error) { setSaveMessage('保存失败，请稍后重试。'); ui.showToast(`保存失败：${(error as Error).message}`, 'error'); } finally { ui.hideLoading(); }
  };

  if (resultVisible) return <div style={{ padding: 32, maxWidth: 760, margin: '0 auto' }} className="page-enter">
    <LiquidButton variant="secondary" onClick={() => setResultVisible(false)} style={{ marginBottom: 24 }}><ArrowLeft size={16} /> 返回题目</LiquidButton>
    <h1 style={{ margin: '0 0 10px', fontSize: 28, color: 'var(--text-rose)' }}>互动观察小结</h1>
    <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--text-purple)', lineHeight: 1.7 }}>以下内容只整理你提供的互动事实，不解释她的内心。</p>
    <GlassCard hover={false} style={{ marginBottom: 16 }}><div style={{ fontWeight: 700, color: 'var(--text-rose)', marginBottom: 12 }}>目前知道什么</div>{result.confirmedSignals.length ? result.confirmedSignals.map((item) => <p key={item} style={{ margin: '0 0 9px', color: 'var(--text-purple)', fontSize: 14 }}><CheckCircle2 size={16} color="#4A9E6A" style={{ verticalAlign: 'middle', marginRight: 7 }} />{item}</p>) : <p style={{ margin: 0, color: 'var(--text-purple)' }}>目前还没有足够的事实。</p>}</GlassCard>
    <GlassCard hover={false} style={{ marginBottom: 22 }}><div style={{ fontWeight: 700, color: 'var(--text-rose)', marginBottom: 12 }}>需要继续观察</div>{result.summary.map((item) => <p key={item} style={{ margin: '0 0 9px', color: 'var(--text-purple)', fontSize: 14, lineHeight: 1.7 }}>{item}</p>)}</GlassCard>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <LiquidButton onClick={save} disabled={saved}>{saved ? '已保存' : '保存互动观察'}</LiquidButton>
      <LiquidButton variant="secondary" onClick={() => onNavigate('stage-questionnaires')}>返回专项问卷</LiquidButton>
      {saved && <LiquidButton onClick={() => onNavigate(getNextStageAssessment('observation'))}>下一步：节奏与边界 <ArrowRight size={16} /></LiquidButton>}
    </div>
    {saveMessage && <p role="status" style={{ margin: '14px 0 0', color: saveMessage.startsWith('已保存') ? '#4A9E6A' : '#C96A6A', fontSize: 13, lineHeight: 1.6 }}>{saveMessage}</p>}
  </div>;

  return <div style={{ padding: 32, maxWidth: 720, margin: '0 auto' }} className="page-enter">
    <LiquidButton variant="secondary" onClick={() => onNavigate('stage-questionnaires')} style={{ marginBottom: 24 }}><ArrowLeft size={16} /> 返回专项问卷</LiquidButton>
    <h1 style={{ margin: 0, fontSize: 26, color: 'var(--text-rose)' }}>她的互动观察</h1><p style={{ margin: '8px 0 20px', color: 'var(--text-purple)' }}>{relationshipStage === 'observing' ? '初识接触期' : relationshipStage === 'warming' ? '升温期' : relationshipStage === 'ambiguous' ? '暧昧观察期' : '追求期'} · 第 {current + 1} / {questions.length} 题 · 只记录真实互动</p>
    <GlassCard hover={false} style={{ marginBottom: 16 }}><h2 style={{ margin: 0, fontSize: 19, color: 'var(--text-rose)', lineHeight: 1.55 }}>{question.text}</h2></GlassCard>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>{question.options.map((option) => <button key={option.id} onClick={() => update(option.id)} style={{ textAlign: 'left', padding: '14px 17px', borderRadius: 18, cursor: 'pointer', border: selected === option.id ? '1px solid rgba(232,116,138,.65)' : '1px solid rgba(232,116,138,.16)', background: selected === option.id ? 'rgba(232,116,138,.12)' : 'rgba(255,255,255,.44)', color: 'var(--text-rose)', fontSize: 14 }}>{option.text}</button>)}</div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><LiquidButton variant="secondary" disabled={current === 0} onClick={() => setCurrent((value) => Math.max(0, value - 1))}><ArrowLeft size={16} /> 上一题</LiquidButton><LiquidButton disabled={!selected} onClick={() => current === questions.length - 1 ? setResultVisible(true) : setCurrent((value) => value + 1)}>{current === questions.length - 1 ? '查看观察小结' : <>下一题 <ArrowRight size={16} /></>}</LiquidButton></div>
  </div>;
}
