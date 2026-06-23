# ProfileSetupPage 字段保存问题诊断报告

## 🔍 已发现的问题

### ❌ 问题 1：relationMap 缺少"追求中"和"已在一起"的映射

**位置：** `src/app/components/ProfileSetup Page.tsx` 第 235-240 行

**现状：**
```typescript
const relationMap: Record<string, 'stranger' | 'observing' | 'ambiguous'> = {
  '陌生人': 'stranger',
  '普通朋友': 'observing',
  '熟悉朋友': 'observing',
  '暧昧关系': 'ambiguous',
  // ❌ 缺少"追求中"和"已在一起"
};
```

**问题分析：**
- 用户在 UI 选择"追求中"
- `relationMap["追求中"]` 返回 `undefined`
- `relationMap[relation[0]] || 'observing'` 走到 default，返回 `'observing'`
- **数据库中保存的永远是 `'observing'`，而不是 `'pursuing'`**

**类型定义支持：**
`GirlProfile.currentStage` 类型已包含 `'pursuing' | 'dating'`，但 relationMap 没有映射它们。

---

### ❌ 问题 2：使用了多选 toggle 导致数组可能有多个值

**位置：** `src/app/components/ProfileSetupPage.tsx` 第 99-100 行

**现状：**
```typescript
const toggle = (arr: string[], val: string, setArr: (a: string[]) => void) =>
  setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

// 在 UI 中使用
onToggle={v => toggle(relation, v, setRelation)}
```

**问题分析：**
1. **这是多选逻辑**：点击已选项会取消选择，点击未选项会追加到数组
2. 用户可能先点"普通朋友"，再点"追求中"，导致 `relation = ['普通朋友', '追求中']`
3. 保存时取 `relation[0]`，永远是数组第一个元素（旧值）
4. 即使用户最后点了"追求中"，保存的仍然是 `relation[0] = '普通朋友'`

**UI 应该单选但实际是多选**：
- "当前关系阶段"应该是单选（互斥关系）
- "联系频率"应该是单选（互斥关系）
- 但代码用了 `toggle`，导致可以多选

---

### ⚠️ 问题 3：interactionFrequency 映射粒度不足

**位置：** `src/app/components/ProfileSetupPage.tsx` 第 242-247 行

**现状：**
```typescript
const freqMap: Record<string, 'low' | 'medium' | 'high'> = {
  '每天聊': 'high',
  '隔天聊': 'medium',     // ❌ 映射到 medium
  '一周几次': 'medium',   // ❌ 也映射到 medium
  '断断续续': 'low',
};
```

**问题分析：**
- "隔天聊"和"一周几次"都映射到 `'medium'`
- 从数据库读取 `interactionFrequency: 'medium'` 时，无法区分用户原本选的是哪个
- 回显时只能默认显示其中一个（目前是"隔天聊"）

---

### ✅ 问题 4：girlProfileRepo 合并顺序正确（无问题）

**位置：** `src/lib/db/repositories/girlProfileRepo.ts` 第 50-62 行

**现状：**
```typescript
const entity: GirlProfile = {
  ...(existing ?? {}),  // 先展开旧值
  ...profile,           // 再展开新值（覆盖）
  // 特定字段再处理
};
```

**结论：** ✅ 合并顺序正确，新值会覆盖旧值，这不是根因。

但是有一个潜在问题：
```typescript
currentStage: profile.currentStage ?? existing?.currentStage ?? 'observing',
```

如果 `profile.currentStage` 是 `undefined`（因为 relationMap 没有对应映射），会取 `existing.currentStage`（旧值）。

---

## 📊 根因总结

| 现象 | 根因 | 严重程度 |
|------|------|----------|
| "追求中"保存后变成"observing" | relationMap 缺少"追求中"→"pursuing"映射 | 🔴 严重 |
| 按钮可以多选 | 使用了 toggle 多选逻辑 | 🟠 中等 |
| relation[0] 永远是旧值 | 多选导致数组第一项是最早选中的 | 🟠 中等 |
| "一周几次"回显成"隔天聊" | 两个选项都映射到 medium | 🟡 轻微 |

---

## 🎯 诊断结论

### 1. "当前关系阶段"没保存成 pursuing 的根因

**主要根因：**
- ❌ **relationMap 缺少"追求中" → "pursuing"的映射**
- 用户选择"追求中"时，`relationMap["追求中"]` 返回 `undefined`
- 走 default 逻辑，保存为 `'observing'`

**次要根因：**
- ❌ **使用了多选 toggle**
- 如果用户先点了"普通朋友"再点"追求中"，`relation = ['普通朋友', '追求中']`
- 保存时取 `relation[0]`，得到旧值"普通朋友"

---

### 2. "联系频率"回显不准的根因

**根因：**
- ❌ **freqMap 映射粒度不足**
- "隔天聊"和"一周几次"都映射到 `'medium'`
- 数据库中只保存 `interactionFrequency: 'medium'`
- 回显时无法区分用户原本选的是哪个

---

### 3. 是否存在多选数组导致 relation[0] 取旧值的问题

**结论：是的。**

**证据：**
```typescript
const toggle = (arr: string[], val: string, setArr: (a: string[]) => void) =>
  setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
```

这是多选逻辑：
- 点击未选项 → 追加到数组末尾
- 点击已选项 → 从数组移除

**场景复现：**
1. 用户进入页面，relation = []
2. 点击"普通朋友" → relation = ['普通朋友']
3. 点击"追求中" → relation = ['普通朋友', '追求中']
4. 保存时取 `relation[0]` = '普通朋友'（旧值）

