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

export function getStageAssessmentCatalog(stage: RelationshipStageValue): StageAssessmentCatalog {
  if (stage === 'pursuing') {
    return { available: true, items: pursuitItems };
  }

  return { available: false, items: [] };
}
