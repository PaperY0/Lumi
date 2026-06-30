/**
 * 关系画像 Repository
 * 负责关系画像数据的增删改查
 */

import { db } from '../database';
import type { RelationshipPortrait, PortraitResponse } from '@/types';

class PortraitRepository {
  /**
   * 保存关系画像
   */
  async save(params: {
    userId: string;
    girlId: string;
    data: PortraitResponse;
  }): Promise<RelationshipPortrait> {
    const portrait: RelationshipPortrait = {
      id: crypto.randomUUID(),
      userId: params.userId,
      girlId: params.girlId,
      data: params.data,
      createdAt: new Date().toISOString(),
    };

    await db.relationshipPortraits.add(portrait);
    console.log('[PortraitRepository] 画像已保存:', portrait.id);

    return portrait;
  }

  /**
   * 获取最新的关系画像
   */
  async getLatest(userId: string, girlId: string): Promise<RelationshipPortrait | undefined> {
    return await db.relationshipPortraits
      .where({ userId, girlId })
      .reverse()
      .sortBy('createdAt')
      .then((portraits) => portraits[0]);
  }

  /**
   * 获取某个用户的所有画像（按时间倒序）
   */
  async getByUserId(userId: string): Promise<RelationshipPortrait[]> {
    return await db.relationshipPortraits
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('createdAt');
  }

  /**
   * 删除指定画像
   */
  async delete(id: string): Promise<void> {
    await db.relationshipPortraits.delete(id);
    console.log('[PortraitRepository] 画像已删除:', id);
  }

  /**
   * 清空所有画像
   */
  async clear(): Promise<void> {
    await db.relationshipPortraits.clear();
    console.log('[PortraitRepository] 所有画像已清空');
  }
}

export const portraitRepository = new PortraitRepository();
