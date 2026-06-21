/**
 * 问卷测评结果的数据访问层（Repository）。
 * 同时管理男生问卷（maleQuestionnaireResults）和女生问卷（femaleQuestionnaireResults）两张表。
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  MaleQuestionnaireResult,
  FemaleQuestionnaireResult,
} from '@/types';
import { db } from '../database';

export const questionnaireRepository = {
  /** 保存一条男生问卷结果：缺 id 自动生成，缺 completedAt 自动填当前时间 */
  async saveMaleResult(
    result: Partial<MaleQuestionnaireResult>,
  ): Promise<MaleQuestionnaireResult> {
    const now = new Date().toISOString();
    const entity: MaleQuestionnaireResult = {
      ...result,
      id: result.id ?? uuidv4(),
      completedAt: result.completedAt ?? now,
    } as MaleQuestionnaireResult;

    await db.maleQuestionnaireResults.put(entity);
    return entity;
  },

  /** 保存一条女生问卷结果：缺 id 自动生成，缺 completedAt 自动填当前时间 */
  async saveFemaleResult(
    result: Partial<FemaleQuestionnaireResult>,
  ): Promise<FemaleQuestionnaireResult> {
    const now = new Date().toISOString();
    const entity: FemaleQuestionnaireResult = {
      ...result,
      id: result.id ?? uuidv4(),
      completedAt: result.completedAt ?? now,
    } as FemaleQuestionnaireResult;

    await db.femaleQuestionnaireResults.put(entity);
    return entity;
  },

  /** 取某男生最新一条男生问卷结果（按 completedAt 倒序取第一条） */
  async getLatestMale(
    userId: string,
  ): Promise<MaleQuestionnaireResult | undefined> {
    const list = await db.maleQuestionnaireResults
      .where('userId')
      .equals(userId)
      .sortBy('completedAt');
    return list[list.length - 1];
  },

  /** 取某男生最新一条女生问卷结果（按 completedAt 倒序取第一条） */
  async getLatestFemale(
    userId: string,
  ): Promise<FemaleQuestionnaireResult | undefined> {
    const list = await db.femaleQuestionnaireResults
      .where('userId')
      .equals(userId)
      .sortBy('completedAt');
    return list[list.length - 1];
  },

  /** 清空两张问卷结果表 */
  async clearAll(): Promise<void> {
    await db.maleQuestionnaireResults.clear();
    await db.femaleQuestionnaireResults.clear();
  },
};
