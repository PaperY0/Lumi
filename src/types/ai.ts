import type { AIAnalysisReport } from './analysis';
import type { UserProfile, GirlProfile } from './profile';
import type { MaleQuestionnaireResult, FemaleQuestionnaireResult } from './questionnaire';

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
 * 请求 AI 分析会话的入参。
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
 * AI 分析会话的返回结果，直接复用完整分析报告结构。
 */
export type AnalyzeResponse = AIAnalysisReport;

/**
 * 请求 AI 生成回复建议的入参。
 */
export interface ReplyRequest {
  /** 男生用户资料 id */
  userProfileId: string;
  /** 女生资料 id */
  girlProfileId: string;
  /** 对方最新发来的消息内容 */
  otherMessage: string;
  /** 额外上下文（可选） */
  context?: string;
}

/**
 * AI 回复建议的返回结果。
 */
export interface ReplyResponse {
  /** 一句话直给的简明结论 */
  simpleAnswer: string;
  /** 不同风格的推荐回复及其解释 */
  recommendedReplies: {
    /** 回复风格 */
    style: ReplyStyle;
    /** 推荐的回复文本 */
    text: string;
    /** 该回复的解释/思路说明 */
    explanation: string;
  }[];
  /** 应避免的回复 */
  avoidReplies: string[];
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
