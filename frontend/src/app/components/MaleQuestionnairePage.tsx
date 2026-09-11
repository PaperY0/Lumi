import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, PartyPopper, Lightbulb } from 'lucide-react';
import { GlassCard, LiquidButton, ProgressStepper, StageBadge } from './GlassUI';
import { CountUp } from './CountUp';
import { BlurText } from './BlurText';
import { CoreQuestionnaireQuestion } from './CoreQuestionnaireQuestion';
import { IconBadge } from './IconBadge';
import type { PageName } from './GlassUI';
// ✅ 接入题库
import { maleQuestions, quickStartMaleQuestions, maleDimensionMeta, type MaleDimension } from '@/data/maleQuestions';
import { questionnaireRepository } from '@/lib/db';
import { useUserStore, useUiStore, useSettingsStore } from '@/stores';
import type { MaleQuestionAnswer, MaleQuestionnaireResult } from '@/types/questionnaire';

interface Props { onNavigate: (page: PageName) => void; }

const fullSteps = ['资料建档', '男生问卷', '女生问卷', '阶段问卷', '关系画像'];
const quickStartSteps = ['简单建档', '快速了解', '初始画像'];

// ✅ 计分函数
function computeMaleResult(userPicks: { questionId: string; option: { label: string; score: number; }; dimension: MaleDimension }[]) {
  // 按维度分组求均分
  const dimSum: Record<string, { sum: number; count: number }> = {};
  userPicks.forEach(p => {
    if (!dimSum[p.dimension]) dimSum[p.dimension] = { sum: 0, count: 0 };
    dimSum[p.dimension].sum += p.option.score;
    dimSum[p.dimension].count += 1;
  });
  const typeTags: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  (Object.keys(dimSum) as MaleDimension[]).forEach(dim => {
    const avg = dimSum[dim].sum / dimSum[dim].count;
    const meta = maleDimensionMeta[dim];
    if (avg >= 2) typeTags.push(meta.label);
    else { weaknesses.push(meta.weak); suggestions.push(meta.suggest); }
  });
  // 至少 1 个标签兜底
  if (typeTags.length === 0) typeTags.push('成长进行中');
  return { typeTags, weaknesses, suggestions };
}

