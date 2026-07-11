export interface InitialContactObservationQuestion {
  id: string;
  dimension: 'openness' | 'continuity' | 'comfort' | 'boundary';
  text: string;
  options: Array<{ id: string; text: string; signal?: string; uncertain?: boolean }>;
}

const unsure = { id: 'not-sure', text: '暂不确定', uncertain: true };

export const initialContactObservationQuestions: InitialContactObservationQuestion[] = [
  { id: 'ic-ob-1', dimension: 'openness', text: '她是否愿意回应你的自然开场？', options: [{ id: 'open', text: '会接住话题并给出内容', signal: '她愿意参与当前对话' }, { id: 'brief', text: '会礼貌回应，但内容较短' }, { id: 'avoid', text: '经常不回应或快速结束' }, unsure] },
  { id: 'ic-ob-2', dimension: 'openness', text: '她是否分享过自己的日常或兴趣？', options: [{ id: 'share', text: '会主动分享一些内容', signal: '她有主动提供了解线索' }, { id: 'asked', text: '问到时愿意分享' }, { id: 'rare', text: '很少分享个人信息' }, unsure] },
  { id: 'ic-ob-3', dimension: 'continuity', text: '她是否会自然延续一个话题？', options: [{ id: 'often', text: '会追问、补充或把话题接下去', signal: '她有延续互动的表现' }, { id: 'sometimes', text: '偶尔会，取决于话题' }, { id: 'rare', text: '通常由你单方面维持' }, unsure] },
  { id: 'ic-ob-4', dimension: 'continuity', text: '她是否会在之后主动开启新的对话？', options: [{ id: 'yes', text: '出现过主动开启的情况', signal: '她有过主动靠近的表现' }, { id: 'occasionally', text: '偶尔，但还不稳定' }, { id: 'no', text: '目前没有观察到' }, unsure] },
  { id: 'ic-ob-5', dimension: 'comfort', text: '你表达近况或兴趣时，她的反应更接近？', options: [{ id: 'engage', text: '会回应内容或继续追问', signal: '她会接住你的分享' }, { id: 'polite', text: '礼貌回应，但没有继续展开' }, { id: 'change', text: '经常转移话题或结束交流' }, unsure] },
  { id: 'ic-ob-6', dimension: 'comfort', text: '当话题稍微靠近个人感受时，她通常？', options: [{ id: 'comfortable', text: '愿意在舒服范围内继续聊', signal: '她在部分深入话题中表现舒适' }, { id: 'conditional', text: '只在特定话题或时机下愿意聊' }, { id: 'avoid', text: '明显回避或减少回应' }, unsure] },
  { id: 'ic-ob-7', dimension: 'boundary', text: '她是否表达过“不方便”“想休息”或“不想聊”？', options: [{ id: 'clear', text: '明确表达过', signal: '她表达过需要被尊重的边界' }, { id: 'indirect', text: '通过转移话题、婉拒或减少互动表现过', signal: '她可能使用间接方式表达边界' }, { id: 'none', text: '暂时没有注意到' }, unsure] },
  { id: 'ic-ob-8', dimension: 'boundary', text: '当她婉拒一次互动时，她之后是否给出替代安排？', options: [{ id: 'alternative', text: '主动提出其他时间或方式', signal: '她曾在拒绝后保留替代安排' }, { id: 'polite', text: '礼貌婉拒，但没有提出替代安排' }, { id: 'avoid', text: '没有回应或持续回避' }, unsure] },
];

export function evaluateInitialContactObservation(answers: Record<string, string>) {
  const confirmedSignals: string[] = []; const unknownAreas: string[] = [];
  initialContactObservationQuestions.forEach((question) => {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option) return; if (option.uncertain) unknownAreas.push(question.text); if (option.signal) confirmedSignals.push(option.signal);
  });
  return {
    confirmedSignals,
    unknownAreas,
    summary: [confirmedSignals.length ? `目前可以确认的互动表现：${confirmedSignals.slice(0, 4).join('；')}。` : '目前还没有足够事实形成判断。', unknownAreas.length ? `还需要继续观察：${unknownAreas.slice(0, 3).join('；')}。` : '先保持自然互动，不急着给关系下结论。'],
  };
}
