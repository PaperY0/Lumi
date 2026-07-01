/**
 * parsers 模块统一出口。
 * 聊天导入增强：OCR / Markdown 清洗 + 切分 + 发言人识别 + 流水线。
 */
export { cleanChatMarkdown } from './chatCleaner';
export { segmentChatLines } from './chatSegmenter';
export { detectSpeakerCandidates } from './speakerDetector';
export { parseImportedChatText } from './chatImportPipeline';
