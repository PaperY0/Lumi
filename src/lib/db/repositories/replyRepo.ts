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

  /** 列出所有回复历史，按 createdAt 倒序 */
  async listAll(): Promise<ReplyHistory[]> {
    const list = await db.replyHistory.toArray();
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** 列出某女生关联的所有回复历史，按 createdAt 倒序（无 girlId 索引，内存过滤） */
  async listByGirlId(girlId: string): Promise<ReplyHistory[]> {
    console.log('📚 [replyRepository.listByGirlId] 查询回复历史:', girlId);
    const list = await db.replyHistory.toArray();
    const filtered = list
      .filter((r) => r.girlId === girlId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return filtered;
  },

  /** 根据 id 取单条回复历史 */
  async getById(id: string): Promise<ReplyHistory | undefined> {
    return db.replyHistory.get(id);
  },

  /** 删除单条回复历史 */
  async remove(id: string): Promise<void> {
    console.log('🗑️ [replyRepository.remove] 删除回复历史:', id);
    await db.replyHistory.delete(id);
    console.log('✅ [replyRepository.remove] 删除成功:', id);
  },

  /** 清空所有回复历史 */
  async clearAll(): Promise<void> {
    await db.replyHistory.clear();
  },
};
