# 📋 Lumi 项目未完成功能清单

根据 PRD 和 SPEC.md 分析，以下是当前项目已完成和未完成的功能：

---

## ✅ 已完成功能（MVP 核心）

### 1. 信息建档
- ✅ 男生个人信息填写（ProfileSetupPage）
- ✅ 女生信息填写（ProfileSetupPage 内）
- ✅ 本地 IndexedDB 存储（LumiDB）
- ✅ userProfiles 表
- ✅ girlProfiles 表

### 2. 问卷系统
- ✅ 男生类型问卷（MaleQuestionnairePage）
- ✅ 女生观察问卷（FemaleQuestionnairePage）
- ✅ 问卷题目数据（src/data/maleQuestions.ts, femaleQuestions.ts）
- ✅ 问卷结果存储（maleQuestionnaireResults, femaleQuestionnaireResults 表）

### 3. 聊天记录导入
- ✅ 聊天导入页面（ChatImportPage）
- ✅ 微信聊天记录解析器（chatParser.ts）
- ✅ 三行一组格式解析（昵称/时间/内容）
- ✅ 多行内容合并
- ✅ 昵称选择 UI
- ✅ 导入帮助面板
- ✅ 复制粘贴导入（paste）
- ✅ chatSessions 表
- ✅ chatMessages 表
- ✅ chatRepository.createSessionWithMessages

### 4. UI 框架
- ✅ GlassUI 组件库（毛玻璃风格）
- ✅ 页面路由（App.tsx）
- ✅ Zustand 状态管理（userStore, uiStore, chatImportStore）
- ✅ Toast 提示系统
- ✅ 进度条组件（ProgressStepper）

### 5. 其他已完成
- ✅ 本地优先架构（IndexedDB）
- ✅ TypeScript 类型系统
- ✅ 隐私提示组件（PrivacyNotice）
- ✅ 设置页面（SettingsPage）

---

## ❌ 未完成功能（MVP 范围内）

### 1. 关系画像生成 ⚠️ **核心缺失**
**优先级：P0（最高）**

**需要实现**：
- ❌ 关系画像生成逻辑（基于问卷结果）
- ❌ RelationshipPortraitPage 完整实现（当前只有框架）
- ❌ 男生类型标签输出（直男表达型、过度分析型、紧张讨好型等）
- ❌ 男生沟通短板分析
- ❌ 女生性格标签输出（慢热观察型、主动分享型、边界清晰型等）
- ❌ 当前关系阶段判断
- ❌ 互动热度评估
- ❌ 推进建议
- ❌ 注意事项

**文件位置**：`src/app/components/RelationshipPortraitPage.tsx`

**技术要点**：
- 需要读取 maleQuestionnaireResults 和 femaleQuestionnaireResults
- 需要设计标签映射算法（问卷分数 → 标签）
- 需要 AI 生成或预设规则生成画像文案
- 结果应存储到 analysisReports 表

---

### 2. AI 聊天分析报告 ⚠️ **核心缺失**
**优先级：P0（最高）**

**需要实现**：
- ❌ AI 分析接口调用
- ❌ Prompt 工程（基于用户资料 + 问卷 + 聊天记录）
- ❌ 分析报告生成页面（AIAnalysisPage）
- ❌ 分析结果展示：
  - 当前可能阶段
  - 互动热度
  - 女生可能态度
  - 积极信号
  - 风险信号
  - 男生表达问题
  - 女生视角解释
  - 下一步建议
- ❌ analysisReports 表数据写入
- ❌ 分析报告历史记录查看

**文件位置**：`src/app/components/AIAnalysisPage.tsx`（需创建）

**技术要点**：
- 需要集成 AI API（OpenAI / Claude / 本地模型）
- 需要设计 Prompt 模板
- 需要处理异步加载和错误处理
- 需要结构化输出（JSON）

---

### 3. 单条消息解析与回复建议 ⚠️ **核心缺失**
**优先级：P0（最高）**

**需要实现**：
- ❌ 回复助手页面（ReplyAssistPage）
- ❌ 消息输入框
- ❌ 场景选择（日常聊天、邀约、道歉、升温、冷淡、争吵）
- ❌ AI 分析接口
- ❌ 输出结构：
  - 简单答案
  - 可能含义
  - 女生视角
  - 推荐回复（2-3条，不同风格）
  - 不要这样回
  - 解释原因
