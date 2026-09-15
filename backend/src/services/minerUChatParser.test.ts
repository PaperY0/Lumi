import assert from 'node:assert/strict';
import test from 'node:test';
import { preserveMinerUText } from './minerUChatParser.js';

test('OCR fallback preserves short messages without inventing alternating speakers', () => {
  const parsed = preserveMinerUText('<!-- image-->\n你好\n嗯\n123\n![avatar](avatar.png)');
  assert.deepEqual(parsed.messages.map(message => message.cleanedText), ['你好', '嗯', '123']);
  assert.ok(parsed.messages.every(message => message.role === 'unknown'));
});

test('OCR fallback maps only explicit speaker labels', () => {
  const parsed = preserveMinerUText('A：你好\nB：晚上好');
  assert.deepEqual(parsed.messages.map(message => message.role), ['A', 'B']);
});
