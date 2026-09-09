# Lumi × 知乎恋爱连接库 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Lumi 的静态恋爱法典升级为“内置精选 + 实时知乎搜索 + 场景化延伸阅读 + 沟通习惯自评”的参赛版知识连接产品。

**Architecture:** 后端新增一个受限、可缓存的知乎搜索代理，密钥只保存在 `backend/.env`。前端以独立的知乎内容类型、调用层和展示组件扩展现有恋爱法典；精选内容作为本地数据，实时结果由搜索页和 AI 场景推荐复用。问卷只保存本地自评结果，并将每个维度连接到 Lumi 行动卡和知乎延伸阅读。

**Tech Stack:** React 18、TypeScript、Vite、Vitest、Express、Zod、Dexie/IndexedDB、Node `fetch`、知乎站内搜索 OpenAPI。

## Global Constraints

- 仅实现知乎文档允许的 `GET https://developer.zhihu.com/api/v1/content/zhihu_search`，`Count` 必须限制在 1 至 10。
- `ZHIHU_ACCESS_SECRET` 只存在于 `backend/.env`，不得进入 `frontend/.env.local`、浏览器、日志、测试输出或 Git。
- 不发送聊天原文、用户资料、对方资料、昵称、手机号或其他个人信息给知乎搜索接口；只发送用户主动输入或由固定场景映射得到的关键词。
- 只展示接口返回的标题、摘要、作者、内容类型、公开互动指标、发布时间和原链接；不得复制知乎全文或评论全文。
- 所有 Lumi 原创建议必须强调尊重边界、避免施压，不得判断“对方一定喜欢/不喜欢”或给出心理诊断。
- 新问卷面向所有性别和关系状态，使用“我的行为/感受”或“我们当前互动”的中性表述，允许“暂不确定”。
- 现有本地数据、现有 30 题男生问卷、女生观察问卷、阶段专项问卷和 `pursuing` 兼容逻辑不能被删除或破坏。
- 所有新增 UI 必须有 loading、empty、error 与 success 状态；网络异常时仍可浏览精选内容。

---

## File Structure

| 路径 | 责任 |
| --- | --- |
| `backend/.env.example` | 声明知乎密钥、搜索限流和缓存配置，不放真实值。 |
| `backend/src/services/zhihuSearch.ts` | 关键词规范化、上游请求、公开字段映射、短缓存和错误转换。 |
| `backend/src/services/zhihuSearch.test.ts` | 搜索服务的纯函数、缓存和错误映射测试。 |
| `backend/src/routes/zhihu.ts` | `GET /api/zhihu/search` 的输入校验与响应封装。 |
| `backend/src/routes/zhihu.test.ts` | 路由参数与 HTTP 错误行为测试。 |
| `backend/src/index.ts` | 挂载知乎路由与独立限流器。 |
| `backend/src/middleware/security.ts` | 新增知乎搜索专属限流器与无敏感信息日志摘要。 |
| `frontend/src/types/zhihu.ts` | 共享的搜索、精选、分类和场景推荐类型。 |
| `frontend/src/lib/zhihu/client.ts` | 前端 GET 调用、超时与统一错误对象。 |
| `frontend/src/lib/zhihu/recommendations.ts` | 从 Lumi 场景生成固定、安全的知乎检索词。 |
| `frontend/src/lib/zhihu/*.test.ts` | 客户端、筛选和推荐词的单元测试。 |
| `frontend/src/data/zhihuCuratedArticles.ts` | 人工审核的精选条目、分类、Lumi 推荐理由和真实知乎链接。 |
| `frontend/src/app/components/ZhihuSearchPanel.tsx` | 实时搜索界面及其 loading/error/empty/result 状态。 |
| `frontend/src/app/components/ZhihuContentCard.tsx` | 搜索和精选共用的知乎内容卡片。 |
| `frontend/src/app/components/RelatedZhihuReading.tsx` | AI 结果页复用的延伸阅读模块。 |
| `frontend/src/app/components/LoveCodePage.tsx` | “精选浏览 / 搜索知乎”双入口和详情页链接。 |
| `frontend/src/data/relationshipConnectionQuestions.ts` | 14 道原创沟通习惯自评题和维度行动卡。 |
| `frontend/src/types/relationshipConnection.ts` | 自评题、结果、维度和本地存储类型。 |
| `frontend/src/lib/db/repositories/relationshipConnectionRepo.ts` | 自评结果的 IndexedDB 读写。 |
| `frontend/src/app/components/RelationshipConnectionQuestionnairePage.tsx` | 14 题自评、结果与延伸阅读。 |
| `frontend/src/app/App.tsx`、`frontend/src/app/components/Sidebar.tsx` | 新页面路由与导航入口。 |
| `frontend/e2e/zhihu-connection.spec.ts` | 用户可完成核心参赛 Demo 的端到端冒烟测试。 |