- ❌ 回复复制功能
- ❌ replyHistory 表数据写入

**文件位置**：`src/app/components/ReplyAssistPage.tsx`（需创建）

**技术要点**：
- 需要集成 AI API
- 需要设计回复风格模板（自然真诚型、轻松幽默型、稳重关心型）
- 需要上下文管理（可选择最近聊天记录作为上下文）

---

### 4. 模拟对话练习 ⚠️ **核心缺失**
**优先级：P1（高）**

**需要实现**：
- ❌ 模拟对话页面（SimulationPage）
- ❌ 场景选择（日常聊天、邀约吃饭、表达好感、道歉、解释误会等）
- ❌ 对话输入框
- ❌ AI 模拟女生回复
- ❌ 对话历史展示（气泡式）
- ❌ 实时反馈（表达评分、改进建议）
- ❌ simulationSessions 表
- ❌ simulationMessages 表

**文件位置**：`src/app/components/SimulationPage.tsx`（需创建）

**技术要点**：
- 需要集成 AI API
- 需要设计场景 Prompt 模板
- 需要对话轮次管理
- 需要评分逻辑（尊重边界、表达清晰、情绪敏感度等）

---

### 5. 首页/Dashboard ⚠️ **核心缺失**
**优先级：P1（高）**

**需要实现**：
- ❌ 首页完整实现（DashboardPage）
- ❌ 新用户引导（"先完成关系建档"）
- ❌ 核心入口：
  - 分析聊天
  - 帮我回复
  - 模拟练习
- ❌ 当前关系阶段摘要卡片
- ❌ 最近分析结果
- ❌ 重要提醒（如：重要日期）
- ❌ 快捷提问入口

**文件位置**：`src/app/components/DashboardPage.tsx`

**技术要点**：
- 需要读取 currentUser / currentGirl
- 需要读取最新的 analysisReports
- 需要读取 importantDates
- 需要设计卡片式布局

---

### 6. 聊天记录导入（未完成部分）
**优先级：P2（中）**

**需要实现**：
- ❌ 截图 OCR 功能
- ❌ 文件导入（txt / csv / json）
- ❌ 聊天记录预览与修正页面（ChatPreviewPage）
- ❌ 发送者手动修正
- ❌ 消息删除/编辑
- ❌ 大文件大小限制（5MB）

**文件位置**：
- `src/app/components/ChatImportPage.tsx`（扩展）
- `src/app/components/ChatPreviewPage.tsx`（需创建）

---

### 7. Onboarding 引导页 ⚠️ **核心缺失**
**优先级：P1（高）**

**需要实现**：
- ❌ 首次使用引导页面（OnboardingPage）
- ❌ 产品说明
- ❌ 核心能力介绍
- ❌ 隐私原则说明
- ❌ "开始填写资料"按钮
- ❌ 首次访问检测逻辑

**文件位置**：`src/app/components/OnboardingPage.tsx`（需创建）

**技术要点**：
- 需要检测本地是否有 userProfiles
- 需要设计多步骤引导流程
- 需要跳过逻辑（已完成建档的用户）

---

### 8. 恋爱法典/内容库 
**优先级：P2（中）**

**需要实现**：
- ❌ 内容库页面（LoveCodePage）
- ❌ 静态内容分类：
  - 聊天原则
  - 女生视角
  - 邀约原则
  - 道歉原则
  - 冲突修复
  - 边界意识
  - 暧昧推进
  - 恋爱维护
- ❌ 内容检索和筛选
- ❌ 内容展示（卡片式）

**文件位置**：`src/app/components/LoveCodePage.tsx`

**技术要点**：
- 第一版可以用静态 Markdown 或 JSON 数据
- 需要设计内容结构
- 未来可扩展为后台管理系统

---

## ⚠️ MVP 范围外（但 PRD 提到的功能）

以下功能在 PRD 中提到，但标注为 **V1.1** 或 **V1.2**，不属于 MVP：

### V1.1 功能（不在当前 MVP）
- ❌ 应急手册
- ❌ 礼物推荐
- ❌ 重要日子提醒系统
- ❌ 更多回复风格
- ❌ 关系周报

