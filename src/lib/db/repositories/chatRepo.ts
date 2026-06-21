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

  /** 清空会话与消息两张表 */
  async clearAll(): Promise<void> {
    await db.chatSessions.clear();
    await db.chatMessages.clear();
  },
};