## Task 1: 定义知乎内容契约与纯搜索服务

**Files:**
- Create: `backend/src/services/zhihuSearch.ts`
- Create: `backend/src/services/zhihuSearch.test.ts`
- Modify: `backend/src/schemas/index.ts`

**Interfaces:**
- Consumes: `query: string`、`count: number`、`sortBy?: string`。
- Produces: `searchZhihuContent(input: ZhihuSearchInput): Promise<ZhihuSearchResponse>`。
- Produces: `normalizeZhihuQuery(value: string): string`，供路由与推荐模块复用。

- [ ] **Step 1: 写服务测试，先锁定输入与公开字段边界**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { mapZhihuResponse, normalizeZhihuQuery } from './zhihuSearch.js';

test('normalizeZhihuQuery trims whitespace and rejects empty values', () => {
  assert.equal(normalizeZhihuQuery('  爱情与交流  '), '爱情与交流');
  assert.throws(() => normalizeZhihuQuery('   '), /查询关键词不能为空/);
});

test('mapZhihuResponse keeps only public result fields', () => {
  const result = mapZhihuResponse({
    Code: 0,
    Message: 'success',
    Data: { HasMore: false, SearchHashId: 'hash-1', Items: [{
      Title: '情侣之间该怎么交流？', ContentType: 'Answer', ContentID: '1',
      ContentText: '沟通需要先理解感受。', Url: 'https://www.zhihu.com/question/1',
      CommentCount: 8, VoteUpCount: 61, AuthorName: '简单心理Uni',
      EditTime: 1710000000, AuthorityLevel: '2', RankingScore: 0.98,
      PrivateField: 'must-not-leak',
    }] },
  });
  assert.deepEqual(result.data.items[0], {
    title: '情侣之间该怎么交流？', contentType: 'Answer', contentId: '1',
    contentText: '沟通需要先理解感受。', url: 'https://www.zhihu.com/question/1',
    commentCount: 8, voteUpCount: 61, authorName: '简单心理Uni',
    editTime: 1710000000, authorityLevel: '2', rankingScore: 0.98,
  });
});
```

- [ ] **Step 2: 运行测试，确认当前失败**

Run: `pnpm --filter lumi-server exec tsx --test src/services/zhihuSearch.test.ts`

Expected: FAIL，提示无法导入 `./zhihuSearch.js` 或导出函数不存在。

- [ ] **Step 3: 实现输入、缓存和字段映射**

```ts
export interface ZhihuSearchInput {
  query: string;
  count: number;
  sortBy?: string;
}

export function normalizeZhihuQuery(value: string): string {
  const query = value.trim().replace(/\s+/g, ' ');
  if (!query) throw new Error('查询关键词不能为空');
  return query;
}

