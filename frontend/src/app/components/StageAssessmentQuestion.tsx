import type { CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { LiquidButton } from './GlassUI';

interface AssessmentOption {
  id: string;
  text: string;
}

interface StageAssessmentQuestionProps {
  title: string;
  eyebrow: string;
  context?: string;
  current: number;
  total: number;
  question: string;
  hint?: string;
  options: AssessmentOption[];
  selected?: string;
  nextLabel: string;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (optionId: string) => void;
}

export function StageAssessmentQuestion({
  title,
  eyebrow,
  context,
  current,
  total,
  question,
  hint,
  options,
  selected,
  nextLabel,
  onBack,
  onPrevious,
  onNext,
  onSelect,
}: StageAssessmentQuestionProps) {
  const progress = ((current + 1) / total) * 100;

  return (
    <main className="stage-assessment page-enter">
      <LiquidButton variant="secondary" onClick={onBack} className="stage-assessment__back">
        <ArrowLeft size={16} aria-hidden="true" /> 返回专项问卷
      </LiquidButton>

      <header className="stage-assessment__header">
        <p className="stage-assessment__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {context && <p className="stage-assessment__context">{context}</p>}
        <div className="stage-assessment__meta">
          <span>第 {current + 1} / {total} 题</span>
          <span aria-hidden="true">{Math.round(progress)}%</span>
        </div>
        <div
          className="stage-assessment__progress"
          role="progressbar"
          aria-label="问卷进度"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={current + 1}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>

      <section className="stage-assessment__question" aria-live="polite">
        <h2>{question}</h2>
        {hint && <p>{hint}</p>}
      </section>

      <fieldset
        className="stage-assessment__options"
        style={{ '--assessment-option-count': options.length } as CSSProperties}
      >
        <legend className="sr-only">请选择最符合你的选项</legend>
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={`stage-assessment__option${isSelected ? ' is-selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(option.id)}
            >
              <span>{option.text}</span>
              <span className="stage-assessment__check" aria-hidden="true">
                {isSelected && <Check size={15} />}
              </span>
            </button>
          );
        })}
      </fieldset>

      <nav className="stage-assessment__actions" aria-label="问卷题目导航">
        <LiquidButton variant="secondary" disabled={current === 0} onClick={onPrevious}>
          <ArrowLeft size={16} aria-hidden="true" /> 上一题
        </LiquidButton>
        <LiquidButton disabled={!selected} onClick={onNext}>
          {nextLabel} <ArrowRight size={16} aria-hidden="true" />
        </LiquidButton>
      </nav>
    </main>
  );
}
