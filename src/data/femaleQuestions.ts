/**
 * 女生观察问卷（30 题）—— 基于用户的客观观察，非"测试女生"
 * 维度：互动主动 / 情绪表达 / 边界感 / 回应速度 / 分享欲 / 邀约接受 / 亲密接受 / 仪式感 / 冲突回避 / 关系投入
 */

export type FemaleDimension =
  | 'initiative' | 'emotionExpression' | 'boundary' | 'responseSpeed' | 'sharing'
  | 'inviteAccept' | 'intimacy' | 'ritual' | 'conflictAvoid' | 'investment';

export interface FemaleQuestion {
  id: string;
  dimension: FemaleDimension;
  text: string;
  hint?: string;
  options: { label: string; text: string; score: number }[];
}

export const femaleQuestions: FemaleQuestion[] = [
  // 互动主动
  { id: 'f1', dimension: 'initiative', text: '最近一周对话谁先开启更多？', options: [
    { label: 'A', text: '几乎都是我', score: 0 },
    { label: 'B', text: '多数我，偶尔她', score: 1 },
    { label: 'C', text: '差不多对半', score: 3 },
    { label: 'D', text: '多数是她', score: 3 },
  ]},
  { id: 'f2', dimension: 'initiative', text: '你几天不联系她，她会？', options: [
    { label: 'A', text: '主动找我', score: 3 },
    { label: 'B', text: '等我先来', score: 1 },
    { label: 'C', text: '完全不联系', score: 0 },
    { label: 'D', text: '我没尝试过', score: 1 },
  ]},
  { id: 'f3', dimension: 'initiative', text: '她有趣的事会主动告诉你吗？', options: [
    { label: 'A', text: '经常', score: 3 },
    { label: 'B', text: '偶尔', score: 2 },
    { label: 'C', text: '只有问起才说', score: 1 },
    { label: 'D', text: '几乎不分享', score: 0 },
  ]},

  // 情绪表达
  { id: 'f4', dimension: 'emotionExpression', text: '她不开心时你能从消息里看出来吗？', options: [
    { label: 'A', text: '她会直接告诉我', score: 3 },
    { label: 'B', text: '能感觉到但她不明说', score: 2 },
    { label: 'C', text: '完全感觉不出', score: 0 },
    { label: 'D', text: '她会突然不回消息', score: 1 },
  ]},
  { id: 'f5', dimension: 'emotionExpression', text: '她对你表达过哪些具体感受？', options: [
    { label: 'A', text: '喜欢/开心/感谢都说过', score: 3 },
    { label: 'B', text: '偶尔说一两句', score: 2 },
    { label: 'C', text: '几乎不说', score: 0 },
    { label: 'D', text: '只在节日才说', score: 1 },
  ]},
  { id: 'f6', dimension: 'emotionExpression', text: '她不爽时通常的表现？', options: [
    { label: 'A', text: '直接说出来', score: 3 },
    { label: 'B', text: '冷处理', score: 1 },
    { label: 'C', text: '阴阳怪气', score: 1 },
    { label: 'D', text: '装没事', score: 0 },
  ]},

  // 边界感
  { id: 'f7', dimension: 'boundary', text: '你越界（问太隐私）时，她会？', options: [
    { label: 'A', text: '明确说"不想聊这个"', score: 3 },
    { label: 'B', text: '转话题', score: 2 },
    { label: 'C', text: '勉强回答', score: 1 },
    { label: 'D', text: '我没法判断', score: 1 },
  ]},
  { id: 'f8', dimension: 'boundary', text: '她对你提过哪些不喜欢的行为？', options: [
    { label: 'A', text: '提过 2-3 件以上', score: 3 },
    { label: 'B', text: '1 件', score: 2 },
    { label: 'C', text: '没提过', score: 1 },
    { label: 'D', text: '我没问过', score: 0 },
  ]},
  { id: 'f9', dimension: 'boundary', text: '她拒绝邀约的方式？', options: [
    { label: 'A', text: '直说"那天不行，改 xx 怎么样"', score: 3 },
    { label: 'B', text: '"再说"', score: 1 },
    { label: 'C', text: '不回应', score: 0 },
    { label: 'D', text: '没拒绝过', score: 3 },
  ]},

  // 回应速度
  { id: 'f10', dimension: 'responseSpeed', text: '她平均多久回你一次消息？', options: [
    { label: 'A', text: '几分钟内', score: 3 },
    { label: 'B', text: '半小时内', score: 2 },
    { label: 'C', text: '几小时', score: 1 },
    { label: 'D', text: '看心情，半天到几天', score: 0 },
  ]},
  { id: 'f11', dimension: 'responseSpeed', text: '她回复的字数通常？', options: [
    { label: 'A', text: '比我多', score: 3 },
    { label: 'B', text: '跟我差不多', score: 2 },
    { label: 'C', text: '比我少很多', score: 1 },
    { label: 'D', text: '单字回复', score: 0 },
  ]},
  { id: 'f12', dimension: 'responseSpeed', text: '她下班/下课后会主动找你吗？', options: [
    { label: 'A', text: '经常', score: 3 },
    { label: 'B', text: '偶尔', score: 2 },
    { label: 'C', text: '几乎不', score: 1 },
    { label: 'D', text: '不知道', score: 1 },
  ]},

  // 分享欲
  { id: 'f13', dimension: 'sharing', text: '她会和你聊家人/朋友/童年吗？', options: [
    { label: 'A', text: '经常聊', score: 3 },
    { label: 'B', text: '偶尔聊', score: 2 },
    { label: 'C', text: '只有问才说', score: 1 },
    { label: 'D', text: '从没聊过', score: 0 },
  ]},
  { id: 'f14', dimension: 'sharing', text: '她吃饭/买新东西/看电影会主动告诉你吗？', options: [
    { label: 'A', text: '会', score: 3 },
    { label: 'B', text: '偶尔', score: 2 },
    { label: 'C', text: '不会', score: 0 },
    { label: 'D', text: '不确定', score: 1 },
  ]},
  { id: 'f15', dimension: 'sharing', text: '她有半夜或情绪激动时找你倾诉过吗？', options: [
    { label: 'A', text: '有过', score: 3 },
    { label: 'B', text: '类似的有过一次', score: 2 },
    { label: 'C', text: '没有', score: 1 },
    { label: 'D', text: '还没到那个程度', score: 1 },
  ]},

  // 邀约接受
  { id: 'f16', dimension: 'inviteAccept', text: '你最近一次邀约的结果？', options: [
    { label: 'A', text: '接受并准时来', score: 3 },
    { label: 'B', text: '接受但临时改', score: 2 },
    { label: 'C', text: '婉拒并主动改约', score: 3 },
    { label: 'D', text: '婉拒没改约/没回应', score: 0 },
  ]},
  { id: 'f17', dimension: 'inviteAccept', text: '你们一共见过几次面？', options: [
    { label: 'A', text: '5 次以上', score: 3 },
    { label: 'B', text: '2-4 次', score: 2 },
    { label: 'C', text: '1 次', score: 1 },
    { label: 'D', text: '还没见过', score: 0 },
  ]},
  { id: 'f18', dimension: 'inviteAccept', text: '她有主动提议过见面吗？', options: [
    { label: 'A', text: '有过', score: 3 },
    { label: 'B', text: '暗示过', score: 2 },
    { label: 'C', text: '没有', score: 1 },
    { label: 'D', text: '我也没等过', score: 1 },
  ]},

  // 亲密接受
  { id: 'f19', dimension: 'intimacy', text: '聊到感情话题时她？', options: [
    { label: 'A', text: '会接，分享自己', score: 3 },
    { label: 'B', text: '听但不说自己', score: 1 },
    { label: 'C', text: '转话题', score: 1 },
    { label: 'D', text: '直接回避', score: 0 },
  ]},
  { id: 'f20', dimension: 'intimacy', text: '你提到"喜欢/在意"时她？', options: [
    { label: 'A', text: '回应同样的字眼', score: 3 },
    { label: 'B', text: '半开玩笑接', score: 2 },
    { label: 'C', text: '沉默或转话题', score: 1 },
    { label: 'D', text: '明确说"别这样"', score: 0 },
  ]},
  { id: 'f21', dimension: 'intimacy', text: '你们有过身体接触（拥抱/牵手）吗？', options: [
    { label: 'A', text: '有，且自然', score: 3 },
    { label: 'B', text: '有过一次但没再有', score: 1 },
    { label: 'C', text: '还没到那阶段', score: 1 },
    { label: 'D', text: '她明确拒绝过', score: 0 },
  ]},

  // 仪式感
  { id: 'f22', dimension: 'ritual', text: '她记得你随口提过的小事吗？', options: [
    { label: 'A', text: '记得，还会再提起', score: 3 },
    { label: 'B', text: '偶尔记得', score: 2 },
    { label: 'C', text: '基本不记得', score: 0 },
    { label: 'D', text: '我没观察过', score: 1 },
  ]},
  { id: 'f23', dimension: 'ritual', text: '她对节日/纪念日的态度？', options: [
    { label: 'A', text: '看重，会准备', score: 3 },
    { label: 'B', text: '提一下但不太在意', score: 2 },
    { label: 'C', text: '完全没提过', score: 1 },
    { label: 'D', text: '说"形式主义"', score: 1 },
  ]},
  { id: 'f24', dimension: 'ritual', text: '她有给你准备过什么小礼物/惊喜吗？', options: [
    { label: 'A', text: '有过', score: 3 },
    { label: 'B', text: '提过想送但没送', score: 2 },
    { label: 'C', text: '没有过', score: 1 },
    { label: 'D', text: '我也没送过她', score: 1 },
  ]},

  // 冲突回避
  { id: 'f25', dimension: 'conflictAvoid', text: '你们有过分歧时她？', options: [
    { label: 'A', text: '直接说出不同看法', score: 3 },
    { label: 'B', text: '先听后表达', score: 3 },
    { label: 'C', text: '不说，但能看出不爽', score: 1 },
    { label: 'D', text: '直接回避或冷处理', score: 0 },
  ]},
  { id: 'f26', dimension: 'conflictAvoid', text: '你做错事道歉后她？', options: [
    { label: 'A', text: '接受并说"下次注意"', score: 3 },
    { label: 'B', text: '原谅但还会念叨', score: 2 },
    { label: 'C', text: '冷一段时间再恢复', score: 1 },
    { label: 'D', text: '从此疏远', score: 0 },
  ]},
  { id: 'f27', dimension: 'conflictAvoid', text: '她有公开过对你的不满吗？', options: [
    { label: 'A', text: '当面温和说过', score: 3 },
    { label: 'B', text: '从来没说过', score: 1 },
    { label: 'C', text: '在朋友圈隐晦', score: 0 },
    { label: 'D', text: '我没注意过', score: 1 },
  ]},

  // 关系投入
  { id: 'f28', dimension: 'investment', text: '她有提过未来一起做的事吗？', options: [
    { label: 'A', text: '提过具体计划（一起去某地等）', score: 3 },
    { label: 'B', text: '泛泛说过', score: 2 },
    { label: 'C', text: '没提过', score: 1 },
    { label: 'D', text: '明确说"先看看"', score: 0 },
  ]},
  { id: 'f29', dimension: 'investment', text: '她让你认识过她的朋友/家人吗？', options: [
    { label: 'A', text: '认识过', score: 3 },
    { label: 'B', text: '提到过他们的名字', score: 2 },
    { label: 'C', text: '从没提', score: 1 },
    { label: 'D', text: '刻意避开', score: 0 },
  ]},
  { id: 'f30', dimension: 'investment', text: '过去 1 个月她聊到过你们关系定位吗？', options: [
    { label: 'A', text: '主动聊过', score: 3 },
    { label: 'B', text: '我提过她接了', score: 2 },
    { label: 'C', text: '我提过她回避', score: 0 },
    { label: 'D', text: '没人提', score: 1 },
  ]},
];

