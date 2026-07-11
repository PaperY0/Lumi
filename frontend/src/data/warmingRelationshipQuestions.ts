export const warmingRelationshipQuestions = [
  { id: 'warm-rel-1', dimension: 'pace', text: '你准备进一步靠近前，最应该先看什么？', options: [{ id: 'mutual', text: '一段时间里的双方主动和投入是否大致平衡', score: 3 }, { id: 'comfort', text: '她是否对当前互动表现舒服', score: 3 }, { id: 'single', text: '一次特别热络的聊天', score: 1 }, { id: 'unsure', text: '暂不确定', score: 2 }] },
  { id: 'warm-rel-2', dimension: 'invitation', text: '升温期邀约怎样更尊重对方？', options: [{ id: 'clear-optional', text: '给出具体安排，并明确不方便可以拒绝', score: 3 }, { id: 'ask-preference', text: '先问她更舒服的时间和方式', score: 3 }, { id: 'urgent', text: '强调你已经准备好，希望她马上配合', score: 0, pause: true }, { id: 'unsure', text: '暂不确定', score: 2 }] },
  { id: 'warm-rel-3', dimension: 'boundary', text: '她对更亲密的称呼或话题没有回应时，你会？', options: [{ id: 'step-back', text: '收回试探，恢复她舒服的称呼和话题', score: 3 }, { id: 'ask', text: '找合适时机直接询问她是否舒服', score: 3 }, { id: 'repeat', text: '多试几次，直到她习惯', score: 0, pause: true }, { id: 'unsure', text: '暂不确定', score: 2 }] },
  { id: 'warm-rel-4', dimension: 'boundary', text: '她拒绝一次邀约但没有给替代安排时，你会？', options: [{ id: 'accept', text: '接受这次结果，不追问、不施压', score: 3 }, { id: 'wait', text: '过一段时间再看是否出现自然窗口', score: 2 }, { id: 'convince', text: '继续解释为什么这次见面对关系很重要', score: 0, pause: true }, { id: 'unsure', text: '暂不确定', score: 2 }] },
  { id: 'warm-rel-5', dimension: 'clarity', text: '你想知道她是否也在靠近时，最合适的做法是？', options: [{ id: 'observe', text: '结合一段时间的行为和投入判断', score: 3 }, { id: 'gentle-share', text: '表达自己的感受，并给她思考和拒绝空间', score: 3 }, { id: 'demand', text: '要求她现在就给出明确答案', score: 0, pause: true }, { id: 'unsure', text: '暂不确定', score: 2 }] },
  { id: 'warm-rel-6', dimension: 'gift', text: '升温期准备礼物或帮助时，你会？', options: [{ id: 'light', text: '选择轻量、合适且不要求回报的方式', score: 3 }, { id: 'ask', text: '先确认她是否需要或愿意接受', score: 3 }, { id: 'exchange', text: '希望她收到后更快确认关系', score: 0, pause: true }, { id: 'unsure', text: '暂不确定', score: 2 }] },
  { id: 'warm-rel-7', dimension: 'selfCare', text: '当互动出现波动时，你会如何保护自己？', options: [{ id: 'balance', text: '保持自己的生活，减少反复查证', score: 3 }, { id: 'communicate', text: '找合适时机沟通一次，再尊重她的选择', score: 3 }, { id: 'overinvest', text: '加倍投入，试图把关系拉回原来的热度', score: 0, pause: true }, { id: 'unsure', text: '暂不确定', score: 2 }] },
  { id: 'warm-rel-8', dimension: 'pace', text: '如果发现你的推进明显快于她，你会？', options: [{ id: 'slow', text: '主动放慢，把下一步选择权交还给她', score: 3 }, { id: 'check', text: '询问她更舒服的互动节奏', score: 3 }, { id: 'push', text: '用更多承诺和付出证明自己认真', score: 0, pause: true }, { id: 'unsure', text: '暂不确定', score: 2 }] },
];

export function evaluateWarmingRelationship(answers: Record<string, string>) {
  let total = 0; let answered = 0; let needsPause = false;
  warmingRelationshipQuestions.forEach((q) => { const option = q.options.find((item) => item.id === answers[q.id]); if (!option) return; total += option.score; answered += 1; needsPause ||= option.pause === true; });
  const average = answered ? total / answered : 2; const status = needsPause ? 'pause' : average < 1.8 ? 'slow' : 'continue';
  return { status, average, title: status === 'pause' ? '需要暂停复盘' : status === 'slow' ? '建议放慢' : '可以继续升温', message: status === 'pause' ? '请先停止推进，尊重对方边界，不用解释、礼物或承诺换取靠近。' : status === 'slow' ? '建议降低推进速度，观察双方投入是否回流，再决定下一步。' : '当前行为大体保留了双方选择权，可以继续用轻量共同体验增加了解。' };
}
