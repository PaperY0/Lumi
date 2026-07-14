export function mockPortrait() {
  return {
    maleTypeTags: ['理性分析型', '轻度焦虑型'],
    maleWeaknesses: [
      '容易把对方短回复理解成态度变化',
      '有时会过度分析对方的言外之意',
      '不确定时倾向于寻求外部建议',
    ],
    maleSuggestions: [
      '先共情再给方案，避免直接讲道理',
      '降低对回复速度和长度的敏感度',
      '把关注点放回真实互动，而不是单条消息',
    ],
    femalePersonalityTags: ['慢热观察型', '情绪敏感型'],
    possibleStage: '暧昧观察期',
    interactionHeat: 'warm',
    positiveSignals: [
      '愿意主动分享生活细节',
      '回复整体较及时',
      '会使用表情或轻松语气维持互动',
    ],
    cautionSignals: [
      '较少主动推进线下见面',
      '会回避过于私密的话题',
      '仍保持一定情感距离',
    ],
    suggestions: [
      '保持低压力互动，不急于推进关系',
      '多创造轻松聊天场景',
      '可以尝试咖啡、散步等低压力邀约',
      '关注她的兴趣点，建立更多共同话题',
    ],
  };
}

export function mockAnalyze() {
  return {
    simpleAnswer: '当前关系有沟通意愿，但仍处在观察期。建议保持自然节奏，不要急于推进。',
    relationshipStage: '暧昧观察期',
    interactionHeat: 'warm',
    girlEmotion: '整体平稳，有分享意愿，但仍保留一定情感距离。',
    positiveSignals: [
      '愿意回复你的消息',
      '会分享生活细节',
      '偶尔使用轻松语气或表情',
    ],
    riskSignals: [
      '较少主动发起话题',
      '对私密话题展开有限',
      '互动频率还不够稳定',
    ],
    boyIssues: [
      '可能过于关注回复速度',
      '提问过多时会给对方压力',
      '表达关心时可以更自然一些',
    ],
    girlPerspective: '她可能觉得你不错，但还在观察你是否稳定、尊重边界、相处轻松。',
    recommendedReplies: [
      {
        style: '自然真诚型',
        text: '最近怎么样？我今天看到一个有意思的东西，突然想跟你分享。',
      },
      {
        style: '轻松幽默型',
        text: '今天适合出门走走，你有没有什么私藏宝藏地点推荐？',
      },
    ],
    avoidReplies: [
      '你为什么不回我消息？',
      '你是不是不想理我了？',
      '我对你这么好你怎么这样？',
    ],
    nextStep: '保持当前互动频率，多聊轻松话题，等氛围更稳定后再尝试低压力邀约。',
  };
}