/**
 * 维度元信息：用于生成"性格标签 / 积极信号 / 谨慎信号"
 */
export const femaleDimensionMeta: Record<FemaleDimension, { positive: string; caution: string }> = {
  initiative:        { positive: '主动型',     caution: '被动型' },
  emotionExpression: { positive: '情绪开放',   caution: '情绪封闭' },
  boundary:          { positive: '边界清晰',   caution: '边界模糊' },
  responseSpeed:     { positive: '高互动热度', caution: '回应较冷' },
  sharing:           { positive: '分享欲强',   caution: '分享欲弱' },
  inviteAccept:      { positive: '愿意线下',   caution: '回避线下' },
  intimacy:          { positive: '接受亲密',   caution: '回避亲密' },
  ritual:            { positive: '重视仪式感', caution: '不重仪式' },
  conflictAvoid:     { positive: '直接沟通',   caution: '冲突回避' },
  investment:        { positive: '高投入度',   caution: '低投入度' },
};

/**
 * 阶段判定：根据总分推断当前可能阶段
 */
export function inferStage(totalScore: number): string {
  if (totalScore >= 75) return '关系明确期';
  if (totalScore >= 55) return '暧昧推进期';
  if (totalScore >= 35) return '暧昧观察期';
  if (totalScore >= 15) return '初识接触期';
  return '关系冷淡期';
}