export function MaleQuestionnairePage({ onNavigate }: Props) {
  const onboardingCompleted = useSettingsStore((state) => state.onboardingCompleted);
  const isQuickStart = !onboardingCompleted;
  const questions = isQuickStart ? quickStartMaleQuestions : maleQuestions;
  const steps = isQuickStart ? quickStartSteps : fullSteps;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  // ✅ 修复：挂载时加载用户数据
  useEffect(() => {
    console.log('[MaleQuestionnaire] 组件挂载，加载用户数据');
    useUserStore.getState().loadCurrentUser().then(() => {
      const user = useUserStore.getState().currentUser;
      console.log('[MaleQuestionnaire] 用户数据加载完成:', user);
    });
  }, []);

  const handleSelect = (label: string) => {
    setAnswers(prev => ({ ...prev, [current]: label }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(current + 1);
    else setShowResult(true);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  // ✅ 提交逻辑
  const handleFinish = async () => {
    console.log('[MaleQuestionnaire] handleFinish 被调用');

    const ui = useUiStore.getState();
    const user = useUserStore.getState().currentUser;

    console.log('[MaleQuestionnaire] 当前用户:', user);

    if (!user) {
      console.warn('[MaleQuestionnaire] 没有用户信息，中断提交');
      ui.showToast('请先完成资料建档', 'error');
      return;
    }

    try {
      console.log('[MaleQuestionnaire] 开始保存问卷结果...');
      ui.showLoading('保存问卷结果...');

      // 把现有用户答题状态转成 answers
      const userPicks = questions.map((q, i) => {
        const picked = q.options.find(o => o.label === answers[i]) ?? q.options[0];
        return { questionId: q.id, option: { label: picked.label, score: picked.score }, dimension: q.dimension };
      });

      console.log('[MaleQuestionnaire] 用户选择:', userPicks.length, '题');

      const { typeTags, weaknesses, suggestions } = computeMaleResult(userPicks);

      const answerRecords: MaleQuestionAnswer[] = userPicks.map(p => ({
        questionId: p.questionId,
        optionLabel: p.option.label,
        score: p.option.score,
      }));

      const result: Partial<MaleQuestionnaireResult> = {
        userId: user.id,
        answers: answerRecords,
        typeTags,
        weaknesses,
        suggestions,
        completedAt: new Date().toISOString(),
      };

      console.log('[MaleQuestionnaire] 准备保存结果:', result);

      await questionnaireRepository.saveMaleResult(result);

      console.log('[MaleQuestionnaire] 保存成功，显示 toast');

      // ✅ 任务 4：根据 onboardingCompleted 决定跳转
      if (onboardingCompleted) {
        ui.showToast('男生问卷已更新', 'success');
        console.log('🔀 [MaleQuestionnaire] 老用户重做问卷完成，跳转 relationship-portrait');
        onNavigate('relationship-portrait');
      } else {
        ui.showToast('快速了解已完成', 'success');
        console.log('[MaleQuestionnaire] 快速问卷完成，准备生成初始画像');
        onNavigate('relationship-portrait');
      }

      console.log('[MaleQuestionnaire] 跳转调用完成');

    } catch (e) {
      console.error('[MaleQuestionnaire] 保存失败:', e);
      ui.showToast('保存失败：' + (e as Error).message, 'error');
    } finally {
      ui.hideLoading();
      console.log('[MaleQuestionnaire] handleFinish 执行完毕');
    }
  };

  if (showResult) {
    // 计算结果预览（用于显示，不再重复落库）
    const userPicks = questions.map((q, i) => {
      const picked = q.options.find(o => o.label === answers[i]) ?? q.options[0];
      return { questionId: q.id, option: { label: picked.label, score: picked.score }, dimension: q.dimension };
    });
    const { typeTags } = computeMaleResult(userPicks);

    return (
      <div style={{ padding: '32px' }} className="core-questionnaire page-enter">
        <GlassCard hover={false} style={{ marginBottom: 24 }} padding="20px 24px">
          <ProgressStepper steps={steps} current={1} />
        </GlassCard>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <IconBadge icon={PartyPopper} size={56} tone="rose" style={{ margin: '0 auto 16px' }} />
          <BlurText text={isQuickStart ? '快速了解完成！' : '问卷完成！'} startDelay={60} style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-rose)', display: 'block' }} />
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>已回答 <CountUp from={0} to={Object.keys(answers).length} duration={0.9} style={{ color: 'var(--soft-rose)', fontWeight: 600 }} /> / {questions.length} 题</p>
        </div>

        <GlassCard style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>你的沟通类型</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {typeTags.map(t => <StageBadge key={t} stage={t} active />)}
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-rose)', lineHeight: 1.7 }}>
            你不是不会聊天，只是容易把不确定放大。你认真、重视关系，愿意用心对待喜欢的人——这是难得的品质。
          </p>
        </GlassCard>

        <GlassCard style={{ marginBottom: 24, background: 'rgba(245,184,165,0.1)', border: '1px solid rgba(197,149,108,0.2)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Lightbulb size={14} color="var(--champagne-gold)" /> 给你的建议
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            先确认事实，再表达感受。当你不确定时，先做自己的事，而不是反复查看消息。给她空间，也给自己空间。
          </p>
        </GlassCard>

        <div style={{ display: 'flex', gap: 12 }}>
          <LiquidButton variant="secondary" onClick={() => { setShowResult(false); setCurrent(0); }} style={{ flex: 1, justifyContent: 'center' }}>
            重新作答
          </LiquidButton>
          <LiquidButton onClick={handleFinish} style={{ flex: 1, justifyContent: 'center' }}>
            {onboardingCompleted
              ? '保存问卷结果'
              : <>生成初始画像 <ArrowRight size={16} /></>
            }
          </LiquidButton>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const selectedAnswer = answers[current];

  return (
    <CoreQuestionnaireQuestion
      steps={steps}
      step={1}
      title={isQuickStart ? '用 1 分钟了解你的沟通方式' : '深入了解你的沟通方式'}
      subtitle={isQuickStart ? '先回答 6 个核心问题，其他资料可以进入主页后再完善。' : '这不是打分，而是帮你更完整地发现自己的表达习惯。'}
      current={current}
      total={questions.length}
      question={q.text}
      options={q.options}
      selected={selectedAnswer}
      onSelect={handleSelect}
      onPrevious={handlePrev}
      onNext={handleNext}
    />
  );
}
