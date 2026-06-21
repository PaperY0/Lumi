/**
 * 女生（目标对象）资料的数据访问层（Repository）。
 * 负责对 girlProfiles 表的读写。
 */

import { v4 as uuidv4 } from 'uuid';
import type { GirlProfile } from '@/types';
import { db } from '../database';

export const girlProfileRepository = {
  /** 新建或更新一条女生资料：缺 id 自动生成，自动维护 createdAt / updatedAt */
  async save(profile: Partial<GirlProfile>): Promise<GirlProfile> {
    const now = new Date().toISOString();
    const existing = profile.id ? await db.girlProfiles.get(profile.id) : undefined;

    const entity: GirlProfile = {
      ...(existing ?? {}),
      ...profile,
      id: profile.id ?? existing?.id ?? uuidv4(),
      createdAt: existing?.createdAt ?? profile.createdAt ?? now,
      updatedAt: now,
    } as GirlProfile;

    await db.girlProfiles.put(entity);
    return entity;
  },

  /** 取某个男生名下的全部女生资料 */
  async getByUserId(userId: string): Promise<GirlProfile[]> {
    return db.girlProfiles.where('userId').equals(userId).toArray();
  },

  /** 按 id 取一条女生资料 */
  async getById(id: string): Promise<GirlProfile | undefined> {
    return db.girlProfiles.get(id);
  },

  /** 按 id 删除一条女生资料 */
  async delete(id: string): Promise<void> {
    await db.girlProfiles.delete(id);
  },

  /** 清空所有女生资料 */
  async clearAll(): Promise<void> {
    await db.girlProfiles.clear();
  },
};
