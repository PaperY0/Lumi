/**
 * 模拟对话练习历史的数据访问层（Repository）。
 * 负责对 simulateHistory 表的读写。
 */

import type { SimulateHistoryRecord } from '@/types';
import { db } from '../database';

export const simulateHistoryRepository = {
  /** 保存一条模拟练习历史 */
  async save(record: SimulateHistoryRecord): Promise<SimulateHistoryRecord> {
    console.log('💾 [simulateHistoryRepository.save] 保存模拟练习历史:', {
      id: record.id,
      scenario: record.scenario,
      difficulty: record.difficulty,
      messageCount: record.messageCount,
    });

    await db.simulateHistory.put(record);

    console.log('✅ [simulateHistoryRepository.save] 保存成功:', record.id);
    return record;
  },

  /** 列出某女生的所有模拟练习历史，按 createdAt 倒序 */
  async listByGirlId(girlId: string): Promise<SimulateHistoryRecord[]> {
    const list = await db.simulateHistory
      .where('girlId')
      .equals(girlId)
      .sortBy('createdAt');
    return list.reverse();
  },

  /** 列出某用户的所有模拟练习历史，按 createdAt 倒序 */
  async listByUserId(userId: string): Promise<SimulateHistoryRecord[]> {
    const list = await db.simulateHistory
      .where('userId')
      .equals(userId)
      .sortBy('createdAt');
    return list.reverse();
  },

  /** 根据 id 查询一条记录 */
  async getById(id: string): Promise<SimulateHistoryRecord | undefined> {
    return db.simulateHistory.get(id);
  },

  /** 删除一条记录 */
  async remove(id: string): Promise<void> {
    console.log('🗑️ [simulateHistoryRepository.remove] 删除模拟练习历史:', id);
    await db.simulateHistory.delete(id);
    console.log('✅ [simulateHistoryRepository.remove] 删除成功:', id);
  },

  /** 清空所有模拟练习历史 */
  async clearAll(): Promise<void> {
    await db.simulateHistory.clear();
  },
};
