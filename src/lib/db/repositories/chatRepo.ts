/**
 * 聊天会话与消息的数据访问层（Repository）。
 * 管理 chatSessions（会话）与 chatMessages（消息）两张表。
 */

import { v4 as uuidv4 } from 'uuid';
import type { ChatSession, ChatMessage } from '@/types';
import { db } from '../database';

export const chatRepository = {
  /** 新建一个聊天会话：缺 id 自动生成，缺 importedAt 自动填当前时间，messageCount 默认 0 */
  async createSession(session: Partial<ChatSession>): Promise<ChatSession> {
    const now = new Date().toISOString();
    const entity: ChatSession = {
      ...session,
      id: session.id ?? uuidv4(),
      importedAt: session.importedAt ?? now,
      messageCount: session.messageCount ?? 0,
    } as ChatSession;

    await db.chatSessions.put(entity);
    return entity;
  },

  /** 往某会话批量追加消息，并同步更新该会话的 messageCount */
  async addMessages(
    sessionId: string,
    messages: Partial<ChatMessage>[],
  ): Promise<void> {
    const entities: ChatMessage[] = messages.map((m) => ({
      ...m,
      id: m.id ?? uuidv4(),
      sessionId,
    })) as ChatMessage[];

    // 用事务保证"写消息 + 更新计数"要么都成功要么都回滚
    await db.transaction('rw', db.chatMessages, db.chatSessions, async () => {
      await db.chatMessages.bulkPut(entities);
      const total = await db.chatMessages
        .where('sessionId')
        .equals(sessionId)
        .count();
      await db.chatSessions.update(sessionId, { messageCount: total });
    });
  },

  /** 按 id 取一个会话 */
  async getSession(id: string): Promise<ChatSession | undefined> {
    return db.chatSessions.get(id);
  },

  /** 列出某男生的所有会话，按 importedAt 倒序（最新在前） */
  async listSessions(userId: string): Promise<ChatSession[]> {
    const list = await db.chatSessions
      .where('userId')
      .equals(userId)
      .sortBy('importedAt');
    return list.reverse();
  },

  /** 取某会话的全部消息，按 sentAt 升序（最早在前） */
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return db.chatMessages
      .where('sessionId')
      .equals(sessionId)
      .sortBy('sentAt');
  },

  /** 删除某会话，并同时删除其下所有消息（事务内完成） */
  async deleteSession(id: string): Promise<void> {
    await db.transaction('rw', db.chatSessions, db.chatMessages, async () => {
      await db.chatMessages.where('sessionId').equals(id).delete();
      await db.chatSessions.delete(id);
    });
  },

  /** 按 userId + girlId 取最新一条会话 */
  async getLatestSession(userId: string, girlId: string): Promise<ChatSession | null> {
    console.log('[chatRepo] getLatestSession 查询', { userId, girlId });
    const sessions = await db.chatSessions
      .where('userId')
      .equals(userId)
      .toArray();
    const matched = sessions
      .filter(s => s.girlId === girlId)
      .sort((a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime());
    const latest = matched[0] ?? null;
    console.log('[chatRepo] getLatestSession 结果:', latest ? { id: latest.id, messageCount: latest.messageCount } : null);
    return latest;
  },

  /** 列出所有会话，按 importedAt 倒序 */
  async listAllSessions(): Promise<ChatSession[]> {
    const list = await db.chatSessions.toArray();
    return list.sort((a, b) => b.importedAt.localeCompare(a.importedAt));
  },

  /** 列出某女生的所有会话，按 importedAt 倒序 */
  async listSessionsByGirlId(girlId: string): Promise<ChatSession[]> {
    console.log('📚 [chatRepository.listSessionsByGirlId] 查询聊天记录历史:', girlId);
    const list = await db.chatSessions.toArray();
    const filtered = list
      .filter((s) => s.girlId === girlId)
      .sort((a, b) => b.importedAt.localeCompare(a.importedAt));
    return filtered;
  },

  /** 清空会话与消息两张表 */
  async clearAll(): Promise<void> {
    await db.chatSessions.clear();
    await db.chatMessages.clear();
  },

  /**
   * 一次性创建会话并导入消息（常用于聊天导入场景）
   * @param userId 男生用户 id
   * @param girlId 女生资料 id（可为 'default-girl' 兜底值）
   * @param messages 消息列表（需包含 sender, content, sentAt, senderName 等字段）
   * @param sourceMethod 来源方式
   * @param title 可选的会话标题
   * @returns 创建的会话对象
   */
  async createSessionWithMessages(
    userId: string,
    girlId: string,
    messages: Array<{
      sender: 'user' | 'other';
      content: string;
      sentAt: Date;
      senderName?: string;
    }>,
    sourceMethod: 'paste' | 'ocr' | 'file' = 'paste',
    title?: string,
  ): Promise<ChatSession> {
    console.log('[chatRepo] createSessionWithMessages 被调用');
    console.log('[chatRepo] 入参 userId:', userId);
    console.log('[chatRepo] 入参 girlId:', girlId);
    console.log('[chatRepo] 入参 messages 数量:', messages.length);
    console.log('[chatRepo] 入参 messages 前 3 条:', messages.slice(0, 3));

    if (!userId) {
      const error = new Error('[chatRepo] userId 为空，无法创建聊天会话');
      console.error(error);
      throw error;
    }

    if (!messages || messages.length === 0) {
      const error = new Error('[chatRepo] messages 为空，无法导入');
      console.error(error);
      throw error;
    }

    // girlId 为空时使用兜底值
    const safeGirlId = girlId || 'default-girl';
    console.log('[chatRepo] 使用 safeGirlId:', safeGirlId);

    const now = new Date().toISOString();
    const sessionId = uuidv4();

    console.log('[chatRepo] 准备创建 sessionId:', sessionId);

    // 创建会话
    const session: ChatSession = {
      id: sessionId,
      userId,
      girlId: safeGirlId,
      title,
      importedAt: now,
      messageCount: messages.length,
      sourceMethod,
    };

    // 构建消息实体
    const messageEntities: ChatMessage[] = messages.map((m) => ({
      id: uuidv4(),
      sessionId,
      sender: m.sender,
      senderName: m.senderName,
      sentAt: m.sentAt.toISOString(),
      content: m.content,
      messageType: 'text' as const,
      sourceMethod,
    }));

    console.log('[chatRepo] 准备写入 session:', session);
    console.log('[chatRepo] 准备写入 messages 数量:', messageEntities.length);
    console.log('[chatRepo] messages 前 3 条:', messageEntities.slice(0, 3));

    try {
      // 事务内同时写入会话和消息
      await db.transaction('rw', db.chatSessions, db.chatMessages, async () => {
        console.log('[chatRepo] transaction 开始');

        await db.chatSessions.put(session);
        console.log('[chatRepo] ✅ chatSessions 写入成功');

        await db.chatMessages.bulkPut(messageEntities);
        console.log('[chatRepo] ✅ chatMessages bulkPut 成功');
      });

      console.log('[chatRepo] transaction 完成，开始写入后验证');

      // 写入后验证
      const savedSession = await db.chatSessions.get(sessionId);
      const savedMessages = await db.chatMessages
        .where('sessionId')
        .equals(sessionId)
        .toArray();

      console.log('[chatRepo] 写入后验证 session:', savedSession);
      console.log('[chatRepo] 写入后验证 messages 数量:', savedMessages.length);
      console.log('[chatRepo] 写入后验证 messages 前 3 条:', savedMessages.slice(0, 3));

      if (!savedSession) {
        console.warn('[chatRepo] ⚠️ 警告：写入后没有查到 session');
      }

      if (savedMessages.length !== messages.length) {
        console.warn(
          '[chatRepo] ⚠️ 警告：写入消息数不一致，期望:',
          messages.length,
          '实际:',
          savedMessages.length
        );
      }

      console.log('[chatRepo] ✅ 导入完成，返回 session');
      return session;
    } catch (error) {
      console.error('[chatRepo] ❌ createSessionWithMessages 写入失败:', error);
      throw error;
    }
  },
};
