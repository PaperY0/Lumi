```json
# API.md
# API 接口文档
## 1. 总则
本项目第一版 API 仅用于 AI 能力。用户资料、聊天记录和分析报告默认保存在浏览器本地。
API 必须遵循：
1. 输入结构稳定。2. 输出结构稳定。3. 错误格式统一。4. 不返回不可解析的自由文本。5. 失败时提供 fallback message。6. 不输出操控、施压、侵犯边界的建议。
## 2. 通用错误格式
```json{  "success": false,  "error": {    "code": "AI_REQUEST_FAILED",    "message": "分析失败，请稍后重试。",    "details": {}  }}

3. POST /api/analyze
3.1 用途
生成聊天记录分析报告。
3.2 Request
json复制{  "userProfile": {    "nickname": "小明",    "ageRange": "22-25",    "relationshipExperience": "none",    "currentStage": "pursuing",    "mainProblems": ["不知道怎么聊天", "看不懂女生表达"]  },  "partnerProfile": {    "displayName": "她",    "knownDuration": "1-3 months",    "relationshipStage": "ambiguous",    "contactFrequency": "daily",    "interests": ["电影", "咖啡"],    "dislikes": ["被催", "强迫做决定"]  },  "maleQuestionnaireResult": {    "tags": ["过度分析型", "表达保守型"],    "weaknesses": ["容易脑补", "表达不够自然"],    "suggestions": ["先确认事实", "减少追问"]  },  "femaleQuestionnaireResult": {    "tags": ["慢热观察型", "边界清晰型"],    "possibleStage": "暧昧观察期",    "suggestions": ["低压力互动", "不要过快推进"]  },  "messages": [    {      "senderRole": "self",      "content": "今天下班累吗？",      "sentAt": "2026-06-17T10:00:00.000Z"    },    {      "senderRole": "partner",      "content": "还好，有点累。",      "sentAt": "2026-06-17T10:01:00.000Z"    }  ]}

3.3 Response
json复制{  "success": true,  "data": {    "reportId": "report_001",    "simpleAnswer": "目前更像是暧昧观察期，互动有窗口，但不适合过快推进。",    "relationshipStage": "暧昧观察期",    "heatScore": 68,    "confidence": 0.72,    "positiveSignals": [      "对方愿意回复日常关心",      "对方没有关闭沟通窗口"    ],    "riskSignals": [      "聊天内容仍偏日常",      "缺少主动邀约或深入分享"    ],    "partnerPerspective": "她可能愿意保持交流，但仍在观察你的表达方式和相处舒适度。",    "userProblems": [      "你可能会把短回复理解为冷淡",      "你容易急于判断关系结果"    ],    "nextSuggestions": [      "先保持轻松聊天，不要频繁追问态度",      "可以找一个低压力话题自然延续",      "如果她状态疲惫，优先表达理解"    ],    "avoidActions": [      "不要问她是不是不想理你",      "不要连续发送多条消息催回复",      "不要在对方疲惫时推进关系"    ]  }}

4. POST /api/reply
4.1 用途
分析女生某句话，并生成回复建议。
4.2 Request
json复制{  "scene": "daily_chat",  "goal": "自然回复并保持聊天",  "partnerMessage": "今天有点累，不太想说话",  "context": {    "relationshipStage": "暧昧观察期",    "userTags": ["过度分析型"],    "partnerTags": ["慢热观察型"],    "recentMessages": []  }}

4.3 Response
json复制{  "success": true,  "data": {    "simpleAnswer": "她可能是真的累了，建议先关心和降低聊天压力，不要追问态度。",    "possibleMeanings": [      "她确实需要休息",      "她愿意告诉你状态，说明没有完全关闭沟通",      "如果近期经常这样，也可能代表互动热度下降"    ],    "partnerPerspective": "她此刻可能更希望被理解，而不是被要求继续聊天。",    "userMisreadRisk": "你可能会把这句话理解成她不想理你，从而开始追问，这会增加压力。",    "recommendedReplies": [      {        "style": "自然真诚型",        "text": "那你先好好休息，今天就别太累啦，等你有精神了我们再聊。"      },      {        "style": "轻松幽默型",        "text": "收到，那今天先给你放个小假，早点休息。"      },      {        "style": "稳重关心型",        "text": "辛苦啦，先休息最重要，不用急着回我。"      }    ],    "avoidReplies": [      "你是不是不想理我？",      "你怎么每次都这样？",      "那算了。"    ],    "nextStep": "等她状态恢复后，再用轻松话题重新开启聊天。"  }}

