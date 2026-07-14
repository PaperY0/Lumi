import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAnalyzePrompt } from './analyze.js';
import { buildPortraitPrompt } from './portrait.js';
import { buildReplyPrompt } from './reply.js';
import { buildSimulatePrompt } from './simulate.js';
import { mockReply } from '../llm/mock.js';

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

test('reply prompt contains explicit stage tone, rhythm card, and safety rules', () => {
  const prompt = buildReplyPrompt({
    profileContext: '当前关系阶段：初识接触期',
    relationshipStage: 'observing',
    rhythmCard: {
      status: 'pause',
      title: '建议先暂停推进',
      nextAction: '停止推进，尊重对方界限',
      avoid: '不要连续追问',
    },
    userMessage: '不用了，谢谢',
  });
  const content = joinedContent(prompt);
  assert.match(content, /初识接触期/);
  assert.match(content, /升温期/);
  assert.match(content, /暧昧观察期/);
  assert.match(content, /当前关系节奏卡/);
  assert.match(content, /明确拒绝/);
  assert.match(content, /停止施压/);
  assert.match(content, /长期单方面投入/);
  assert.match(content, /嫉妒/);
  assert.match(content, /连续追问/);
});

test('mock reply stops pressure after explicit rejection', () => {
  const result = mockReply({ relationshipStage: 'observing', userMessage: '不用了，谢谢，我不想继续聊' });
  assert.match(result.simpleAnswer, /停止推进|尊重/);
  assert.ok(result.recommendedReplies.every((reply) => !/等你愿意|改天再|之后再|随时/.test(reply.text)));
  assert.ok(result.recommendedReplies.some((reply) => /不打扰|不用急着回|尊重/.test(reply.text)));
  assert.ok(result.avoidReplies.some((reply) => /追问|施压|不想理/.test(reply)));
});

test('mock reply keeps initial contact distant and stage-aware', () => {
  const initial = mockReply({ relationshipStage: 'observing', userMessage: '今天工作还顺利吗？' });
  assert.ok(initial.recommendedReplies.every((reply) => !/宝宝|亲爱的|老婆/.test(reply.text)));
  const warming = mockReply({ relationshipStage: 'warming', userMessage: '周末有空吗？' });
  assert.match(warming.analysis, /轻量试探|退出/);
  const ambiguous = mockReply({ relationshipStage: 'ambiguous', userMessage: '你觉得我们是什么关系？' });
  assert.match(ambiguous.analysis, /双向投入|情绪安全|单次回复/);
});