export function clampZhihuCount(value: number): number {
  return Math.min(10, Math.max(1, Math.trunc(value)));
}
```

实现 `mapZhihuResponse`，显式创建返回对象，绝不使用 `...item` 扩散上游对象；缓存键固定为 `${query}\u0000${count}\u0000${sortBy ?? ''}`，TTL 固定 10 分钟。上游密钥缺失时抛出 `ZHIHU_NOT_CONFIGURED`；HTTP 401/403 映射为 `ZHIHU_AUTH_FAILED`，429 映射为 `ZHIHU_RATE_LIMITED`，其余非 2xx 映射为 `ZHIHU_UPSTREAM_FAILED`。

- [ ] **Step 4: 在 `schemas/index.ts` 中添加响应 Schema**

```ts
export const ZhihuSearchItemSchema = z.object({
  title: z.string(), contentType: z.string(), contentId: z.string(),
  contentText: z.string(), url: z.string().url(), commentCount: z.number().int(),
  voteUpCount: z.number().int(), authorName: z.string(), editTime: z.number().int(),
  authorityLevel: z.string(), rankingScore: z.number(),
});

export const ZhihuSearchResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ hasMore: z.boolean(), searchHashId: z.string(), items: z.array(ZhihuSearchItemSchema), emptyReason: z.string().optional() }),
});
```

- [ ] **Step 5: 运行服务测试与后端构建**

Run: `pnpm --filter lumi-server exec tsx --test src/services/zhihuSearch.test.ts`

Expected: PASS。

Run: `pnpm --filter lumi-server build`

Expected: TypeScript 编译成功。

## Task 2: 暴露受保护的知乎搜索 API

**Files:**
- Create: `backend/src/routes/zhihu.ts`
- Create: `backend/src/routes/zhihu.test.ts`
- Modify: `backend/src/index.ts`
- Modify: `backend/src/middleware/security.ts`
- Modify: `backend/.env.example`

**Interfaces:**
- Consumes: `GET /api/zhihu/search?query=<string>&count=<1..10>&sortBy=<optional>`。
- Produces: `200 { success: true, data: ZhihuSearchData }` 或统一的 `{ success: false, error, message }`。

- [ ] **Step 1: 写路由参数与不泄露隐私的失败测试**

```ts
test('route rejects an empty query before calling the upstream', async () => {
  const response = await request(app).get('/api/zhihu/search?query=%20%20');
  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'ZHIHU_INVALID_QUERY');
});

test('route clamps count to the documented maximum', async () => {
  const response = await request(app).get('/api/zhihu/search?query=爱情与交流&count=50');
  assert.equal(response.status, 200);
  assert.equal(searchStub.lastInput.count, 10);
});
```

如果当前工程没有 HTTP 测试工具，先以 Express `Router` 抽取 `parseZhihuSearchQuery(req.query)`，用 Node `assert` 测试该纯函数；不要为了一个路由测试引入整套新依赖。

- [ ] **Step 2: 运行测试，确认当前失败**

Run: `pnpm --filter lumi-server exec tsx --test src/routes/zhihu.test.ts`

Expected: FAIL，提示 `zhihu.ts` 不存在。

- [ ] **Step 3: 实现路由和独立限流**

路由只能读取 `query`、`count`、`sortBy`。日志只记录 `{ queryLength, count, hasSortBy }`，不得记录关键词本身、Authorization header 或上游响应全文。

在 `security.ts` 添加：

```ts
export const zhihuSearchRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: numberFromEnv('ZHIHU_SEARCH_RATE_LIMIT_MAX', 12),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'ZHIHU_RATE_LIMITED', message: '知乎搜索过于频繁，请稍后再试' },
});
```

在 `index.ts` 中于 AI 路由之前挂载：

```ts
app.use('/api/zhihu', zhihuSearchRateLimiter, zhihuRouter);
```

在 `.env.example` 添加且只添加占位配置：

```dotenv
ZHIHU_ACCESS_SECRET=
ZHIHU_SEARCH_RATE_LIMIT_MAX=12
```

- [ ] **Step 4: 运行路由测试和构建**

Run: `pnpm --filter lumi-server exec tsx --test src/routes/zhihu.test.ts`

Expected: PASS。

Run: `pnpm --filter lumi-server build`

Expected: PASS，且 `rg -n "ZHIHU_ACCESS_SECRET" frontend` 无输出。

## Task 3: 建立前端知乎内容模型与调用层

**Files:**
- Create: `frontend/src/types/zhihu.ts`
- Create: `frontend/src/lib/zhihu/client.ts`
- Create: `frontend/src/lib/zhihu/client.test.ts`
- Modify: `frontend/src/types/index.ts`

**Interfaces:**
- Produces: `searchZhihu(input: ZhihuSearchRequest): Promise<ZhihuSearchData>`。
- Produces: `ZhihuCategory`、`ZhihuSearchItem`、`CuratedZhihuArticle`。

- [ ] **Step 1: 写 GET 编码与错误映射测试**

```ts
import { describe, expect, it, vi } from 'vitest';
import { searchZhihu } from './client';

