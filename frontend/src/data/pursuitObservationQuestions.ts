export interface PursuitObservationQuestion {
  id: string;
  dimension: 'initiative' | 'communication' | 'boundary' | 'investment';
  text: string;
  options: Array<{ id: string; text: string; signal?: string; uncertain?: boolean }>;
}

const unsure = { id: 'not-sure', text: '暂不确定', uncertain: true };

export const pursuitObservationQuestions: PursuitObservationQuestion[] = [
  { id: 'po1', dimension: 'initiative', text: '最近一周，她主动开启对话的情况更接近？', options: [{ id: 'often', text: '经常主动开启', signal: '她有主动开启互动的表现' }, { id: 'sometimes', text: '偶尔主动开启', signal: '她偶尔会主动靠近' }, { id: 'rarely', text: '很少主动开启' }, unsure] },
  { id: 'po2', dimension: 'initiative', text: '她在对话中延续话题、追问或接住你的内容吗？', options: [{ id: 'often', text: '经常会延续或追问', signal: '她有持续对话的表现' }, { id: 'sometimes', text: '偶尔会', signal: '她偶尔会延续话题' }, { id: 'rarely', text: '很少或没有' }, unsure] },
  { id: 'po3', dimension: 'initiative', text: '她是否主动分享过日常、兴趣或想告诉你的事情？', options: [{ id: 'often', text: '经常主动分享', signal: '她有主动分享生活的表现' }, { id: 'when-asked', text: '问到时愿意分享', signal: '她在被询问时愿意回应' }, { id: 'rarely', text: '很少分享' }, unsure] },
  { id: 'po4', dimension: 'communication', text: '当你表达自己的近况时，她通常会？', options: [{ id: 'care', text: '回应内容或表达关心', signal: '她会回应你的生活内容' }, { id: 'brief', text: '简短回应后结束', signal: '她目前多以简短方式回应' }, { id: 'change-topic', text: '经常转移话题', signal: '她较少接住你的内容' }, unsure] },
  { id: 'po5', dimension: 'communication', text: '她表达自己的想法和偏好时，更接近？', options: [{ id: 'clear', text: '会清楚说出自己的想法', signal: '她会表达自己的偏好' }, { id: 'sometimes', text: '有时表达，有时随和', signal: '她的表达程度会随场景变化' }, { id: 'avoid', text: '经常说“都可以”或回避表达' }, unsure] },
  { id: 'po6', dimension: 'communication', text: '她不开心、疲惫或有压力时，通常会？', options: [{ id: 'tell', text: '直接告诉你或说明需要', signal: '她会表达当下状态' }, { id: 'hint', text: '通过语气或行为暗示', signal: '她可能更常用间接方式表达' }, { id: 'withdraw', text: '减少互动或暂时不回应' }, unsure] },
  { id: 'po7', dimension: 'boundary', text: '她是否表达过不方便、想休息或不想聊某个话题？', options: [{ id: 'clear', text: '明确表达过', signal: '她表达过自己的边界' }, { id: 'indirect', text: '通过转移话题或婉拒表现过', signal: '她出现过需要被尊重的间接边界' }, { id: 'never-noticed', text: '暂时没有注意到' }, unsure] },
  { id: 'po8', dimension: 'boundary', text: '当她拒绝或推迟一次邀约时，通常会？', options: [{ id: 'alternative', text: '提出其他时间或方式', signal: '她曾在拒绝后提出替代安排' }, { id: 'polite-no', text: '礼貌婉拒，但没有替代安排', signal: '她曾表达过一次不方便' }, { id: 'no-response', text: '没有回应或多次回避' }, unsure] },
  { id: 'po9', dimension: 'boundary', text: '你提出见面、语音或更私人的话题时，她的舒适程度更接近？', options: [{ id: 'comfortable', text: '会自然回应并参与', signal: '她对部分亲近互动表现舒适' }, { id: 'conditioned', text: '在特定时间或话题下更舒适', signal: '她的舒适范围有具体条件' }, { id: 'avoid', text: '经常回避或转开' }, unsure] },
  { id: 'po10', dimension: 'investment', text: '她是否愿意为互动安排时间？', options: [{ id: 'often', text: '会主动或配合安排时间', signal: '她有为互动安排时间的表现' }, { id: 'sometimes', text: '偶尔愿意，需要提前约定', signal: '她会在合适条件下安排时间' }, { id: 'rarely', text: '很少愿意安排' }, unsure] },
  { id: 'po11', dimension: 'investment', text: '你们的联系节奏更接近？', options: [{ id: 'stable', text: '大致稳定，也允许彼此忙碌', signal: '互动节奏相对稳定' }, { id: 'up-down', text: '有时密集，有时明显减少', signal: '互动节奏有波动' }, { id: 'one-sided', text: '主要依靠一方维持', signal: '互动投入目前可能不够平衡' }, unsure] },
  { id: 'po12', dimension: 'investment', text: '综合最近的实际相处，她目前表现出的状态更接近？', options: [{ id: 'open', text: '愿意了解，但仍在保持自己的节奏', signal: '她表现出一定互动意愿，同时保留个人节奏' }, { id: 'mixed', text: '表现有好有坏，还不能形成稳定判断', signal: '目前信号是混合的' }, { id: 'distant', text: '互动较少或持续保持距离', signal: '她目前较少投入互动' }, unsure] },
];

export function evaluatePursuitObservation(answers: Record<string, string>) {
  const confirmedSignals: string[] = [];
  const unknownAreas: string[] = [];

  pursuitObservationQuestions.forEach((question) => {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option) return;
    if (option.uncertain || option.id === 'not-sure') unknownAreas.push(question.text);
    if (option.signal) confirmedSignals.push(option.signal);
  });

  const summary = [
    confirmedSignals.length ? `她目前表现出的互动特点：${confirmedSignals.slice(0, 4).join('；')}。` : '目前还没有足够的互动表现可以总结。',
    unknownAreas.length ? `还需要继续观察：${unknownAreas.slice(0, 3).join('；')}。` : '可以继续保持自然互动，观察一段时间再更新。',
  ];
  if (answers.po8 === 'polite-no') summary.push('不能仅凭一次婉拒判断她的整体态度，先尊重这次安排，不追问、不施压。');

  return { confirmedSignals, unknownAreas, summary };
}
