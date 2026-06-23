# ProfileSetupPage 字段保存问题修复完成报告

## ✅ 已修复的文件（共 3 个）

### 1. src/types/profile.ts
**修改内容：**
- ✅ **任务 1**：扩展 GirlProfile 类型
- 新增 `currentStageLabel?: string` - 保存原始 UI 选项（如"普通朋友""熟悉朋友""追求中"）
- 新增 `interactionFrequencyLabel?: string` - 保存原始 UI 选项（如"隔天聊""一周几次"）
- 保留 `currentStage` 和 `interactionFrequency` 粗粒度字段给 AI 使用

**关键代码：**
```typescript
export interface GirlProfile {
  currentStage: 'stranger' | 'observing' | 'ambiguous' | 'pursuing' | 'dating';
  currentStageLabel?: string; // ✅ 新增：精确回显
  interactionFrequency: 'low' | 'medium' | 'high';
  interactionFrequencyLabel?: string; // ✅ 新增：精确回显
}
```

---

### 2. src/app/components/ProfileSetupPage.tsx
**修改内容：**
- ✅ **任务 1**：添加 GirlProfile 类型导入
- ✅ **任务 2**：新增 `selectSingle` 函数实现真单选
- ✅ **任务 2**：将"当前关系阶段"和"联系频率"改为单选逻辑
- ✅ **任务 3**：保存时同时保存粗粒度字段和 Label 字段
- ✅ **任务 3**：补全 relationMap 和 freqMap 映射
- ✅ **任务 4**：回显时优先使用 Label 字段，无 Label 时用粗粒度兜底

**关键代码：**

**单选函数：**
```typescript
const selectSingle = (
  value: string,
  setter: React.Dispatch<React.SetStateAction<string[]>>
) => {
  setter([value]); // ✅ 直接替换为单个值的数组
};
```

**单选应用：**
```typescript
// 当前关系阶段（单选）
onToggle={(v: string) => {
  console.log('📌 [ProfileSetupPage] 单选关系阶段:', { clicked: v, before: relation, after: [v] });
  selectSingle(v, setRelation);
}}

// 联系频率（单选）
onToggle={(v: string) => {
  console.log('📌 [ProfileSetupPage] 单选联系频率:', { clicked: v, before: freq, after: [v] });
  selectSingle(v, setFreq);
}}
```

**保存映射：**
```typescript
const relationMap: Record<string, GirlProfile['currentStage']> = {
  '陌生人': 'stranger',
  '普通朋友': 'observing',
  '熟悉朋友': 'observing',
  '暧昧关系': 'ambiguous',
  '追求中': 'pursuing', // ✅ 已添加
  '已在一起': 'dating', // ✅ 已添加
};

const girlPayload = {
  currentStage: relationMap[selectedRelation] || 'observing',
  currentStageLabel: selectedRelation || undefined, // ✅ 保存原始 UI 标签
  interactionFrequency: freqMap[selectedFreq] || 'medium',
  interactionFrequencyLabel: selectedFreq || undefined, // ✅ 保存原始 UI 标签
};
```

**回显逻辑：**
```typescript
// 优先使用 Label 字段
if (girl.currentStageLabel) {
  nextRelation = [girl.currentStageLabel]; // ✅ 精确回显
} else {
  // 无 Label，用 currentStage 粗粒度兜底
  const stageToRelation = {
    'stranger': '陌生人',
    'observing': '普通朋友',
    'ambiguous': '暧昧关系',
    'pursuing': '追求中',
    'dating': '已在一起',
  };
  nextRelation = [stageToRelation[girl.currentStage] || '普通朋友'];
}
```

---

### 3. src/lib/db/repositories/girlProfileRepo.ts
**修改内容：**
- ✅ **任务 5**：添加详细日志输出 Label 字段
- ✅ 确认合并顺序正确（新值覆盖旧值）

**关键代码：**
```typescript
console.log('📥 [girlProfileRepo.save] existing 旧值:', {
  currentStage: existing?.currentStage,
  currentStageLabel: existing?.currentStageLabel,
  interactionFrequency: existing?.interactionFrequency,
  interactionFrequencyLabel: existing?.interactionFrequencyLabel,
});

const entity = {
  ...(existing ?? {}),  // 先展开旧值
  ...profile,           // 再展开新值（覆盖）✅
  // ...
};

console.log('📤 [girlProfileRepo.save] 最终写入值:', {
  currentStage: entity.currentStage,
  currentStageLabel: entity.currentStageLabel,
  interactionFrequency: entity.interactionFrequency,
  interactionFrequencyLabel: entity.interactionFrequencyLabel,
});
```

---

## 🎯 修复内容详解

### 1. 哪两个字段改成了真单选

**改动前（多选）：**
```typescript
const toggle = (arr, val, setArr) =>
  setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

onToggle={v => toggle(relation, v, setRelation)} // ❌ 多选
```

**改动后（单选）：**
```typescript
const selectSingle = (value, setter) => {
  setter([value]); // ✅ 直接替换
};

onToggle={v => selectSingle(v, setRelation)} // ✅ 单选
```

**效果：**
- 点击"追求中" → `relation = ['追求中']`（不再追加到数组末尾）
- 再点击"已在一起" → `relation = ['已在一起']`（替换，而不是变成 `['追求中', '已在一起']`）

---

### 2. currentStageLabel / interactionFrequencyLabel 的作用

