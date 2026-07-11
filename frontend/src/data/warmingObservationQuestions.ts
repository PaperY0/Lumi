export const warmingObservationQuestions = [
  { id: 'warm-ob-1', dimension: 'reciprocity', text: '最近一段时间，她是否也会主动开启互动？', options: [{ id: 'often', text: '经常主动开启', signal: '她有稳定的主动回流' }, { id: 'sometimes', text: '偶尔主动', signal: '她有部分主动回流' }, { id: 'rarely', text: '主要还是你在开启' }, { id: 'not-sure', text: '暂不确定', uncertain: true }] },
  { id: 'warm-ob-2', dimension: 'reciprocity', text: '她会不会接住你的分享并继续展开？', options: [{ id: 'deep', text: '会追问、补充或分享自己的经历', signal: '她愿意把互动继续深入' }, { id: 'brief', text: '会回应，但通常不继续展开' }, { id: 'avoid', text: '经常转开或结束话题' }, { id: 'not-sure', text: '暂不确定', uncertain: true }] },
  { id: 'warm-ob-3', dimension: 'time', text: '她是否愿意为你们的互动安排时间？', options: [{ id: 'plan', text: '会主动或配合安排具体时间', signal: '她有投入时间的表现' }, { id: 'condition', text: '在合适条件下愿意安排' }, { id: 'avoid', text: '持续回避具体安排' }, { id: 'not-sure', text: '暂不确定', uncertain: true }] },
  { id: 'warm-ob-4', dimension: 'time', text: '一次邀约不方便时，她通常会？', options: [{ id: 'alternative', text: '提出其他时间或方式', signal: '她会在拒绝后保留替代可能' }, { id: 'polite', text: '礼貌婉拒，没有替代安排' }, { id: 'silence', text: '不回应或反复回避' }, { id: 'not-sure', text: '暂不确定', uncertain: true }] },
  { id: 'warm-ob-5', dimension: 'comfort', text: '当互动变得更亲近时，她的舒适程度如何？', options: [{ id: 'comfortable', text: '会自然参与，也会表达自己的节奏', signal: '她在部分亲近互动中表现舒适' }, { id: 'mixed', text: '有时靠近，有时需要空间' }, { id: 'retreat', text: '明显减少回应或回避' }, { id: 'not-sure', text: '暂不确定', uncertain: true }] },
  { id: 'warm-ob-6', dimension: 'expression', text: '她是否会表达自己的偏好、需要或界限？', options: [{ id: 'clear', text: '会比较清楚地表达', signal: '她会参与建立相处规则' }, { id: 'hint', text: '更多通过暗示表达' }, { id: 'hide', text: '很少表达，常说“都可以”' }, { id: 'not-sure', text: '暂不确定', uncertain: true }] },
  { id: 'warm-ob-7', dimension: 'mutual', text: '你们是否形成了双方都舒服的联系节奏？', options: [{ id: 'stable', text: '大致稳定，彼此忙时也能理解', signal: '双方形成了相对稳定的节奏' }, { id: 'fluctuate', text: '时多时少，还在磨合' }, { id: 'one-sided', text: '主要靠一方维持' }, { id: 'not-sure', text: '暂不确定', uncertain: true }] },
  { id: 'warm-ob-8', dimension: 'clarity', text: '综合最近互动，她的态度更接近？', options: [{ id: 'mutual', text: '愿意靠近，也会保留自己的节奏', signal: '她表现出一定双向意愿' }, { id: 'mixed', text: '有积极信号，但仍然混合不稳定' }, { id: 'distant', text: '持续保持距离或减少投入' }, { id: 'not-sure', text: '暂不确定', uncertain: true }] },
];

export function evaluateWarmingObservation(answers: Record<string, string>) {
  const signals: string[] = []; const unknown: string[] = [];
  warmingObservationQuestions.forEach((q) => { const option = q.options.find((item) => item.id === answers[q.id]); if (!option) return; if (option.uncertain) unknown.push(q.text); if (option.signal) signals.push(option.signal); });
  return { confirmedSignals: signals, unknownAreas: unknown, summary: [signals.length ? `目前观察到的双向表现：${signals.slice(0, 4).join('；')}。` : '目前还没有足够事实确认互动是否双向。', unknown.length ? `仍需观察：${unknown.slice(0, 3).join('；')}。` : '可以继续保持自然节奏，不急着要求关系结论。'] };
}
