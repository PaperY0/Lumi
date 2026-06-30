/**
 * 男生沟通类型问卷题库（30 题）
 * 维度：表达主动性 / 情绪敏感 / 共情 / 边界感 / 推进节奏 / 冲突处理 / 自信 / 焦虑 / 幽默 / 倾听
 * 每题 4 选项，分值 0-3。0=不健康倾向，3=健康倾向。
 * 注：标签生成用维度均分判断。
 */

export type MaleDimension =
  | 'proactivity' | 'emotionAwareness' | 'empathy' | 'boundary' | 'pacing'
  | 'conflict' | 'confidence' | 'anxiety' | 'humor' | 'listening';

export interface MaleQuestion {
  id: string;
  dimension: MaleDimension;
  text: string;
  options: { label: string; text: string; score: number }[];
}

export const maleQuestions: MaleQuestion[] = [
  // 表达主动性
  { id: 'm1', dimension: 'proactivity', text: '你想到她时，最常做的是？', options: [
    { label: 'A', text: '想想就过去了，怕打扰', score: 1 },
    { label: 'B', text: '等她先发我再回', score: 0 },
    { label: 'C', text: '找个借口（段子/分享）发过去', score: 2 },
    { label: 'D', text: '直接说"刚想到你"', score: 3 },
  ]},
  { id: 'm2', dimension: 'proactivity', text: '一周里你主动开启对话的次数？', options: [
    { label: 'A', text: '几乎没有，都是她先', score: 0 },
    { label: 'B', text: '1-2 次', score: 1 },
    { label: 'C', text: '3-4 次', score: 2 },
    { label: 'D', text: '几乎天天', score: 3 },
  ]},
  { id: 'm3', dimension: 'proactivity', text: '你有好感时最常的做法？', options: [
    { label: 'A', text: '暗示，看她反应', score: 1 },
    { label: 'B', text: '在朋友圈频繁点赞刷存在感', score: 1 },
    { label: 'C', text: '主动找她聊但不挑明', score: 2 },
    { label: 'D', text: '直接说"我挺喜欢和你聊天"', score: 3 },
  ]},

  // 情绪敏感度
  { id: 'm4', dimension: 'emotionAwareness', text: '她只回了"嗯"一个字，你的第一反应？', options: [
    { label: 'A', text: '她是不是不想理我了', score: 0 },
    { label: 'B', text: '反复回看聊天找原因', score: 1 },
    { label: 'C', text: '她可能在忙', score: 3 },
    { label: 'D', text: '不管，继续我想说的', score: 2 },
  ]},
  { id: 'm5', dimension: 'emotionAwareness', text: '她说"今天好累"，你最先想到？', options: [
    { label: 'A', text: '问她是不是工作压力大', score: 2 },
    { label: 'B', text: '给她讲笑话转移情绪', score: 1 },
    { label: 'C', text: '让她早点休息', score: 2 },
    { label: 'D', text: '顺着说"我也累"', score: 0 },
  ]},
  { id: 'm6', dimension: 'emotionAwareness', text: '她朋友圈发了伤感文字，你？', options: [
    { label: 'A', text: '评论"别难过"', score: 1 },
    { label: 'B', text: '私聊问"还好吗"', score: 3 },
    { label: 'C', text: '装没看见', score: 0 },
    { label: 'D', text: '转个段子给她', score: 2 },
  ]},

  // 共情
  { id: 'm7', dimension: 'empathy', text: '她抱怨同事让她加班，你？', options: [
    { label: 'A', text: '教她怎么拒绝', score: 1 },
    { label: 'B', text: '说"那同事真过分"', score: 2 },
    { label: 'C', text: '先说"听着确实烦"再问她想咋办', score: 3 },
    { label: 'D', text: '反问"你不会拒绝吗"', score: 0 },
  ]},
  { id: 'm8', dimension: 'empathy', text: '她说她妈又催相亲，你？', options: [
    { label: 'A', text: '调侃"那来跟我相啊"', score: 1 },
    { label: 'B', text: '问"你怎么想"', score: 2 },
    { label: 'C', text: '说"父母都这样"', score: 1 },
    { label: 'D', text: '听完说"听起来你压力挺大"', score: 3 },
  ]},
  { id: 'm9', dimension: 'empathy', text: '你和她对一件事看法不同，你？', options: [
    { label: 'A', text: '努力说服她我对', score: 0 },
    { label: 'B', text: '各退一步', score: 2 },
    { label: 'C', text: '先理解她为啥这么想', score: 3 },
    { label: 'D', text: '不再聊这话题', score: 1 },
  ]},

  // 边界感
  { id: 'm10', dimension: 'boundary', text: '她明确说"今晚想自己待着"，你？', options: [
    { label: 'A', text: '"为啥呀，是不是我做错了"', score: 0 },
    { label: 'B', text: '"好的早点休息，明天聊"', score: 3 },
    { label: 'C', text: '隔半小时再发个表情包试探', score: 0 },
    { label: 'D', text: '等到第二天再说', score: 3 },
  ]},
  { id: 'm11', dimension: 'boundary', text: '她超过 12 小时没回，你？', options: [
    { label: 'A', text: '连发好几条', score: 0 },
    { label: 'B', text: '发"在吗"', score: 1 },
    { label: 'C', text: '继续等', score: 3 },
    { label: 'D', text: '朋友圈发文字暗示', score: 0 },
  ]},
  { id: 'm12', dimension: 'boundary', text: '想知道她和某男性朋友的关系，你？', options: [
    { label: 'A', text: '直接问"那是谁"', score: 1 },
    { label: 'B', text: '含蓄试探', score: 1 },
    { label: 'C', text: '不问，相信她', score: 3 },
    { label: 'D', text: '翻她朋友圈和点赞', score: 0 },
  ]},

  // 推进节奏
  { id: 'm13', dimension: 'pacing', text: '认识 2 周，你最想做的？', options: [
    { label: 'A', text: '立刻表白', score: 0 },
    { label: 'B', text: '提议见一面', score: 3 },
    { label: 'C', text: '每天聊得火热', score: 2 },
    { label: 'D', text: '继续观察', score: 2 },
  ]},
  { id: 'm14', dimension: 'pacing', text: '第一次单独吃饭后，你？', options: [
    { label: 'A', text: '当晚发"在一起吧"', score: 0 },
    { label: 'B', text: '第二天说"昨天很开心，下次再约"', score: 3 },
    { label: 'C', text: '继续日常聊天，不提那次饭', score: 1 },
    { label: 'D', text: '等她先表态', score: 1 },
  ]},
  { id: 'm15', dimension: 'pacing', text: '知道她最近很忙，你？', options: [
    { label: 'A', text: '减少打扰，偶尔关心', score: 3 },
    { label: 'B', text: '还是每天发消息', score: 1 },
    { label: 'C', text: '完全不发', score: 1 },
    { label: 'D', text: '抱怨她不重视', score: 0 },
  ]},

  // 冲突处理
  { id: 'm16', dimension: 'conflict', text: '吵架后第一件事？', options: [
    { label: 'A', text: '冷战看谁先低头', score: 0 },
    { label: 'B', text: '立刻道歉不管对错', score: 1 },
    { label: 'C', text: '先冷静再谈', score: 3 },
    { label: 'D', text: '找朋友吐槽她', score: 0 },
  ]},
  { id: 'm17', dimension: 'conflict', text: '她说你某句话伤到她了，你？', options: [
    { label: 'A', text: '"我不是这意思啊"', score: 1 },
    { label: 'B', text: '"对不起，下次注意"', score: 2 },
    { label: 'C', text: '"你具体哪里不舒服？"', score: 3 },
    { label: 'D', text: '"你太敏感了"', score: 0 },
  ]},
  { id: 'm18', dimension: 'conflict', text: '同一件事吵过 3 次了，你？', options: [
    { label: 'A', text: '还是按原来的方式', score: 0 },
    { label: 'B', text: '想换方式但不知道咋换', score: 1 },
    { label: 'C', text: '主动提"咱们换种方式聊"', score: 3 },
    { label: 'D', text: '干脆不聊', score: 1 },
  ]},

  // 自信
  { id: 'm19', dimension: 'confidence', text: '你觉得自己"凭什么"被她喜欢？', options: [
    { label: 'A', text: '想不太出来', score: 0 },
    { label: 'B', text: '至少我对她不错', score: 1 },
    { label: 'C', text: '我有些她欣赏的特质', score: 3 },
    { label: 'D', text: '我条件比同龄人好', score: 2 },
  ]},
  { id: 'm20', dimension: 'confidence', text: '她夸你时你的反应？', options: [
    { label: 'A', text: '反驳"哪有，我也就这样"', score: 1 },
    { label: 'B', text: '不好意思但接受', score: 3 },
    { label: 'C', text: '顺着调侃自己', score: 2 },
    { label: 'D', text: '觉得她在客气', score: 0 },
  ]},
  { id: 'm21', dimension: 'confidence', text: '看到她和别的男生玩得开心，你？', options: [
    { label: 'A', text: '立刻质问什么关系', score: 0 },
    { label: 'B', text: '心里不舒服但不说', score: 1 },
    { label: 'C', text: '信任她不影响我', score: 3 },
    { label: 'D', text: '反复想自己哪里不够好', score: 0 },
  ]},

  // 焦虑
  { id: 'm22', dimension: 'anxiety', text: '她回复慢的时候你最常做的？', options: [
    { label: 'A', text: '反复刷新看她在不在线', score: 0 },
    { label: 'B', text: '想她是不是不喜欢我了', score: 0 },
    { label: 'C', text: '该干嘛干嘛', score: 3 },
    { label: 'D', text: '找朋友倾诉焦虑', score: 1 },
  ]},
  { id: 'm23', dimension: 'anxiety', text: '一段关系里你最害怕的？', options: [
    { label: 'A', text: '她突然不理我', score: 0 },
    { label: 'B', text: '我们性格不合', score: 2 },
    { label: 'C', text: '我给不了她想要的', score: 1 },
    { label: 'D', text: '没什么特别害怕的', score: 3 },
  ]},
  { id: 'm24', dimension: 'anxiety', text: '你睡前常想的是？', options: [
    { label: 'A', text: '她今天怎么没主动找我', score: 0 },
    { label: 'B', text: '明天约她做什么', score: 3 },
    { label: 'C', text: '我们的未来', score: 1 },
    { label: 'D', text: '不会想这些', score: 2 },
  ]},

  // 幽默
  { id: 'm25', dimension: 'humor', text: '她讲了个不太好笑的笑话，你？', options: [
    { label: 'A', text: '礼貌笑一下', score: 2 },
    { label: 'B', text: '顺着她接梗', score: 3 },
    { label: 'C', text: '直说"这不好笑"', score: 1 },
    { label: 'D', text: '不回应', score: 0 },
  ]},
  { id: 'm26', dimension: 'humor', text: '你最常用什么活跃气氛？', options: [
    { label: 'A', text: '自嘲', score: 3 },
    { label: 'B', text: '段子表情包', score: 2 },
    { label: 'C', text: '调侃她', score: 1 },
    { label: 'D', text: '我不擅长', score: 1 },
  ]},
  { id: 'm27', dimension: 'humor', text: '你们之间有"内部梗"吗？', options: [
    { label: 'A', text: '有好几个', score: 3 },
    { label: 'B', text: '偶尔有', score: 2 },
    { label: 'C', text: '想不起来', score: 1 },
    { label: 'D', text: '没有', score: 0 },
  ]},

  // 倾听
  { id: 'm28', dimension: 'listening', text: '她讲完一件事，你最常的反应？', options: [
    { label: 'A', text: '立刻给建议', score: 1 },
    { label: 'B', text: '问"你想我怎么帮你"', score: 3 },
    { label: 'C', text: '说"嗯嗯"', score: 1 },
    { label: 'D', text: '跳到自己想说的话题', score: 0 },
  ]},
  { id: 'm29', dimension: 'listening', text: '能复述她上周告诉你的一件烦心事吗？', options: [
    { label: 'A', text: '完全记得细节', score: 3 },
    { label: 'B', text: '大致记得', score: 2 },
    { label: 'C', text: '只记得有这事', score: 1 },
    { label: 'D', text: '想不起来了', score: 0 },
  ]},
  { id: 'm30', dimension: 'listening', text: '她说话时你常做什么？', options: [
    { label: 'A', text: '看着她，停下手里的事', score: 3 },
    { label: 'B', text: '边听边玩手机', score: 1 },
    { label: 'C', text: '想自己接下来要说啥', score: 1 },
    { label: 'D', text: '走神', score: 0 },
  ]},
];

