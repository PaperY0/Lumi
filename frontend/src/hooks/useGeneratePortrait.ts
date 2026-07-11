import { useCallback, useState } from 'react';
import { aiClient } from '@/lib/ai';
import {
  girlProfileRepository,
  portraitRepository,
  questionnaireRepository,
  userProfileRepository,
} from '@/lib/db';
import { chatRepository } from '@/lib/db/repositories/chatRepo';
import { buildPursuitContext, preparePursuitProfiles } from '@/lib/ai/profileContext';
import type { PortraitRequest, PortraitResponse } from '@/types';

const MAX_PORTRAIT_CHAT_MESSAGES = 40;

async function buildRecentChatHistory(
  userId: string,
  girlId: string,
): Promise<NonNullable<PortraitRequest['chatHistory']>> {
  const latestSession = await chatRepository.getLatestSession(userId, girlId);
  if (!latestSession) {
    if (import.meta.env.DEV) {
      console.log('[useGeneratePortrait] no chat session found for portrait context');
    }
    return [];
  }

  const messages = await chatRepository.getMessages(latestSession.id);
  const recentMessages = messages.slice(-MAX_PORTRAIT_CHAT_MESSAGES);

  if (import.meta.env.DEV) {
    console.log('[useGeneratePortrait] collected recent chat context', {
      sessionId: latestSession.id,
      totalMessages: messages.length,
      includedMessages: recentMessages.length,
    });
  }

  return recentMessages
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      role: message.sender === 'user' ? 'user' : 'other',
      content: message.content,
      timestamp: message.sentAt,
    }));
}

export function useGeneratePortrait() {
  const [data, setData] = useState<PortraitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCached = useCallback(async () => {
    try {
      const user = await userProfileRepository.getCurrent();
      if (!user) return;

      const girls = await girlProfileRepository.getByUserId(user.id);
      const girl = girls[0];
      if (!girl) return;

      const cachedPortrait = await portraitRepository.getLatest(user.id, girl.id);
      if (cachedPortrait) {
        setData(cachedPortrait.data);
      }

      if (import.meta.env.DEV) {
        console.log('[useGeneratePortrait] cached portrait lookup complete', {
          userId: user.id,
          girlId: girl.id,
          hasCachedPortrait: !!cachedPortrait,
        });
      }
    } catch (e) {
      console.error('[useGeneratePortrait] failed to load cached portrait', e);
    }
  }, []);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await userProfileRepository.getCurrent();
      if (!user) {
        throw new Error('请先完成资料建档');
      }

      const girls = await girlProfileRepository.getByUserId(user.id);
      const girl = girls[0];
      if (!girl) {
        throw new Error('请先添加女生资料');
      }

      const maleQuestionnaire = await questionnaireRepository.getLatestMale(user.id);
      const femaleQuestionnaire = await questionnaireRepository.getLatestFemale(user.id);
      const chatHistory = await buildRecentChatHistory(user.id, girl.id);
      const profileContext = buildPursuitContext({
        userProfile: user,
        girlProfile: girl,
        maleQuestionnaire,
        femaleQuestionnaire,
        recentMessages: chatHistory.map((message, index) => ({
          id: `portrait-context-${index}`,
          sessionId: 'portrait-context',
          sender: message.role === 'user' ? 'user' : 'other',
          senderName: message.role,
          sentAt: message.timestamp ?? new Date().toISOString(),
          content: message.content,
          messageType: 'text',
          sourceMethod: 'paste',
        })),
      });
      const pursuitProfiles = preparePursuitProfiles(user, girl);

      if (import.meta.env.DEV) {
        console.log('[useGeneratePortrait] generating portrait', {
          userId: user.id,
          girlId: girl.id,
          hasMaleQuestionnaire: !!maleQuestionnaire,
          hasFemaleQuestionnaire: !!femaleQuestionnaire,
          chatHistoryCount: chatHistory.length,
          userContextFields: profileContext.stats.userFieldCount,
          girlContextFields: profileContext.stats.girlFieldCount,
        });
      }

      const portrait = await aiClient.generatePortrait({
        userProfile: pursuitProfiles.userProfile,
        girlProfile: pursuitProfiles.girlProfile,
        userQuestionnaire: maleQuestionnaire ?? undefined,
        girlQuestionnaire: femaleQuestionnaire ?? undefined,
        profileContext: profileContext.summary,
        chatHistory,
      });

      await portraitRepository.save({
        userId: user.id,
        girlId: girl.id,
        data: portrait,
      });

      setData(portrait);

      if (import.meta.env.DEV) {
        console.log('[useGeneratePortrait] portrait generated and saved', {
          maleTypeTagCount: portrait.maleTypeTags.length,
          femaleTagCount: portrait.femalePersonalityTags.length,
          interactionHeat: portrait.interactionHeat,
          chatHistoryCount: chatHistory.length,
        });
      }
    } catch (e: any) {
      console.error('[useGeneratePortrait] failed to generate portrait', e);
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
