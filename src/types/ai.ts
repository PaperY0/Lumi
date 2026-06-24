import type { AIAnalysisReport } from './analysis';
import type { UserProfile, GirlProfile } from './profile';
import type { MaleQuestionnaireResult, FemaleQuestionnaireResult } from './questionnaire';
import type { ChatMessage } from './chat';

/**
 * 回复助手支持的回复风格：真诚 / 幽默 / 关心。
 */
export type ReplyStyle = 'sincere' | 'humor' | 'caring';

/**
 * 关系画像生成请求
 */
export interface PortraitRequest {
  userProfile?: UserProfile;
  girlProfile?: GirlProfile;
  userQuestionnaire?: MaleQuestionnaireResult;
  girlQuestionnaire?: FemaleQuestionnaireResult;
  chatHistory?: Array<{ role: string; content: string; timestamp?: string }>;
}

/**
 * 关系画像生成响应
 */
export interface PortraitResponse {
  /** 男生沟通类型标签 */
  maleTypeTags: string[];
  /** 男生短板 */
  maleWeaknesses: string[];
  /** 给男生的建议 */
  maleSuggestions: string[];
  /** 女生性格标签 */
  femalePersonalityTags: string[];
  /** 当前可能的关系阶段 */
  possibleStage: string;
  /** 互动热度 */
  interactionHeat: 'cold' | 'cool' | 'warm' | 'hot';
  /** 积极信号 */
  positiveSignals: string[];
  /** 谨慎信号 */
  cautionSignals: string[];
  /** 整体建议 */
  suggestions: string[];
}

/**
 * 请求 AI 分析会话的入参（旧版本，保留兼容）。
 */
export interface AnalyzeRequest {
  /** 男生用户资料 id */
  userProfileId: string;
  /** 女生资料 id */
  girlProfileId: string;
  /** 待分析的会话 id */
  sessionId: string;
  /** 男生想额外补充的具体问题（可选） */
  userQuestion?: string;
}

/**
 * 请求 AI 分析会话的入参（新版本，发送完整上下文）。
 */
export interface AnalyzeChatRequest {
  userProfile: UserProfile;
  girlProfile: GirlProfile;
  maleQuestionnaire?: MaleQuestionnaireResult;
  femaleQuestionnaire?: FemaleQuestionnaireResult;
  chatSession?: {
    id: string;
    userId: string;
    title: string;
    startTime: string;
    endTime?: string;
    messageCount: number;
    createdAt: string;
  };
  messages: Array<{
    id: string;
    sessionId: string;
    sender: 'user' | 'other';
    content: string;
    timestamp: string;
  }>;
  userQuestion?: string;
}

/**
 * AI 分析会话的返回结果，直接复用完整分析报告结构。
 */
export type AnalyzeResponse = AIAnalysisReport;

/**
 * 单条推荐回复选项。
 */
export interface ReplyOption {
  /** 回复风格，如"自然真诚型""轻松幽默型""稳重关心型" */
  style: string;
  /** 推荐的回复文本 */
  text: string;
}

/**
 * 请求 AI 生成回复建议的入参。
 */
export interface ReplyRequest {
  /** 男生用户资料 */
  userProfile: UserProfile;
  /** 女生资料 */
  girlProfile: GirlProfile;
  /** 男生问卷结果（可选） */
  maleQuestionnaire?: MaleQuestionnaireResult | null;
  /** 女生问卷结果（可选） */
  femaleQuestionnaire?: FemaleQuestionnaireResult | null;
  /** 最近的聊天记录（可选） */
  recentMessages?: ChatMessage[];
  /** 对方最新发来的消息内容（必填） */
  userMessage: string;
  /** 用户意图，如"我想约她吃饭"（可选） */
  userIntent?: string;
  /** 当前场景，如"邀约""道歉""日常聊天"（可选） */
  scene?: string;
}

/**
 * AI 回复建议的返回结果。
 */
export interface ReplyResponse {
  /** 报告 id */
  id: string;
  /** 生成时间，ISO 8601 字符串 */
  createdAt: string;
  /** 一句话直给的简明结论 */
  simpleAnswer: string;
  /** 不同风格的推荐回复 */
  recommendedReplies: ReplyOption[];
  /** 应避免的回复 */
  avoidReplies: string[];
  /** 详细分析 */
  analysis: string;
}

/**
 * 请求 AI 进行情景模拟对话的入参。
 */
export interface SimulateRequest {
  /** 男生用户资料 id */
  userProfileId: string;
  /** 女生资料 id */
  girlProfileId: string;
  /** 模拟场景描述 */
  scene: string;
  /** 难度：简单 / 困难 */
  difficulty: 'easy' | 'hard';
  /** 历史对话记录 */
  history: {
    /** 角色：user 表示男生本人，ai 表示扮演女生的 AI */
    role: 'user' | 'ai';
    /** 该轮对话的文本 */
    text: string;
  }[];
}

/**
 * AI 情景模拟对话的返回结果。
 */
export interface SimulateResponse {
  /** AI（扮演女生）的回复 */
  aiReply: string;
  /** 针对男生上一句表现的反馈（可选） */
  feedback?: string;
}
