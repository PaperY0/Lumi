export interface PursuitRelationshipQuestion {
  id: string;
  dimension: 'pace' | 'anxiety' | 'invitation' | 'boundary';
  text: string;
  options: Array<{ id: string; text: string; score: number; pause?: boolean }>;
}

const unsure = { id: 'unsure', text: '暂不确定', score: 2 };

export const pursuitRelationshipQuestions: PursuitRelationshipQuestion[] = [
  { id: 'pr1', dimension: 'pace', text: '你准备开启一次对话时，通常会先考虑？', options: [{ id: 'real-share', text: '是否有真实想分享或想了解的内容', score: 3 }, { id: 'just-presence', text: '先发点什么保持存在感', score: 1 }, { id: 'wait-perfect', text: '等到绝对不会尴尬的时机', score: 1 }, unsure] },
  { id: 'pr2', dimension: 'pace', text: '她说最近很忙时，你通常会？', options: [{ id: 'give-space', text: '表达理解，减少打扰，等她有空再聊', score: 3 }, { id: 'occasional-care', text: '偶尔发一条轻量关心，不要求立即回复', score: 2 }, { id: 'daily-check', text: '仍然每天追问她在做什么', score: 0 }, unsure] },
  { id: 'pr3', dimension: 'pace', text: '关系还没有明确时，你会怎样提出靠近？', options: [{ id: 'small-step', text: '提出具体、轻量、可以拒绝的小邀约', score: 3 }, { id: 'hint-more', text: '通过暗示和试探观察她反应', score: 1 }, { id: 'demand-answer', text: '要求她尽快说明对我的态度', score: 0 }, unsure] },
  { id: 'pr4', dimension: 'boundary', text: '她明确说“不方便”或“想慢一点”时，你会？', options: [{ id: 'respect-no', text: '接受并停止推进，把选择权留给她', score: 3 }, { id: 'ask-once', text: '只确认一次是否有更合适的时间', score: 2 }, { id: 'keep-persuading', text: '换个说法继续劝到她同意', score: 0, pause: true }, unsure] },
  { id: 'pr5', dimension: 'anxiety', text: '她没有及时回复时，你最可能的行为是？', options: [{ id: 'continue-life', text: '先做自己的事，等合适时机再联系', score: 3 }, { id: 'one-followup', text: '过一段时间发一次自然跟进', score: 2 }, { id: 'multiple-followups', text: '连续发送消息确认她为什么不回', score: 0, pause: true }, unsure] },
  { id: 'pr6', dimension: 'anxiety', text: '你感到不安时，通常会怎样处理？', options: [{ id: 'self-regulate', text: '先安顿情绪，再决定是否沟通', score: 3 }, { id: 'talk-friend', text: '和朋友聊聊，但自己对行为负责', score: 2 }, { id: 'make-her-reassure', text: '马上找她确认，让她负责消除我的不安', score: 0 }, unsure] },
  { id: 'pr7', dimension: 'invitation', text: '你提出邀约时，最合适的表达是？', options: [{ id: 'clear-option', text: '给出具体安排，也说明不方便可以拒绝', score: 3 }, { id: 'vague-invite', text: '只说“有空一起玩”，等待她猜', score: 1 }, { id: 'urgent-invite', text: '临时提出并要求她马上决定', score: 0 }, unsure] },
  { id: 'pr8', dimension: 'boundary', text: '你想知道她和某位朋友的关系时，会？', options: [{ id: 'respect-privacy', text: '尊重她的私人关系，不查证或盘问', score: 3 }, { id: 'ask-with-acceptance', text: '坦诚问一次，并接受她不想回答', score: 2 }, { id: 'check-without-permission', text: '翻看动态、聊天或向别人打听', score: 0, pause: true }, unsure] },
  { id: 'pr9', dimension: 'boundary', text: '关于亲昵称呼、私密话题或肢体靠近，你会？', options: [{ id: 'wait-consent', text: '根据她明确表达和舒适反应逐步靠近', score: 3 }, { id: 'ask-directly', text: '直接询问她是否舒服', score: 3 }, { id: 'assume-intimacy', text: '觉得关系不错就默认她会接受', score: 0, pause: true }, unsure] },
  { id: 'pr10', dimension: 'invitation', text: '一次邀约被婉拒后，你会？', options: [{ id: 'accept-and-stop', text: '接受这次结果，不追问、不施压', score: 3 }, { id: 'wait-later', text: '过一段时间再提出一次不同的轻量安排', score: 2 }, { id: 'guilt-trip', text: '用失望、委屈或冷淡让她改变主意', score: 0, pause: true }, unsure] },
  { id: 'pr11', dimension: 'pace', text: '你如何判断是否可以进一步推进？', options: [{ id: 'mutual-pattern', text: '看一段时间的双向互动，不靠单次热情', score: 3 }, { id: 'single-signal', text: '根据一次特别热络的聊天判断', score: 1 }, { id: 'force-clarity', text: '通过逼问答案获得确定感', score: 0, pause: true }, unsure] },
  { id: 'pr12', dimension: 'anxiety', text: '如果发现自己连续几次忽略她的拒绝，你会？', options: [{ id: 'stop-reflect', text: '停止推进，复盘行为并尊重她的选择', score: 3 }, { id: 'apologize-change', text: '道歉并用行动改变，不要求她立刻原谅', score: 3 }, { id: 'keep-pursuing', text: '认为只要足够坚持就能改变她', score: 0, pause: true }, unsure] },
];

export function evaluatePursuitRelationship(answers: Record<string, string>) {
  let total = 0;
  let answered = 0;
  let needsPause = false;
  pursuitRelationshipQuestions.forEach((question) => {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option) return;
    total += option.score;
    answered += 1;
    needsPause ||= option.pause === true;
  });

  const average = answered ? total / answered : 2;
  const status = needsPause ? 'pause' : average < 1.7 ? 'slow' : 'continue';
  const title = status === 'pause' ? '需要暂停复盘' : status === 'slow' ? '建议放慢' : '可以继续';
  const message = status === 'pause'
    ? '请先停止推进，尊重对方已经表达的界限，并复盘自己的行为；不要用道歉换取继续施压。'
    : status === 'slow'
      ? '建议降低频率，停止追加确认，把注意力放回自己的生活和情绪调节。'
      : '当前答案显示你大体能保留拒绝空间，可以继续用具体、低压力的方式互动。';

  return { status, title, message, average };
}
