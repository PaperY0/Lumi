# 流程设计问题修复完成报告

## ✅ 已修复的文件（共 4 个）

### 1. src/app/components/ProfileSetupPage.tsx
**修改内容：**
- ✅ **任务 1**：读取 onboardingCompleted 状态
- ✅ **任务 1**：保存后根据状态决定跳转
  - 老用户（onboardingCompleted=true）：保存后停留当前页
  - 新用户（onboardingCompleted=false）：跳转到缺失的下一步（男生问卷/女生问卷/关系画像）
- ✅ **任务 1**：按钮文案动态变化
  - 老用户："保存修改"
  - 新用户："保存并继续"
- ✅ **任务 2**：添加"重做问卷"按钮（仅老用户可见）
- ✅ 添加 questionnaireRepository 导入

**关键代码：**
```typescript
// 读取状态
const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted);

// 保存后逻辑
if (onboardingCompleted) {
  console.log('✅ [ProfileSetupPage] 老用户资料保存成功，停留当前页，不跳转问卷');
  ui.showToast('资料已保存', 'success');
  return;
}

// 新手引导：只跳缺失步骤
const maleQ = await questionnaireRepository.getLatestMale(savedUser.id);
const femaleQ = await questionnaireRepository.getLatestFemale(savedUser.id);
if (!maleQ) onNavigate('male-questionnaire');
else if (!femaleQ || !femaleQ.girlId) onNavigate('female-questionnaire');
else onNavigate('relationship-portrait');
```

---

### 2. src/lib/db/repositories/questionnaireRepo.ts
**修改内容：**
- ✅ **任务 3**：saveMaleResult 改为覆盖更新
  - 查询 getLatestMale(userId)
  - 存在则保留 id，更新 completedAt 和字段
  - 不存在则新建
- ✅ **任务 3**：saveFemaleResult 改为覆盖更新
  - 查询同 userId + girlId 的最新记录
  - 存在则保留 id，更新 completedAt 和字段
  - 不存在则新建
- ✅ 添加详细日志

**关键代码：**
```typescript
// 男生问卷覆盖更新
const existing = await this.getLatestMale(result.userId);
if (existing) {
  console.log('♻️ [questionnaireRepo.saveMaleResult] 已存在结果，执行覆盖更新，id:', existing.id);
  const updated = { ...existing, ...result, id: existing.id, completedAt: now };
  await db.maleQuestionnaireResults.put(updated);
  return updated;
}

// 女生问卷覆盖更新（按 userId + girlId）
const existing = await db.femaleQuestionnaireResults
  .where('userId').equals(result.userId)
  .filter(x => x.girlId === result.girlId)
  .reverse().sortBy('completedAt')
  .then(list => list[0]);
```

---

### 3. src/app/components/MaleQuestionnairePage.tsx
**修改内容：**
- ✅ **任务 4**：根据 onboardingCompleted 决定跳转
  - 老用户：保存后跳 relationship-portrait，toast "男生问卷已更新"
  - 新用户：保存后跳 female-questionnaire，toast "男生问卷已完成"
- ✅ 添加 useSettingsStore 导入
- ✅ 添加日志

**关键代码：**
```typescript
const onboardingCompleted = useSettingsStore.getState().onboardingCompleted;
if (onboardingCompleted) {
  ui.showToast('男生问卷已更新', 'success');
  console.log('🔀 [MaleQuestionnaire] 老用户重做问卷完成，跳转 relationship-portrait');
  onNavigate('relationship-portrait');
} else {
  ui.showToast('男生问卷已完成', 'success');
  onNavigate('female-questionnaire');
}
```

---

### 4. src/app/components/FemaleQuestionnairePage.tsx
**修改内容：**
- ✅ **任务 4**：根据 onboardingCompleted 决定跳转和 toast 文案
  - 老用户：toast "女生问卷已更新"
  - 新用户：toast "女生问卷已完成"
  - 两者都跳 relationship-portrait
- ✅ 添加 useSettingsStore 导入
- ✅ 添加日志

**关键代码：**
```typescript
const onboardingCompleted = useSettingsStore.getState().onboardingCompleted;
if (onboardingCompleted) {
  ui.showToast('女生问卷已更新', 'success');
  console.log('🔀 [FemaleQuestionnaire] 老用户重做问卷完成，跳转 relationship-portrait');
} else {
  ui.showToast('女生问卷已完成', 'success');
}
onNavigate('relationship-portrait');
```

---

## 🎯 ProfileSetupPage 如何区分场景

