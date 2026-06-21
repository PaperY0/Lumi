/**
 * 男生本人资料的数据访问层（Repository）。
 * 负责对 userProfiles 表的读写，屏蔽 Dexie 细节。
 */

import { v4 as uuidv4 } from 'uuid';
import type { UserProfile } from '@/types';
import { db } from '../database';

export const userProfileRepository = {
  /** 新建或更新一条男生资料：缺 id 自动生成，自动维护 createdAt / updatedAt */
  async save(profile: Partial<UserProfile>): Promise<UserProfile> {
    const now = new Date().toISOString();
    // 已有 id 视为更新，先把旧记录读出来以保留 createdAt
    const existing = profile.id ? await db.userProfiles.get(profile.id) : undefined;

    const entity: UserProfile = {
      ...(existing ?? {}),
      ...profile,
      id: profile.id ?? existing?.id ?? uuidv4(),
      createdAt: existing?.createdAt ?? profile.createdAt ?? now,
      updatedAt: now,
    } as UserProfile;

    await db.userProfiles.put(entity);
    return entity;
  },

  /** 取当前用户：按 createdAt 取最新创建的一条 */
  async getCurrent(): Promise<UserProfile | undefined> {
    return db.userProfiles.orderBy('createdAt').last();
  },

  /** 按 id 取一条男生资料 */
  async getById(id: string): Promise<UserProfile | undefined> {
    return db.userProfiles.get(id);
  },

  /** 清空所有男生资料 */
  async clearAll(): Promise<void> {
    await db.userProfiles.clear();
  },
};
