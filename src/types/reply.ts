/**
 * 回复助手的历史记录。
 * 每次男生请求 AI 生成回复建议后，把那一次的输入与建议结果存档，方便回看。
 */
export interface ReplyHistory {
  /** 主键，uuid */
  id: string;
  /** 关联的男生用户 id（UserProfile.id） */
  userId: string;
  /** 当时对方发来的消息内容 */
  otherMessage: string;
  /** AI 给出的推荐回复列表（结构与 ai.ts 的 ReplyResponse.recommendedReplies 一致，这里用任意数组以保持灵活） */
  recommendedReplies: any[];
  /** 创建时间，ISO 8601 字符串 */
  createdAt: string;
}
