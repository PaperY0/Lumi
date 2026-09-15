/**
 * Chat image OCR via the backend MinerU v4 precise parsing pipeline.
 *
 * The browser only uploads the image to Lumi's backend. The backend owns:
 * MinerU token usage, upload URL handling, polling, zip download, full.md
 * extraction, and the LLM cleanup/A-B speaker parsing pass.
 */

import { AI_API_BASE } from './ai/config';
import type { MinerUParseResponse } from '@/types/minerUChatImport';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/jp2', 'image/webp', 'image/gif', 'image/bmp'];
const REQUEST_TIMEOUT_MS = 180000;

export interface ImageOcrResult {
  fileName: string;
  text: string;
  normalizedText: string;
  lines: { side: 'left' | 'right' | 'center' | 'unknown'; text: string; top: number; confidence: number }[];
  confidence?: number;
  warning?: string;
  minerUParse?: MinerUParseResponse;
}

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `图片超过 20MB（当前 ${(file.size / 1024 / 1024).toFixed(1)}MB），请压缩后重试。`;
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  const mimeOk = ALLOWED_TYPES.includes(file.type);
  const extOk = ext ? ['png', 'jpg', 'jpeg', 'jp2', 'webp', 'gif', 'bmp'].includes(ext) : false;
  if (!mimeOk && !extOk) {
    return `不支持的图片格式（${file.type || ext || '未知'}），请使用 png/jpg/jpeg/webp/gif/bmp。`;
  }

  return null;
}

function buildNormalized(text: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => `unknown：${line.trim()}`)
    .join('\n');
}

async function parseImageWithMinerU(file: File, onStage?: (progress: number, stage: string) => void): Promise<MinerUParseResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = `${AI_API_BASE}/api/mineru/parse-image-chat?fileName=${encodeURIComponent(file.name)}`;

  try {
    console.log(`[OCR] MinerU v4 parse start: ${file.name}, ${(file.size / 1024).toFixed(1)}KB`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/x-ndjson' },
      body: file,
      signal: controller.signal,
    });

    if (response.ok && response.headers.get('content-type')?.includes('application/x-ndjson') && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pending = '';
      let result: MinerUParseResponse | undefined;
      const consume = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === 'progress') onStage?.(event.progress, event.stage);
        if (event.type === 'error') throw new Error(event.message || '云端识别失败');
        if (event.type === 'result') result = event.result;
      };
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        pending += decoder.decode(value, { stream: true });
        const lines = pending.split('\n');
        pending = lines.pop() || '';
        lines.forEach(consume);
      }
      pending += decoder.decode();
      consume(pending);
      if (!result || !Array.isArray(result.messages)) throw new Error('云端识别中断，未收到完整结果，请重试');
      return result;
    }

    const raw = await response.text();
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new Error(`云端识别响应格式异常（HTTP ${response.status}）`);
    }

    if (!response.ok) {
      throw new Error(json.message || json.error || `云端识别失败（HTTP ${response.status}）`);
    }

    console.log(`[OCR] MinerU v4 parse done: ${file.name}, messages=${json.messages?.length ?? 0}`);
    return json as MinerUParseResponse;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('云端识别超时，请稍后重试或换一张更清晰的截图。');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function recognizeChatImages(
  files: File[],
  onProgress?: (progress: number) => void,
  onStage?: (stage: string) => void,
): Promise<ImageOcrResult[]> {
  const results: ImageOcrResult[] = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const validationError = validateFile(file);

    if (validationError) {
      console.warn(`[OCR] ${file.name}: ${validationError}`);
      results.push({ fileName: file.name, text: '', normalizedText: '', lines: [], warning: validationError });
      onProgress?.(Math.round(((index + 1) / files.length) * 100));
      continue;
    }

    try {
      onProgress?.(Math.round(((index + 0.05) / files.length) * 100));
      onStage?.(`正在连接识别服务（${index + 1}/${files.length}）`);
      const minerUParse = await parseImageWithMinerU(file, (progress, stage) => {
        onProgress?.(Math.round(((index + Math.min(100, Math.max(0, progress)) / 100) / files.length) * 100));
        onStage?.(`${stage}（${index + 1}/${files.length}）`);
      });

      const rawText = minerUParse.rawText || minerUParse.messages.map((message) => message.cleanedText || message.rawText).join('\n');
      results.push({
        fileName: file.name,
        text: rawText,
        normalizedText: buildNormalized(rawText),
        lines: [],
        minerUParse,
      });
    } catch (error) {
      const warning = error instanceof Error
        ? error.message
        : '云端识别失败，请稍后重试或改用文本/文件导入。';
      console.warn(`[OCR] ${file.name}: ${warning}`);
      results.push({ fileName: file.name, text: '', normalizedText: '', lines: [], warning });
    } finally {
      onProgress?.(Math.round(((index + 1) / files.length) * 100));
    }
  }

  return results;
}
