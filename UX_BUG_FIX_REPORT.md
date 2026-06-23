# 体验 Bug 修复完成报告

## ✅ 已修复的文件（共 3 个）

### 1. src/app/App.tsx
**修改内容：**
- ✅ **任务 1 核心修复**：Onboarding 守卫中，无 user 时跳转欢迎页而非资料页
- ✅ 状态不一致时（onboardingCompleted=true 但 user 不存在）跳转欢迎页
- ✅ OnboardingPage 的 onComplete 回调中设置 `setCurrentPage('profile')`
- ✅ 添加日志：`🔀 [OnboardingGuard] 未找到 user，跳转欢迎页`

**关键代码：**
```typescript
// 无 user 时跳转欢迎页
if (!user) {
  console.log('🔀 [OnboardingGuard] 未找到 user，跳转欢迎页');
  setShowOnboarding(true); // ✅ 显示欢迎页
  return;
}

// 欢迎页完成后跳转资料页
<OnboardingPage onComplete={() => {
  console.log('🔀 [App] 欢迎页完成，跳转 profile');
  setShowOnboarding(false);
  setCurrentPage('profile');
}} />
```

---

### 2. src/app/components/OnboardingPage.tsx
**修改内容：**
- ✅ **任务 1**：两个按钮点击时添加日志
- ✅ 确认不设置 onboardingCompleted=true（由 RelationshipPortraitPage 负责）

**关键代码：**
```typescript
onClick={() => {
  console.log('✅ [OnboardingPage] 用户点击开始，跳转 profile');
  onComplete();
}}
```

---

### 3. src/app/components/ProfileSetupPage.tsx
**修改内容：**
- ✅ **任务 2**：女生称呼必填校验
  - 添加 `girlNameError` 状态
  - onSubmit 开头校验 herName 非空
  - 输入时清除错误
  - 输入框下方显示红色错误提示
  - 兜底检查 girlPayload.nickname
  
- ✅ **任务 3**：女生资料回显
  - useEffect 中加载 girl 数据
  - 回显字段：nickname, knownDuration, currentStage, interactionFrequency, likes, tabooBehaviors, birthday
  - 反向映射：stranger→陌生人, observing→普通朋友, ambiguous→暧昧关系
  - 反向映射：high→每天聊, medium→隔天聊, low→断断续续

- ✅ **任务 4**：防止保存空女生资料
  - girlPayload 构造后检查 nickname 非空
  - 为空时显示错误并 return

**关键代码：**
```typescript
// 任务 2：女生称呼必填校验
if (!herName || !herName.trim()) {
  setGirlNameError('请填写她的称呼');
  console.warn('⚠️ [ProfileSetupPage] 女生称呼为空，阻止提交');
  return;
}

// 任务 3：女生资料回显
const girls = await girlProfileRepository.getByUserId(user.id);
const girl = girls[0];
if (girl) {
  setHerName(girl.nickname || '');
  setKnowDuration(girl.knownDuration || '');
  // ... 更多回显
}

// 任务 4：兜底检查
if (!girlPayload.nickname || !girlPayload.nickname.trim()) {
  console.error('❌ [ProfileSetupPage] girlPayload.nickname 为空，取消保存');
  setGirlNameError('请填写她的称呼');
  ui.hideLoading();
  return;
}
```

---

## 🎯 欢迎页流程（任务 1）

### 新用户完整流程：
```
App 启动
  ↓
🧭 OnboardingGuard 检查
  ↓
📥 user = null
  ↓
🔀 跳转欢迎页 (showOnboarding=true)
  ↓
OnboardingPage 显示
  ↓
用户勾选同意 + 点击"开始建立关系档案"
  ↓
✅ onComplete() → setCurrentPage('profile')
  ↓
ProfileSetupPage 显示
  ↓
填写男生 + 女生信息 → 保存
  ↓
MaleQuestionnairePage
  ↓
FemaleQuestionnairePage
  ↓
RelationshipPortraitPage → 点击"开始使用 Lumi"
  ↓
✅ setOnboardingCompleted(true) → 跳转首页
```

### 状态不一致修复流程：
```
LocalStorage: onboardingCompleted=true
IndexedDB: user 不存在
  ↓
⚠️ 检测到不一致
  ↓
重置 onboardingCompleted=false
  ↓
🔀 跳转欢迎页（而非资料页）
```

---

## 🔴 女生称呼校验（任务 2）

### 触发场景：
1. **点击"保存并继续"时 herName 为空**
   - 显示红色错误："请填写她的称呼"
   - 阻止保存和跳转
   - 不保存 user 和 girl
   
