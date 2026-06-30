/**
 * 单条推荐回复。
 */
export interface RecommendedReply {
  /** 回复风格描述，如 "真诚"、"幽默" */
  style: string;
  /** 推荐的回复文本 */
  text: string;
}

/**
 * AI 对一次会话的完整分析报告。
 * 字段结构对应 PRD 第 8 节的 JSON 结构（统一 camelCase）。
 */
export interface AIAnalysisReport {
  /** 主键，uuid */
  id: string;
  /** 关联的会话 id（ChatSession.id） */
  sessionId: string;
  /** 报告生成时间，ISO 8601 字符串 */
  createdAt: string;
  /** 一句话直给的简明结论 */
  simpleAnswer: string;
  /** 当前关系阶段描述（自由文本） */
  relationshipStage: string;
  /** 互动热度：冷淡 / 温和 / 热络 */
  interactionHeat: 'cold' | 'warm' | 'hot';
  /** 对方（女生）当前情绪描述 */
  girlEmotion: string;
  /** 积极信号 */
  positiveSignals: string[];
  /** 风险信号 */
  riskSignals: string[];
  /** 男生自身存在的问题 */
  boyIssues: string[];
  /** 站在女生视角的解读 */
  girlPerspective: string;
  /** 推荐回复列表 */
  recommendedReplies: RecommendedReply[];
  /** 应避免的回复 */
  avoidReplies: string[];
  /** 下一步建议 */
  nextStep: string;
}
