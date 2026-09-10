import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ZhihuSearchPanel } from './ZhihuSearchPanel';

describe('ZhihuSearchPanel', () => {
  it('shows result metadata and opens Zhihu in a new tab', async () => {
    const user = userEvent.setup();
    render(
      <ZhihuSearchPanel
        search={async () => ({
          hasMore: false,
          searchHashId: 'fixture',
          items: [{
            title: '情侣之间该怎么交流？', contentType: 'Answer', contentId: 'fixture-1',
            contentText: '先确认感受，再讨论方案。', url: 'https://www.zhihu.com/question/21157476',
            commentCount: 3, voteUpCount: 32, authorName: '简单心理', editTime: 0,
            authorityLevel: '', rankingScore: 0,
          }],
        })}
      />,
    );

    await user.type(screen.getByLabelText('搜索知乎内容'), '爱情与交流');
    await user.click(screen.getByRole('button', { name: '搜索' }));

    expect(await screen.findByText('情侣之间该怎么交流？')).toBeInTheDocument();
    expect(screen.getByText('简单心理')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '在知乎阅读：情侣之间该怎么交流？' })).toHaveAttribute('target', '_blank');
  });
});
