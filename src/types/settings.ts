/**
 * 应用级配置项（键值对存储）。
 */
export interface AppSetting {
  /** 配置项的键 */
  key: string;
  /** 配置项的值（类型不固定） */
  value: any;
  /** 最近更新时间，ISO 8601 字符串 */
  updatedAt: string;
}

/**
 * 受支持的配置项键名。
 * - onboardingCompleted：是否完成新手引导
 * - mockMode：是否开启 Mock 模式
 * - currentUserId：当前选中的男生用户 id
 * - currentGirlId：当前选中的女生资料 id
 */
export type SettingKey =
  | 'onboardingCompleted'
  | 'mockMode'
  | 'currentUserId'
  | 'currentGirlId';
