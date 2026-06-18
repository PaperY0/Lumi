# ARCHITECTURE.md

# 架构设计

## 1. 架构目标

本项目采用本地优先架构。用户资料、女生资料、问卷答案、聊天记录、分析报告优先保存在浏览器 IndexedDB 中。服务端 API 只负责 AI 分析、回复建议和模拟对话等需要模型能力的任务。

第一版不做登录、不做云同步、不做付费、不做后台管理。

## 2. 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Dexie.js
- IndexedDB
- Zustand
- React Hook Form
- Zod
- Tesseract.js
- Vitest
- Playwright

## 3. 分层设计

### 3.1 UI 层

目录：

- app/
- components/

职责：

- 页面展示。
- 表单交互。
- 导入入口。
- 分析结果展示。
- 模拟对话界面。

UI 层不得直接操作 IndexedDB，必须通过 repository 或 store。

### 3.2 状态层

目录：

- stores/

职责：

- 保存当前页面状态。
- 保存当前选中的会话。
- 保存临时导入结果。
- 控制 loading 和 error 状态。

长期数据不应只放在 Zustand，必须同步到 IndexedDB。

### 3.3 数据层

目录：

- lib/db/

职责：

- 定义 IndexedDB schema。
- 提供 CRUD 方法。
- 屏蔽 Dexie 实现细节。

### 3.4 解析层

目录：

- lib/parsers/

职责：

- 解析复制粘贴文本。
- 解析 txt。
- 解析 csv。
- 解析 json。
- 统一转换为 ChatMessage[]。

### 3.5 OCR 层

目录：

- lib/ocr/

职责：

- 使用 Tesseract.js 识别截图。
- 返回原始文本。
- 交给 parsers 继续结构化。

### 3.6 问卷层

目录：

- lib/questionnaires/

职责：

- 存放写死的问卷题目。
- 计算男生类型。
- 计算女生观察结果。
- 输出结构化画像。

### 3.7 AI 层

目录：

- lib/ai/

职责：

- 管理 prompt。
- 管理 AI 请求。
- 校验 AI 输出结构。
- 提供 mock 模式。

### 3.8 API 层

目录：

- app/api/

职责：

- /api/analyze 生成聊天分析报告。
- /api/reply 生成回复建议。
- /api/simulate 生成模拟对话回复。

## 4. 数据流

### 4.1 建档数据流

页面表单 → Zod 校验 → repository 保存 → IndexedDB → store 更新 → 跳转下一步。

### 4.2 问卷数据流

问卷页面 → 用户作答 → scoring 函数 → 生成结果 → IndexedDB 保存 → 画像页展示。

### 4.3 聊天导入数据流

输入源 → parser/OCR → normalizeMessages → 预览页 → 用户修正 → 保存到 IndexedDB。

### 4.4 AI 分析数据流

IndexedDB 读取上下文 → 前端构造请求 → API route → AI client → 结构化响应 → 前端保存分析结果。

## 5. 本地数据库设计

使用 IndexedDB，封装库 Dexie.js。

数据库名称：

love_guide_local_db

版本：

1

表：

- user_profiles
- partner_profiles
- questionnaires
- questionnaire_results
- conversations
- chat_messages
- analysis_reports
- reply_suggestions
- simulation_sessions
- simulation_messages
- handbook_items
- app_settings

## 6. 隐私设计

### 6.1 默认本地保存

用户资料、聊天记录和分析报告默认保存在浏览器本地。

### 6.2 AI 请求最小化

调用 AI 接口时，只发送完成当前任务所需的上下文。不要默认发送全部聊天记录。

### 6.3 用户控制

设置页必须支持：

- 清空所有本地数据。
- 清空聊天记录。
- 清空分析报告。
- 查看隐私说明。

### 6.4 敏感信息处理

提供 redaction 工具，尽量识别手机号、地址、身份证、银行卡等敏感信息，并在发送 AI 分析前提醒用户确认。

## 7. 错误处理

所有核心流程必须有错误状态：

- 表单保存失败。
- OCR 识别失败。
- 文件格式错误。
- 聊天解析失败。
- AI 请求失败。
- IndexedDB 不可用。
- 输出结构不合法。

错误提示必须告诉用户下一步可以怎么做。

## 8. Mock 模式

开发阶段必须支持 AI mock 模式。

当没有配置 AI Key 或 AI 服务不可用时，系统返回本地 mock 数据，保证前端流程可以完整跑通。

## 9. 路由设计

- / 首页
- /onboarding 新手引导
- /profile 资料填写
- /questionnaires/male 男生问卷
- /questionnaires/female 女生观察问卷
- /persona 关系画像
- /import 聊天导入
- /analysis 分析报告
- /reply 消息解析与回复建议
- /simulator 模拟对话
- /handbook 恋爱法典
- /settings 设置

## 10. 开发顺序

推荐顺序：

1. 初始化项目。
2. 创建类型定义。
3. 创建 IndexedDB schema。
4. 创建基础布局。
5. 实现 onboarding。
6. 实现资料填写。
7. 实现问卷。
8. 实现画像页。
9. 实现聊天导入。
10. 实现 AI mock。
11. 实现 API route。
12. 实现分析报告。
13. 实现回复建议。
14. 实现模拟对话。
15. 实现设置页和数据清空。
16. 编写测试。