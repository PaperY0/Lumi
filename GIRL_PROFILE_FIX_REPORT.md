# 女生资料保存与回显 Bug 修复完成报告

## ✅ 已修复的文件（共 2 个）

### 1. src/lib/db/repositories/girlProfileRepo.ts
**修改内容：**
- ✅ **任务 1**：save 方法实现按 userId 更新
  - 有 id：按 id 查询并更新
  - 无 id 但有 userId：查询该 userId 的最新记录并覆盖
  - 无 id 无 userId：抛出错误
  - 字段兜底：ageRange, knownChannel 等默认值
  - nickname 必填校验

- ✅ **任务 2**：getByUserId 返回最新数据在前
  - 按 updatedAt 倒序排序
  - 返回数组第一条就是最新记录

- ✅ **任务 3**：新增 cleanupDuplicatesByUserId 方法
  - 查询同 userId 下所有记录
  - 按时间排序，保留最新一条
  - 删除其余重复记录

**关键代码：**
```typescript
// 任务 1：按 userId 查询最新记录并更新
if (profile.userId) {
  const allGirls = await db.girlProfiles.where('userId').equals(profile.userId).toArray();
  if (allGirls.length > 0) {
    allGirls.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
    existing = allGirls[0];
    console.log('♻️ [girlProfileRepo.save] 检测到同 userId 已有女生资料，执行覆盖更新');
  }
}

// 任务 2：返回最新数据在前
results.sort((a, b) => {
  const aTime = a.updatedAt || a.createdAt;
  const bTime = b.updatedAt || b.createdAt;
  return bTime.localeCompare(aTime);
});

// 任务 3：清理重复记录
async cleanupDuplicatesByUserId(userId: string) {
  const allGirls = await db.girlProfiles.where('userId').equals(userId).toArray();
  if (allGirls.length <= 1) return;
  
  allGirls.sort(...); // 按时间倒序
  const keptGirl = allGirls[0]; // 保留最新
  const toDelete = allGirls.slice(1); // 删除其余
  
  for (const girl of toDelete) {
    await db.girlProfiles.delete(girl.id);
  }
}
```

---

### 2. src/app/components/ProfileSetupPage.tsx
**修改内容：**
- ✅ **任务 4**：保存后清理重复记录
  - 保存 girlProfile 后调用 cleanupDuplicatesByUserId
  - 然后 loadCurrentUser 同步 store
  
- ✅ **任务 5**：回显最新女生资料
  - getByUserId 已按时间倒序，取 girls[0] 即为最新
  - 回显所有字段包括生日
  
- ✅ **任务 6**：生日字段保存和回显
  - 保存：girlPayload.birthday = importantDate
  - 回显：setImportantDate(girl.birthday)
  - 添加日志输出 birthday 值

**关键代码：**
```typescript
// 任务 4：保存后清理重复
const savedGirl = await girlProfileRepository.save(girlPayload);
await girlProfileRepository.cleanupDuplicatesByUserId(savedUser.id);
console.log('🧹 [ProfileSetupPage] 已清理重复 girlProfiles');
await userStore.loadCurrentUser();

// 任务 5 & 6：回显生日
setImportantDate(girl.birthday || '');
console.log('✅ [ProfileSetupPage] girlProfile 回显完成:', {
  id: girl.id,
  nickname: girl.nickname,
  birthday: girl.birthday,
  updatedAt: girl.updatedAt,
});
```

---

## 🎯 save 方法如何判断"更新还是新增"

### 判断逻辑（按优先级）：

1. **有 profile.id**
   ```
   按 id 查询 → 存在则更新 → 不存在则报错（异常情况）
   ```

2. **无 id 但有 profile.userId**
   ```
   查询 userId 下所有记录 → 按 updatedAt 倒序 → 取最新一条 existing
   ├─ existing 存在 → 复用 existing.id，覆盖更新
   └─ existing 不存在 → 生成新 id，首次创建
   ```

3. **无 id 无 userId**
   ```
   抛出错误："保存女生资料失败：缺少 userId"
   ```

### MVP 阶段效果：
- 同一个 userId 下，每次保存都会更新同一条 girlProfile
- 不会产生重复记录
- 用户补充生日、喜好等信息会覆盖到原记录

---

## 📊 getByUserId 如何保证返回最新资料

### 排序机制：
```typescript
results.sort((a, b) => {
  const aTime = a.updatedAt || a.createdAt;
  const bTime = b.updatedAt || b.createdAt;
  return bTime.localeCompare(aTime); // 新的在前
});
```

### 效果：
- 返回数组第一条 `results[0]` 就是最新记录
- userStore.loadCurrentUser() 取 `girls[0]` 时自动拿到最新
- ProfileSetupPage 回显时也是取 `girls[0]`，显示最新数据

