import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle, BarChart3 } from 'lucide-react';
import { GlassCard, LiquidButton, ProgressStepper, WarningNotice } from './GlassUI';
import { CountUp } from './CountUp';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';
// ✅ 接入题库
import { femaleQuestions, femaleDimensionMeta, inferStage, type FemaleDimension } from '@/data/femaleQuestions';
import { questionnaireRepository } from '@/lib/db';
import { useUserStore, useUiStore } from '@/stores';
import type { FemaleQuestionAnswer, FemaleQuestionnaireResult } from '@/types/questionnaire';

interface Props { onNavigate: (page: PageName) => void; }

const steps = ['资料建档', '男生问卷', '女生问卷', '关系画像', '聊天导入'];

// ✅ 使用题库数据
const questions = femaleQuestions;

// ✅ 计分函数
function computeFemaleResult(userPicks: { questionId: string; option: { label: string; score: number; }; dimension: FemaleDimension }[]) {
  // 按维度分组求均分
  const dimSum: Record<string, { sum: number; count: number }> = {};
  let totalScore = 0;
  userPicks.forEach(p => {
    if (!dimSum[p.dimension]) dimSum[p.dimension] = { sum: 0, count: 0 };
    dimSum[p.dimension].sum += p.option.score;
    dimSum[p.dimension].count += 1;
    totalScore += p.option.score;
  });

  const personalityTags: string[] = [];
  const positiveSignals: string[] = [];
  const cautionSignals: string[] = [];

  (Object.keys(dimSum) as FemaleDimension[]).forEach(dim => {
    const avg = dimSum[dim].sum / dimSum[dim].count;
    const meta = femaleDimensionMeta[dim];
    if (avg >= 2) {
      personalityTags.push(meta.positive);
      positiveSignals.push(meta.positive);
    } else {
      cautionSignals.push(meta.caution);
    }
  });

  const possibleStage = inferStage(totalScore);

  // 根据 cautionSignals 生成建议
  const cautionToSuggestion: Record<string, string> = {
    '被动型': '她较少主动联系，你可以降低期待，保持适度互动而非频繁追问。',
    '情绪封闭': '她不太表达情绪，给她安全感和时间，不要逼问"怎么了"。',
    '边界模糊': '她可能不善于直接拒绝，注意观察非言语信号，避免让她感到压力。',
    '回应较冷': '她回复较慢或字数少，不要把延迟当成态度变化，给她空间。',
    '分享欲弱': '她较少主动分享，可以用开放式问题引导，但不要追问隐私。',
    '回避线下': '她对见面邀约谨慎，可能需要更多线上信任积累，不要急于推进。',
    '回避亲密': '她对亲密话题或接触回避，尊重边界，慢慢建立安全感。',
    '不重仪式': '她不太在意节日仪式感，不要用"她不重视我"来解读。',
    '冲突回避': '她倾向回避冲突，主动表达不满前先建立安全感，让她知道说"不"是被接受的。',
    '低投入度': '她对关系投入较低，可能还在观察阶段，不要过早定义关系或要求承诺。',
  };

  const suggestions: string[] = cautionSignals.map(sig => cautionToSuggestion[sig] || '保持耐心，给彼此更多时间了解。').filter(Boolean);

  // 至少有一条建议
  if (suggestions.length === 0) {
    suggestions.push('关系进展顺利，保持当前节奏，继续真诚互动。');
  }

  return { personalityTags, possibleStage, positiveSignals, cautionSignals, suggestions };
}

