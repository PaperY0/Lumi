/**
 * 单条聊天消息。
 * 来源于导入的聊天记录（粘贴 / OCR / 文件），用于还原对话上下文。
 */
export interface ChatMessage {
  /** 主键，uuid */
  id: string;
  /** 所属会话 id（ChatSession.id） */
  sessionId: string;
  /** 发送者：user 表示男生本人，other 表示对方（女生） */
  sender: 'user' | 'other';
  /** 发送时间，ISO 8601 字符串 */
  sentAt: string;
  /** 消息内容文本 */
  content: string;
  /** 消息类型：文本 / 图片 / 语音 / 系统消息 */
  messageType: 'text' | 'image' | 'voice' | 'system';
  /** 来源方式：粘贴 / OCR 识别 / 文件导入 */
  sourceMethod: 'paste' | 'ocr' | 'file';
  /** 识别置信度（OCR 等场景下可用），0~1 */
  confidence?: number;
}

/**
 * 一次聊天记录导入形成的会话。
 * 聚合一批 ChatMessage，作为 AI 分析的输入单位。
 */
export interface ChatSession {
  /** 主键，uuid */
  id: string;
  /** 关联的男生用户 id（UserProfile.id） */
  userId: string;
  /** 关联的女生资料 id（GirlProfile.id） */
  girlId: string;
  /** 会话标题（可选） */
  title?: string;
  /** 导入时间，ISO 8601 字符串 */
  importedAt: string;
  /** 该会话包含的消息条数 */
  messageCount: number;
  /** 来源方式：粘贴 / OCR 识别 / 文件导入 */
  sourceMethod: 'paste' | 'ocr' | 'file';
}
