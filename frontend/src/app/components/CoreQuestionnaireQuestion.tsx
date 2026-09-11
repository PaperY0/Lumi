import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LiquidButton, ProgressStepper, WarningNotice } from './GlassUI';

interface CoreQuestionnaireOption {
  label: string;
  text: string;
}

interface CoreQuestionnaireQuestionProps {
  steps: string[];
  step: number;
  title: string;
  subtitle: string;
  notice?: string;
  current: number;
  total: number;
  question: string;
  hint?: string;
  options: CoreQuestionnaireOption[];
  selected?: string;
  onSelect: (label: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function CoreQuestionnaireQuestion({
  steps,
  step,
  title,
  subtitle,
  notice,
  current,
  total,
  question,
  hint,
  options,
  selected,
  onSelect,
  onPrevious,
  onNext,
}: CoreQuestionnaireQuestionProps) {
  const progress = ((current + 1) / total) * 100;

  return (
    <main className="core-questionnaire page-enter">
      <div className="core-questionnaire__stepper">
        <ProgressStepper steps={steps} current={step} />
      </div>

      <header className="core-questionnaire__header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>

      {notice && <div className="core-questionnaire__notice"><WarningNotice text={notice} /></div>}

      <div className="core-questionnaire__progress-meta">
        <span>第 {current + 1} / {total} 题</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div
        className="core-questionnaire__progress"
        role="progressbar"
        aria-label="问卷进度"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <section className="core-questionnaire__question" aria-live="polite">
        <h2>{question}</h2>
        {hint && <p>{hint}</p>}
      </section>

      <fieldset className="core-questionnaire__options">
        <legend className="sr-only">请选择最符合实际的选项</legend>
        {options.map((option) => {
          const isSelected = selected === option.label;
          return (
            <button
              key={option.label}
              type="button"
              className={`core-questionnaire__option${isSelected ? ' is-selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(option.label)}
            >
              <span className="core-questionnaire__option-label" aria-hidden="true">{option.label}</span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </fieldset>

      <nav className="core-questionnaire__actions" aria-label="问卷题目导航">
        <LiquidButton variant="secondary" onClick={onPrevious} disabled={current === 0}>
          <ArrowLeft size={16} aria-hidden="true" /> 上一题
        </LiquidButton>
        <LiquidButton onClick={onNext} disabled={!selected}>
          {current === total - 1 ? '查看结果' : '下一题'}
          <ArrowRight size={16} aria-hidden="true" />
        </LiquidButton>
      </nav>
    </main>
  );
}