it('URL-encodes Chinese queries and returns parsed data', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    success: true, data: { hasMore: false, searchHashId: 'hash', items: [] },
  }), { status: 200 })));
  await searchZhihu({ query: '爱情与交流', count: 5 });
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('query=%E7%88%B1%E6%83%85'), expect.any(Object));
});
```

- [ ] **Step 2: 运行测试，确认当前失败**

Run: `pnpm --filter @figma/my-make-file test -- src/lib/zhihu/client.test.ts`

Expected: FAIL，提示目标模块不存在。

- [ ] **Step 3: 定义类型与客户端**

`ZhihuCategory` 固定为：`science`、`communication`、`action`、`realQuestion`、`repair`、`boundaries`、`interestConnection`。`CuratedZhihuArticle` 必须包含 `id`、`zhihuContentId`、`category`、`title`、`summary`、`contentType`、`authorName`、`voteUpCount`、`commentCount`、`url`、`tags`、`lumiReason`、`stages`。

客户端使用 `AI_API_BASE`，通过 `URLSearchParams` 生成 GET URL，20 秒超时；把 400、401/403、429、5xx、网络超时转换为可展示的中文错误。客户端不接受、也不传入用户画像或聊天正文。

- [ ] **Step 4: 运行前端单测与类型检查**

Run: `pnpm --filter @figma/my-make-file test -- src/lib/zhihu/client.test.ts`

Expected: PASS。

Run: `pnpm --filter @figma/my-make-file type-check`

Expected: PASS。

## Task 4: 建立人工精选的知乎内容库

**Files:**
- Create: `frontend/src/data/zhihuCuratedArticles.ts`
- Create: `frontend/src/data/zhihuCuratedArticles.test.ts`

**Interfaces:**
- Produces: `curatedZhihuArticles: readonly CuratedZhihuArticle[]`。
- Produces: `zhihuCategories`，供法典页与搜索过滤共用。

- [ ] **Step 1: 写精选数据完整性测试**

```ts
it('has at least three reviewed articles in every category', () => {
  for (const category of zhihuCategories) {
    expect(curatedZhihuArticles.filter((item) => item.category === category.key)).toHaveLength(3);
  }
});