---

## 🧹 cleanupDuplicatesByUserId 如何清理

### 清理流程：
1. 查询该 userId 下所有 girlProfiles
2. 数量 <= 1：无需清理，直接 return
3. 按 updatedAt 倒序排序
4. 保留 `allGirls[0]`（最新一条）
5. 删除 `allGirls.slice(1)`（其余旧记录）

### 调用时机：
- ProfileSetupPage 保存 girlProfile 成功后
- 自动清理该 userId 的重复记录
- 保证数据库中只保留最新一条

---

## 🎂 ProfileSetupPage 如何保存并回显生日

### 保存流程：
1. UI 输入：`importantDate` state（用户在"重要日子"输入框填写）
2. 构造 payload：
   ```typescript
   birthday: importantDate || undefined
   importantDates: importantDate ? [{ name: '生日', date: importantDate }] : []
   ```
3. 日志：`console.log('📥 [ProfileSetupPage] girlPayload birthday:', girlPayload.birthday);`

### 回显流程：
1. 读取：`const girls = await girlProfileRepository.getByUserId(user.id);`
2. 取最新：`const girl = girls[0];`（已按 updatedAt 倒序）
3. 回显：`setImportantDate(girl.birthday || '');`
4. 日志：输出 `birthday` 和 `updatedAt`

### 效果：
- 用户首次填写生日 → 保存到 girl.birthday
- 用户后续修改生日 → 覆盖更新 girl.birthday（不新增记录）
- 刷新页面 → 回显最新的生日值

---

## ✅ 类型检查结果

```bash
npm run type-check
# ✅ 通过，0 错误
```

---

## 🧪 测试步骤

### 测试 1：首次保存女生资料
1. 清空数据库
2. 完成引导流程，进入资料建档页
3. 填写女生信息（称呼、认识时长、生日）
4. 点击"保存并继续"
5. DevTools → IndexedDB → girlProfiles
6. ✅ 应该只有 1 条记录
7. ✅ birthday 字段有值

### 测试 2：修改女生资料（不重复新增）
1. 回到资料建档页
2. 按钮显示"保存修改"
3. 修改生日、添加喜好
4. 点击"保存修改"
5. 控制台应显示：
   ```
   ♻️ [girlProfileRepo.save] 检测到同 userId 已有女生资料，执行覆盖更新
   🧹 [ProfileSetupPage] 已清理重复 girlProfiles
   ```
6. DevTools → IndexedDB → girlProfiles
7. ✅ 仍然只有 1 条记录（id 不变）
8. ✅ birthday 已更新为新值
9. ✅ updatedAt 已更新为最新时间

### 测试 3：刷新页面回显最新资料
1. 修改资料后点击保存
2. 按 F5 刷新页面
3. 回到资料建档页
4. ✅ 女生称呼应回显
5. ✅ 生日应回显最新值
6. ✅ 喜好、雷点等应回显
7. 控制台日志：
   ```
   📤 [girlProfileRepo.getByUserId] 第一条最新记录: { id, nickname, birthday, updatedAt }
   ✅ [ProfileSetupPage] girlProfile 回显完成
   ```

### 测试 4：清理已有重复数据
1. 如果数据库中已有重复 girlProfiles
2. 进入资料建档页，修改任意信息
3. 点击"保存修改"
4. ✅ 应自动清理重复记录
5. DevTools → girlProfiles
6. ✅ 同一个 userId 下只保留最新一条

---

## 📊 修复总结

| 问题 | 症状 | 根因 | 修复方案 | 状态 |
|-----|------|------|----------|------|
| **问题 1** | 多次保存产生重复记录 | save 每次都新建 | 按 userId 查询并覆盖更新 | ✅ 已修复 |
| **问题 2** | 回显显示旧数据 | 未按时间排序 | getByUserId 按 updatedAt 倒序 | ✅ 已修复 |
| **问题 3** | 已有重复数据 | 历史遗留 | cleanupDuplicatesByUserId 清理 | ✅ 已修复 |
| **问题 4** | 生日不显示 | 未正确回显 | 回显 girl.birthday | ✅ 已修复 |

---

## 🎉 关键改进

1. **数据唯一性保证**：同一个 userId 只保留一条 girlProfile
2. **更新而非新增**：修改资料时覆盖原记录，不产生重复
3. **回显最新数据**：getByUserId 按时间排序，永远返回最新
4. **自动清理重复**：保存时自动清理旧重复记录
5. **生日字段完整**：保存和回显都正确处理 birthday

---

测试完成后，女生资料保存与回显 bug 应该都已修复！
