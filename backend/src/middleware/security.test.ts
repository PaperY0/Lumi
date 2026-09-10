import assert from 'node:assert/strict';
import test from 'node:test';
import { getAllowedOrigins } from './security.js';

test('default allowed origins support localhost and loopback Vite URLs', () => {
  const previous = process.env.ALLOWED_ORIGINS;
  delete process.env.ALLOWED_ORIGINS;

  try {
    assert.deepEqual(getAllowedOrigins(), [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ]);
  } finally {
    if (previous === undefined) delete process.env.ALLOWED_ORIGINS;
    else process.env.ALLOWED_ORIGINS = previous;
  }
});
