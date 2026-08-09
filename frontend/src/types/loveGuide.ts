export type LoveGuideCategory =
  | 'chat'
  | 'date'
  | 'confession'
  | 'conflict'
  | 'relationship'
  | 'selfGrowth';

export type LoveGuideStage = 'observing' | 'pursuing' | 'ambiguous' | 'warming';

export type LoveGuideSourceId =
  | 'healthy-relationship'
  | 'personality-traits'
  | 'warning-signs'
  | 'communication';

/** Built-in content only: explains the principle and the limits of the guidance. */
export interface LoveGuideEvidence {
  principle: string;
  evidenceBoundary: string;
  sources: readonly LoveGuideSourceId[];
}

export interface LoveGuideArticle {
  id: string;
  category: LoveGuideCategory;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  tags: string[];
  readTimeMinutes: number;
  difficulty: '入门' | '进阶' | '高阶';
  stage?: LoveGuideStage;
  evidence?: LoveGuideEvidence;
}

export interface CustomLoveGuideArticle extends LoveGuideArticle {
  source: 'custom';
  createdAt: string;
  updatedAt: string;
}
