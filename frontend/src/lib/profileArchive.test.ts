import { describe, expect, it } from 'vitest';
import { mergeProfileTags } from './profileArchive';

describe('mergeProfileTags', () => {
  it('merges selected tags and comma-separated custom entries without duplicates', () => {
    expect(mergeProfileTags(['音乐', '旅行'], '看展，音乐、手帐')).toEqual([
      '音乐',
      '旅行',
      '看展',
      '手帐',
    ]);
  });

  it('ignores empty custom entries', () => {
    expect(mergeProfileTags([], '  ， 、  ')).toEqual([]);
  });
});
