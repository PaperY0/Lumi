import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnboardingPage } from './OnboardingPage';

vi.mock('./HeroScene', () => ({
  HeroScene: () => <div data-testid="hero-scene" />,
}));

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

describe('OnboardingPage hero conversation layer', () => {
  it('renders six decorative callouts around the desktop hero', () => {
    const { container } = render(<OnboardingPage onComplete={vi.fn()} />);

    expect(container.querySelectorAll('.hero-callout')).toHaveLength(6);
    expect(container.querySelectorAll('.hero-spark')).toHaveLength(13);
    expect(container.querySelector('.hero-spark-nine')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.hero-spark-thirteen')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.hero-signal-trail')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.onboarding-ring-top')).not.toBeInTheDocument();
    expect(container.querySelector('.onboarding-ring-bottom')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveStyle({
      fontSize: 'clamp(48px, 5.8vw, 74px)',
      letterSpacing: '0.005em',
    });
    expect(container.querySelector('.onboarding-title-line-first')).toHaveTextContent('让沟通更真诚，');
    expect(container.querySelector('.onboarding-title-line-second')).toHaveTextContent('让靠近更有分寸');
    expect(screen.getByText('读懂关系信号，组织恰当表达，也尊重彼此边界。')).toBeInTheDocument();
    expect(screen.getByText('在吗？')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('慢慢来，也很好')).toHaveAttribute('aria-hidden', 'true');
  });
});
