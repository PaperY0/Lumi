import { expect, it } from 'vitest';
import { parseImportedChatText } from './chatImportPipeline';

it('uses the format-aware parser for nicknames and multiline text previews', () => {
  const result = parseImportedChatText('小明：你好\n这是续行\n小红：晚上好', { userName: '小明', girlName: '小红' });
  expect(result.messages).toHaveLength(2);
  expect(result.messages[0].cleanedText).toContain('这是续行');
  expect(result.messages.map(message => message.senderRole)).toEqual(['me', 'her']);
});

it('recognizes explicit me/her labels without profile nicknames', () => {
  const result = parseImportedChatText('我：你好\n她：晚上好');
  expect(result.messages.map(message => message.senderRole)).toEqual(['me', 'her']);
});
