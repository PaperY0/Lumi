import { describe, expect, it } from 'vitest';
import { buildPursuitRhythmCard } from './pursuitRhythm';

describe('buildPursuitRhythmCard', () => {
  it('shows an incomplete state until the relationship check is saved', () => {
    const card = buildPursuitRhythmCard([]);

    expect(card.status).toBe('incomplete');
    expect(card.title).toContain('还没有完成');
  });

  it('prioritizes a pause result over normal next-step advice', () => {
    const card = buildPursuitRhythmCard([
      { audience: 'relationship', summary: ['需要暂停复盘', '请先停止推进'] },
    ]);

    expect(card.status).toBe('pause');
    expect(card.nextAction).toContain('停止推进');
  });
});
