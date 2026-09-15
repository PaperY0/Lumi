import { afterEach, expect, it, vi } from 'vitest';
import { recognizeChatImages } from './chatImageOcr';

afterEach(() => vi.unstubAllGlobals());

it('reports bounded monotonic batch progress and completes at 100', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
    originalMarkdown: '你好', rawText: '你好', messages: [], warnings: [],
  }), { headers: { 'content-type': 'application/json' } })));
  const progress: number[] = [];
  await recognizeChatImages([
    new File(['x'], 'a.png', { type: 'image/png' }),
    new File(['x'], 'b.png', { type: 'image/png' }),
  ], value => progress.push(value));
  expect(progress.every(value => value >= 0 && value <= 100)).toBe(true);
  expect(progress).toEqual([...progress].sort((a, b) => a - b));
  expect(progress[progress.length - 1]).toBe(100);
});

it('consumes streamed stages and retains Chinese text across chunk boundaries', async () => {
  const result = { originalMarkdown: '你好', rawText: '你好', messages: [], warnings: [] };
  const bytes = new TextEncoder().encode([
    JSON.stringify({ type: 'progress', progress: 10, stage: '申请上传' }),
    JSON.stringify({ type: 'progress', progress: 40, stage: '正在识别' }),
    JSON.stringify({ type: 'result', result }),
  ].join('\n'));
  vi.stubGlobal('fetch', vi.fn(async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(bytes.slice(0, 63)); controller.enqueue(bytes.slice(63)); controller.close(); },
  }), { headers: { 'content-type': 'application/x-ndjson' } })));
  const stages: string[] = [];
  const results = await recognizeChatImages([new File(['x'], 'a.png', { type: 'image/png' })], undefined, stage => stages.push(stage));
  expect(stages.some(stage => stage.includes('正在识别'))).toBe(true);
  expect(results[0].text).toBe('你好');
});

it('surfaces streamed provider failures instead of pretending recognition succeeded', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(
    `${JSON.stringify({ type: 'error', message: 'MinerU 鉴权失败' })}\n`,
    { headers: { 'content-type': 'application/x-ndjson' } },
  )));
  const results = await recognizeChatImages([new File(['x'], 'a.png', { type: 'image/png' })]);
  expect(results[0].warning).toBe('MinerU 鉴权失败');
  expect(results[0].minerUParse).toBeUndefined();
});
