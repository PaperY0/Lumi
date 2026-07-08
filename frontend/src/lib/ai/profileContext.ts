import type {
  ChatMessage,
  FemaleQuestionnaireResult,
  GirlProfile,
  MaleQuestionnaireResult,
  UserProfile,
} from '@/types';

const ageRangeLabels: Record<string, string> = {
  '18-22': '18-22岁',
  '23-27': '23-27岁',
  '28-32': '28-32岁',
  '33+': '33岁以上',
};

const relationshipStatusLabels: Record<string, string> = {
  single: '喜欢但没表白',
  pursuing: '追求中',
  ambiguous: '暧昧中',
  dating: '已在一起',
};

const loveExperienceLabels: Record<string, string> = {
  none: '零经验',
  little: '有过暗恋',
  some: '恋爱过1次',
  rich: '恋爱过多次',
};

const girlStageLabels: Record<string, string> = {
  stranger: '陌生人',
  observing: '普通朋友/观察中',
  ambiguous: '暧昧关系',
  pursuing: '追求中',
  dating: '已在一起',
};

const frequencyLabels: Record<string, string> = {
  low: '联系较少或断断续续',
  medium: '中等频率',
  high: '联系较频繁',
};

function text(value: unknown, fallback = '未填写'): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function boolLabel(value: boolean | undefined, yes: string, no: string): string {
  if (value === true) return yes;
  if (value === false) return no;
  return '未填写';
}

function list(values: string[] | undefined, fallback = '未填写'): string {
  const filtered = values?.map((item) => item.trim()).filter(Boolean) ?? [];
  return filtered.length > 0 ? filtered.join('、') : fallback;
}

function importantDates(girl: GirlProfile): string {
  const items = [
    girl.birthday ? `生日：${girl.birthday}` : '',
    ...(girl.importantDates ?? []).map((item) => `${item.name}：${item.date}`),
  ].filter(Boolean);
  return items.length > 0 ? items.join('；') : '未填写';
}

function questionnaireSummary(
  maleQuestionnaire?: MaleQuestionnaireResult | null,
  femaleQuestionnaire?: FemaleQuestionnaireResult | null,
): string {
  return [
    `男生问卷：${maleQuestionnaire ? `已完成，完成时间 ${maleQuestionnaire.completedAt}` : '未完成'}`,
    `女生观察问卷：${femaleQuestionnaire ? `已完成，完成时间 ${femaleQuestionnaire.completedAt}` : '未完成'}`,
  ].join('\n');
}

export interface RelationshipProfileContextInput {
  userProfile: UserProfile;
  girlProfile: GirlProfile;
  maleQuestionnaire?: MaleQuestionnaireResult | null;
  femaleQuestionnaire?: FemaleQuestionnaireResult | null;
  recentMessages?: ChatMessage[];
}

export interface RelationshipProfileContext {
  summary: string;
  sections: {
    user: string;
    girl: string;
    questionnaires: string;
    recentInteraction: string;
  };
  stats: {
    userFieldCount: number;
    girlFieldCount: number;
    recentMessageCount: number;
  };
}

export function buildRelationshipProfileContext(input: RelationshipProfileContextInput): RelationshipProfileContext {
  const { userProfile, girlProfile, maleQuestionnaire, femaleQuestionnaire, recentMessages = [] } = input;
  const userSection = [
    `昵称：${text(userProfile.nickname)}`,
    `年龄段：${ageRangeLabels[userProfile.ageRange] ?? text(userProfile.ageRange)}`,
    `恋爱经验：${loveExperienceLabels[userProfile.loveExperience] ?? text(userProfile.loveExperience)}`,
    `当前阶段：${relationshipStatusLabels[userProfile.relationshipStatus] ?? text(userProfile.relationshipStatus)}`,
    `主要困惑：${text(userProfile.mainConfusion)}`,
    `沟通风格：${text(userProfile.chatStyle)}`,
    `是否容易焦虑：${boolLabel(userProfile.isAnxious, '容易焦虑', '不太容易焦虑')}`,
    `是否主动：${boolLabel(userProfile.isProactive, '偏主动', '不太主动')}`,
    `MBTI：${text(userProfile.mbti)}`,
    `自我性格描述：${text(userProfile.selfPersonality)}`,
    `沟通习惯：${text(userProfile.communicationHabit)}`,
    `情绪表达方式：${text(userProfile.emotionExpression)}`,
  ].join('\n');

  const girlSection = [
    `称呼：${text(girlProfile.nickname)}`,
    `年龄段：${ageRangeLabels[girlProfile.ageRange] ?? text(girlProfile.ageRange)}`,
    `认识渠道：${text(girlProfile.knownChannel)}`,
    `认识时长：${text(girlProfile.knownDuration)}`,
    `当前关系阶段：${girlProfile.currentStageLabel || girlStageLabels[girlProfile.currentStage] || text(girlProfile.currentStage)}`,
    `联系频率：${girlProfile.interactionFrequencyLabel || frequencyLabels[girlProfile.interactionFrequency] || text(girlProfile.interactionFrequency)}`,
    `喜好/兴趣：${list(girlProfile.likes?.length ? girlProfile.likes : girlProfile.interests)}`,
    `雷点/禁忌行为：${list(girlProfile.tabooBehaviors)}`,
    `重要日子：${importantDates(girlProfile)}`,
    `聊天风格：${text(girlProfile.chatStyle)}`,
    `是否主动：${boolLabel(girlProfile.isProactive, '偏主动', '不太主动')}`,
    `是否情绪化：${boolLabel(girlProfile.isEmotional, '情绪表达较明显', '情绪表达较稳定')}`,
    `是否看重仪式感：${boolLabel(girlProfile.likesRitual, '看重仪式感', '不太看重仪式感')}`,
    `备注：${text(girlProfile.notes)}`,
  ].join('\n');

  const recentInteractionSection = recentMessages.length > 0
    ? `最近已保存聊天：共提供 ${recentMessages.length} 条消息，作为判断当前互动状态、热度和风险信号的依据。`
    : '最近已保存聊天：暂无。请主要基于资料和问卷生成基础判断。';

  const questionnaires = questionnaireSummary(maleQuestionnaire, femaleQuestionnaire);

  return {
    summary: [
      '## 我的信息',
      userSection,
      '',
      '## 她的信息',
      girlSection,
      '',
      '## 问卷状态',
      questionnaires,
      '',
      '## 最近互动',
      recentInteractionSection,
    ].join('\n'),
    sections: {
      user: userSection,
      girl: girlSection,
      questionnaires,
      recentInteraction: recentInteractionSection,
    },
    stats: {
      userFieldCount: userSection.split('\n').filter((line) => !line.endsWith('未填写')).length,
      girlFieldCount: girlSection.split('\n').filter((line) => !line.endsWith('未填写')).length,
      recentMessageCount: recentMessages.length,
    },
  };
}
