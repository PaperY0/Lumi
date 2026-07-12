import type { RelationshipStageValue } from '@/lib/relationshipStage';
import type { StageQuestionnaireAudience } from '@/types/stageQuestionnaire';

export interface StageAssessmentCatalogItem {
  audience: StageQuestionnaireAudience;
  title: string;
  description: string;
  boundary: string;
}

export interface StageAssessmentCatalog {
  available: boolean;
  items: StageAssessmentCatalogItem[];
}

const pursuitItems: StageAssessmentCatalogItem[] = [
  {
    audience: 'self',
    title: '我在关系中的样子',
    description: '了解表达、倾听、情绪调节、成长经历与支持系统如何影响你的相处方式。',
    boundary: '不诊断人格，只帮助你看见可练习的习惯。',
  },
  {
    audience: 'observation',
    title: '她的互动观察',
    description: '记录已发生的回应、边界、邀约和互动节奏，并区分事实、聊天线索与个人观察。',
    boundary: '不推断她的内心，也不把慢回复当成拒绝。',
  },
  {
    audience: 'relationship',
    title: '关系节奏与边界',
    description: '检查你的推进、邀约与表达是否保留拒绝空间，是否出现焦虑追问或越界风险。',
    boundary: '出现施压、控制或强迫迹象时，只提供暂停与安全提醒。',
  },
];

const initialContactItems: StageAssessmentCatalogItem[] = [
  {
    audience: 'self',
    title: '初识接触期 · 我的相处方式',
    description: '检查第一印象、情绪稳定、聊天分寸和礼貌距离。',
    boundary: '不诊断人格，只帮助你练习更舒服的靠近方式。',
  },
  {
    audience: 'observation',
    title: '初识接触期 · 她的互动观察',
    description: '记录她是否愿意回应、分享、延续话题，以及是否表现出舒适或回避。',
    boundary: '只记录已发生的互动，不推断她的内心。',
  },
  {
    audience: 'relationship',
    title: '初识接触期 · 礼貌边界检查',
    description: '检查称呼、邀约、礼物、隐私和联系频率是否保留拒绝空间。',
    boundary: '出现施压或查证行为时，优先暂停并尊重边界。',
  },
];

const warmingItems: StageAssessmentCatalogItem[] = [
  { audience: 'self', title: '升温期 · 我的相处方式', description: '检查期待、稳定回应、适度试探和自我节奏。', boundary: '不把一次热情当成关系确定，不用付出换承诺。' },
  { audience: 'observation', title: '升温期 · 她的互动观察', description: '观察双方主动、时间投入、邀约回流和互动舒适度。', boundary: '只根据一段时间的实际行为判断，不猜测内心。' },
  { audience: 'relationship', title: '升温期 · 推进边界检查', description: '检查邀约、称呼、礼物和关系沟通是否保留拒绝空间。', boundary: '试探必须轻量、有退路，出现不适就及时放慢。' },
];

const ambiguousItems: StageAssessmentCatalogItem[] = [
  { audience: 'self', title: '暧昧观察期 · 我的相处方式', description: '识别不确定中的期待、焦虑、投入和自我保护，避免用猜测替代沟通。', boundary: '不把一次亲密互动当成承诺，也不把对方的选择等同于你的价值。' },
  { audience: 'observation', title: '暧昧观察期 · 她的互动观察', description: '观察长期的双向投入、交流深度、边界表达和真实回流。', boundary: '只整理可观察事实，不替她下结论，不把模糊当成默认同意。' },
  { audience: 'relationship', title: '暧昧观察期 · 关系节奏与边界', description: '检查确认关系、降低投入、表达期待和接受结果的方式。', boundary: '沟通要有退路；明确拒绝、持续回避或不适出现时，优先停止推进。' },
];

export function getStageAssessmentCatalog(stage: RelationshipStageValue): StageAssessmentCatalog {
  if (stage === 'observing') {
    return { available: true, items: initialContactItems };
  }
  if (stage === 'warming') {
    return { available: true, items: warmingItems };
  }
  if (stage === 'ambiguous') {
    return { available: true, items: ambiguousItems };
  }
  if (stage === 'pursuing') {
    return { available: true, items: pursuitItems };
  }

  return { available: false, items: [] };
}