5. POST /api/simulate
5.1 用途
模拟女生口吻进行对话练习。
5.2 Request
json复制{  "scenario": "invite_dinner",  "userMessage": "这周末要不要一起吃个饭？",  "context": {    "relationshipStage": "暧昧观察期",    "partnerTags": ["慢热观察型"],    "recentInteraction": "最近每天聊天，但还没有单独约出去"  }}

5.3 Response
json复制{  "success": true,  "data": {    "simulatedPartnerReply": "这周末我还不确定有没有时间诶，你想吃什么？",    "feedback": {      "score": 82,      "strengths": [        "表达直接清楚",        "没有给对方压力"      ],      "improvements": [        "可以给出更具体但轻松的选项",        "可以降低对方做决定的成本"      ],      "suggestedNextReply": "没事，不急。如果你有空的话，我们可以去吃你之前提过的那家；不方便的话就下次。"    }  }}

6. 前端本地方法约定
虽然不是 HTTP API，但本地 repository 方法也需要稳定。
userProfileRepository

get()
save(profile)
update(partialProfile)
clear()

partnerProfileRepository

get()
save(profile)
update(partialProfile)
clear()

chatRepository

createConversation()
addMessages(conversationId, messages)
getConversation(conversationId)
listConversations()
deleteConversation(conversationId)
clearAllMessages()

analysisRepository

saveReport(report)
getReport(reportId)
listReports()
deleteReport(reportId)
clearReports()