export function FemaleQuestionnairePage({ onNavigate }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  // ✅ 修复：挂载时加载用户数据
  useEffect(() => {
    console.log('[FemaleQuestionnaire] 组件挂载，加载用户数据');
    useUserStore.getState().loadCurrentUser().then(() => {
      const user = useUserStore.getState().currentUser;
      console.log('[FemaleQuestionnaire] 用户数据加载完成:', user);
    });
  }, []);

  const handleSelect = (val: string) => setAnswers(prev => ({ ...prev, [current]: val }));

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(current + 1);
    else setShowResult(true);
  };

  const handlePrev = () => { if (current > 0) setCurrent(current - 1); };

  // ✅ 提交逻辑：落库
  const handleFinish = async () => {
    console.log('[FemaleQuestionnaire] handleFinish 被调用');

    const ui = useUiStore.getState();
    const user = useUserStore.getState().currentUser;
    const girl = useUserStore.getState().currentGirl;

    console.log('[FemaleQuestionnaire] 当前用户:', user);
    console.log('[FemaleQuestionnaire] 当前女生:', girl);

    if (!user) {
      console.warn('[FemaleQuestionnaire] 没有用户信息，中断提交');
      ui.showToast('请先完成资料建档', 'error');
      return;
    }

    try {
      console.log('[FemaleQuestionnaire] 开始保存问卷结果...');
      ui.showLoading('保存问卷结果...');

      // 把现有用户答题状态转成 answers
      const userPicks = questions.map((q, i) => {
        const picked = q.options.find(o => o.label === answers[i]) ?? q.options[0];
        return { questionId: q.id, option: { label: picked.label, score: picked.score }, dimension: q.dimension };
      });

      console.log('[FemaleQuestionnaire] 用户选择:', userPicks.length, '题');

      const { personalityTags, possibleStage, positiveSignals, cautionSignals, suggestions } = computeFemaleResult(userPicks);

      console.log('[FemaleQuestionnaire] 计算结果 - possibleStage:', possibleStage);
      console.log('[FemaleQuestionnaire] 计算结果 - personalityTags:', personalityTags);
      console.log('[FemaleQuestionnaire] 计算结果 - positiveSignals:', positiveSignals);
      console.log('[FemaleQuestionnaire] 计算结果 - cautionSignals:', cautionSignals);

      const answerRecords: FemaleQuestionAnswer[] = userPicks.map(p => ({
        questionId: p.questionId,
        optionLabel: p.option.label,
        score: p.option.score,
      }));

      const result: Partial<FemaleQuestionnaireResult> = {
        userId: user.id,
        girlId: girl?.id ?? '',
        answers: answerRecords,
        personalityTags,
        possibleStage,
        positiveSignals,
        cautionSignals,
        suggestions,
        completedAt: new Date().toISOString(),
      };

      console.log('[FemaleQuestionnaire] 准备保存结果:', result);

      await questionnaireRepository.saveFemaleResult(result);

      console.log('[FemaleQuestionnaire] 保存成功，显示 toast');
      ui.showToast('女生问卷已完成', 'success');

      console.log('[FemaleQuestionnaire] 准备跳转到 relationship-portrait');
      onNavigate('relationship-portrait');

      console.log('[FemaleQuestionnaire] 跳转调用完成');

    } catch (e) {
      console.error('[FemaleQuestionnaire] 保存失败:', e);
      ui.showToast('保存失败：' + (e as Error).message, 'error');
    } finally {
      ui.hideLoading();
      console.log('[FemaleQuestionnaire] handleFinish 执行完毕');
    }
  };

  const countPositive = () => {
    // 计算积极信号数量（用于结果预览）
    const userPicks = questions.map((q, i) => {
      const picked = q.options.find(o => o.label === answers[i]) ?? q.options[0];
      return { questionId: q.id, option: { label: picked.label, score: picked.score }, dimension: q.dimension };
    });
    const { positiveSignals } = computeFemaleResult(userPicks);
    return positiveSignals.length;
  };

  const countCaution = () => {
    const userPicks = questions.map((q, i) => {
      const picked = q.options.find(o => o.label === answers[i]) ?? q.options[0];
      return { questionId: q.id, option: { label: picked.label, score: picked.score }, dimension: q.dimension };
    });
    const { cautionSignals } = computeFemaleResult(userPicks);
    return cautionSignals.length;
  };

  if (showResult) {
    const positive = countPositive();
    const caution = countCaution();
    const total = positive + caution;
    const confidence = total > 0 ? Math.round((positive / total) * 100) : 50;

    return (
      <div style={{ padding: '32px', maxWidth: 600, margin: '0 auto' }} className="page-enter">
        <GlassCard hover={false} style={{ marginBottom: 24 }} padding="20px 24px">
          <ProgressStepper steps={steps} current={2} />
        </GlassCard>

        <WarningNotice text="以下结果基于你的观察，不代表对方真实想法的绝对结论。" />

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: 'var(--text-rose)' }}>观察结果概览</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: '积极信号', value: positive, total: 10, color: '#E8748A' },
            { label: '谨慎信号', value: caution, total: 10, color: '#D4A5C9' },
            { label: '判断置信度', value: confidence, color: '#C5956C', noSlash: true },
          ].map(item => (
            <GlassCard key={item.label} padding="16px" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: item.color, lineHeight: 1.1, marginBottom: 4 }}>
                <CountUp from={0} to={item.value} duration={1.1} suffix={item.noSlash ? '%' : `/${item.total}`} style={{ color: item.color }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7 }}>{item.label}</div>
            </GlassCard>
          ))}
        </div>

        <GlassCard style={{ marginBottom: 24, background: 'rgba(232,116,138,0.05)', border: '1px solid rgba(232,116,138,0.15)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>💡 AI 初步判断</div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            {positive >= 6
              ? '基于你的观察，她表现出较强的互动意愿。建议查看关系画像获得更精准的分析。'
              : positive >= 4
              ? '互动信号有些混合，可能处于暧昧观察阶段。不要过快推进，保持自然互动更重要。'
              : '目前信号偏少或谨慎项较多。置信度较低，建议增加更多自然互动后再分析。'}
          </p>
        </GlassCard>

        <div style={{ display: 'flex', gap: 12 }}>
          <LiquidButton variant="secondary" onClick={() => { setShowResult(false); setCurrent(0); }} style={{ flex: 1, justifyContent: 'center' }}>
            重新填写
          </LiquidButton>
          <LiquidButton onClick={handleFinish} style={{ flex: 1, justifyContent: 'center' }}>
            查看关系画像 <ArrowRight size={16} />
          </LiquidButton>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const selectedAnswer = answers[current];

  return (
    <div style={{ padding: '32px', maxWidth: 640, margin: '0 auto' }} className="page-enter">
      <GlassCard hover={false} style={{ marginBottom: 32 }} padding="20px 24px">
        <ProgressStepper steps={steps} current={2} />
      </GlassCard>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <BlurText text="基于观察，了解她的互动方式" startDelay={60} style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-rose)', letterSpacing: '-0.02em', display: 'block' }} />
        <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          请根据真实互动填写，不要猜测过度。
        </p>
      </div>

      <WarningNotice text="这是基于你已知信息的辅助判断，不代表对方真实想法的绝对结论。" />

      <div style={{ marginTop: 24, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>第 {current + 1} / {questions.length} 题</span>
          <span style={{ fontSize: 13, color: 'var(--pink-primary)', fontWeight: 500 }}>{Math.round(((current + 1) / questions.length) * 100)}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 999, background: 'rgba(212,165,201,0.25)', overflow: 'hidden' }}>
          <div style={{
            width: `${((current + 1) / questions.length) * 100}%`, height: '100%',
            background: 'linear-gradient(90deg, #D4A5C9, #E8748A)',
            borderRadius: 999, transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      <GlassCard style={{ marginBottom: 12, marginTop: 20 }}>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-rose)', lineHeight: 1.5 }}>{q.text}</p>
        {q.hint && <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--text-purple)', opacity: 0.65, lineHeight: 1.5 }}>{q.hint}</p>}
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
        {q.options.map((opt) => {
          const isSelected = selectedAnswer === opt.label;
          return (
            <div
              key={opt.label}
              className={`option-card ${isSelected ? 'option-card-selected' : ''}`}
              onClick={() => handleSelect(opt.label)}
              style={{
                borderRadius: 20,
                padding: '20px',
                textAlign: 'center',
                background: isSelected ? 'rgba(232,116,138,0.12)' : undefined,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: isSelected ? 600 : 400, color: 'var(--text-rose)' }}>{opt.text}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <LiquidButton variant="secondary" onClick={handlePrev} style={{ opacity: current === 0 ? 0.4 : 1 }}>
          <ArrowLeft size={16} /> 上一题
        </LiquidButton>
        <LiquidButton onClick={handleNext} disabled={!selectedAnswer} style={{ opacity: selectedAnswer ? 1 : 0.5 }}>
          {current === questions.length - 1 ? '查看结果' : '下一题'} <ArrowRight size={16} />
        </LiquidButton>
      </div>
    </div>
  );
}
