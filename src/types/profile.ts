/**
 * 用户（男生本人）的个人资料。
 * 在引导/资料设置环节收集，用于后续 AI 分析时理解“当事人”的性格与困惑。
 */
export interface UserProfile {
  /** 主键，uuid */
  id: string;
  /** 昵称 */
  nickname: string;
  /** 年龄段 */
  ageRange: '18-22' | '23-27' | '28-32' | '33+';
  /** 当前感情状态：单身 / 追求中 / 暧昧中 / 恋爱中 */
  relationshipStatus: 'single' | 'pursuing' | 'ambiguous' | 'dating';
  /** 恋爱经验：无 / 很少 / 一些 / 丰富 */
  loveExperience: 'none' | 'little' | 'some' | 'rich';
  /** 当前最主要的困惑（自由文本） */
  mainConfusion: string;
  /** 创建时间，ISO 8601 字符串 */
  createdAt: string;
  /** 最后更新时间，ISO 8601 字符串 */
  updatedAt: string;

  /** MBTI 人格类型，如 'INTP' */
  mbti?: string;
  /** 自我评价的性格描述 */
  selfPersonality?: string;
  /** 沟通习惯描述 */
  communicationHabit?: string;
  /** 情绪表达方式描述 */
  emotionExpression?: string;
  /** 是否容易焦虑 */
  isAnxious?: boolean;
  /** 是否主动 */
  isProactive?: boolean;
  /** 聊天风格描述 */
  chatStyle?: string;
}

/**
 * 目标对象（女生）的资料。
 * 每条记录关联到一个男生用户（userId），用于刻画追求/相处对象的画像。
 */
export interface GirlProfile {
  /** 主键，uuid */
  id: string;
  /** 关联的男生用户 id（UserProfile.id） */
  userId: string;
  /** 昵称 */
  nickname: string;
  /** 年龄段 */
  ageRange: '18-22' | '23-27' | '28-32' | '33+';
  /** 认识渠道，如 '同事' / '相亲' / '社交软件' */
  knownChannel: string;
  /** 认识时长，如 '三个月' */
  knownDuration: string;
  /** 当前关系阶段：陌生 / 观察中 / 暧昧 / 追求中 / 恋爱中 */
  currentStage: 'stranger' | 'observing' | 'ambiguous' | 'pursuing' | 'dating';
  /** 互动频率：低 / 中 / 高 */
  interactionFrequency: 'low' | 'medium' | 'high';
  /** 创建时间，ISO 8601 字符串 */
  createdAt: string;
  /** 最后更新时间，ISO 8601 字符串 */
  updatedAt: string;

  /** 兴趣爱好列表 */
  interests?: string[];
  /** 喜欢的东西列表 */
  likes?: string[];
  /** 讨厌的东西列表 */
  dislikes?: string[];
  /** 禁忌行为（会触雷的事）列表 */
  tabooBehaviors?: string[];
  /** 生日，ISO 8601 字符串 */
  birthday?: string;
  /** 重要纪念日列表（名称 + 日期） */
  importantDates?: { name: string; date: string }[];
  /** MBTI 人格类型 */
  mbti?: string;
  /** 聊天风格描述 */
  chatStyle?: string;
  /** 是否主动 */
  isProactive?: boolean;
  /** 是否情绪化 */
  isEmotional?: boolean;
  /** 是否看重仪式感 */
  likesRitual?: boolean;
}
