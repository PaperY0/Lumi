export type PursuitSelfDimension =
  | 'selfAwareness'
  | 'emotionRegulation'
  | 'communication'
  | 'boundaries'
  | 'growthContext'
  | 'supportSystem';

export interface PursuitSelfQuestion {
  id: string;
  dimension: PursuitSelfDimension;
  text: string;
  hint?: string;
  options: Array<{ id: string; text: string; score: number; needsPause?: boolean }>;
}

export const pursuitSelfQuestions: PursuitSelfQuestion[] = [
  {
    id: 'ps1', dimension: 'selfAwareness', text: '她一段时间没有回复时，你通常先怎样理解？',
    options: [
      { id: 'allow-context', text: '先承认自己会在意，但不急着下结论，继续安排自己的事', score: 3 },
      { id: 'ask-once', text: '等合适时间发一条自然关心，之后不追加', score: 2 },
      { id: 'self-blame', text: '反复想是不是我哪里做错了', score: 1 },
      { id: 'assume-rejection', text: '直接认定她不想理我', score: 0 },
      { id: 'unsure', text: '暂不确定', score: 2 },
    ],
  },
  {
    id: 'ps2', dimension: 'selfAwareness', text: '当你想联系她时，你更常从哪里出发？',
    options: [
      { id: 'share-genuine', text: '有真实想分享或想了解她的事情，再自然开启', score: 3 },
      { id: 'keep-presence', text: '主要是怕她忘记我，所以找话题', score: 1 },
      { id: 'need-reassurance', text: '希望她回复来证明她在意我', score: 1 },
      { id: 'unsure', text: '暂不确定', score: 2 },
    ],
  },
  {
    id: 'ps3', dimension: 'emotionRegulation', text: '你因为关系感到焦虑时，通常会怎么安放这种情绪？',
    options: [
      { id: 'pause-and-return', text: '先暂停发送，找回自己的节奏，情绪稳定后再决定是否沟通', score: 3 },
      { id: 'talk-to-friend', text: '和信任的人聊聊，但不会让对方替我判断她的心意', score: 2 },
      { id: 'scroll-and-ruminate', text: '反复翻聊天记录或动态找答案', score: 1 },
      { id: 'send-in-impulse', text: '忍不住连续发消息确认关系', score: 0 },
      { id: 'unsure', text: '暂不确定', score: 2 },
    ],
  },
  {
    id: 'ps4', dimension: 'boundaries', text: '她明确说“这次不方便”或“想慢一点”时，你会怎么做？',
    options: [
      { id: 'respect-and-leave-space', text: '表示理解，停止推进，并把选择权留给她', score: 3 },
      { id: 'ask-one-context', text: '只在必要时确认一次是否有更合适的安排', score: 2 },
      { id: 'continue-after-no', text: '换个说法继续劝，直到她同意', score: 0, needsPause: true },
      { id: 'withdraw-punish', text: '冷下来，让她知道我不高兴', score: 0, needsPause: true },
      { id: 'unsure', text: '暂不确定', score: 2 },
    ],
  },
  {
    id: 'ps5', dimension: 'boundaries', text: '对方没有主动分享的私人信息，你通常会？',
    options: [
      { id: 'wait-for-consent', text: '尊重她是否愿意说，不用试探或旁敲侧击逼出答案', score: 3 },
      { id: 'ask-openly-once', text: '在合适时机坦诚说明为什么想了解，并接受她不回答', score: 2 },
      { id: 'research-socials', text: '通过朋友圈、共同朋友或其他渠道反复查证', score: 0, needsPause: true },
      { id: 'unsure', text: '暂不确定', score: 2 },
    ],
  },
  {
    id: 'ps6', dimension: 'communication', text: '她讲一件烦心事时，你更接近哪种反应？',
    options: [
      { id: 'listen-first', text: '先确认我听懂了她的感受，再问她想被倾听还是一起想办法', score: 3 },
      { id: 'comfort-first', text: '先安慰她，之后再看她愿不愿意继续聊', score: 2 },
      { id: 'solve-immediately', text: '马上告诉她该怎么做', score: 1 },
      { id: 'redirect-to-self', text: '很快转到我自己的类似经历', score: 0 },
      { id: 'unsure', text: '暂不确定', score: 2 },
    ],
  },
  {
    id: 'ps7', dimension: 'communication', text: '当你们看法不同，你一般如何表达？',
    options: [
      { id: 'curious-and-clear', text: '先了解她为什么这样想，再清楚表达自己的感受和需要', score: 3 },
      { id: 'avoid-topic', text: '不太想冲突，常常把话题带过去', score: 1 },
      { id: 'win-argument', text: '更在意证明自己是对的', score: 0 },
      { id: 'unsure', text: '暂不确定', score: 2 },
    ],
  },
  {
    id: 'ps8', dimension: 'growthContext', text: '在成长环境里，表达不开心或不同意见通常是？',
    hint: '只按你愿意回忆的程度填写；这不是评判家庭。',
    options: [
      { id: 'can-speak', text: '大多可以说出来，也有人愿意听', score: 3 },
      { id: 'learned-to-hold', text: '常常先忍着，怕给别人添麻烦', score: 1 },
      { id: 'conflict-escalates', text: '容易变成指责、冷战或很激烈的争执', score: 1 },
      { id: 'prefer-not-answer', text: '暂不想回答', score: 2 },
    ],
  },
  {
    id: 'ps9', dimension: 'growthContext', text: '当关系里出现不确定时，你更熟悉的应对方式是？',
    options: [
      { id: 'name-needs', text: '先分清是害怕、期待还是需要确认，再选择合适表达', score: 3 },
      { id: 'please-more', text: '更努力讨好，希望关系稳定下来', score: 1 },
      { id: 'pull-away-first', text: '先疏远自己，避免可能受伤', score: 1 },
      { id: 'unsure', text: '暂不确定', score: 2 },
    ],
  },
  {
    id: 'ps10', dimension: 'supportSystem', text: '在追求期间，你的生活重心通常是？',
    options: [
      { id: 'balanced-life', text: '工作学习、朋友、兴趣和关系都保有自己的位置', score: 3 },
      { id: 'relationship-heavy', text: '会明显把很多时间和情绪都放在她身上', score: 1 },
      { id: 'closed-off', text: '不太愿意和任何人谈，也很少做自己的事', score: 1 },
      { id: 'unsure', text: '暂不确定', score: 2 },
    ],
  },
  {
    id: 'ps11', dimension: 'supportSystem', text: '朋友给你感情建议时，你更常怎么使用？',
    options: [
      { id: 'reflect-not-delegate', text: '参考不同观点，但自己负责判断和行为', score: 3 },
      { id: 'seek-certainty', text: '希望朋友替我确认她到底喜不喜欢我', score: 1 },
      { id: 'follow-pressure', text: '朋友说该冲就冲，即使她表达过犹豫', score: 0, needsPause: true },
      { id: 'unsure', text: '暂不确定', score: 2 },
    ],
  },
  {
    id: 'ps12', dimension: 'emotionRegulation', text: '准备邀约前，你会如何判断是否合适？',
    options: [
      { id: 'specific-and-optional', text: '根据已知兴趣提出具体、轻量且可被拒绝的邀请', score: 3 },
      { id: 'wait-perfectly', text: '一直等绝对不会被拒绝的时机', score: 1 },
      { id: 'push-for-answer', text: '希望她马上给明确答复，不喜欢模糊状态', score: 1 },
      { id: 'unsure', text: '暂不确定', score: 2 },
    ],
  },
];