### V1.2 功能（不在当前 MVP）
- ❌ 异地恋模块
- ❌ 约会场景指南
- ❌ 经期关怀提醒
- ❌ 更完整恋爱法典

---

## 📊 MVP 完成度统计

### 按模块统计

| 模块 | 完成度 | 状态 |
|------|--------|------|
| 信息建档 | 100% | ✅ 完成 |
| 问卷系统 | 100% | ✅ 完成 |
| 聊天导入（复制粘贴） | 100% | ✅ 完成 |
| 聊天导入（OCR/文件） | 0% | ❌ 未开始 |
| 关系画像生成 | 10% | ⚠️ 只有框架 |
| AI 聊天分析 | 0% | ❌ 未开始 |
| 回复建议 | 0% | ❌ 未开始 |
| 模拟对话 | 0% | ❌ 未开始 |
| 首页/Dashboard | 10% | ⚠️ 只有框架 |
| Onboarding | 0% | ❌ 未开始 |
| 恋爱法典 | 0% | ❌ 未开始 |
| 设置页面 | 80% | ⚠️ 基本完成 |

### 按优先级统计

| 优先级 | 功能数 | 完成 | 未完成 |
|--------|--------|------|--------|
| P0（最高）| 3 | 0 | 3 |
| P1（高）| 3 | 0 | 3 |
| P2（中）| 2 | 0 | 2 |
| P3（低）| 0 | 0 | 0 |

**总体 MVP 完成度：约 45%**

---

## 🎯 建议开发顺序

### 阶段 1：完成核心分析闭环（P0）
1. **关系画像生成**（1-2 天）
   - 实现标签映射算法
   - 完善 RelationshipPortraitPage
   - 测试问卷 → 画像流程

2. **AI 聊天分析报告**（2-3 天）
   - 集成 AI API
   - 设计 Prompt 模板
   - 实现 AIAnalysisPage
   - 测试完整流程：建档 → 问卷 → 导入 → 分析

3. **单条消息解析与回复建议**（2-3 天）
   - 实现 ReplyAssistPage
   - 设计回复风格模板
   - 测试多场景回复

### 阶段 2：完成用户体验闭环（P1）
4. **首页/Dashboard**（1 天）
   - 实现核心入口
   - 展示关系阶段摘要
   - 快捷操作

5. **Onboarding 引导**（1 天）
   - 首次使用引导
   - 产品说明
   - 隐私提示

6. **模拟对话练习**（2-3 天）
   - 实现 SimulationPage
   - AI 模拟对话
   - 反馈评分

### 阶段 3：补充增强功能（P2）
7. **聊天导入增强**（2-3 天）
   - OCR 功能
   - 文件导入
   - 预览修正页面

8. **恋爱法典/内容库**（1-2 天）
   - 静态内容整理
   - 页面展示
   - 分类检索

---

## 🚧 技术债务与待优化

### 1. AI 集成
- ❌ 尚未选择 AI 服务商（OpenAI / Claude / 本地模型）
- ❌ 尚未实现 AI API 调用封装
- ❌ 尚未设计 Prompt 模板库
- ❌ 尚未实现 Token 计费控制

### 2. 数据库优化
- ⚠️ currentGirl 使用 'default-girl' 兜底（临时方案）
- ⚠️ 缺少数据迁移机制
- ⚠️ 缺少数据导出功能

### 3. 错误处理
- ⚠️ 部分页面缺少完整的错误处理
- ⚠️ 缺少全局错误边界
- ⚠️ 缺少网络错误重试机制

### 4. 性能优化
- ⚠️ 大量聊天记录可能导致性能问题
- ⚠️ AI 分析可能较慢，需要异步任务机制
- ⚠️ 缺少分页/虚拟滚动

### 5. 测试
- ❌ 缺少单元测试
- ❌ 缺少集成测试
- ❌ 缺少 E2E 测试

---

## 📝 关键接口清单（未实现）

