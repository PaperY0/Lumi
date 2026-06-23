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

    console.log('[questionnaireRepo] saveMaleResult 开始保存:', entity.id);
    await db.maleQuestionnaireResults.put(entity);
    console.log('[questionnaireRepo] saveMaleResult 保存成功，立即验证...');

    // ✅ 修复：保存后立即读取验证
    const saved = await db.maleQuestionnaireResults.get(entity.id);
    console.log('[questionnaireRepo] saveMaleResult 验证结果:', saved ? '成功' : '失败');

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

    console.log('[questionnaireRepo] saveFemaleResult 开始保存:', entity.id);
    await db.femaleQuestionnaireResults.put(entity);
    console.log('[questionnaireRepo] saveFemaleResult 保存成功，立即验证...');

    // ✅ 修复：保存后立即读取验证
    const saved = await db.femaleQuestionnaireResults.get(entity.id);
    console.log('[questionnaireRepo] saveFemaleResult 验证结果:', saved ? '成功' : '失败');

    return entity;
  },

  /** 取某男生最新一条男生问卷结果（按 completedAt 倒序取第一条） */
  async getLatestMale(
    userId: string,
  ): Promise<MaleQuestionnaireResult | undefined> {
    console.log('[questionnaireRepo] getLatestMale 开始查询，userId:', userId);

    // ✅ 修复：使用 reverse() 直接倒序，而不是先正序再取最后一个
    const list = await db.maleQuestionnaireResults
      .where('userId')
      .equals(userId)
      .reverse() // 按 completedAt 倒序
      .sortBy('completedAt');

    console.log('[questionnaireRepo] getLatestMale 查询结果数量:', list.length);

    const result = list[0]; // 取第一条（最新的）
    console.log('[questionnaireRepo] getLatestMale 返回:', result ? result.id : 'undefined');

    return result;
  },

  /** 取某男生最新一条女生问卷结果（按 completedAt 倒序取第一条） */
  async getLatestFemale(
    userId: string,
  ): Promise<FemaleQuestionnaireResult | undefined> {
    console.log('[questionnaireRepo] getLatestFemale 开始查询，userId:', userId);

    // ✅ 修复：使用 reverse() 直接倒序
    const list = await db.femaleQuestionnaireResults
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('completedAt');

    console.log('[questionnaireRepo] getLatestFemale 查询结果数量:', list.length);

    const result = list[0];
    console.log('[questionnaireRepo] getLatestFemale 返回:', result ? result.id : 'undefined');

    return result;
  },

  /** 清空两张问卷结果表 */
  async clearAll(): Promise<void> {
    await db.maleQuestionnaireResults.clear();
    await db.femaleQuestionnaireResults.clear();
  },
};
