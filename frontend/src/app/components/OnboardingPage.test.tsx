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
    expect(screen.getByRole('heading', { level: 1 })).toHaveStyle({ letterSpacing: '0.005em' });
    expect(screen.getByText('在吗？')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('慢慢来，也很好')).toHaveAttribute('aria-hidden', 'true');
  });
});
