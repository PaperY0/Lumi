export type LoveGuideCategory =
  | 'chat'
  | 'date'
  | 'confession'
  | 'conflict'
  | 'relationship'
  | 'selfGrowth';

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
}
