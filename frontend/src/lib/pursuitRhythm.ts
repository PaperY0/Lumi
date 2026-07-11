export interface RhythmInput {
  audience: 'self' | 'observation' | 'relationship';
  summary: string[];
}

export interface PursuitRhythmCard {
  status: 'incomplete' | 'continue' | 'pause';
  title: string;
  nextAction: string;
  avoid: string;
}

export function buildPursuitRhythmCard(results: RhythmInput[]): PursuitRhythmCard {
  const relationship = results.find((result) => result.audience === 'relationship');
  const pause = relationship?.summary.some((line) => line.includes('需要暂停复盘'));
  if (pause) {
    return {
      status: 'pause',
      title: '建议先暂停推进',
      nextAction: relationship?.summary.find((line) => line.includes('停止推进')) ?? '停止推进，尊重对方界限，并复盘自己的行为。',
      avoid: '不要连续追问、劝说或用冷淡和委屈换取回应。',
    };
  }

  if (!relationship) {
    return {
      status: 'incomplete',
      title: '还没有完成关系节奏检查',
      nextAction: '先完成关系节奏与边界问卷，再生成更贴合当前阶段的建议。',
      avoid: '在信息不足时，不要把一次回复或拒绝当成确定结论。',
    };
  }

  return {
    status: 'continue',
    title: '保持当前节奏',
    nextAction: relationship.summary.find((line) => line.includes('可以继续')) ?? '继续用具体、低压力的方式互动。',
    avoid: '不要因为一次热络就突然加快推进，也不要默认使用亲昵称呼。',
  };
}
