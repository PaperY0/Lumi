/**
 * 关系画像生成 Hook
 * 封装"收集数据 → 调 AI 接口 → 处理 loading/error → 缓存"的完整流程
 */

import { useState, useCallback } from 'react';
import { aiClient } from '@/lib/ai';
import {
  userProfileRepository,
  girlProfileRepository,
  questionnaireRepository,
  portraitRepository,
} from '@/lib/db';
import type { PortraitResponse } from '@/types';

export function useGeneratePortrait() {
  const [data, setData] = useState<PortraitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载已缓存的画像
   * 进页面时调用，从 IndexedDB 读取最新一条
   */
  const loadCached = useCallback(async () => {
    try {
      console.log('🔍 [useGeneratePortrait.loadCached] 开始加载缓存画像');

      const user = await userProfileRepository.getCurrent();
      if (!user) {
        console.log('⚠️ [useGeneratePortrait.loadCached] user 为空，跳过加载');
        return;
      }
      console.log('  - user.id:', user.id, ', nickname:', user.nickname);

      const girls = await girlProfileRepository.getByUserId(user.id);
      console.log('  - girls 数组长度:', girls.length);

      const girl = girls[0]; // MVP 阶段取第一个女生
      if (!girl) {
        console.log('⚠️ [useGeneratePortrait.loadCached] girl 为空，跳过加载');
        return;
      }
      console.log('  - girl.id:', girl.id, ', nickname:', girl.nickname);

      const cachedPortrait = await portraitRepository.getLatest(user.id, girl.id);
      if (cachedPortrait) {
        console.log('✅ [useGeneratePortrait.loadCached] 找到缓存画像:', cachedPortrait.id);
        setData(cachedPortrait.data);
      } else {
        console.log('⚠️ [useGeneratePortrait.loadCached] 没有缓存画像');
      }
    } catch (e: any) {
      console.error('❌ [useGeneratePortrait.loadCached] 加载缓存失败:', e);
      // 加载缓存失败不显示错误，静默处理
    }
  }, []);

  /**
   * 生成新画像
   * 点击按钮时调用，调用 AI 接口并保存到数据库
   */
  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎯 [useGeneratePortrait.generate] 开始生成画像');

      // 1. 收集用户资料
      console.log('📥 [useGeneratePortrait.generate] 步骤 1/4：收集用户资料');
      const user = await userProfileRepository.getCurrent();
      if (!user) {
        console.error('❌ [useGeneratePortrait.generate] user 为空，抛出错误');
        throw new Error('请先完成资料建档');
      }
      console.log('✅ [useGeneratePortrait.generate] user 收集成功:', {
        id: user.id,
        nickname: user.nickname,
      });

      // 2. 收集女生资料（MVP 阶段取第一个）
      console.log('📥 [useGeneratePortrait.generate] 步骤 2/4：收集女生资料，查询 userId:', user.id);
      const girls = await girlProfileRepository.getByUserId(user.id);
      console.log('📤 [useGeneratePortrait.generate] girls 数组长度:', girls.length);

      const girl = girls[0];
      if (!girl) {
        console.error('❌ [useGeneratePortrait.generate] girl 为空，girls 数组为空，抛出错误');
        throw new Error('请先添加女生资料');
      }
      console.log('✅ [useGeneratePortrait.generate] girl 收集成功:', {
        id: girl.id,
        nickname: girl.nickname,
        userId: girl.userId,
      });

      // 3. 收集问卷结果
      console.log('📥 [useGeneratePortrait.generate] 步骤 3/4：收集问卷结果');
      const maleQuestionnaire = await questionnaireRepository.getLatestMale(user.id);
      const femaleQuestionnaire = await questionnaireRepository.getLatestFemale(user.id);

      console.log('✅ [useGeneratePortrait.generate] 数据收集完成，准备调用 AI 接口');
      console.log('  - 用户:', user.nickname, '(id:', user.id + ')');
      console.log('  - 女生:', girl.nickname, '(id:', girl.id, ', userId:', girl.userId + ')');
      console.log('  - 男生问卷:', maleQuestionnaire ? '✅ 已填写 (id: ' + maleQuestionnaire.id + ')' : '❌ 未填写');
      console.log('  - 女生问卷:', femaleQuestionnaire ? '✅ 已填写 (id: ' + femaleQuestionnaire.id + ')' : '❌ 未填写');

      // 4. 调用 AI 接口生成画像
      console.log('📥 [useGeneratePortrait.generate] 步骤 4/4：调用 AI 接口');
      const portrait = await aiClient.generatePortrait({
        userProfile: user,
        girlProfile: girl,
        userQuestionnaire: maleQuestionnaire ?? undefined,
        girlQuestionnaire: femaleQuestionnaire ?? undefined,
      });

      console.log('✅ [useGeneratePortrait.generate] AI 生成成功，返回数据:', {
        maleTypeTags: portrait.maleTypeTags,
        femalePersonalityTags: portrait.femalePersonalityTags,
        interactionHeat: portrait.interactionHeat,
      });

      // 5. 保存到数据库
      console.log('📥 [useGeneratePortrait.generate] 保存画像到数据库');
      await portraitRepository.save({
        userId: user.id,
        girlId: girl.id,
        data: portrait,
      });

      console.log('✅ [useGeneratePortrait.generate] 画像保存成功');

      // 6. 更新状态
      setData(portrait);
      console.log('✅ [useGeneratePortrait.generate] 完整流程结束');
    } catch (e: any) {
      console.error('❌ [useGeneratePortrait.generate] 生成失败:', e);
      setError(e.message || '生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    generate,
    loadCached,
  };
}
