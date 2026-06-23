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
    console.log('📥 [girlProfileRepo.save] 收到入参:', profile);

    const now = new Date().toISOString();

    // ✅ 任务 1：实现按 userId 更新逻辑
    let existing: GirlProfile | undefined;

    // 情况 1：profile.id 存在，按 id 查询
    if (profile.id) {
      existing = await db.girlProfiles.get(profile.id);
      if (existing) {
        console.log('  - 检测到已存在记录（按 id），执行更新操作，existing.id:', existing.id);
      }
    }
    // 情况 2：profile.id 不存在，但 profile.userId 存在，按 userId 查询最新记录
    else if (profile.userId) {
      const allGirls = await db.girlProfiles.where('userId').equals(profile.userId).toArray();
      if (allGirls.length > 0) {
        // 按 updatedAt 倒序排序，取最新一条
        allGirls.sort((a, b) => {
          const aTime = a.updatedAt || a.createdAt;
          const bTime = b.updatedAt || b.createdAt;
          return bTime.localeCompare(aTime);
        });
        existing = allGirls[0];
        console.log('♻️ [girlProfileRepo.save] 检测到同 userId 已有女生资料，执行覆盖更新，existing.id:', existing.id);
      } else {
        console.log('✅ [girlProfileRepo.save] 首次创建 girlProfile');
      }
    }
    // 情况 3：既无 id 也无 userId，报错
    else {
      throw new Error('保存女生资料失败：缺少 userId');
    }

    // ✅ 任务 5：添加日志查看合并顺序
    console.log('📥 [girlProfileRepo.save] existing 旧值:', {
      currentStage: existing?.currentStage,
      currentStageLabel: existing?.currentStageLabel,
      interactionFrequency: existing?.interactionFrequency,
      interactionFrequencyLabel: existing?.interactionFrequencyLabel,
    });
    console.log('📥 [girlProfileRepo.save] profile 新值:', {
      currentStage: profile.currentStage,
      currentStageLabel: profile.currentStageLabel,
      interactionFrequency: profile.interactionFrequency,
      interactionFrequencyLabel: profile.interactionFrequencyLabel,
    });

    const entity: GirlProfile = {
      ...(existing ?? {}),
      ...profile,
      id: existing?.id ?? profile.id ?? uuidv4(),
      createdAt: existing?.createdAt ?? profile.createdAt ?? now,
      updatedAt: now,
      // 必填字段兜底
      nickname: profile.nickname ?? existing?.nickname ?? '',
      ageRange: profile.ageRange ?? existing?.ageRange ?? '23-27',
      knownChannel: profile.knownChannel ?? existing?.knownChannel ?? '其他',
      knownDuration: profile.knownDuration ?? existing?.knownDuration ?? '未知',
      currentStage: profile.currentStage ?? existing?.currentStage ?? 'observing',
      interactionFrequency: profile.interactionFrequency ?? existing?.interactionFrequency ?? 'medium',
    } as GirlProfile;

    console.log('📤 [girlProfileRepo.save] 最终写入值:', {
      currentStage: entity.currentStage,
      currentStageLabel: entity.currentStageLabel,
      interactionFrequency: entity.interactionFrequency,
      interactionFrequencyLabel: entity.interactionFrequencyLabel,
    });

    // ✅ 任务 1：nickname 必填校验
    if (!entity.nickname || !entity.nickname.trim()) {
      throw new Error('请填写她的称呼');
    }

    console.log('📤 [girlProfileRepo.save] 准备写入对象:', {
      id: entity.id,
      userId: entity.userId,
      nickname: entity.nickname,
      ageRange: entity.ageRange,
      knownChannel: entity.knownChannel,
      knownDuration: entity.knownDuration,
      currentStage: entity.currentStage,
      interactionFrequency: entity.interactionFrequency,
      birthday: entity.birthday,
    });

    // 检查必填字段
    const missingFields: string[] = [];
    if (!entity.userId) missingFields.push('userId');
    if (!entity.nickname) missingFields.push('nickname');
    if (!entity.ageRange) missingFields.push('ageRange');
    if (!entity.knownChannel) missingFields.push('knownChannel');
    if (!entity.knownDuration) missingFields.push('knownDuration');
    if (!entity.currentStage) missingFields.push('currentStage');
    if (!entity.interactionFrequency) missingFields.push('interactionFrequency');

    if (missingFields.length > 0) {
      console.error('❌ [girlProfileRepo.save] 缺少必填字段:', missingFields);
      throw new Error(`girlProfile 缺少必填字段: ${missingFields.join(', ')}`);
    }

    await db.girlProfiles.put(entity);
    console.log('✅ [girlProfileRepo.save] 已写入 girlProfiles 表:', {
      id: entity.id,
      userId: entity.userId,
      nickname: entity.nickname,
      birthday: entity.birthday,
    });
    return entity;
  },

  /** 取某个男生名下的全部女生资料 */
  async getByUserId(userId: string): Promise<GirlProfile[]> {
    console.log('📥 [girlProfileRepo.getByUserId] 查询 userId:', userId);
    const results = await db.girlProfiles.where('userId').equals(userId).toArray();

    // ✅ 任务 2：按 updatedAt 倒序排序，返回最新数据在前
    results.sort((a, b) => {
      const aTime = a.updatedAt || a.createdAt;
      const bTime = b.updatedAt || b.createdAt;
      return bTime.localeCompare(aTime);
    });

    console.log('📤 [girlProfileRepo.getByUserId] 返回数组长度:', results.length);
    if (results.length > 0) {
      console.log('📤 [girlProfileRepo.getByUserId] 第一条最新记录:', {
        id: results[0].id,
        nickname: results[0].nickname,
        birthday: results[0].birthday,
        updatedAt: results[0].updatedAt,
      });
    }
    return results;
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

  /** ✅ 任务 3：清理同一个 userId 下的重复女生资料，只保留最新一条 */
  async cleanupDuplicatesByUserId(userId: string): Promise<void> {
    console.log('🧹 [girlProfileRepo.cleanupDuplicatesByUserId] 开始清理，userId:', userId);

    const allGirls = await db.girlProfiles.where('userId').equals(userId).toArray();

    if (allGirls.length <= 1) {
      console.log('  - 只有 1 条或没有记录，无需清理');
      return;
    }

    // 按 updatedAt/createdAt 倒序排序
    allGirls.sort((a, b) => {
      const aTime = a.updatedAt || a.createdAt;
      const bTime = b.updatedAt || b.createdAt;
      return bTime.localeCompare(aTime);
    });

    const keptGirl = allGirls[0]; // 保留最新一条
    const toDelete = allGirls.slice(1); // 删除其余旧记录

    for (const girl of toDelete) {
      await db.girlProfiles.delete(girl.id);
    }

    console.log('🧹 [girlProfileRepo.cleanupDuplicatesByUserId] 已清理重复女生资料:', {
      userId,
      keptId: keptGirl.id,
      deletedCount: toDelete.length,
    });
  },
};