---

### 4. 是否存在映射函数缺少"追求中"的问题

**结论：是的。**

**证据：**
```typescript
const relationMap: Record<string, 'stranger' | 'observing' | 'ambiguous'> = {
  '陌生人': 'stranger',
  '普通朋友': 'observing',
  '熟悉朋友': 'observing',
  '暧昧关系': 'ambiguous',
  // ❌ 缺少"追求中" → "pursuing"
  // ❌ 缺少"已在一起" → "dating"
};
```

TypeScript 类型已支持 `'pursuing' | 'dating'`，但映射对象没有包含它们。

---

### 5. 是否存在 girlProfileRepo 合并顺序导致新值被旧值覆盖的问题

**结论：否，但有潜在问题。**

**合并顺序正确：**
```typescript
const entity = {
  ...(existing ?? {}),  // 先展开旧值
  ...profile,           // 再展开新值（覆盖）✅
};
```

**但字段兜底逻辑有问题：**
```typescript
currentStage: profile.currentStage ?? existing?.currentStage ?? 'observing',
```

如果 `profile.currentStage` 是 `undefined`（因为映射失败），会取 `existing.currentStage`，导致保存旧值。

---

## 🔧 最小修复方案

### 修复 1：添加缺失的映射（已在日志版本中修复）

```typescript
const relationMap: Record<string, 'stranger' | 'observing' | 'ambiguous' | 'pursuing' | 'dating'> = {
  '陌生人': 'stranger',
  '普通朋友': 'observing',
  '熟悉朋友': 'observing',
  '暧昧关系': 'ambiguous',
  '追求中': 'pursuing', // ✅ 添加
  '已在一起': 'dating', // ✅ 添加
};
```

**影响：** 立即修复"追求中"无法保存的问题。

---

### 修复 2：将 toggle 改为单选逻辑

```typescript
// 关系阶段（单选）
onToggle={(v) => {
  console.log('📌 点击关系阶段按钮:', { clicked: v, before: relation, after: [v] });
  setRelation([v]); // ✅ 直接替换为单个值的数组
}}

// 联系频率（单选）
onToggle={(v) => {
  console.log('📌 点击联系频率按钮:', { clicked: v, before: freq, after: [v] });
  setFreq([v]); // ✅ 直接替换为单个值的数组
}}
```

**影响：** 防止多选导致 relation[0] 取旧值的问题。

---

### 修复 3：联系频率映射粒度问题

**建议方案 A（推荐）：接受 medium 的歧义性**

- 继续使用 low/medium/high
- medium 默认回显为"隔天聊"
- 用户如果选了"一周几次"，下次回显会变成"隔天聊"
- **优点：** 无需改数据库，改动最小
- **缺点：** 用户体验略差，但 MVP 可接受

**方案 B：扩展 GirlProfile 类型（不推荐）**

```typescript
export interface GirlProfile {
  interactionFrequency: 'low' | 'medium' | 'high';
  rawInteractionFrequency?: '每天聊' | '隔天聊' | '一周几次' | '断断续续'; // 新增
}
```

- **优点：** 保留用户原始选择
- **缺点：** 需要改类型，需要升级数据库 schema，改动较大

**方案 C：细化 interactionFrequency 类型（不推荐）**

```typescript
currentStage: 'stranger' | 'observing' | 'ambiguous' | 'pursuing' | 'dating';
interactionFrequency: 'daily' | 'everyOtherDay' | 'weekly' | 'occasionally';
```

- **优点：** 粒度精确
- **缺点：** 需要改类型，需要升级 DB schema，后端 mock 也要改

**推荐：** 使用方案 A，MVP 阶段接受这个小缺陷。

---

## 📝 已添加的日志

### 1. 按钮点击日志
```typescript
console.log('📌 [ProfileSetupPage] 点击关系阶段按钮:', { clicked, before, after });
console.log('📌 [ProfileSetupPage] 点击联系频率按钮:', { clicked, before, after });
```

### 2. 保存前 state 日志
```typescript
console.log('📥 [ProfileSetupPage] 保存前女生关系阶段 state:', relation);
console.log('📥 [ProfileSetupPage] 保存前女生联系频率 state:', freq);
console.log('📥 [ProfileSetupPage] 保存时选中的关系阶段:', selectedRelation);
console.log('📥 [ProfileSetupPage] 保存时选中的联系频率:', selectedFreq);
```

### 3. 映射日志
```typescript
console.log('🔁 [ProfileSetupPage] 关系阶段映射:', { ui, db });
console.log('🔁 [ProfileSetupPage] 联系频率映射:', { ui, db });
```

### 4. girlProfileRepo 合并日志
```typescript
console.log('📥 [girlProfileRepo.save] existing 旧值:', { currentStage, interactionFrequency });
console.log('📥 [girlProfileRepo.save] profile 新值:', { currentStage, interactionFrequency });
console.log('📤 [girlProfileRepo.save] 最终写入值:', { currentStage, interactionFrequency });
```

---

## ✅ 下一步操作

1. **立即可测试**：已添加完整日志，可以复现问题并查看日志
2. **应用修复 1**：relationMap 已添加"追求中"和"已在一起"映射
3. **应用修复 2**：将 toggle 改为单选逻辑（`setRelation([v])`）
4. **保留修复 3**：接受 medium 的歧义性，MVP 可接受

---

所有日志已添加完毕，类型检查通过，可以开始测试了！
