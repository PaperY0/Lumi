import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ZhihuContentCard } from './ZhihuContentCard';

describe('ZhihuContentCard', () => {
  it('truncates a long live-search excerpt while preserving the source link', () => {
    const longText = '沟通需要在尊重边界的前提下持续练习。'.repeat(30);
    render(<ZhihuContentCard item={{
      title: '长内容', contentType: 'Answer', contentId: 'long-1', contentText: longText,
      url: 'https://www.zhihu.com/question/1', commentCount: 2, voteUpCount: 3,
      authorName: '作者', editTime: 0, authorityLevel: '', rankingScore: 0,
    }} />);

    expect(screen.getByText(/沟通需要在尊重边界/).textContent).toMatch(/…$/);
    expect(screen.queryByText(longText)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '在知乎阅读：长内容' })).toBeInTheDocument();
  });
});
