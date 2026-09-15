import assert from 'node:assert/strict';
import test from 'node:test';
import { getPublicLLMError, LLMProviderError } from './client.js';

test('provider authentication failures expose actionable status without credentials', () => {
  const result = getPublicLLMError(new LLMProviderError('private provider detail', 401, 'invalid_request_error'));
  assert.equal(result.error, 'DEEPSEEK_REQUEST_FAILED');
  assert.match(result.message, /DEEPSEEK_API_KEY/);
  assert.equal(JSON.stringify(result).includes('private provider detail'), false);
});

test('provider balance failures are distinct from authentication failures', () => {
  const result = getPublicLLMError(new LLMProviderError('private detail', 402));
  assert.match(result.message, /余额不足/);
});
