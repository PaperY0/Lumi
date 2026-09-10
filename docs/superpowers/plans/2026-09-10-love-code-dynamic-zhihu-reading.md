# Love Code Dynamic Zhihu Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 根据当前恋爱法典文章的主题、标签和关系阶段，在详情页稳定展示最相关的两条知乎精选内容和推荐原因。

**Architecture:** 新增一个纯本地匹配模块，接收法典文章和精选知乎条目，先限制在映射后的同主题分类，再按共享标签与关系阶段重合排序。详情页只消费模块返回的条目与原因；不触发实时搜索，也不传递任何数据到网络。

**Tech Stack:** React 18、TypeScript、Vitest、Testing Library。

## Global Constraints

- 只使用 `curatedZhihuArticles` 的已审核公开元数据和知乎外链。
- 不调用 `searchZhihu`，不上传用户档案、聊天记录、阅读历史或自定义文章正文。
- 每个详情页最多渲染两条推荐；无标签或阶段匹配时回退为同分类精选。
- 保持 `target="_blank"` 与 `rel="noreferrer"` 的外链安全属性。
- 本任务的所有代码和测试完成后单独提交并推送；不提交 `pnpm-lock.yaml`。

---

### Task 1: 本地匹配器与法典详情接入

**Files:**
- Create: `frontend/src/lib/zhihu/loveCodeRecommendations.ts`
- Create: `frontend/src/lib/zhihu/loveCodeRecommendations.test.ts`
- Modify: `frontend/src/app/components/LoveCodePage.tsx`
- Test: `frontend/src/lib/zhihu/loveCodeRecommendations.test.ts`

**Interfaces:**
- Consumes: `LoveGuideArticle`, `CuratedZhihuArticle`, `LoveGuideCategory`，以及 `zhihuCategoryForLoveGuide` 的分类映射。
- Produces: `getLoveCodeZhihuReadings(article, articles): { items: CuratedZhihuArticle[]; reason: string }`。
- Produces: 详情页的“为什么推荐”文案与最多两张 `ZhihuContentCard`。

- [ ] **Step 1: 写失败测试，描述标签、阶段与兜底排序**

```ts
import { describe, expect, it } from 'vitest';
import { getLoveCodeZhihuReadings } from './loveCodeRecommendations';

const article = {
  id: 'guide-1', category: 'conflict', title: '冲突后如何修复', subtitle: '', summary: '', content: '',
  tags: ['争吵', '修复'], readTimeMinutes: 3, difficulty: '入门' as const, stage: 'ambiguous' as const,
};

const readings = [
  { id: 'same-tags-stage', category: 'repair', tags: ['争吵', '修复'], stages: ['ambiguous'], title: '优先项' },
  { id: 'same-tag', category: 'repair', tags: ['修复'], stages: ['warming'], title: '次优项' },
  { id: 'fallback', category: 'repair', tags: ['道歉'], stages: ['relationship'], title: '兜底项' },
] as any;

describe('getLoveCodeZhihuReadings', () => {
  it('prioritizes shared tags and then matching relationship stage', () => {
    expect(getLoveCodeZhihuReadings(article, readings).items.map((item) => item.id))
      .toEqual(['same-tags-stage', 'same-tag']);
  });

  it('falls back to same-category readings and explains the fallback', () => {
    const result = getLoveCodeZhihuReadings({ ...article, tags: [], stage: undefined }, readings);
    expect(result.items.map((item) => item.id)).toEqual(['same-tags-stage', 'same-tag']);
    expect(result.reason).toMatch(/同一关系主题/);
  });
});
```

- [ ] **Step 2: 运行测试，确认它因模块不存在而失败**

Run: `npm test -- --pool=forks --maxWorkers=1 --no-file-parallelism src/lib/zhihu/loveCodeRecommendations.test.ts`

Expected: FAIL，报错无法解析 `./loveCodeRecommendations`。

- [ ] **Step 3: 实现纯本地匹配函数**

```ts
export function getLoveCodeZhihuReadings(
  article: Pick<LoveGuideArticle, 'category' | 'tags' | 'stage'>,
  articles: readonly CuratedZhihuArticle[],
) {
  const category = zhihuCategoryForLoveGuide(article.category);
  const matches = articles
    .map((item, index) => ({
      item,
      index,
      sharedTags: item.tags.filter((tag) => article.tags.includes(tag)).length,
      stageMatch: Boolean(article.stage && item.stages.includes(article.stage)),
    }))
    .filter(({ item }) => item.category === category)
    .sort((a, b) => b.sharedTags - a.sharedTags || Number(b.stageMatch) - Number(a.stageMatch) || a.index - b.index)
    .slice(0, 2);

  const hasDirectMatch = matches.some(({ sharedTags, stageMatch }) => sharedTags > 0 || stageMatch);
  return {
    items: matches.map(({ item }) => item),
    reason: hasDirectMatch
      ? '这篇法典关注的标签或关系阶段与以下知乎内容相近，因此优先推荐它们。'
      : '这两篇内容与当前法典属于同一关系主题，可作为延伸讨论。',
  };
}
```

- [ ] **Step 4: 将详情页改为消费匹配结果**

```tsx
const relatedZhihuReading = getLoveCodeZhihuReadings(article, curatedZhihuArticles);

{relatedZhihuReading.items.length > 0 && (
  <section aria-label="知乎延伸阅读">
    <h2>知乎延伸阅读</h2>
    <p><strong>为什么推荐：</strong>{relatedZhihuReading.reason}</p>
    <div>
      {relatedZhihuReading.items.map((item) => <ZhihuContentCard key={item.id} item={item} />)}
    </div>
  </section>
)}
```

- [ ] **Step 5: 运行针对性测试，确认通过**

Run: `npm test -- --pool=forks --maxWorkers=1 --no-file-parallelism src/lib/zhihu/loveCodeRecommendations.test.ts`

Expected: PASS，两个排序/兜底测试通过。

- [ ] **Step 6: 运行前端全量验证并进行人工验收**

Run: `npm test -- --pool=forks --maxWorkers=1 --no-file-parallelism`

Run: `npm run type-check`

Run: `npm run build`

Expected: 全部 PASS；构建可保留已有的第三方注释和包体积警告，但不得有 TypeScript 或 Vite 构建错误。

人工验收：打开 `/love-code` 的冲突修复文章，确认“为什么推荐”显示且推荐优先含“争吵/修复”标签的内容；创建或打开无标签的自定义冲突文章，确认仍显示两条同主题兜底内容。

- [ ] **Step 7: 提交并推送**

```bash
git add frontend/src/lib/zhihu/loveCodeRecommendations.ts frontend/src/lib/zhihu/loveCodeRecommendations.test.ts frontend/src/app/components/LoveCodePage.tsx
git commit -m "feat: personalize Love Code Zhihu readings"
git push origin feat/lumi-zhihu-connection
```
