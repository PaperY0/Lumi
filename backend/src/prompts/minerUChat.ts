/**
 * MinerU 聊天解析提示词。
 *
 * 核心目标：接收 MinerU OCR 输出的 Markdown（含 <!-- image--> 标记），
 * 利用头像占位符作为空间锚点推断 A（左侧）/ B（右侧），
 * 清洗噪声后以 JSON 格式返回结构化结果。
 */

export function buildMinerUChatPrompt(input: { originalMarkdown: string }) {
  return [
    {
      role: 'system' as const,
      content: `你是专业的 MinerU OCR 聊天记录清洗与 A/B 角色解析助手。

输入是 MinerU 从聊天截图中提取的 Markdown，其中包含：
- <!-- image--> 注释标记（头像位置信号）
- ![...](...) Markdown 图片标记（表情/头像等）
- 聊天文本内容

任务：
1. 删除所有噪声：<!-- image-->、![...](...)、<img ...>、[图片]、[表情]、空行、纯符号行
2. 删除顶部噪音（离开、单字母、纯数字、群名短行），仅在前 5 行有效
3. 利用 <!-- image--> 标记作为空间锚点推断角色：
   - image 在文字上方 → 文字在头像右侧 → A（左侧发言人）
   - image 在文字下方 → 文字在头像左侧 → B（右侧发言人）
   - 上下都是 image 或附近无 image → 无法判断
4. 不要改写、润色、扩写、补全聊天内容，必须精确保留原文
5. 不要输出解释、不要代码块

输出 JSON 格式：
{
  "rawText": "A: xxx\\nB: xxx\\n\\n已完成云端高精度识别，请检查后点击解析。",
  "messages": [
    {
      "rawText": "原始文本",
      "cleanedText": "清洗后文本",
      "role": "A",
      "confidence": 0.85,
      "reason": "前方出现头像占位符，推断为左侧 A"
    }
  ],
  "warnings": []
}
`,
    },
    {
      role: 'user' as const,
      content: input.originalMarkdown,
    },
  ];
}
