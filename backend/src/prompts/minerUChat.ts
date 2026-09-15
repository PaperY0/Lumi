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
2. 保留短句、数字和昵称；不要猜测顶部短行是噪声而删除真实消息
3. A 表示左侧、B 表示右侧。仅在原文包含明确角色标签或可靠空间坐标时判定 A/B。
   Markdown 图片标记的上下顺序不能证明左右位置；没有可靠证据时必须输出 role="unknown"、confidence=0。
   禁止交替分配 A/B，禁止编造发言人。
4. 不要改写、润色、扩写、补全聊天内容，必须精确保留原文
5. 不要输出解释、不要代码块

输出 JSON 格式：
{
  "rawText": "识别到的聊天原文，不添加操作提示",
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