### 新手引导模式（onboardingCompleted=false）
- **按钮文案**："保存并继续"
- **保存后行为**：跳转到缺失的下一步
  - 无男生问卷 → male-questionnaire
  - 无女生问卷 → female-questionnaire
  - 问卷都有 → relationship-portrait
- **不显示**："重做问卷"按钮

### 老用户补充资料模式（onboardingCompleted=true）
- **按钮文案**："保存修改"
- **保存后行为**：停留当前页，不跳转
- **显示**："重新填写男生问卷" + "重新填写女生问卷" 按钮

---

## ♻️ 问卷结果覆盖更新机制

### 男生问卷（saveMaleResult）
1. 查询：getLatestMale(userId)
2. 存在 → 保留 id，更新 completedAt + 所有字段
3. 不存在 → 生成新 id，创建记录

### 女生问卷（saveFemaleResult）
1. 查询：where('userId').equals(userId).filter(x => x.girlId === girlId)
2. 存在 → 保留 id，更新 completedAt + 所有字段
3. 不存在 → 生成新 id，创建记录

### 效果
- MVP 阶段每个用户只保留最新一份问卷结果
- 重做问卷时自动覆盖旧结果
- AI 分析永远读取最新结果
- 不会产生重复脏数据

---

## 🧪 手动测试步骤

### 测试 1：新用户引导流程
1. 清空数据库和 LocalStorage
2. 完成欢迎页 → 资料建档
3. ✅ 按钮显示"保存并继续"
4. ✅ 不显示"重做问卷"按钮
5. 点击保存
6. ✅ 应跳转到男生问卷页
7. 完成男生问卷
8. ✅ toast "男生问卷已完成"，跳转女生问卷
9. 完成女生问卷
10. ✅ toast "女生问卷已完成"，跳转关系画像

### 测试 2：老用户补充资料（不跳问卷）
1. 完成整个引导流程（到首页）
2. 回到资料建档页
3. ✅ 按钮显示"保存修改"
4. ✅ 显示"重新填写男生问卷" + "重新填写女生问卷"按钮
5. 修改女生资料（如认识时长）
6. 点击"保存修改"
7. ✅ toast "资料已保存"
8. ✅ 停留在当前页，不跳转问卷

### 测试 3：重做问卷（覆盖更新）
1. 在资料建档页点击"重新填写男生问卷"
2. ✅ 进入男生问卷页
3. 修改几个答案，完成问卷
4. ✅ toast "男生问卷已更新"
5. ✅ 跳转 relationship-portrait
6. DevTools → IndexedDB → maleQuestionnaireResults
7. ✅ 应该只有 1 条记录（覆盖更新，不是新增）

### 测试 4：女生问卷覆盖更新
1. 点击"重新填写女生问卷"
2. 修改答案，完成
3. ✅ toast "女生问卷已更新"
4. ✅ 跳转 relationship-portrait
5. DevTools → IndexedDB → femaleQuestionnaireResults
6. ✅ 应该只有 1 条记录（覆盖更新）
7. ✅ completedAt 应该是最新时间

---

## ✅ 类型检查结果

```bash
npm run type-check
# ✅ 通过，0 错误
```

---

## 📊 修复总结

| 问题 | 症状 | 根因 | 修复方案 | 状态 |
|-----|------|------|----------|------|
| **问题 1** | 老用户保存资料后被强制跳问卷 | 未区分新/老用户 | 根据 onboardingCompleted 决定跳转 | ✅ 已修复 |
| **问题 2** | 问卷结果重复新增 | 每次提交都创建新记录 | 覆盖更新最新结果 | ✅ 已修复 |
| **问题 3** | 缺少重做问卷入口 | UI 没有按钮 | 添加"重做问卷"按钮 | ✅ 已修复 |

---

## 🎉 关键改进

1. **用户体验优化**：老用户修改资料不被打断，按需重做问卷
2. **数据库清洁**：问卷结果采用覆盖更新，不产生脏数据
3. **流程清晰**：新手引导和老用户编辑有明确区分
4. **灵活性增强**：用户可主动选择重做问卷更新画像

---

## 🔄 完整流程

### 新用户首次引导
```
欢迎页 → 资料建档（保存并继续）→ 男生问卷 → 女生问卷 → 关系画像 → 首页
```

### 老用户补充资料
```
资料建档页 → 修改资料 → 保存修改 → 停留当前页 ✅
```

### 老用户重做问卷
```
资料建档页 → 点击"重新填写XX问卷" → 完成问卷 → 关系画像页 ✅
（问卷结果覆盖更新，不重复新增）
```

---

测试完成后，所有流程设计问题应该都已修复！
