/**
 * 应用级键值配置的数据访问层（Repository）。
 * 负责对 appSettings 表的读写。每条记录是一个 { key, value, updatedAt }。
 */

import type { AppSetting, SettingKey } from '@/types';
import { db } from '../database';

export const settingsRepository = {
  /** 按 key 取配置值；不存在返回 undefined。泛型 T 用于标注 value 的期望类型 */
  async get<T = any>(key: SettingKey): Promise<T | undefined> {
    const row = await db.appSettings.get(key);
    return row?.value as T | undefined;
  },

  /** 设置某个配置项的值，并刷新 updatedAt */
  async set(key: SettingKey, value: any): Promise<void> {
    const entity: AppSetting = {
      key,
      value,
      updatedAt: new Date().toISOString(),
    };
    await db.appSettings.put(entity);
  },

  /** 删除某个配置项 */
  async remove(key: SettingKey): Promise<void> {
    await db.appSettings.delete(key);
  },

  /** 清空所有配置 */
  async clearAll(): Promise<void> {
    await db.appSettings.clear();
  },
};
