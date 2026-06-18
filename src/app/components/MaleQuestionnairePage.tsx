import { useState } from 'react';
import { ArrowLeft, ArrowRight, PartyPopper, Lightbulb } from 'lucide-react';
import { GlassCard, LiquidButton, ProgressStepper, StageBadge } from './GlassUI';
import { CountUp } from './CountUp';
import { BlurText } from './BlurText';
import { IconBadge } from './IconBadge';
import type { PageName } from './GlassUI';

interface Props { onNavigate: (page: PageName) => void; }

const steps = ['资料建档', '男生问卷', '女生问卷', '关系画像', '聊天导入'];

const questions = [
  {
    q: '当她回复变慢时，你通常会怎么想？',
    options: [
      { label: 'A', text: '她是不是不想理我了' },
      { label: 'B', text: '可能只是忙，晚点再说' },
      { label: 'C', text: '我会忍不住连续追问' },
      { label: 'D', text: '我会先做自己的事' },
    ],
  },
  {
    q: '你想表达喜欢时，通常会怎么做？',
    options: [
      { label: 'A', text: '直接说出来，不拐弯抹角' },
      { label: 'B', text: '通过行动表达，不太说' },
      { label: 'C', text: '先暗示，看她反应再决定' },
      { label: 'D', text: '一直等待合适时机，但没说' },
    ],
  },
  {
    q: '她发了个模糊的消息，你看不太懂，你会？',
    options: [
      { label: 'A', text: '反复研究，分析各种可能含义' },
      { label: 'B', text: '直接问她什么意思' },
      { label: 'C', text: '随便回一个，看她怎么接' },
      { label: 'D', text: '先放着，等之后再接话题' },
    ],
  },
  {
    q: '发出消息后，你一般多久会查看是否已读？',
    options: [
      { label: 'A', text: '几分钟内就会反复看' },
      { label: 'B', text: '半小时内会看一次' },
      { label: 'C', text: '发完基本不管，等她回' },
      { label: 'D', text: '会看但尽量控制自己' },
    ],
  },
  {
    q: '聊天冷场时你会怎么做？',
    options: [
      { label: 'A', text: '立刻找话题，害怕冷场' },
      { label: 'B', text: '等一等，看她会不会主动' },
      { label: 'C', text: '说"那我先去忙了"，给彼此空间' },
      { label: 'D', text: '把话题切换到更轻松的内容' },
    ],
  },
  {
    q: '你认为关系推进最重要的是？',
    options: [
      { label: 'A', text: '创造仪式感和特别时刻' },
      { label: 'B', text: '持续稳定的日常陪伴' },
      { label: 'C', text: '坦诚地表达自己的感受' },
      { label: 'D', text: '给对方充足的空间和自由' },
    ],
  },
  {
    q: '她说"最近有点累"，你第一反应是？',
    options: [
      { label: 'A', text: '立刻问她发生了什么事' },
      { label: 'B', text: '说"辛苦了，好好休息"' },
      { label: 'C', text: '分享自己也有过类似感受' },
      { label: 'D', text: '问她需不需要帮忙或陪伴' },
    ],
  },
  {
    q: '你在追一个人时最大的恐惧是什么？',
    options: [
      { label: 'A', text: '被明确拒绝，很难堪' },
      { label: 'B', text: '一直不表白，错过机会' },
      { label: 'C', text: '对方只是把我当朋友' },
      { label: 'D', text: '自己说错话，关系变差' },
    ],
  },
  {
    q: '在关系初期，你更倾向于？',
    options: [
      { label: 'A', text: '主动频繁联系，让对方感受到热情' },
      { label: 'B', text: '保持适当距离，不想给压力' },
      { label: 'C', text: '跟随对方节奏，她多聊我多聊' },
      { label: 'D', text: '做自己，不会特意调整节奏' },
    ],
  },
  {
    q: '如果她暂时没有回复你，你觉得大概率是？',
    options: [
      { label: 'A', text: '她不想和我聊，可能要冷静' },
      { label: 'B', text: '她肯定在忙，没什么特别原因' },
      { label: 'C', text: '说不准，要看之前聊天的状态' },
      { label: 'D', text: '我没想太多，等她回就好' },
    ],
  },
];

