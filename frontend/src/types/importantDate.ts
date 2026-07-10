/**
 * 与某个女生关联的重要日期（生日 / 纪念日 / 其它）。
 * 独立成表便于按日期建索引、做提醒。
 */
export interface ImportantDate {
  /** 主键，uuid */
  id: string;
  /** 关联的女生资料 id（GirlProfile.id） */
  girlId: string;
  /** 日期名称，如 '生日'、'第一次见面' */
  name: string;
  /** 日期，ISO 8601 字符串 */
  date: string;
  /** 类型：生日 / 纪念日 / 其它 */
  type: 'birthday' | 'anniversary' | 'other';
  /** 是否已提醒过（可选） */
  reminded?: boolean;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}
