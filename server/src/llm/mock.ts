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
    emotionalTone: 'neutral-positive',
    coreNeed: '希望得到理解和陪伴',
    subtext: '对方可能在暗示希望你关心她的状态',
    replyDirection: 'empathy-first',
    reasoning: '对方用"有点累"这样的表达，通常是在寻求情感支持而非具体建议。应该先共情她的感受，再自然引导话题。',
    attentionPoints: [
      '避免立即给建议（如"那你早点休息"）',
      '可以询问原因但不要追问',
      '保持轻松语气，不要让对方感到压力'
    ]
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