code复制
---
# **数据库设计**
因为第一版优先本地化处理，推荐数据库不是服务端 MySQL，而是浏览器本地 IndexedDB。下面是 Dexie.js 版本的数据表设计。
## **1. user_profiles**
保存男生资料。
| 字段 | 类型 | 说明 ||---|---|---|| id | string | 用户资料 ID || nickname | string | 昵称 || ageRange | string | 年龄段 || relationshipExperience | string | 恋爱经验 || currentStage | string | 当前阶段 || mainProblems | string[] | 主要问题 || personalitySelfTags | string[] | 自评标签 || communicationStyle | string | 沟通风格 || anxietyLevel | number | 焦虑程度 1-5 || createdAt | string | 创建时间 || updatedAt | string | 更新时间 |
## **2. partner_profiles**
保存女生资料。
| 字段 | 类型 | 说明 ||---|---|---|| id | string | 女生资料 ID || displayName | string | 显示名称 || ageRange | string | 年龄段 || knownDuration | string | 认识时长 || relationshipStage | string | 当前关系阶段 || contactFrequency | string | 联系频率 || interests | string[] | 喜好 || dislikes | string[] | 不喜欢 || redFlags | string[] | 雷点 || importantDates | ImportantDate[] | 重要日子 || mbti | string | MBTI，可选 || periodInfo | PeriodInfo | 经期信息，可选 || notes | string | 备注 || createdAt | string | 创建时间 || updatedAt | string | 更新时间 |
## **3. questionnaires**
保存问卷定义。第一版也可以写死在代码中，这张表可暂不使用。
| 字段 | 类型 | 说明 ||---|---|---|| id | string | 问卷 ID || type | male / female | 问卷类型 || title | string | 标题 || questions | Question[] | 问题 || version | number | 版本 |
## **4. questionnaire_results**
保存问卷结果。
| 字段 | 类型 | 说明 ||---|---|---|| id | string | 结果 ID || questionnaireType | male / female | 问卷类型 || answers | Record<string, any> | 用户答案 || tags | string[] | 结果标签 || strengths | string[] | 优点 || weaknesses | string[] | 短板 || suggestions | string[] | 建议 || possibleStage | string | 女生问卷使用 || createdAt | string | 创建时间 || updatedAt | string | 更新时间 |
## **5. conversations**
保存会话。
| 字段 | 类型 | 说明 ||---|---|---|| id | string | 会话 ID || title | string | 会话标题 || source | paste / screenshot / file | 来源 || messageCount | number | 消息数量 || dateRangeStart | string | 最早消息时间 || dateRangeEnd | string | 最晚消息时间 || createdAt | string | 创建时间 || updatedAt | string | 更新时间 |
## **6. chat_messages**
保存聊天消息。
| 字段 | 类型 | 说明 ||---|---|---|| id | string | 消息 ID || conversationId | string | 会话 ID || sender | string | 发送者名称 || senderRole | self / partner / unknown | 发送者角色 || content | string | 消息内容 || messageType | text / image / system / unknown | 消息类型 || sentAt | string | 发送时间 || source | paste / screenshot / file | 来源 || confidence | number | 解析置信度 || createdAt | string | 创建时间 |
## **7. analysis_reports**
保存分析报告。
| 字段 | 类型 | 说明 ||---|---|---|| id | string | 报告 ID || conversationId | string | 会话 ID || simpleAnswer | string | 简单答案 || relationshipStage | string | 关系阶段 || heatScore | number | 互动热度 0-100 || confidence | number | 置信度 0-1 || positiveSignals | string[] | 积极信号 || riskSignals | string[] | 风险信号 || partnerPerspective | string | 女生视角 || userProblems | string[] | 男生问题 || nextSuggestions | string[] | 下一步建议 || avoidActions | string[] | 不建议行为 || createdAt | string | 创建时间 |
## **8. reply_suggestions**
保存单条回复建议。
| 字段 | 类型 | 说明 ||---|---|---|| id | string | 建议 ID || partnerMessage | string | 对方消息 || scene | string | 场景 || goal | string | 用户目标 || simpleAnswer | string | 简单答案 || possibleMeanings | string[] | 可能含义 || partnerPerspective | string | 女生视角 || recommendedReplies | ReplyOption[] | 推荐回复 || avoidReplies | string[] | 避免回复 || nextStep | string | 下一步 || createdAt | string | 创建时间 |
## **9. simulation_sessions**
保存模拟对话会话。
| 字段 | 类型 | 说明 ||---|---|---|| id | string | 模拟会话 ID || scenario | string | 场景 || relationshipStage | string | 关系阶段 || createdAt | string | 创建时间 || updatedAt | string | 更新时间 |
## **10. simulation_messages**
保存模拟对话消息。
| 字段 | 类型 | 说明 ||---|---|---|| id | string | 消息 ID || sessionId | string | 会话 ID || role | user / simulated_partner / assistant_feedback | 角色 || content | string | 内容 || feedback | object | 反馈 || createdAt | string | 创建时间 |
## **11. app_settings**
保存应用设置。
| 字段 | 类型 | 说明 ||---|---|---|| id | string | 设置 ID || aiMockMode | boolean | 是否使用 mock || privacyAccepted | boolean | 是否接受隐私说明 || onboardingCompleted | boolean | 是否完成引导 || createdAt | string | 创建时间 || updatedAt | string | 更新时间 |
---
# **TypeScript 类型定义提示词**
你可以让 Claude Code 先生成类型：
```text请基于 docs/SPEC.md、docs/ARCHITECTURE.md 和数据库设计，先创建 types/ 目录下的 TypeScript 类型定义。
要求：1. 创建 profile.ts、questionnaire.ts、chat.ts、analysis.ts、ai.ts。2. 所有类型必须和数据库字段一致。3. 不要实现页面。4. 不要实现复杂业务逻辑。5. 类型命名必须清晰，例如 UserProfile、PartnerProfile、ChatMessage、AnalysisReport、ReplySuggestion。6. 完成后说明每个文件的作用。xxxxxxxxxx8 1{2  "success": false,3  "error": {4    "code": "AI_REQUEST_FAILED",5    "message": "分析失败，请稍后重试。",6    "details": {}7  }8}json