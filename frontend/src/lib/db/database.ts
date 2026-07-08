/**
 * Lumi 本地数据库定义（基于 Dexie.js 封装 IndexedDB）。
 *
 * 所有用户数据都存在浏览器本地的 IndexedDB 里，数据库名为 'LumiDB'。
 * 这里只负责"建表 + 配索引 + 绑定 TS 类型"，具体的增删改查放在 repositories/ 下。
 *
 * 索引语法速记（Dexie 的 stores 字符串）：
 *   - 第一个字段是主键（primary key）。
 *   - 后面用逗号分隔的字段是"次级索引"，只有建了索引的字段才能高效地 where(...) 查询/排序。
 *   - 主键前加 ++ 表示自增；这里我们统一用业务自己生成的 uuid，所以不加 ++。
 */

import Dexie, { type Table } from 'dexie';
import type {
  UserProfile,
  GirlProfile,
  MaleQuestionnaireResult,
  FemaleQuestionnaireResult,
  ChatSession,
  ChatMessage,
  AIAnalysisReport,
  AppSetting,
  ReplyHistory,
  SimulationSession,
  SimulationMessage,
  ImportantDate,
  RelationshipPortrait,
  SimulateHistoryRecord,
  CustomLoveGuideArticle,
} from '@/types';

/**
 * LumiDB：项目的本地数据库类。
 * 每个 Table<T, Key> 属性对应 IndexedDB 里的一张表（object store）。
 * 泛型第一个参数是行的数据类型，第二个是主键的类型。
 */
export class LumiDB extends Dexie {
  /** 男生本人的资料 */
  userProfiles!: Table<UserProfile, string>;
  /** 女生（目标对象）的资料 */
  girlProfiles!: Table<GirlProfile, string>;
  /** 男生问卷测评结果 */
  maleQuestionnaireResults!: Table<MaleQuestionnaireResult, string>;
  /** 女生问卷测评结果 */
  femaleQuestionnaireResults!: Table<FemaleQuestionnaireResult, string>;
  /** 聊天记录导入形成的会话 */
  chatSessions!: Table<ChatSession, string>;
  /** 会话下的单条聊天消息 */
  chatMessages!: Table<ChatMessage, string>;
  /** AI 分析报告 */
  analysisReports!: Table<AIAnalysisReport, string>;
  /** 回复助手历史记录 */
  replyHistory!: Table<ReplyHistory, string>;
  /** 情景模拟会话 */
  simulationSessions!: Table<SimulationSession, string>;
  /** 情景模拟会话下的单条对话消息 */
  simulationMessages!: Table<SimulationMessage, string>;
  /** 女生关联的重要日期（生日/纪念日等） */
  importantDates!: Table<ImportantDate, string>;
  /** 关系画像（AI 生成） */
  relationshipPortraits!: Table<RelationshipPortrait, string>;
  /** 应用级键值配置 */
  appSettings!: Table<AppSetting, string>;
  /** 模拟对话练习历史 */
  simulateHistory!: Table<SimulateHistoryRecord, string>;
  /** 恋爱法典自定义文章 */
  loveGuideArticles!: Table<CustomLoveGuideArticle, string>;

  constructor() {
    super('LumiDB');

    this.version(2).stores({
      // 男生本人资料：按 createdAt 可取"最新一条"
      userProfiles: 'id, createdAt',
      // 女生资料：按 userId 查某男生名下所有女生
      girlProfiles: 'id, userId, createdAt',
      // 男生问卷结果：按 userId + completedAt 取最新
      maleQuestionnaireResults: 'id, userId, completedAt',
      // 女生问卷结果：按 userId / girlId 维度查询
      femaleQuestionnaireResults: 'id, userId, girlId, completedAt',
      // 聊天会话：按 userId / girlId 查询，按 importedAt 排序
      chatSessions: 'id, userId, girlId, importedAt',
      // 聊天消息：按 sessionId 查询，按 sentAt 排序，按 sender 过滤
      chatMessages: 'id, sessionId, sentAt, sender',
      // 分析报告：按 sessionId 查询，按 createdAt 取最新
      analysisReports: 'id, sessionId, createdAt',
      // 回复历史：按 userId 查询，按 createdAt 排序
      replyHistory: 'id, userId, createdAt',
      // 模拟会话：按 userId / scene 查询，按 createdAt 排序
      simulationSessions: 'id, userId, scene, createdAt',
      // 模拟消息：按 sessionId 查询，按 sentAt 排序
      simulationMessages: 'id, sessionId, sentAt',
      // 重要日期：按 girlId 查询，按 date 排序
      importantDates: 'id, girlId, date',
      // 关系画像：按 userId / girlId 查询，按 createdAt 取最新
      relationshipPortraits: 'id, userId, girlId, createdAt',
      // 应用配置：以 key 作为主键
      appSettings: 'key',
    });

    // v3：新增模拟对话练习历史表
    this.version(3).stores({
      simulateHistory: 'id, createdAt, updatedAt, userId, girlId, scenario, difficulty',
    });

    // v4：新增恋爱法典本地自定义文章表
    this.version(4).stores({
      loveGuideArticles: 'id, category, createdAt, updatedAt',
    });
  }

  /**
   * ✅ 清空所有本地数据（危险操作）
   * 一次性清空 IndexedDB 里的所有表
   */
  async clearAllData(): Promise<void> {
    console.log('[LumiDB] 开始清空所有数据...');

    await this.transaction('rw', this.tables, async () => {
      for (const table of this.tables) {
        console.log(`[LumiDB] 清空表: ${table.name}`);
        await table.clear();
      }
    });

    console.log('[LumiDB] 所有表已清空');
  }
}

/** 数据库单例：整个应用共用这一个实例 */
export const db = new LumiDB();
