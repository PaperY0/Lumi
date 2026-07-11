import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAnalyzePrompt } from './analyze.js';
import { buildPortraitPrompt } from './portrait.js';
import { buildReplyPrompt } from './reply.js';
import { buildSimulatePrompt } from './simulate.js';

const pursuitContext = '当前模式：追求期';

function joinedContent(messages: Array<{ content: string }>): string {
  return messages.map((message) => message.content).join('\n');
}

test('all AI prompts include the pursuit-stage boundary rule', () => {
  const prompts = [
    buildAnalyzePrompt({ profileContext: pursuitContext }),
    buildPortraitPrompt({ profileContext: pursuitContext }),
    buildReplyPrompt({ userMessage: '今天有点累', profileContext: pursuitContext }),
    buildSimulatePrompt({ scenario: '邀约吃饭', difficulty: '普通', profileContext: pursuitContext }),
  ];

  for (const prompt of prompts) {
    const content = joinedContent(prompt);
    assert.match(content, /追求期规则/);
    assert.match(content, /不默认使用亲昵称呼/);
    assert.match(content, /保留拒绝空间/);
  }
});