it('keeps external sources distinct from Lumi commentary', () => {
  for (const item of curatedZhihuArticles) {
    expect(item.url).toMatch(/^https:\/\/(www\.)?zhihu\.com|^https:\/\/zhuanlan\.zhihu\.com/);
    expect(item.lumiReason.length).toBeGreaterThan(12);
  }
});
```

- [ ] **Step 2: 运行测试，确认当前失败**

Run: `pnpm --filter @figma/my-make-file test -- src/data/zhihuCuratedArticles.test.ts`

Expected: FAIL，提示数据模块不存在。

- [ ] **Step 3: 收集、审核并录入 21 条内容**

每类用固定关键词实际调用新后端一次，再人工选择 3 条。首批检索词依次为：`亲密关系 安全感`、`情侣交流 有效沟通`、`恋爱沟通技巧`、`对方冷淡 怎么办`、`情侣吵架 道歉`、`恋爱边界 尊重拒绝`、`情侣共同爱好`。

每条入库前核验：接口链接可打开、标题与摘要对应、没有营销/导流主体、没有歧视/操控/侵犯边界导向。至少包含已验证的“情侣之间该怎么交流？”、“恋爱中的精神交流有多重要？”、“情感交流不仅是聊天”和“情侣深度沟通的 30 个话题”。

每条 `lumiReason` 只写 1 至 2 句原创说明，例如：“适合正在练习先确认感受、再讨论方案的用户；它帮助区分交流和单纯消息往来。”

- [ ] **Step 4: 运行数据测试**

Run: `pnpm --filter @figma/my-make-file test -- src/data/zhihuCuratedArticles.test.ts`

Expected: PASS，7 类各 3 条，总数 21 条。

## Task 5: 改造恋爱法典为双入口连接库

**Files:**
- Create: `frontend/src/app/components/ZhihuContentCard.tsx`
- Create: `frontend/src/app/components/ZhihuSearchPanel.tsx`
- Create: `frontend/src/app/components/ZhihuSearchPanel.test.tsx`
- Modify: `frontend/src/app/components/LoveCodePage.tsx`
- Modify: `frontend/src/types/loveGuide.ts`

**Interfaces:**
- Consumes: `CuratedZhihuArticle | ZhihuSearchItem`。
- Produces: “精选浏览 / 搜索知乎”切换、结果卡、外链和可访问状态。

- [ ] **Step 1: 写搜索面板行为测试**

```tsx
it('shows result metadata and opens Zhihu in a new tab', async () => {
  render(<ZhihuSearchPanel search={async () => fixture} />);
  await userEvent.type(screen.getByLabelText('搜索知乎内容'), '爱情与交流');
  await userEvent.click(screen.getByRole('button', { name: '搜索' }));
  expect(await screen.findByText('情侣之间该怎么交流？')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '去知乎阅读完整讨论' })).toHaveAttribute('target', '_blank');
});
```

- [ ] **Step 2: 运行测试，确认当前失败**

Run: `pnpm --filter @figma/my-make-file test -- src/app/components/ZhihuSearchPanel.test.tsx`

Expected: FAIL，提示组件不存在。

- [ ] **Step 3: 实现可复用卡片和搜索面板**

卡片固定展示：`来自知乎`、内容类型、标题、摘要、作者、赞同、评论、Lumi 推荐理由（仅精选有）、“去知乎阅读完整讨论”。外链必须使用：

```tsx
<a href={item.url} target="_blank" rel="noreferrer" aria-label={`在知乎阅读：${item.title}`}>
  去知乎阅读完整讨论