/**
 * 男生类型标签生成：每个维度均分 ≥2 算"健康"，≤1 算"短板"
 * 输出：typeTags（健康维度的中文标签）+ weaknesses（短板维度）+ suggestions（针对短板的建议）
 */
export const maleDimensionMeta: Record<MaleDimension, { label: string; weak: string; suggest: string }> = {
  proactivity:      { label: '主动表达型', weak: '表达保守型', suggest: '从小事开始练习主动开启话题，比如分享一件今天遇到的小事。' },
  emotionAwareness: { label: '情绪敏感型', weak: '情绪迟钝型', suggest: '看到对方情绪信号时，先承认情绪本身（"听起来你不太开心"），再聊事情。' },
  empathy:          { label: '共情倾听型', weak: '解决方案型', suggest: '她吐槽时先共情再给方案，可以说"听着确实让人烦"。' },
  boundary:         { label: '尊重边界型', weak: '边界模糊型', suggest: '她明确说不时不要试探，给空间反而更安全。' },
  pacing:           { label: '稳健推进型', weak: '推进过快型', suggest: '不要把单次好印象当成可以告白的信号，多见几次再判断。' },
  conflict:         { label: '修复型沟通', weak: '回避冲突型', suggest: '吵架后先冷静再谈，避免冷战和"你太敏感"这类否定。' },
  confidence:       { label: '稳定自信型', weak: '低自尊型', suggest: '她夸你时直接接受，不要反驳"哪有"。' },
  anxiety:          { label: '安全依恋型', weak: '焦虑依恋型', suggest: '她回复慢时，先做自己的事，不要把延迟当成态度变化。' },
  humor:            { label: '风趣幽默型', weak: '严肃拘谨型', suggest: '试着接她的玩笑，制造你们之间的"内部梗"。' },
  listening:        { label: '深度倾听型', weak: '心不在焉型', suggest: '她说话时放下手机看着她，记住细节。' },
};
