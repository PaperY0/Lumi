import assert from 'node:assert/strict';
import test from 'node:test';
import { executeLLM } from './execute.js';

test('explicit mock mode returns fixtures without calling the provider', async () => {
  let liveCalled = false;
  const result = await executeLLM({
    mockMode: true,
    mock: () => 'fixture',
    live: async () => {
      liveCalled = true;
      return 'live';
    },
  });

  assert.deepEqual(result, { value: 'fixture', source: 'mock' });
  assert.equal(liveCalled, false);
});

test('live mode returns provider output and identifies its source', async () => {
  const result = await executeLLM({
    mockMode: false,
    mock: () => 'fixture',
    live: async () => 'live',
  });

  assert.deepEqual(result, { value: 'live', source: 'deepseek' });
});

test('live provider failures propagate instead of silently returning fixtures', async () => {
  let mockCalled = false;

  await assert.rejects(
    executeLLM({
      mockMode: false,
      mock: () => {
        mockCalled = true;
        return 'fixture';
      },
      live: async () => {
        throw new Error('provider failed');
      },
    }),
    /provider failed/,
  );

  assert.equal(mockCalled, false);
});