**问题：**
- `currentStage: 'observing'` 无法区分"普通朋友"和"熟悉朋友"
- `interactionFrequency: 'medium'` 无法区分"隔天聊"和"一周几次"

**解决方案：双字段存储**

| 字段 | 类型 | 用途 | 示例 |
|------|------|------|------|
| `currentStage` | 粗粒度枚举 | AI 分析、业务逻辑 | `'observing'` |
| `currentStageLabel` | 原始字符串 | UI 精确回显 | `'熟悉朋友'` |
| `interactionFrequency` | 粗粒度枚举 | AI 分析、业务逻辑 | `'medium'` |
| `interactionFrequencyLabel` | 原始字符串 | UI 精确回显 | `'一周几次'` |

**优点：**
- AI 继续使用简化的 3-5 级分类
- 用户看到的是自己当初选的精确选项
- 不破坏现有 AI prompt 和后端逻辑

---

### 3. 保存时如何同时保存粗粒度字段和原始 UI 标签

**保存流程：**
```typescript
// 1. 用户在 UI 选择"熟悉朋友"
selectedRelation = '熟悉朋友';

// 2. 映射到粗粒度字段
currentStage = relationMap['熟悉朋友'] = 'observing';

// 3. 同时保存原始 UI 标签
currentStageLabel = '熟悉朋友';

// 4. 写入数据库
girlPayload = {
  currentStage: 'observing',        // AI 用
  currentStageLabel: '熟悉朋友',     // 回显用
};
```

**数据库示例：**
```json
{
  "currentStage": "observing",
  "currentStageLabel": "熟悉朋友",
  "interactionFrequency": "medium",
  "interactionFrequencyLabel": "一周几次"
}
```

---

### 4. 回显时如何优先使用 Label 字段

**回显流程：**
```typescript
// 1. 从数据库读取
girl = {
  currentStage: 'observing',
  currentStageLabel: '熟悉朋友',
};

// 2. 优先使用 Label
if (girl.currentStageLabel) {
  setRelation([girl.currentStageLabel]); // ✅ 显示"熟悉朋友"
} else {
  // 兜底：用粗粒度映射
  setRelation(['普通朋友']); // observing 默认映射
}
```

**场景对比：**

| 场景 | 数据库值 | 回显结果 |
|------|----------|----------|
| 新数据 | `currentStage: 'observing'`<br>`currentStageLabel: '熟悉朋友'` | ✅ "熟悉朋友" |
| 旧数据 | `currentStage: 'observing'`<br>`currentStageLabel: undefined` | ✅ "普通朋友"（兜底） |
| 新数据 | `interactionFrequency: 'medium'`<br>`interactionFrequencyLabel: '一周几次'` | ✅ "一周几次" |
| 旧数据 | `interactionFrequency: 'medium'`<br>`interactionFrequencyLabel: undefined` | ✅ "隔天聊"（兜底） |

---

## ✅ 类型检查结果

```bash
npm run type-check
# ✅ 通过，0 错误
```

---

## 🧪 测试步骤

### 测试 1：单选行为
1. 进入资料建档页
2. 点击"普通朋友"
3. 再点击"追求中"
4. ✅ 控制台应显示：`before: ['普通朋友'], after: ['追求中']`
5. ✅ UI 上只有"追求中"被选中（不是两个都选中）

### 测试 2：保存"追求中"
1. 选择"追求中"
2. 点击"保存修改"
3. DevTools → IndexedDB → girlProfiles
4. ✅ `currentStage: 'pursuing'`
5. ✅ `currentStageLabel: '追求中'`

### 测试 3：精确回显
1. 选择"熟悉朋友"
2. 保存
3. 刷新页面
4. ✅ 应回显"熟悉朋友"（而不是"普通朋友"）

### 测试 4：联系频率精确回显
1. 选择"一周几次"
2. 保存
3. 刷新页面
4. ✅ 应回显"一周几次"（而不是"隔天聊"）

### 测试 5：旧数据兜底
1. 手动删除 IndexedDB 中的 `currentStageLabel` 字段
2. 刷新页面
3. ✅ 应回显"普通朋友"（observing 的兜底值）

---

## 📊 修复总结

| 问题 | 根因 | 修复方案 | 状态 |
|------|------|----------|------|
| 按钮可以多选 | 使用了 toggle 多选逻辑 | 改为 selectSingle 单选 | ✅ 已修复 |
| "追求中"无法保存 | relationMap 缺少映射 | 补全 pursuing/dating 映射 | ✅ 已修复 |
| relation[0] 是旧值 | 多选数组累加 | 单选直接替换 | ✅ 已修复 |
| "熟悉朋友"回显成"普通朋友" | observing 映射不唯一 | 新增 Label 字段精确回显 | ✅ 已修复 |
| "一周几次"回显成"隔天聊" | medium 映射不唯一 | 新增 Label 字段精确回显 | ✅ 已修复 |

---

## 🎉 关键改进

1. **真单选**：按钮点击直接替换，不再累加到数组
2. **完整映射**：relationMap 支持全部 6 个关系阶段
3. **双字段存储**：粗粒度给 AI，Label 给回显
4. **向后兼容**：旧数据无 Label 时用粗粒度兜底
5. **不破坏 AI**：AI prompt 和后端无需修改

---

测试完成后，所有字段保存和回显问题应该都已修复！
