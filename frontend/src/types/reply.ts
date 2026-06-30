import type { ReplyOption } from './ai';

/**
 * 回复助手的历史记录。
 * 每次男生请求 AI 生成回复建议后，把那一次的输入与建议结果存档，方便回看。
 */
export interface ReplyHistory {
  /** 主键，uuid */
  id: string;
  /** 关联的男生用户 id（UserProfile.id） */
  userId: string;
  /** 关联的女生资料 id（GirlProfile.id） */
  girlId: string;
  /** 对方发来的消息 */
  userMessage: string;
  /** 用户意图（可选） */
  userIntent?: string;
  /** 当前场景（可选） */
  scene?: string;
  /** AI 一句话简答 */
  simpleAnswer: string;
  /** AI 详细分析 */
  analysis: string;
  /** 推荐回复列表 */
  recommendedReplies: ReplyOption[];
  /** 不建议的回复 */
  avoidReplies: string[];
  /** 创建时间，ISO 8601 字符串 */
  createdAt: string;
}
