export interface WarmingSelfQuestion {
  id: string;
  dimension: string;
  text: string;
  hint?: string;
  options: Array<{ id: string; text: string; score: number; needsPause?: boolean }>;
}

export const warmingSelfQuestions: WarmingSelfQuestion[] = [
  { id: 'warm-self-1', dimension: 'pace', text: '互动变多后，你会如何控制自己的期待？', options: [{ id: 'trend', text: '看一段时间的双向互动，不靠一次热情下结论', score: 3 }, { id: 'enjoy', text: '享受互动，同时保留自己的生活', score: 3 }, { id: 'assume', text: '默认关系已经确定，只等她表态', score: 0, needsPause: true }] },
  { id: 'warm-self-2', dimension: 'emotion', text: '她某天回复变少时，你通常会？', options: [{ id: 'context', text: '先考虑她可能有自己的安排，再观察趋势', score: 3 }, { id: 'one-care', text: '发一次轻量关心，之后给空间', score: 2 }, { id: 'question', text: '连续询问是不是对我失去兴趣', score: 0, needsPause: true }] },
  { id: 'warm-self-3', dimension: 'communication', text: '你想表达好感时，哪种方式更合适？', options: [{ id: 'specific', text: '表达具体欣赏，不要求她立即回应', score: 3 }, { id: 'hint', text: '用轻松试探，看她是否接住', score: 2 }, { id: 'confess-now', text: '用表白迫使关系马上确定', score: 0, needsPause: true }] },
  { id: 'warm-self-4', dimension: 'invitation', text: '你准备邀约时，最重要的是？', options: [{ id: 'optional', text: '具体、轻量、有退路，并观察她是否愿意投入', score: 3 }, { id: 'repeat-later', text: '一次拒绝后隔一段时间再看情况', score: 2 }, { id: 'insist', text: '尽量说服她接受这次安排', score: 0, needsPause: true }] },
  { id: 'warm-self-5', dimension: 'boundaries', text: '关于亲昵称呼或更私人的话题，你会？', options: [{ id: 'comfort', text: '确认她是否舒服，再逐步增加亲密度', score: 3 }, { id: 'observe', text: '根据她主动使用的称呼和回应判断', score: 2 }, { id: 'assume', text: '觉得关系变好就可以直接使用', score: 0, needsPause: true }] },
  { id: 'warm-self-6', dimension: 'emotion', text: '当你很想得到确定答案时，你会？', options: [{ id: 'pause', text: '先安顿情绪，区分事实、期待和担心', score: 3 }, { id: 'talk', text: '和朋友讨论，但自己对行为负责', score: 2 }, { id: 'demand', text: '马上找她确认，让她消除我的焦虑', score: 0, needsPause: true }] },
  { id: 'warm-self-7', dimension: 'selfCare', text: '关系升温后，你的生活安排会？', options: [{ id: 'balanced', text: '继续保留工作、朋友、兴趣和休息', score: 3 }, { id: 'adjust', text: '适当安排时间，但不会放弃原有节奏', score: 2 }, { id: 'all-in', text: '把大部分时间和情绪都交给这段关系', score: 1 }] },
  { id: 'warm-self-8', dimension: 'reflection', text: '如果发现自己推进得比她快，你会？', options: [{ id: 'slow', text: '主动放慢，给她选择和回应的时间', score: 3 }, { id: 'ask', text: '温和询问她更舒服的节奏', score: 3 }, { id: 'prove', text: '加倍付出来证明自己的认真', score: 0, needsPause: true }] },
];

export function evaluateWarmingSelf(answers: Record<string, string>) {
  let total = 0; let answered = 0; let needsPause = false;
  warmingSelfQuestions.forEach((q) => { const option = q.options.find((item) => item.id === answers[q.id]); if (!option) return; total += option.score; answered += 1; needsPause ||= option.needsPause === true; });
  const average = answered ? total / answered : 2;
  return { needsPause, strengths: average >= 2.5 ? ['能在关系变近时保持观察和分寸'] : [], practiceSuggestions: average < 2.5 ? ['下一次推进前，先确认对方是否也在投入和回应。'] : ['继续用具体、轻量、可拒绝的方式增加共同体验。'], pauseMessage: needsPause ? '建议暂停推进：不要用表白、付出或连续确认换取关系确定，先尊重对方节奏。' : '' };
}