</a>
```

搜索面板初始状态展示 4 个热门词：`爱情与交流`、`情侣有效沟通`、`对方冷淡怎么办`、`恋爱边界`。提交后显示加载骨架；空结果显示“没有找到结果，试试换一个更具体的问题”；错误显示后端返回的安全消息和“重试”按钮。

- [ ] **Step 4: 在 `LoveCodePage.tsx` 中加入双入口**

用已有的按钮风格切换 `curated` 与 `search` 模式。精选模式保留旧的 Lumi 原创法典，并增加“知乎精选”区域；搜索模式只显示知乎检索，不把搜索结果写入默认法典或 IndexedDB。详情页在 Lumi 内容后展示一个“知乎延伸阅读”分区。

- [ ] **Step 5: 运行组件测试、类型检查和构建**

Run: `pnpm --filter @figma/my-make-file test -- src/app/components/ZhihuSearchPanel.test.tsx`

Run: `pnpm --filter @figma/my-make-file type-check`

Run: `pnpm --filter @figma/my-make-file build`

Expected: 全部 PASS。

## Task 6: 将知乎阅读连接到 AI 三个场景

**Files:**
- Create: `frontend/src/lib/zhihu/recommendations.ts`
- Create: `frontend/src/lib/zhihu/recommendations.test.ts`
- Create: `frontend/src/app/components/RelatedZhihuReading.tsx`
- Modify: `frontend/src/app/components/AIAnalysisPage.tsx`
- Modify: `frontend/src/app/components/ReplyAssistPage.tsx`
- Modify: `frontend/src/app/components/SimulationPage.tsx`

**Interfaces:**
- Produces: `buildZhihuRecommendation(input): ZhihuRecommendation`，只生成固定关键词与原创原因。
- Produces: `RelatedZhihuReading`，最多显示 3 条推荐。

- [ ] **Step 1: 写场景映射测试**

```ts
it('maps a low-pressure reply scenario to communication reading', () => {
  expect(buildZhihuRecommendation({ kind: 'reply', scene: 'daily_chat', userMessage: '今天有点累，不太想说话' }))
    .toMatchObject({ query: '情侣交流 有效沟通', reason: expect.stringMatching(/降低压力|理解感受/) });
});

it('never puts user chat text into the search query', () => {
  const input = '这是仅用于测试的私人聊天内容';
  expect(buildZhihuRecommendation({ kind: 'reply', scene: 'daily_chat', userMessage: input }).query).not.toContain(input);
});
```

- [ ] **Step 2: 运行测试，确认当前失败**

Run: `pnpm --filter @figma/my-make-file test -- src/lib/zhihu/recommendations.test.ts`

Expected: FAIL，提示映射模块不存在。

- [ ] **Step 3: 实现场景白名单映射**

映射只能使用常量：

```ts
const QUERY_BY_SCENE = {
  reply_low_pressure: '情侣交流 有效沟通',
  conflict_repair: '情侣吵架 道歉 修复关系',
  boundary_respect: '恋爱边界 尊重拒绝',
  interaction_cooling: '回复慢 安全感 恋爱焦虑',
  interest_connection: '情侣共同爱好 约会话题',
} as const;
```

不得将 `userMessage`、`recentMessages`、昵称或对方资料拼入关键词。组件请求失败时显示精选的同分类 2 条内容，不中断 AI 主结果。

- [ ] **Step 4: 在三个结果页安装模块**

AI 分析和回复建议显示最多 3 条；模拟反馈显示最多 2 条。模块只在 AI 结果成功后出现，标题统一为“延伸阅读 · 来自知乎”，并始终显示“为什么推荐这些内容”。

- [ ] **Step 5: 运行单测与前端全量测试**

Run: `pnpm --filter @figma/my-make-file test -- src/lib/zhihu/recommendations.test.ts`

Run: `pnpm --filter @figma/my-make-file test`

Expected: PASS。

## Task 7: 新增 14 题“关系连接与沟通习惯”自评

**Files:**
- Create: `frontend/src/types/relationshipConnection.ts`
- Create: `frontend/src/data/relationshipConnectionQuestions.ts`
- Create: `frontend/src/data/relationshipConnectionQuestions.test.ts`
- Create: `frontend/src/lib/db/repositories/relationshipConnectionRepo.ts`
- Create: `frontend/src/lib/db/repositories/relationshipConnectionRepo.test.ts`
- Create: `frontend/src/app/components/RelationshipConnectionQuestionnairePage.tsx`
- Modify: `frontend/src/lib/db/database.ts`
- Modify: `frontend/src/lib/db/repositories/index.ts`
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/app/components/Sidebar.tsx`

**Interfaces:**
- Produces: `RelationshipConnectionResult`，字段为 `id`、`userId`、`girlId?`、`answers`、`dimensionScores`、`createdAt`。
- Produces: `calculateRelationshipConnectionResult(answers)`，只输出 7 维趋势与行动卡，不输出人格或关系成败标签。