const dimensionMeta: Record<PursuitSelfDimension, { strength: string; practice: string }> = {
  selfAwareness: { strength: '能区分感受与事实', practice: '情绪上来时，先写下“我知道的事实”和“我担心的猜测”。' },
  emotionRegulation: { strength: '能把焦虑放回自己的节奏', practice: '准备发送追问前，先给自己 20 分钟做一件离开屏幕的事。' },
  communication: { strength: '愿意倾听并清楚表达', practice: '下一次先用“我听到你在意的是……”确认理解。' },
  boundaries: { strength: '尊重拒绝与个人界限', practice: '练习一句收尾：“没关系，你方便时再说。”' },
  growthContext: { strength: '愿意理解成长经验如何影响现在', practice: '只观察一个旧习惯：紧张时更倾向讨好、回避，还是直接表达。' },
  supportSystem: { strength: '保有关系之外的生活支点', practice: '本周安排一次不围绕这段关系的朋友、兴趣或运动时间。' },
};

export function evaluatePursuitSelfAssessment(answers: Record<string, string>) {
  const scores = new Map<PursuitSelfDimension, number[]>();
  let needsPause = false;

  pursuitSelfQuestions.forEach((question) => {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option) return;
    const values = scores.get(question.dimension) ?? [];
    values.push(option.score);
    scores.set(question.dimension, values);
    needsPause ||= option.needsPause === true;
  });

  const strengths: string[] = [];
  const practiceSuggestions: string[] = [];
  scores.forEach((values, dimension) => {
    const average = values.reduce((total, score) => total + score, 0) / values.length;
    if (average >= 2.5) strengths.push(dimensionMeta[dimension].strength);
    if (average < 2.5) practiceSuggestions.push(dimensionMeta[dimension].practice);
  });

  return {
    strengths,
    practiceSuggestions: practiceSuggestions.length > 0 ? practiceSuggestions : ['保持自己的生活节奏，继续用具体、低压力的方式表达好感。'],
    needsPause,
    pauseMessage: needsPause
      ? '建议暂停推进：先停止追问、劝说或查证行为，尊重对方已表达的界限，并把注意力放回自己的情绪调节。'
      : '',
  };
}
