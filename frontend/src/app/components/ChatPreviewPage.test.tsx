import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { useChatImportStore } from '@/stores/chatImportStore';
import { ChatPreviewPage } from './ChatPreviewPage';

afterEach(() => { cleanup(); useChatImportStore.getState().clear(); });

it('does not save unknown speakers as the other person', () => {
  useChatImportStore.getState().setImportResult({ rawText: 'fixture', cleanedText: 'fixture', warnings: [], removedNoiseCount: 0,
    messages: ['me', 'her', 'unknown'].map((role, index) => ({ id: String(index), rawText: 'text', cleanedText: 'text', senderRole: role as 'me' | 'her' | 'unknown' })),
  });
  render(<ChatPreviewPage onNavigate={() => {}} />);
  expect(screen.getByRole('button', { name: /^保存$/ })).toBeDisabled();
});

it('allows a short one-sided transcript after its speaker is confirmed', () => {
  useChatImportStore.getState().setImportResult({ rawText: '她：你好', cleanedText: '她：你好', warnings: [], removedNoiseCount: 0,
    messages: [{ id: 'one', rawText: '她：你好', cleanedText: '你好', senderRole: 'her' }],
  });
  render(<ChatPreviewPage onNavigate={() => {}} />);
  expect(screen.getByRole('button', { name: /^保存$/ })).toBeEnabled();
});
