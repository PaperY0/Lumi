/**
 * 回复历史的数据访问层（Repository）。
 * 负责对 replyHistory 表的读写。
 */

import { v4 as uuidv4 } from 'uuid';
import type { ReplyHistory } from '@/types';
import { db } from '../database';

export const replyRepository = {
  /** 保存一条回复历史：缺 id 自动生成，缺 createdAt 自动填当前时间 */
  async save(record: Partial<ReplyHistory>): Promise<ReplyHistory> {
    const now = new Date().toISOString();
    const entity: ReplyHistory = {
      ...record,
      id: record.id ?? uuidv4(),
      createdAt: record.createdAt ?? now,
    } as ReplyHistory;

    console.log('[replyRepository.save] 开始保存回复历史:', {
      id: entity.id,
      userId: entity.userId,
      girlId: entity.girlId,
      userMessage: entity.userMessage,
    });

    await db.replyHistory.put(entity);

    console.log('✅ [replyRepository.save] 回复历史已保存:', entity.id);
    return entity;
  },

  /** 取某用户的最新一条回复历史 */
  async getLatestByUserId(userId: string): Promise<ReplyHistory | undefined> {
    const list = await db.replyHistory
      .where('userId')
      .equals(userId)
      .sortBy('createdAt');
    return list[list.length - 1];
  },

  /** 列出某用户的所有回复历史，按 createdAt 倒序 */
  async listByUserId(userId: string): Promise<ReplyHistory[]> {
    const list = await db.replyHistory
      .where('userId')
      .equals(userId)
      .sortBy('createdAt');
    return list.reverse();
  },

  /** 清空所有回复历史 */
  async clearAll(): Promise<void> {
    await db.replyHistory.clear();
  },
};
