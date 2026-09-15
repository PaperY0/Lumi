import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import JSZip from 'jszip';
import router from './minerUImage.js';

test('image upload streams recognition stages and preserves drafts when AI is disabled', async () => {
  const nativeFetch = globalThis.fetch;
  const previousMode = process.env.MOCK_MODE;
  const previousToken = process.env.MINERU_TOKEN;
  const zip = new JSZip();
  zip.file('full.md', '你好\n嗯');
  const archive = await zip.generateAsync({ type: 'uint8array' });
  process.env.MOCK_MODE = 'true';
  process.env.MINERU_TOKEN = 'synthetic-token';
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes('file-urls/batch')) return Response.json({ code: 0, data: { batch_id: 'fixture', file_urls: ['https://fixture.aliyuncs.com/image'] } });
    if (url.includes('fixture.aliyuncs.com')) return new Response('OK');
    if (url.includes('extract-results/batch')) return Response.json({ code: 0, data: { extract_result: [{ state: 'done', full_zip_url: 'https://cdn-mineru.openxlab.org.cn/fixture.zip' }] } });
    return new Response(archive);
  };
  const app = express();
  app.use('/api', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const response = await nativeFetch(`http://127.0.0.1:${address.port}/api/mineru/parse-image-chat?fileName=test.png`, {
      method: 'POST', body: new Uint8Array([1, 2, 3]), headers: { accept: 'application/x-ndjson' },
    });
    const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line));
    assert.ok(events.some(event => event.type === 'progress' && event.progress === 80));
    const result = events.find(event => event.type === 'result').result;
    assert.deepEqual(result.messages.map((message: { cleanedText: string }) => message.cleanedText), ['你好', '嗯']);
    assert.ok(result.messages.every((message: { role: string }) => message.role === 'unknown'));
  } finally {
    globalThis.fetch = nativeFetch;
    if (previousMode === undefined) delete process.env.MOCK_MODE; else process.env.MOCK_MODE = previousMode;
    if (previousToken === undefined) delete process.env.MINERU_TOKEN; else process.env.MINERU_TOKEN = previousToken;
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
