import { describe, it, expect } from 'vitest';
import { formatDateTime } from './date';

describe('formatDateTime', () => {
  it('合法 ISO 日期返回非空字符串', () => {
    const result = formatDateTime('2026-06-24T14:30:00');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(5);
  });

  it('非法日期返回原值', () => {
    const result = formatDateTime('not-a-date');
    expect(result).toBe('not-a-date');
  });

  it('空字符串返回空字符串', () => {
    const result = formatDateTime('');
    expect(result).toBe('');
  });

  it('有效日期包含年份', () => {
    const result = formatDateTime('2026-01-15T08:30:00');
    expect(result).toContain('2026');
  });
});