- [ ] **Step 1: 写题库完整性与结果边界测试**

```ts
it('contains exactly two neutral questions for each of seven dimensions', () => {
  expect(relationshipConnectionQuestions).toHaveLength(14);
  expect(new Set(relationshipConnectionQuestions.map((q) => q.dimension))).toEqual(new Set([
    'interestConnection', 'mutualKnowing', 'listening', 'repair', 'uncertainty', 'boundaries', 'relationshipExperience',
  ]));
});

it('returns an action card instead of a diagnosis label', () => {
  const result = calculateRelationshipConnectionResult(lowBoundaryAnswers);
  expect(result.dimensionScores.boundaries.action).toMatch(/选择|拒绝|压力/);
  expect(JSON.stringify(result)).not.toMatch(/焦虑型|回避型|适合|不适合/);
});
```

- [ ] **Step 2: 运行测试，确认当前失败**

Run: `pnpm --filter @figma/my-make-file test -- src/data/relationshipConnectionQuestions.test.ts`

Expected: FAIL，提示题库模块不存在。

- [ ] **Step 3: 实现 14 道原创题与结果计算**

每维度 2 道、5 点选项加“暂不确定”。必须包含以下 7 道代表题，另 7 道为同维度补充题：

```ts
{ id: 'interest-1', dimension: 'interestConnection', text: '我能说出至少一件我们都愿意一起做的事。' }
{ id: 'knowing-1', dimension: 'mutualKnowing', text: '我们会聊彼此最近在意的事情，而不只交换日常安排。' }
{ id: 'listening-1', dimension: 'listening', text: '对方表达烦恼时，我通常先确认感受，再给建议。' }
{ id: 'repair-1', dimension: 'repair', text: '发生分歧后，我能提出一个双方都能接受的继续沟通时间。' }
{ id: 'uncertainty-1', dimension: 'uncertainty', text: '对方暂时没回复时，我能先继续自己的安排，而不是连续追问。' }
{ id: 'boundary-1', dimension: 'boundaries', text: '对方拒绝邀约或话题时，我能不要求立刻解释原因。' }
{ id: 'experience-1', dimension: 'relationshipExperience', text: '在这段关系里，我大多数时候能坦诚表达而不担心被嘲笑。' }
```

结果卡固定结构：`当前观察`、`一个小行动`、`知乎检索词`。例如边界维度较低时使用行动“把‘你为什么不回我’改写为‘你方便时再回复就好’”，搜索词固定为“恋爱边界 尊重拒绝”。

- [ ] **Step 4: 增加本地表与 Repository**

将 Dexie 升级到 v8：

```ts
this.version(8).stores({
  relationshipConnectionResults: 'id, userId, girlId, createdAt',
});
```

Repository 提供 `save(result)`、`getLatestByUserId(userId)` 和 `listByUserId(userId)`；不得上传到后端。

- [ ] **Step 5: 实现页面与导航**

页面顶部明确说明“这是沟通习惯自评，不是心理诊断或关系判决”。完成后显示 7 张维度卡；每张卡有“去知乎延伸阅读”按钮，使用 Task 6 的固定关键词，不传回答原文。将路由命名为 `/relationship-connection`，侧栏文案为“沟通连接自评”。

- [ ] **Step 6: 运行题库、Repository、类型与构建检查**

Run: `pnpm --filter @figma/my-make-file test -- src/data/relationshipConnectionQuestions.test.ts src/lib/db/repositories/relationshipConnectionRepo.test.ts`

Run: `pnpm --filter @figma/my-make-file type-check`

Run: `pnpm --filter @figma/my-make-file build`

Expected: 全部 PASS。

## Task 8: 参赛 Demo、端到端验证与安全审查

**Files:**
- Create: `frontend/e2e/zhihu-connection.spec.ts`
- Create: `docs/zhihu-competition-demo.md`
- Modify: `README.md`

