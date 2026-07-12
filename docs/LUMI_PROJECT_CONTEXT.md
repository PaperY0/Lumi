# Lumi 恋语项目上下文

更新时间：2026-07-11

## 产品定位

Lumi 恋语是本地优先的 AI 恋爱沟通陪伴工具。当前产品重点是恋爱前的追求期总模式，追求期不是一个独立可选阶段，而是由以下三个阶段组成：

1. 初识接触期：保持礼貌距离、建立舒适感、留下可靠的第一印象。
2. 升温期：观察双向投入，进行轻量试探，但保留拒绝空间。
3. 暧昧观察期：识别长期模糊、确认双方期待、降低内耗并及时止损。

恋爱期内容暂不纳入当前版本，后续单独设计。

## 当前主要能力

- React + Vite + TypeScript 前端，Express 后端。
- Zustand 管理用户、设置和分析状态。
- Dexie/IndexedDB 保存用户资料、女生资料、男女问卷、阶段专项问卷、聊天记录和分析历史。
- 前端路由已经接入，主要页面有独立 URL。
- MinerU v4 图片解析已接入后端入口 `POST /api/mineru/parse-image-chat`。
- 后端具备基础 CORS、请求 ID、限流和日志脱敏能力。
- 当前阶段专项问卷已经有初识接触期、升温期、暧昧观察期三套题库。
- 每个阶段有三类专项问卷：我的相处方式、她的互动观察、关系节奏与边界。
- AI 分析会参考双方资料、男女问卷、阶段问卷和聊天记录。

## 当前相关代码入口

- 应用守卫与页面路由：`frontend/src/app/App.tsx`
- 欢迎页：`frontend/src/app/components/OnboardingPage.tsx`
- 资料建档：`frontend/src/app/components/ProfileSetupPage.tsx`
- 男生问卷：`frontend/src/app/components/MaleQuestionnairePage.tsx`
- 女生问卷：`frontend/src/app/components/FemaleQuestionnairePage.tsx`
- 阶段问卷总览：`frontend/src/app/components/StageQuestionnairePage.tsx`
- 三个阶段专项问卷：
  - `frontend/src/app/components/PursuitSelfAssessmentPage.tsx`
  - `frontend/src/app/components/PursuitObservationAssessmentPage.tsx`
  - `frontend/src/app/components/PursuitRelationshipAssessmentPage.tsx`
- 阶段题库目录：`frontend/src/lib/pursuitAssessmentCatalog.ts`
- 男女问卷 Repository：`frontend/src/lib/db/repositories/questionnaireRepo.ts`
- 阶段问卷 Repository：`frontend/src/lib/db/repositories/stageQuestionnaireRepo.ts`
- AI 上下文：`frontend/src/lib/ai/profileContext.ts`

## 第 1 步现状审查结论

### 当前实际流程

- 首次没有用户资料时，`App.tsx` 显示欢迎页。
- 欢迎页完成后直接进入资料建档页，没有独立的登录/用户识别页。
- 资料保存后，新用户根据男女问卷是否存在跳转男生问卷或女生问卷。
- 当前资料页保存后不会把阶段专项问卷作为新用户必经步骤。
- 女生问卷完成后，当前引导逻辑会进入关系画像，而不是阶段专项问卷。
- 阶段专项问卷可以通过页面入口进入，但当前总览页只显示“开始填写”，不读取完成状态。

### 老用户判断方式

- `useSettingsStore` 使用 `localStorage` 的 `lumi-settings` 保存 `onboardingCompleted`。
- `useUserStore` 从 IndexedDB 加载当前用户和女生资料。
- `App.tsx` 当前只要 `onboardingCompleted=true` 且用户存在，就直接放行当前页面，不继续检查阶段问卷是否完成。
- 因此当前“老用户直接进首页”的机制存在，但“新用户完整完成所有问卷后才成为老用户”的条件还不完整。

### 当前数据保存方式

- 男女问卷分别保存到 `maleQuestionnaireResults` 和 `femaleQuestionnaireResults`。
- 男女问卷 Repository 会覆盖同一用户的最新结果，并保留 `completedAt`。
- 阶段问卷保存到 `stageQuestionnaireResults`，记录用户、女生、阶段、问卷类型、答案、摘要和完成时间。
- 阶段问卷 Repository 目前保存新记录，不做同阶段同类型覆盖；读取时取最新结果。
- 当前阶段题库通过资料中的关系阶段分流，旧的 `pursuing` 数据仍保留兼容读取。

### 当前明确缺口

1. 没有独立的登录/本地用户识别页。
2. `onboardingCompleted` 的放行条件过早，未包含阶段必填和阶段三份问卷。
3. 资料页阶段必须作为新用户流程的必填项，并需要更明确的保存反馈。
4. 阶段问卷总览没有显示三份问卷的完成状态。
5. 三份阶段问卷结果页还没有完整的连续导航链路。
6. 新用户和老用户的按钮文案没有完全区分。
7. 资料保存按钮位置需要靠近资料卡和阶段选择区域。

## 稳定性约束

- 每次只处理一个小步骤，不把流程、UI、数据结构混在一个大改动中。
- 每次改动前先列文件和行为清单。
- 每次改动后固定运行测试、类型检查和构建。
- 不删除旧数据字段，不破坏 `pursuing` 兼容读取。
- 不引入云端账号作为当前 MVP 的前置条件；先使用本地用户识别，为后续真实登录保留边界。
- 每一步验收通过后再提交和推送。
