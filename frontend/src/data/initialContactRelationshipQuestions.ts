export interface InitialContactRelationshipQuestion {
  id: string;
  dimension: 'distance' | 'pace' | 'respect' | 'selfCare';
  text: string;
  options: Array<{ id: string; text: string; score: number; pause?: boolean }>;
}

const unsure = { id: 'unsure', text: '暂不确定', score: 2 };

export const initialContactRelationshipQuestions: InitialContactRelationshipQuestion[] = [
  { id: 'ic-rel-1', dimension: 'distance', text: '目前关系还不熟时，你会如何称呼她？', options: [{ id: 'follow-preference', text: '使用她接受或主动使用的称呼', score: 3 }, { id: 'ask-first', text: '不确定时先询问她是否舒服', score: 3 }, { id: 'pet-name', text: '默认使用亲昵称呼拉近距离', score: 0, pause: true }, unsure] },
  { id: 'ic-rel-2', dimension: 'pace', text: '刚认识不久，你想增加联系频率时会？', options: [{ id: 'observe-response', text: '看她是否稳定回应，再小幅调整', score: 3 }, { id: 'ask-time', text: '询问她更方便的聊天时间', score: 3 }, { id: 'daily-demand', text: '每天固定联系并期待她配合', score: 0, pause: true }, unsure] },
  { id: 'ic-rel-3', dimension: 'pace', text: '第一次邀约最合适的方式是？', options: [{ id: 'specific-light', text: '具体、轻量、公共场所，并明确可以拒绝', score: 3 }, { id: 'wait', text: '先继续了解，等双方更熟悉', score: 2 }, { id: 'urgent', text: '临时提出并要求她马上决定', score: 0, pause: true }, unsure] },
  { id: 'ic-rel-4', dimension: 'respect', text: '她说“不方便”时，你会？', options: [{ id: 'accept', text: '接受这次结果，不追问、不劝说', score: 3 }, { id: 'one-check', text: '只确认一次是否存在更合适的时间', score: 2 }, { id: 'persuade', text: '换方式继续说服她', score: 0, pause: true }, unsure] },
  { id: 'ic-rel-5', dimension: 'respect', text: '你想了解她的私人关系或生活细节时？', options: [{ id: 'privacy', text: '尊重她的隐私，不查证、不打听', score: 3 }, { id: 'ask-openly', text: '坦诚问一次，并接受她不回答', score: 2 }, { id: 'check', text: '通过动态、朋友或其他渠道查找', score: 0, pause: true }, unsure] },
  { id: 'ic-rel-6', dimension: 'respect', text: '你送出礼物或提供帮助时，应该？', options: [{ id: 'no-exchange', text: '选择轻量且不让她有回报压力的方式', score: 3 }, { id: 'ask-preference', text: '先确认她是否需要或是否愿意接受', score: 3 }, { id: 'expect-return', text: '希望她因此更快接受我的感情', score: 0, pause: true }, unsure] },
  { id: 'ic-rel-7', dimension: 'selfCare', text: '她暂时没有明显主动表现时，你会？', options: [{ id: 'keep-balance', text: '降低投入，继续过自己的生活并观察', score: 3 }, { id: 'communicate-once', text: '找合适时机表达一次自己的感受', score: 2 }, { id: 'prove-worth', text: '加倍付出证明自己值得被喜欢', score: 0, pause: true }, unsure] },
  { id: 'ic-rel-8', dimension: 'selfCare', text: '你发现自己因为这段关系持续焦虑时，会？', options: [{ id: 'pause', text: '暂停发送和查证，先恢复自己的节奏', score: 3 }, { id: 'friend', text: '和可信任的人聊聊，再自己决定行为', score: 2 }, { id: 'ask-reassurance', text: '马上找她确认，让她负责消除焦虑', score: 0, pause: true }, unsure] },
];

export function evaluateInitialContactRelationship(answers: Record<string, string>) {
  let total = 0; let answered = 0; let needsPause = false;
  initialContactRelationshipQuestions.forEach((question) => { const option = question.options.find((item) => item.id === answers[question.id]); if (!option) return; total += option.score; answered += 1; needsPause ||= option.pause === true; });
  const average = answered ? total / answered : 2; const status = needsPause ? 'pause' : average < 1.8 ? 'slow' : 'continue';
  return { status, average, title: status === 'pause' ? '需要暂停复盘' : status === 'slow' ? '建议放慢' : '可以继续认识', message: status === 'pause' ? '请先停止推进，尊重对方的边界，不用礼物、解释或追问换取靠近。' : status === 'slow' ? '建议降低频率，保持礼貌距离，先观察双方是否有自然的互动回流。' : '当前行为大体保留了礼貌和拒绝空间，可以继续用轻量、具体的方式认识对方。' };
}