### 1. AI 分析接口
```typescript
// 需要实现
interface AIAnalysisService {
  // 生成关系画像
  generateRelationshipPortrait(
    userProfile: UserProfile,
    girlProfile: GirlProfile,
    maleQuestionnaire: MaleQuestionnaireResult,
    femaleQuestionnaire: FemaleQuestionnaireResult
  ): Promise<RelationshipPortrait>;

  // 分析聊天记录
  analyzeChatHistory(
    userProfile: UserProfile,
    girlProfile: GirlProfile,
    chatMessages: ChatMessage[],
    context: AnalysisContext
  ): Promise<ChatAnalysisReport>;

  // 单条消息解析
  parseMessage(
    message: string,
    context: MessageContext
  ): Promise<MessageAnalysis>;

  // 生成回复建议
  generateReplySuggestions(
    message: string,
    context: ReplyContext,
    styles: ReplyStyle[]
  ): Promise<ReplySuggestion[]>;

  // 模拟对话
  simulateConversation(
    userMessage: string,
    scene: SimulationScene,
    history: SimulationMessage[]
  ): Promise<SimulationResponse>;
}
```

### 2. 关系画像生成逻辑
```typescript
// 需要实现
interface RelationshipPortraitService {
  // 计算男生类型标签
  calculateMaleTags(
    questionnaire: MaleQuestionnaireResult
  ): MaleTypeTags;

  // 计算女生性格标签
  calculateFemaleTags(
    questionnaire: FemaleQuestionnaireResult
  ): FemaleTypeTags;

  // 判断关系阶段
  determineRelationshipStage(
    userProfile: UserProfile,
    girlProfile: GirlProfile,
    femaleQuestionnaire: FemaleQuestionnaireResult
  ): RelationshipStage;

  // 生成互动热度评估
  assessInteractionIntensity(
    chatMessages: ChatMessage[]
  ): InteractionIntensity;

  // 生成推进建议
  generateAdvice(
    portrait: RelationshipPortrait
  ): AdviceList;
}
```

---

## 🎯 下一步行动建议

### 立即开始（本周）
1. ✅ **完成关系画像生成**
   - 设计标签映射规则
   - 实现 RelationshipPortraitPage 完整逻辑
   - 测试端到端流程

2. ✅ **选择并集成 AI 服务**
   - 决定使用 OpenAI / Claude / 其他
   - 实现 API 调用封装
   - 设计基础 Prompt 模板

3. ✅ **实现 AI 聊天分析核心功能**
   - 创建 AIAnalysisPage
   - 实现分析报告生成
   - 测试完整用户路径

### 短期目标（2 周内）
4. ✅ 实现回复建议功能（ReplyAssistPage）
5. ✅ 实现首页/Dashboard
6. ✅ 实现 Onboarding 引导

### 中期目标（1 个月内）
7. ✅ 实现模拟对话练习
8. ✅ 完善聊天导入（OCR + 文件）
9. ✅ 实现恋爱法典/内容库

---

## 📎 附录：数据库表完整性检查

### 已创建的表
- ✅ userProfiles
- ✅ girlProfiles
- ✅ maleQuestionnaireResults
- ✅ femaleQuestionnaireResults
- ✅ chatSessions
- ✅ chatMessages
- ✅ analysisReports（已定义，未使用）
- ✅ replyHistory（已定义，未使用）
- ✅ simulationSessions（已定义，未使用）
- ✅ simulationMessages（已定义，未使用）
- ✅ importantDates（已定义，未使用）
- ✅ appSettings

### 表使用状态
| 表名 | 状态 | 说明 |
|------|------|------|
| userProfiles | ✅ 使用中 | 存储男生资料 |
| girlProfiles | ⚠️ 定义但未使用 | currentGirl 为 null 时用 default-girl 兜底 |
| maleQuestionnaireResults | ✅ 使用中 | 存储男生问卷结果 |
| femaleQuestionnaireResults | ✅ 使用中 | 存储女生问卷结果 |
| chatSessions | ✅ 使用中 | 存储聊天会话 |
| chatMessages | ✅ 使用中 | 存储聊天消息 |
| analysisReports | ❌ 未使用 | 需要在 AI 分析功能中使用 |
| replyHistory | ❌ 未使用 | 需要在回复建议功能中使用 |
| simulationSessions | ❌ 未使用 | 需要在模拟对话功能中使用 |
| simulationMessages | ❌ 未使用 | 需要在模拟对话功能中使用 |
| importantDates | ❌ 未使用 | V1.1 功能 |
| appSettings | ⚠️ 定义但未充分使用 | 可用于存储用户偏好 |

---

**更新时间**：2026-06-23  
**项目版本**：MVP 阶段（约 45% 完成）
