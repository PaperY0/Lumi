import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, PauseCircle } from 'lucide-react';
import { GlassCard, LiquidButton } from './GlassUI';
import type { PageName } from './GlassUI';
import { evaluatePursuitRelationship, pursuitRelationshipQuestions } from '@/data/pursuitRelationshipQuestions';
import { evaluateInitialContactRelationship, initialContactRelationshipQuestions } from '@/data/initialContactRelationshipQuestions';
import { evaluateWarmingRelationship, warmingRelationshipQuestions } from '@/data/warmingRelationshipQuestions';
import { girlProfileRepository, stageQuestionnaireRepository } from '@/lib/db';
import { useUiStore, useUserStore } from '@/stores';
import { getRelationshipStageLabel, getRelationshipStageValue, type RelationshipStageValue } from '@/lib/relationshipStage';

interface Props { onNavigate: (page: PageName) => void; }

export function PursuitRelationshipAssessmentPage({ onNavigate }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resultVisible, setResultVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const [relationshipStage, setRelationshipStage] = useState<RelationshipStageValue>('observing');
  const questions = relationshipStage === 'observing' ? initialContactRelationshipQuestions : relationshipStage === 'warming' ? warmingRelationshipQuestions : pursuitRelationshipQuestions;
  const question = questions[current];
  const selected = answers[question.id];
  const result = useMemo(() => relationshipStage === 'observing' ? evaluateInitialContactRelationship(answers) : relationshipStage === 'warming' ? evaluateWarmingRelationship(answers) : evaluatePursuitRelationship(answers), [answers, relationshipStage]);

  useEffect(() => { (async () => {
    await useUserStore.getState().loadCurrentUser();
    const user = useUserStore.getState().currentUser;
    if (!user) return;
    const girl = (await girlProfileRepository.getByUserId(user.id))[0];
    const stage = girl ? getRelationshipStageValue(getRelationshipStageLabel(girl)) : 'observing';
    setRelationshipStage(stage);
    const existing = await stageQuestionnaireRepository.getLatest(user.id, stage, 'relationship')
      ?? (stage === 'observing' ? await stageQuestionnaireRepository.getLatest(user.id, 'pursuing', 'relationship') : undefined);
    if (existing) setAnswers(Object.fromEntries(existing.answers.map((item) => [item.questionId, item.optionId])));
  })(); }, []);

  const save = async () => {
    const ui = useUiStore.getState();
    const user = useUserStore.getState().currentUser;
    if (!user) { ui.showToast('请先完成资料建档', 'error'); return; }
    try {
      ui.showLoading('保存节奏检查...');
      const girl = (await girlProfileRepository.getByUserId(user.id))[0];
      await stageQuestionnaireRepository.save({ userId: user.id, girlId: girl?.id, relationshipStage, audience: 'relationship', answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })), summary: [result.title, result.message] });
      setSaved(true); ui.showToast('关系节奏检查已保存', 'success');
    } catch (error) { ui.showToast(`保存失败：${(error as Error).message}`, 'error'); } finally { ui.hideLoading(); }
  };

  if (resultVisible) return <div style={{ padding: 32, maxWidth: 760, margin: '0 auto' }} className="page-enter">
    <LiquidButton variant="secondary" onClick={() => setResultVisible(false)} style={{ marginBottom: 24 }}><ArrowLeft size={16} /> 返回题目</LiquidButton>
    <h1 style={{ margin: '0 0 10px', fontSize: 28, color: 'var(--text-rose)' }}>关系节奏检查</h1>
    <GlassCard hover={false} style={{ marginBottom: 20, background: result.status === 'pause' ? 'rgba(255,236,218,.72)' : 'rgba(255,245,248,.55)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}><PauseCircle size={24} color={result.status === 'pause' ? 'var(--champagne-gold)' : 'var(--pink-primary)'} /><div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-rose)', marginBottom: 8 }}>{result.title}</div><p style={{ margin: 0, color: 'var(--text-purple)', lineHeight: 1.75, fontSize: 14 }}>{result.message}</p></div></div>
    </GlassCard>
    <GlassCard hover={false} style={{ marginBottom: 24 }}><div style={{ fontWeight: 700, color: 'var(--text-rose)', marginBottom: 10 }}>这不是给你贴标签</div><p style={{ margin: 0, color: 'var(--text-purple)', lineHeight: 1.75, fontSize: 14 }}>结果只反映这次作答里出现的行为倾向。真正重要的是尊重明确拒绝、停止控制和给彼此空间。</p></GlassCard>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><LiquidButton onClick={save} disabled={saved}>{saved ? '已保存' : '保存检查结果'}</LiquidButton><LiquidButton variant="secondary" onClick={() => onNavigate('stage-questionnaires')}>返回专项问卷</LiquidButton></div>
  </div>;

  return <div style={{ padding: 32, maxWidth: 720, margin: '0 auto' }} className="page-enter">
    <LiquidButton variant="secondary" onClick={() => onNavigate('stage-questionnaires')} style={{ marginBottom: 24 }}><ArrowLeft size={16} /> 返回专项问卷</LiquidButton>
    <h1 style={{ margin: 0, fontSize: 26, color: 'var(--text-rose)' }}>关系节奏与边界</h1><p style={{ margin: '8px 0 20px', color: 'var(--text-purple)' }}>{relationshipStage === 'observing' ? '初识接触期' : relationshipStage === 'warming' ? '升温期' : '追求期'} · 第 {current + 1} / {questions.length} 题 · 检查自己的推进方式</p>
    <GlassCard hover={false} style={{ marginBottom: 16 }}><h2 style={{ margin: 0, fontSize: 19, color: 'var(--text-rose)', lineHeight: 1.55 }}>{question.text}</h2></GlassCard>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>{question.options.map((option) => <button key={option.id} onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: option.id }))} style={{ textAlign: 'left', padding: '14px 17px', borderRadius: 18, cursor: 'pointer', border: selected === option.id ? '1px solid rgba(232,116,138,.65)' : '1px solid rgba(232,116,138,.16)', background: selected === option.id ? 'rgba(232,116,138,.12)' : 'rgba(255,255,255,.44)', color: 'var(--text-rose)', fontSize: 14 }}>{option.text}</button>)}</div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><LiquidButton variant="secondary" disabled={current === 0} onClick={() => setCurrent((value) => Math.max(0, value - 1))}><ArrowLeft size={16} /> 上一题</LiquidButton><LiquidButton disabled={!selected} onClick={() => current === questions.length - 1 ? setResultVisible(true) : setCurrent((value) => value + 1)}>{current === questions.length - 1 ? '查看节奏结果' : <>下一题 <ArrowRight size={16} /></>}</LiquidButton></div>
  </div>;
}