export function mockReply(input?: { relationshipStage?: string; userMessage?: string; rhythmCard?: { status: string; nextAction: string; avoid: string } }) {
  const pause = input?.rhythmCard?.status === 'pause';
  const stage = input?.relationshipStage;
  const explicitRejection = /不用了|不想聊|别联系|不方便|拒绝|不要再/.test(input?.userMessage ?? '');
  const stageGuidance = stage === 'observing'
    ? '初识接触期保持自然礼貌和距离，不使用亲昵称呼。'
    : stage === 'warming'
      ? '升温期可以轻量试探，但要保留随时退出的空间。'
      : stage === 'ambiguous'
        ? '暧昧观察期优先关注双向投入和情绪安全，不把单次回复当成确定喜欢。'
        : '根据当前阶段保持低压力、尊重边界的互动。';
  const recommendedReplies = explicitRejection || pause
    ? [
      { style: '自然真诚型', text: '好的，明白了。我先不打扰你，祝你一切顺利。' },
      { style: '轻松幽默型', text: '收到，那就先到这里，不给你添压力。' },
      { style: '稳重关心型', text: '我尊重你的想法，你不用急着回复。' },
      { style: '暧昧升温型', text: '那我先暂停推进，祝你接下来顺利。' },
      { style: '道歉修复型', text: '如果刚才让你感到有压力，抱歉，我会停下来。' },
      { style: '边界尊重型', text: '好的，我会尊重你的边界，不再继续追问。' },
    ]
    : stage === 'observing'
      ? [
        { style: '自然真诚型', text: '听起来还不错，你方便的话再和我分享。' },
        { style: '轻松幽默型', text: '那我先把好奇心收好，改天再聊。' },
        { style: '稳重关心型', text: '你按自己的节奏就好，有空再聊。' },
        { style: '暧昧升温型', text: '和你聊天挺轻松的，之后想聊时随时说。' },
        { style: '道歉修复型', text: '如果我刚才问得多了些，你不用有压力。' },
        { style: '边界尊重型', text: '如果你现在不方便回复，完全没关系。' },
      ]
      : [
        { style: '自然真诚型', text: '那你先好好休息，等你有精神了我们再聊。' },
        { style: '轻松幽默型', text: '收到，今天先给你放个假，改天再继续营业。' },
        { style: '稳重关心型', text: '辛苦了，好好休息。如果想聊我在，不想说也没关系。' },
        { style: '暧昧升温型', text: '那我先不打扰你啦，你按自己的节奏就好。' },
        { style: '道歉修复型', text: '如果我刚刚问太多让你更累了，抱歉。我先收一收。' },
        { style: '边界尊重型', text: '好，我尊重你现在想安静一下，你不用急着回。' },
      ];

  return {
    id: `reply-${Date.now()}`,
    createdAt: new Date().toISOString(),
    simpleAnswer: explicitRejection || pause
      ? '当前节奏卡建议先暂停推进，尊重对方边界，不要连续追问。'
      : stage === 'observing'
        ? '先接住她的状态，保持礼貌距离，用低压力方式确认是否愿意继续聊。'
        : '先接住她的状态，降低压力，再给她一个轻松回到对话的入口。',
    recommendedReplies,
    avoidReplies: explicitRejection || pause
      ? ['不要继续追问或劝说。', '不要用委屈、嫉妒或冷淡施压。', '尊重明确拒绝，及时停止推进。']
      : ['你是不是不想理我了？', '你怎么又这样？', '那算了。'],
    analysis: explicitRejection || pause
      ? `对方已经表达拒绝或节奏卡要求暂停，应停止施压并尊重边界。${input?.rhythmCard?.avoid ?? ''}`
      : `对方表达疲惫时，重点不是立刻推进聊天，而是让她感到被理解、被尊重。回复宜短、稳、低压力。${stageGuidance}`,
  };
}

export function mockSimulate() {
  return {
    id: `sim-${Date.now()}`,
    createdAt: new Date().toISOString(),
    girlReply: '还好啦，就是今天事情有点多。你呢，今天怎么样？',
    feedback: {
      score: 70,
      strengths: ['回应自然友好', '没有给对方太大压力'],
      risks: ['还可以更具体地回应她的状态'],
      suggestion: '可以简单分享自己的状态，然后轻轻接住她说“事情有点多”这个线索。',
    },
    nextSuggestion: '可以说：“我今天还不错。你说事情有点多，是工作上的事吗？”',
    isFinished: false,
  };
}

export function mockMinerUChatParse(input: { originalMarkdown: string }) {
  return {
    originalMarkdown: input.originalMarkdown,
    rawText: 'A: 嗯\nB: 我今天有点累\nA: 那你早点休息',
    messages: [
      {
        id: 'mock-1',
        rawText: '嗯',
        cleanedText: '嗯',
        role: 'A' as const,
        confidence: 0.85,
        reason: '示例消息，推断为 A',
      },
      {
        id: 'mock-2',
        rawText: '我今天有点累',
        cleanedText: '我今天有点累',
        role: 'B' as const,
        confidence: 0.85,
        reason: '示例消息，推断为 B',
      },
      {
        id: 'mock-3',
        rawText: '那你早点休息',
        cleanedText: '那你早点休息',
        role: 'A' as const,
        confidence: 0.85,
        reason: '示例消息，推断为 A',
      },
    ],
    warnings: [] as string[],
  };
}
