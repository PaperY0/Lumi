import { describe, expect, it } from 'vitest';
import { getLoveGuideSources, loveGuideMethodology } from './loveGuideMethodology';

describe('love guide methodology', () => {
  it('resolves only the sources cited by an evidence card', () => {
    const sources = getLoveGuideSources(['warning-signs', 'communication']);
    expect(sources.map((source) => source.id)).toEqual(['warning-signs', 'communication']);
    expect(loveGuideMethodology.boundaries).toContain('单次消息、回复速度或社交动态不能证明喜欢、不喜欢或任何人格结论。');
  });
});
