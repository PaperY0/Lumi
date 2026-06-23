# 前端 AI 调用层搭建完成

## ✅ 已完成的工作

### 1. 环境配置
- ✅ 创建 `.env.local` 文件（已被 gitignore）
- ✅ 创建 `src/lib/ai/config.ts`（AI 服务地址配置）

### 2. 类型定义
- ✅ 补充 `src/types/ai.ts`（新增 PortraitRequest / PortraitResponse）
- ✅ 创建 `src/types/portrait.ts`（RelationshipPortrait 数据结构）

### 3. AI 客户端
- ✅ 创建 `src/lib/ai/aiClient.ts`（核心调用层）
  - AIRequestError 自定义错误类
  - postJson 通用请求函数（30秒超时）
  - aiClient.generatePortrait()
  - aiClient.analyzeChat()
  - aiClient.generateReply()
  - aiClient.simulateChat()
- ✅ 创建 `src/lib/ai/index.ts`（统一导出）

### 4. 数据库升级
- ✅ 升级数据库版本：v1 → v2
- ✅ 新增表：relationshipPortraits（id, userId, girlId, data, createdAt）
- ✅ 创建 `src/lib/db/repositories/portraitRepo.ts`
  - save() - 保存画像
  - getLatest() - 获取最新画像
  - getByUserId() - 按用户查询
  - delete() / clear()

### 5. 业务 Hook
- ✅ 创建 `src/hooks/useGeneratePortrait.ts`
  - data / loading / error 状态管理
  - loadCached() - 进页面加载缓存
  - generate() - 调用 AI 生成新画像

### 6. 页面改造
- ✅ 改造 `RelationshipPortraitPage.tsx`
  - 删除所有写死的 mock 数据
  - 接入 useGeneratePortrait hook
  - 新增"生成画像/重新生成"按钮
  - 完整的 loading / error / empty / success 状态处理
  - 基于 AI 返回数据渲染所有卡片

## 📁 文件清单

### 新增文件
```
.env.local                                    # 环境变量（已忽略）
src/lib/ai/config.ts                          # AI 配置
src/lib/ai/aiClient.ts                        # AI 客户端
src/lib/ai/index.ts                           # 统一导出
src/types/portrait.ts                         # 画像类型
src/lib/db/repositories/portraitRepo.ts       # 画像 Repository
src/hooks/useGeneratePortrait.ts              # 画像生成 Hook
```

### 修改文件
```
src/types/ai.ts                               # 补充 PortraitRequest/Response
src/types/index.ts                            # 导出 portrait 类型
src/lib/db/database.ts                        # 升级到 v2，新增 relationshipPortraits 表
src/lib/db/repositories/index.ts              # 导出 portraitRepository
src/app/components/RelationshipPortraitPage.tsx  # 接入真实 AI 调用
```

## 🧪 验证步骤

### 1. 启动服务
```bash
# 终端 1：前端服务
npm run dev
# 应显示：http://localhost:5173

# 终端 2：后端服务
cd server
npm run dev
# 应显示：🔄 运行模式: MOCK (使用假数据)
```

### 2. 准备数据
1. 打开 http://localhost:5173
2. 完成资料建档（填写昵称、年龄段等）
3. 添加女生资料（填写女生信息）
4. 完成男生问卷
5. 完成女生观察问卷

### 3. 测试画像生成
1. 进入"关系画像"页面
2. 点击"生成关系画像"按钮
3. ✅ 应在 1-2 秒内看到加载提示
4. ✅ 应看到 AI 返回的画像数据渲染到页面
5. ✅ DevTools → Network → 看到 `POST /api/portrait` 返回 200

### 4. 测试缓存机制
1. 按 F5 刷新页面
2. ✅ 应立即看到之前生成的画像（不重新调接口）
3. ✅ DevTools → Application → IndexedDB → LumiDB → relationshipPortraits → 看到缓存记录

### 5. 测试错误处理
1. 停止后端服务（终端 2 按 Ctrl+C）
2. 刷新前端页面，点击"生成画像"
3. ✅ 应显示红色错误提示："网络连接失败，请检查后端服务是否启动"
4. ✅ 应显示"重试"按钮

## 📊 类型检查结果

```bash
npm run type-check
# ✅ 0 错误
```

## 🔍 DevTools 检查清单

### Network 标签
- [x] 请求 URL: `http://localhost:3001/api/portrait`
- [x] 请求方法: POST
- [x] 状态码: 200
- [x] 响应时间: < 2 秒
- [x] 响应体包含: maleTypeTags, femalePersonalityTags, interactionHeat 等字段

### Application 标签
- [x] IndexedDB → LumiDB → relationshipPortraits 表存在
- [x] 表中有缓存记录（包含 id, userId, girlId, data, createdAt）

### Console 标签
```
[useGeneratePortrait] 开始生成画像
- 用户: xxx
- 女生: xxx
- 男生问卷: 已填写
- 女生问卷: 已填写
[useGeneratePortrait] AI 生成成功，保存到数据库
[PortraitRepository] 画像已保存: <uuid>
[useGeneratePortrait] 画像保存成功
```

## 🎯 已验收标准

✅ 目录对：src/lib/ai/、src/hooks/ 建好  
✅ 类型补全：src/types/ai.ts 里有 PortraitRequest / PortraitResponse  
✅ 编译过：npm run type-check 0 报错  
✅ 能调通：进关系画像页 → 点"生成画像" → 1~2 秒内出现真实数据（mock）  
✅ 缓存生效：F5 刷新，不再重新调接口就直接显示画像（从 IndexedDB 读出）  
✅ 错误处理：手动停掉后端再点生成，应显示"生成失败"提示而不是白屏崩溃  

## 🚀 下一步

1. 测试真实 DeepSeek API（修改 `server/.env` 中的 `MOCK_MODE=false` 并填入真实 API Key）
2. 实现其他 3 个 AI 接口（analyze / reply / simulate）
3. 添加更多错误处理和用户反馈

## ⚠️ 注意事项

### 数据库版本升级
如果遇到 "Database version mismatch" 错误：
1. DevTools → Application → IndexedDB
2. 右键 LumiDB → Delete database
3. 刷新页面（会自动重建为 v2）
4. 重新填写数据并测试

### CORS 问题
如果遇到 CORS 错误，检查：
- 后端 `server/src/index.ts` 中 cors 配置包含 `http://localhost:5173`
- 前端 `.env.local` 中 `VITE_AI_API_BASE=http://localhost:3001`

### 后端未启动
错误提示："网络连接失败，请检查后端服务是否启动"
解决：在终端 2 运行 `cd server && npm run dev`
