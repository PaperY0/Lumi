/**
 * Mock 数据生成器 - 当 MOCK_MODE 启用或 LLM 调用失败时使用
 * 所有函数返回符合 schemas 定义的假数据
 */

export function mockPortrait() {
  return {
    maleTypeTags: ['理性解决型', '轻度焦虑型'],
    maleWeaknesses: [
      '容易把对方短回复理解成态度变化',
      '过度分析对方的言外之意',
      '在不确定时倾向于寻求外部建议'
    ],
    maleSuggestions: [
      '先共情再给方案，避免直接讲道理',
      '降低对回复速度和长度的敏感度',
      '相信自己的直觉，不必过度解读'
    ],
    femalePersonalityTags: ['慢热观察型', '情绪敏感型'],
    possibleStage: '暧昧观察期',
    interactionHeat: 'warm',
    positiveSignals: [
      '愿意主动分享生活细节',
      '回复较为及时',
      '会用表情包增加互动趣味'
    ],
    cautionSignals: [
      '很少主动邀约线下见面',
      '避免过于私密的话题',
      '保持一定的情感距离'
    ],
    suggestions: [
      '保持低压力互动，不急于推进关系',
      '多创造轻松的聊天场景',
      '适当时候可以提出低压力的见面邀约（如咖啡、散步）',
      '关注她的兴趣点，建立更多共同话题'
    ]
  };
}

export function mockAnalyze() {
  return {
    simpleAnswer: '从当前聊天来看，她对你有一定的沟通意愿，但关系仍处于观察期。建议保持自然轻松的互动节奏，不要急于推进。',
    relationshipStage: '暧昧观察期',
    interactionHeat: 'warm',
    girlEmotion: '整体情绪平稳，有一定分享意愿，但保持了一定的情感距离',
    positiveSignals: [
      '愿意回复你的消息，互动较为及时',
      '会主动分享一些生活细节',
      '偶尔会用表情包增加聊天趣味'
    ],
    riskSignals: [
      '很少主动发起话题或邀约',
      '回复深度有限，不太愿意展开私密话题',
      '互动频率不够稳定，有时回复较慢'
    ],
    boyIssues: [
      '可能过于关注回复速度，容易把回复慢解读为冷淡',
      '有时提问过多，给对方一定压力',
      '表达关心时方式偏直接，可以更自然一些'
    ],
    girlPerspective: '她可能觉得你是一个不错的人，但还在观察阶段。她愿意保持联系说明有好感基础，但还没到可以放心推进的程度。她希望被理解而不是被分析。',
    recommendedReplies: [
      {
        style: '自然真诚型',
        text: '最近怎么样呀？我今天看到一个有意思的事情想跟你分享~'
      },
      {
        style: '轻松幽默型',
        text: '今天的天气适合出去走走，你有没有什么推荐的地方？'
      }
    ],
    avoidReplies: [
      '你为什么不回我消息？',
      '你是不是不想理我了？',
      '我对你这么好你怎么这样？'
    ],
    nextStep: '保持当前的互动频率，多聊一些轻松的话题，等关系更近一步后再尝试低压力的线下邀约。'
  };
}

export function mockReply() {
  return {
    simpleAnswer: '听起来今天挺辛苦的，怎么了呀？',
    recommendedReplies: [
      {
        style: 'caring',
        text: '听起来今天挺累的，发生什么事了吗？如果不想说也没关系，就是想关心一下你～',
        pros: '温暖体贴，给对方倾诉的空间',
        cons: '可能显得过于关切，需要注意对方是否愿意深入交流'
      },
      {
        style: 'light',
        text: '哈哈那要不要来点快乐的事情？我今天看到一个很有意思的东西',
        pros: '轻松幽默，不给压力',
        cons: '可能会让对方觉得你没有理解她的情绪'
      },
      {
        style: 'balance',
        text: '辛苦啦～如果想聊聊我在，不想说的话就好好休息，明天会更好的',
        pros: '既表达关心又尊重边界，给对方选择权',
        cons: '相对保守，可能缺少一些推进关系的机会'
      }
    ],
    avoidReplies: [
      {
        text: '那你早点睡吧',
        reason: '过于敷衍，没有表达关心，可能让对话戛然而止'
      },
      {
        text: '是工作累还是生活累？',
        reason: '过于理性和追问，可能让对方感到压力'
      }
    ]
  };
}

export function mockSimulate() {
  return {
    aiReply: '还好啦，就是今天事情有点多。你呢，今天怎么样？',
    feedback: '回应自然友好，成功把话题转向你，说明她对你也有兴趣。可以简单分享一下自己的状态，然后继续深入她的话题。',
    nextStepSuggestion: '简单回应自己的状态后，可以说"我今天还不错～你说的事情多，是工作上的吗？"来延续话题'
  };
}
