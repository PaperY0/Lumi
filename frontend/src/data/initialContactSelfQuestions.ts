export interface InitialContactSelfQuestion {
  id: string;
  dimension: 'firstImpression' | 'emotion' | 'communication' | 'boundaries';
  text: string;
  hint?: string;
  options: Array<{ id: string; text: string; score: number; needsPause?: boolean }>;
}

const unsure = { id: 'unsure', text: '暂不确定', score: 2 };

export const initialContactSelfQuestions: InitialContactSelfQuestion[] = [
  { id: 'ic-self-1', dimension: 'firstImpression', text: '刚认识她时，你更希望对方感受到什么？', options: [{ id: 'respectful', text: '可靠、礼貌、相处没有压力', score: 3 }, { id: 'interesting', text: '我很有趣，希望她马上记住我', score: 2 }, { id: 'impressive', text: '尽快证明自己值得被喜欢', score: 1 }, unsure] },
  { id: 'ic-self-2', dimension: 'firstImpression', text: '聊天暂时没有话题时，你通常会？', options: [{ id: 'pause', text: '自然收尾，等有真实内容时再聊', score: 3 }, { id: 'share', text: '分享一个轻量近况，不要求她接着聊', score: 2 }, { id: 'fill-silence', text: '不断找话题，害怕她觉得我没存在感', score: 1 }, unsure] },
  { id: 'ic-self-3', dimension: 'emotion', text: '她回复较慢时，你最容易出现什么反应？', options: [{ id: 'keep-life', text: '承认自己在意，但继续过自己的生活', score: 3 }, { id: 'one-care', text: '合适时发一次关心，之后等待', score: 2 }, { id: 'ruminate', text: '反复查看记录，猜测是不是被讨厌', score: 1 }, { id: 'follow-up', text: '连续发消息确认她为什么不回', score: 0, needsPause: true }, unsure] },
  { id: 'ic-self-4', dimension: 'emotion', text: '你想给她留下好印象时，最需要提醒自己？', options: [{ id: 'be-real', text: '真诚表达，不表演成另一个人', score: 3 }, { id: 'slow-down', text: '先观察她是否舒服，再逐步靠近', score: 3 }, { id: 'over-give', text: '多付出一些，让她尽快感受到我的诚意', score: 1 }, unsure] },
  { id: 'ic-self-5', dimension: 'communication', text: '她分享日常时，你更倾向于？', options: [{ id: 'listen', text: '回应她分享的内容，并给她继续说的空间', score: 3 }, { id: 'ask', text: '问一两个具体问题，但接受她不想展开', score: 2 }, { id: 'perform', text: '马上讲自己的类似经历，证明我们很合拍', score: 1 }, unsure] },
  { id: 'ic-self-6', dimension: 'communication', text: '第一次提出见面时，你会怎么做？', options: [{ id: 'clear-optional', text: '给出轻量、具体、可以拒绝的安排', score: 3 }, { id: 'wait', text: '先继续聊天，等她表现出更明确兴趣', score: 2 }, { id: 'urgent', text: '强调机会难得，希望她马上决定', score: 0, needsPause: true }, unsure] },
  { id: 'ic-self-7', dimension: 'boundaries', text: '她说“不方便”或“不想聊”时，你会？', options: [{ id: 'respect', text: '表示理解，停止追问，把选择权留给她', score: 3 }, { id: 'clarify-once', text: '必要时确认一次是否有合适的时间', score: 2 }, { id: 'persuade', text: '换种说法继续劝她改变想法', score: 0, needsPause: true }, unsure] },
  { id: 'ic-self-8', dimension: 'boundaries', text: '关于她尚未主动提过的私人信息，你会？', options: [{ id: 'wait-consent', text: '等她愿意分享，不通过别人或网络查证', score: 3 }, { id: 'ask-openly', text: '坦诚问一次，并接受她不回答', score: 2 }, { id: 'investigate', text: '通过动态、朋友或旁敲侧击了解', score: 0, needsPause: true }, unsure] },
];

export function evaluateInitialContactSelf(answers: Record<string, string>) {
  let score = 0; let answered = 0; let needsPause = false;
  initialContactSelfQuestions.forEach((question) => {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option) return; score += option.score; answered += 1; needsPause ||= option.needsPause === true;
  });
  const average = answered ? score / answered : 2;
  return {
    needsPause,
    strengths: average >= 2.5 ? ['愿意保持礼貌距离和真实表达'] : [],
    practiceSuggestions: average < 2.5 ? ['先观察对方是否舒服，再决定是否继续靠近。'] : ['继续用轻量、具体、可拒绝的方式认识对方。'],
    pauseMessage: needsPause ? '建议先暂停推进：尊重她已经表达的界限，不追问、不劝说，也不要通过其他渠道查证。' : '',
  };
}