2. **用户开始输入**
   - 输入非空字符时，错误提示自动消失

3. **兜底检查（任务 4）**
   - girlPayload 构造后再次检查
   - 即使绕过前端校验也会被拦截

### UI 表现：
```tsx
<GlassInput
  label="称呼（你对她的叫法）"
  value={herName}
  onChange={(v) => {
    setHerName(v);
    if (v && v.trim()) setGirlNameError(null); // ✅ 自动清除错误
  }}
/>
{girlNameError && (
  <p style={{ color: '#e5484d', fontSize: 13, margin: '6px 0 0', paddingLeft: 4 }}>
    {girlNameError}
  </p>
)}
```

---

## 📋 女生资料回显字段（任务 3）

| 数据库字段 | UI State | 映射规则 |
|-----------|----------|----------|
| `girl.nickname` | `herName` | 直接赋值 |
| `girl.knownDuration` | `knowDuration` | 直接赋值 |
| `girl.currentStage` | `relation` | stranger→陌生人<br>observing→普通朋友<br>ambiguous→暧昧关系 |
| `girl.interactionFrequency` | `freq` | high→每天聊<br>medium→隔天聊<br>low→断断续续 |
| `girl.likes / girl.interests` | `likes` | 数组直接赋值 |
| `girl.tabooBehaviors` | `triggers` | 数组直接赋值 |
| `girl.birthday` | `importantDate` | 直接赋值 |

### 回显逻辑：
```typescript
useEffect(() => {
  async function loadExistingProfile() {
    console.log('🔍 [ProfileSetupPage] 开始加载已保存资料用于回显');
    
    // 1. 加载并回显男生资料
    const user = await userProfileRepository.getCurrent();
    if (user) {
      form.reset({ /* 男生字段 */ });
      console.log('✅ [ProfileSetupPage] userProfile 回显完成');
    }
    
    // 2. 加载并回显女生资料
    if (user?.id) {
      const girls = await girlProfileRepository.getByUserId(user.id);
      const girl = girls[0];
      if (girl) {
        setHerName(girl.nickname || '');
        // ... 更多字段
        console.log('✅ [ProfileSetupPage] girlProfile 回显完成');
      }
    }
  }
  
  loadExistingProfile();
}, []);
```

---

## ✅ 类型检查结果

```bash
npm run type-check
# ✅ 通过，0 错误
```

---

## 🧪 测试步骤

### 测试 1：欢迎页流程
1. 清空 IndexedDB 和 LocalStorage
2. 刷新页面
3. ✅ 应先看到欢迎页（3D mockup + "开始建立关系档案"按钮）
4. 勾选同意 + 点击开始
5. ✅ 应跳转到资料建档页

### 测试 2：女生称呼必填
1. 进入资料建档页
2. 只填写男生信息，女生"称呼"留空
3. 点击"保存并继续"
4. ✅ 应显示红色错误："请填写她的称呼"
5. ✅ 不应跳转，不应保存任何数据
6. 填写女生称呼
7. ✅ 红色错误应自动消失
8. 再次点击"保存并继续"
9. ✅ 应成功保存并跳转

### 测试 3：女生资料回显
1. 完整填写资料建档（包括女生信息）
2. 保存并完成整个流程
3. 回到资料建档页（通过侧边栏或其他方式）
4. ✅ 男生信息应回显
5. ✅ 女生信息应回显（称呼、认识时长、关系阶段、联系频率、喜好、雷点、生日）

### 测试 4：状态不一致修复
1. 完成整个引导流程
2. 删除 IndexedDB（保留 LocalStorage）
3. 刷新页面
4. ✅ 应重置 onboardingCompleted=false
5. ✅ 应跳转到欢迎页（而非直接进资料页）

---

## 📊 修复总结

| Bug | 症状 | 修复 | 状态 |
|-----|------|------|------|
| **Bug 1** | 新用户跳过欢迎页 | 无 user 时跳转欢迎页 | ✅ 已修复 |
| **Bug 2** | 女生称呼为空无提示 | 添加必填校验 + 红字提示 | ✅ 已修复 |
| **Bug 3** | 女生资料无回显 | 加载 girl 并回显所有字段 | ✅ 已修复 |

---

## 🎉 关键改进

1. **用户体验优化**：新用户必看欢迎页，了解产品理念
2. **数据完整性保证**：女生称呼必填，防止脏数据
3. **编辑友好**：资料回显，用户可修改而非重填
4. **状态一致性**：数据异常时重置到欢迎页

---

测试完成后，所有体验 bug 应该都已修复！