const resultTags: Record<string, string[]> = {
  A: ['过度分析型', '焦虑敏感型'],
  B: ['稳重等待型', '表达保守型'],
  C: ['冲动行动型', '急于表达型'],
  D: ['情绪稳定型', '独立自主型'],
};

export function MaleQuestionnairePage({ onNavigate }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

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

  const getMostCommonAnswer = () => {
    const counts: Record<string, number> = {};
    Object.values(answers).forEach(a => { counts[a] = (counts[a] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'B';
  };

  if (showResult) {
    const topAnswer = getMostCommonAnswer();
    const tags = resultTags[topAnswer] || resultTags['B'];
    return (
      <div style={{ padding: '32px', maxWidth: 600, margin: '0 auto' }} className="page-enter">
        <GlassCard hover={false} style={{ marginBottom: 24 }} padding="20px 24px">
          <ProgressStepper steps={steps} current={1} />
        </GlassCard>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <IconBadge icon={PartyPopper} size={56} tone="rose" style={{ margin: '0 auto 16px' }} />
          <BlurText text="问卷完成！" startDelay={60} style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-rose)', display: 'block' }} />
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>已回答 <CountUp from={0} to={Object.keys(answers).length} duration={0.9} style={{ color: 'var(--soft-rose)', fontWeight: 600 }} /> / {questions.length} 题</p>
        </div>

        <GlassCard style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>你的沟通类型</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {tags.map(t => <StageBadge key={t} stage={t} active />)}
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
          <LiquidButton onClick={() => onNavigate('female-questionnaire')} style={{ flex: 1, justifyContent: 'center' }}>
            继续：她的观察问卷 <ArrowRight size={16} />
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
        <ProgressStepper steps={steps} current={1} />
      </GlassCard>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <BlurText text="先了解你的沟通方式" startDelay={60} style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-rose)', letterSpacing: '-0.02em', display: 'block' }} />
        <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          这不是打分，而是帮你发现自己的表达习惯。
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>第 {current + 1} / {questions.length} 题</span>
          <span style={{ fontSize: 13, color: 'var(--pink-primary)', fontWeight: 500 }}>{Math.round(((current + 1) / questions.length) * 100)}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 999, background: 'rgba(249,200,213,0.3)', overflow: 'hidden' }}>
          <div style={{ width: `${((current + 1) / questions.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #E8748A, #C5956C)', borderRadius: 999, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Question Card */}
      <GlassCard style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-rose)', lineHeight: 1.5, letterSpacing: '-0.01em' }}>
          {q.q}
        </p>
      </GlassCard>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {q.options.map((opt) => {
          const isSelected = selectedAnswer === opt.label;
          return (
            <div
              key={opt.label}
              className={`option-card ${isSelected ? 'option-card-selected' : ''}`}
              onClick={() => handleSelect(opt.label)}
              style={{
                borderRadius: 20,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 32, height: 32, borderRadius: 999,
                  background: isSelected ? 'linear-gradient(135deg,#E8748A,#C5956C)' : 'rgba(255,245,248,0.7)',
                  border: isSelected ? 'none' : '1px solid rgba(232,116,138,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 13, fontWeight: 600,
                  color: isSelected ? 'white' : 'var(--pink-primary)',
                  transition: 'all 0.2s ease',
                }}
              >
                {opt.label}
              </div>
              <span style={{ fontSize: 14, color: 'var(--text-rose)', lineHeight: 1.5, fontWeight: isSelected ? 500 : 400 }}>
                {opt.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <LiquidButton variant="secondary" onClick={handlePrev} style={{ opacity: current === 0 ? 0.4 : 1 }}>
          <ArrowLeft size={16} /> 上一题
        </LiquidButton>
        <LiquidButton onClick={handleNext} disabled={!selectedAnswer} style={{ opacity: selectedAnswer ? 1 : 0.5 }}>
          {current === questions.length - 1 ? '查看结果' : '下一题'}
          <ArrowRight size={16} />
        </LiquidButton>
      </div>
    </div>
  );
}
