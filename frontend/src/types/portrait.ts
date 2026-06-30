/**
 * 关系画像存储类型
 * 用于缓存 AI 生成的关系画像结果
 */

import type { PortraitResponse } from './ai';

export interface RelationshipPortrait {
  /** 唯一标识 */
  id: string;
  /** 男生用户 ID */
  userId: string;
  /** 女生资料 ID */
  girlId: string;
  /** AI 生成的画像数据 */
  data: PortraitResponse;
  /** 创建时间 */
  createdAt: string;
}
