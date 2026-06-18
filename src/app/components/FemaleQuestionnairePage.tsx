import { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle, BarChart3 } from 'lucide-react';
import { GlassCard, LiquidButton, ProgressStepper, WarningNotice } from './GlassUI';
import { CountUp } from './CountUp';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';

interface Props { onNavigate: (page: PageName) => void; }

const steps = ['资料建档', '男生问卷', '女生问卷', '关系画像', '聊天导入'];

const questions = [
  { q: '她是否会主动分享自己的日常生活？', hint: '比如今天吃了什么、发生了什么有趣的事' },
  { q: '她是否接受过你的邀约（线上或线下）？', hint: '哪怕只是聊天、看视频这类轻量邀约' },
  { q: '她是否明确表达过不喜欢的行为或话题？', hint: '比如告诉你某类话题让她不舒服' },
  { q: '她回复慢时，通常是否会解释原因？', hint: '比如说"刚才在忙"或"刚看到"' },
  { q: '她是否主动发起过聊天（而非只回复你）？', hint: '哪怕只是发了个表情或分享一个内容' },
  { q: '她和你聊天时，是否会问起你的生活？', hint: '说明她对你也有一定好奇心' },
  { q: '她是否在你们互动中使用过亲昵的称呼？', hint: '比如你的名字的特别叫法、"哈哈哈"等语气词频繁使用' },
  { q: '她在现实中见面时，是否表现得自然轻松？', hint: '相比聊天时没有明显的紧张或疏远' },
];

const freqOptions = ['经常', '偶尔', '很少', '不确定'];

const freqColors: Record<string, string> = {
  '经常': 'rgba(232,116,138,0.12)',
  '偶尔': 'rgba(212,165,201,0.12)',
  '很少': 'rgba(245,184,165,0.1)',
  '不确定': 'rgba(200,200,220,0.12)',
};

export function FemaleQuestionnairePage({ onNavigate }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (val: string) => setAnswers(prev => ({ ...prev, [current]: val }));

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(current + 1);
    else setShowResult(true);
  };

  const handlePrev = () => { if (current > 0) setCurrent(current - 1); };

  const countPositive = () =>
    Object.values(answers).filter(a => a === '经常' || a === '偶尔').length;
  const countUncertain = () =>
    Object.values(answers).filter(a => a === '不确定').length;

  if (showResult) {
    const positive = countPositive();
    const uncertain = countUncertain();
    const confidence = Math.max(30, 100 - uncertain * 10);

    return (
      <div style={{ padding: '32px', maxWidth: 600, margin: '0 auto' }} className="page-enter">
        <GlassCard hover={false} style={{ marginBottom: 24 }} padding="20px 24px">
          <ProgressStepper steps={steps} current={2} />
        </GlassCard>

        <WarningNotice text="以下结果基于你的观察，不代表对方真实想法的绝对结论。AI 会根据不确定项降低判断置信度。" />

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: 'var(--text-rose)' }}>观察结果概览</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: '积极信号', value: positive, total: 8, color: '#E8748A' },
            { label: '不确定项', value: uncertain, total: 8, color: '#D4A5C9' },
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

        <GlassCard style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
            <BarChart3 size={14} color="var(--soft-rose)" /> 观察汇总
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questions.map((q, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.85, flex: 1, lineHeight: 1.4 }}>{q.q}</span>
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  padding: '3px 10px', borderRadius: 999,
                  background: freqColors[answers[i] || '不确定'],
                  color: answers[i] === '经常' ? 'var(--pink-primary)' : answers[i] === '偶尔' ? '#8B6A9E' : answers[i] === '很少' ? '#B07060' : 'var(--text-purple)',
                  flexShrink: 0,
                }}>
                  {answers[i] || '未答'}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard style={{ marginBottom: 24, background: 'rgba(232,116,138,0.05)', border: '1px solid rgba(232,116,138,0.15)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>💡 AI 初步判断</div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            {positive >= 5
              ? '基于你的观察，她表现出一定程度的互动意愿。建议导入聊天记录获得更精准的分析。'
              : positive >= 3
              ? '互动信号有些混合，可能处于暧昧观察阶段。不要过快推进，保持自然互动更重要。'
              : '目前信号偏少或不确定项较多。AI 置信度较低，建议增加更多自然互动后再分析。'}
          </p>
        </GlassCard>

        <div style={{ display: 'flex', gap: 12 }}>
          <LiquidButton variant="secondary" onClick={() => { setShowResult(false); setCurrent(0); }} style={{ flex: 1, justifyContent: 'center' }}>
            重新填写
          </LiquidButton>
          <LiquidButton onClick={() => onNavigate('relationship-portrait')} style={{ flex: 1, justifyContent: 'center' }}>
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

      <WarningNotice text="这是基于你已知信息的辅助判断，不代表对方真实想法的绝对结论。不确定也是重要答案，AI 会降低判断置信度。" />

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
        <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-rose)', lineHeight: 1.5 }}>{q.q}</p>
        <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--text-purple)', opacity: 0.65, lineHeight: 1.5 }}>{q.hint}</p>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
        {freqOptions.map((opt) => {
          const isSelected = selectedAnswer === opt;
          return (
            <div
              key={opt}
              className={`option-card ${isSelected ? 'option-card-selected' : ''}`}
              onClick={() => handleSelect(opt)}
              style={{
                borderRadius: 20,
                padding: '20px',
                textAlign: 'center',
                background: isSelected ? freqColors[opt] : undefined,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: isSelected ? 600 : 400, color: 'var(--text-rose)' }}>{opt}</div>
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
