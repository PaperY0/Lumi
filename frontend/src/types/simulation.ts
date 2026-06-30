/**
 * 情景模拟的一次会话。
 * 记录某个练习场景下、AI 扮演女生与男生对练的整体信息。
 */
export interface SimulationSession {
  /** 主键，uuid */
  id: string;
  /** 关联的男生用户 id（UserProfile.id） */
  userId: string;
  /** 关联的女生资料 id（GirlProfile.id） */
  girlId: string;
  /** 模拟场景描述，如 '第一次约对方吃饭' */
  scene: string;
  /** 难度：简单 / 困难 */
  difficulty: 'easy' | 'hard';
  /** 创建时间，ISO 8601 字符串 */
  createdAt: string;
}

/**
 * 情景模拟会话中的单条对话消息。
 */
export interface SimulationMessage {
  /** 主键，uuid */
  id: string;
  /** 所属模拟会话 id（SimulationSession.id） */
  sessionId: string;
  /** 角色：user 表示男生本人，ai 表示扮演女生的 AI */
  role: 'user' | 'ai';
  /** 消息内容文本 */
  content: string;
  /** 发送时间，ISO 8601 字符串 */
  sentAt: string;
}