**Interfaces:**
- Produces: 可重复执行的本地 Demo 路径和环境配置说明。

- [ ] **Step 1: 写 Playwright 冒烟测试**

```ts
test('searches Zhihu, opens reading, and completes the connection questionnaire', async ({ page }) => {
  await page.goto('/love-code');
  await page.getByRole('button', { name: '搜索知乎' }).click();
  await page.getByLabel('搜索知乎内容').fill('爱情与交流');
  await page.getByRole('button', { name: '搜索' }).click();
  await expect(page.getByText('来自知乎').first()).toBeVisible();
  await expect(page.getByRole('link', { name: /在知乎阅读/ }).first()).toHaveAttribute('target', '_blank');
  await page.goto('/relationship-connection');
  await page.getByRole('button', { name: '开始自评' }).click();
  await page.getByLabel('很符合').first().check();
  await expect(page.getByText('这是沟通习惯自评，不是心理诊断或关系判决')).toBeVisible();
});
```

- [ ] **Step 2: 配置可控的 E2E 搜索替身**

Playwright 使用本地固定的知乎成功响应 fixture，不使用真实密钥、不访问生产接口。验证卡片数据、错误降级与外链属性；真实接口只在人工验收时调用一次。

- [ ] **Step 3: 编写 Demo 文档**

`docs/zhihu-competition-demo.md` 固定为 7 步：进入精选库、查看“情侣之间该怎么交流？”、实时搜索“爱情与交流”、输入低压力回复场景、查看延伸阅读、完成沟通连接自评、总结“用户—知乎知识—练习”的连接价值。文档同时写明填写 `backend/.env` 的 `ZHIHU_ACCESS_SECRET`，但不得包含真实值。

- [ ] **Step 4: 更新 README 的启动与安全说明**

在现有环境配置节新增 `ZHIHU_ACCESS_SECRET`；新增“知乎内容使用规则”：只展示接口允许的元数据和外链、不转发用户聊天/个人信息、网络失败时精选内容可用。

- [ ] **Step 5: 运行完整验证**

Run: `pnpm --filter lumi-server build`

Run: `pnpm --filter @figma/my-make-file test`

Run: `pnpm --filter @figma/my-make-file type-check`

Run: `pnpm --filter @figma/my-make-file build`

Run: `pnpm --filter @figma/my-make-file e2e -- zhihu-connection.spec.ts`

Expected: 全部 PASS。

- [ ] **Step 6: 人工真实接口验收**

在只含本地密钥的 `backend/.env` 中配置后，启动前后端，搜索“爱情与交流”。检查：返回最多 10 条、没有密钥出现在 DevTools/日志、每条链接打开知乎、关闭网络后精选内容仍可访问、AI 页面延伸阅读不包含聊天原文。

## Delivery Order

1. 任务 1 与任务 2先完成，保证密钥、字段和接口边界正确。
2. 任务 3与任务 4完成后，先验收数据质量和内容来源，再开始 UI。
3. 任务 5完成可形成“精选 + 实时搜索”的最小参赛闭环。
4. 任务 6和任务 7补齐“AI 结果到知识、知识到练习”的产品故事。
5. 任务 8只在功能和单测稳定后进行，以固定 fixture 保证 Demo 可复现。

## Spec Coverage Review

- 双层内容：任务 4、5。
- 后端密钥、缓存、限流、错误降级：任务 1、2。
- 7 类分类与 21 条人工精选：任务 3、4。
- AI 三页的延伸阅读：任务 6。
- 14 题问卷、行动卡、知乎关联和本地优先：任务 7。
- 不复制全文、保护隐私、边界友好与参赛 Demo：全局约束、任务 5、6、8。

实施时应先运行每项的失败测试，再实现最小代码使其通过；此项目当前工作区存在未提交改动，必须在独立分支或确认过的工作树中执行，不能覆盖现有变更。
