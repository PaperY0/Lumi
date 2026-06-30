/**
 * 男生测评问卷中单题的作答记录。
 */
export interface MaleQuestionAnswer {
  /** 题目 id */
  questionId: string;
  /** 所选选项的标签文本 */
  optionLabel: string;
  /** 该选项对应的得分 */
  score: number;
}

/**
 * 女生测评问卷中单题的作答记录。
 */
export interface FemaleQuestionAnswer {
  /** 题目 id */
  questionId: string;
  /** 所选选项的标签文本 */
  optionLabel: string;
  /** 该选项对应的得分 */
  score: number;
}

/**
 * 男生问卷的测评结果。
 * 根据男生本人的作答，输出其类型标签、短板与建议。
 */
export interface MaleQuestionnaireResult {
  /** 主键，uuid */
  id: string;
  /** 关联的男生用户 id（UserProfile.id） */
  userId: string;
  /** 全部题目的作答记录 */
  answers: MaleQuestionAnswer[];
  /** 类型标签，如 ["理性解决型", "轻度焦虑型"] */
  typeTags: string[];
  /** 识别出的短板/弱点 */
  weaknesses: string[];
  /** 改进建议 */
  suggestions: string[];
  /** 完成时间，ISO 8601 字符串 */
  completedAt: string;
}

/**
 * 女生问卷的测评结果。
 * 由男生代入女生视角作答，输出女生画像、可能阶段与信号判断。
 */
export interface FemaleQuestionnaireResult {
  /** 主键，uuid */
  id: string;
  /** 关联的男生用户 id（UserProfile.id） */
  userId: string;
  /** 关联的女生资料 id（GirlProfile.id） */
  girlId: string;
  /** 全部题目的作答记录 */
  answers: FemaleQuestionAnswer[];
  /** 女生性格标签 */
  personalityTags: string[];
  /** 推断出的当前可能阶段（自由文本） */
  possibleStage: string;
  /** 积极信号 */
  positiveSignals: string[];
  /** 需谨慎对待的信号 */
  cautionSignals: string[];
  /** 给男生的建议 */
  suggestions: string[];
  /** 完成时间，ISO 8601 字符串 */
  completedAt: string;
}
