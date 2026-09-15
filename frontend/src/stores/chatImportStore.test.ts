import { afterEach, expect, it } from 'vitest';
import { useChatImportStore } from './chatImportStore';

afterEach(() => useChatImportStore.getState().clear());

it('switches from OCR preview to a new text import without stale OCR drafts', () => {
  const store = useChatImportStore.getState();
  store.setMinerUImportResult({ originalMarkdown: 'old', rawText: 'old', messages: [], warnings: [] });
  store.setImportResult({ rawText: 'new', cleanedText: 'new', messages: [], warnings: [], removedNoiseCount: 0 });
  expect(useChatImportStore.getState().minerUImportResult).toBeNull();
  expect(useChatImportStore.getState().minerUMessages).toEqual([]);
});

it('switches from text preview to OCR without stale text drafts', () => {
  const store = useChatImportStore.getState();
  store.setImportResult({ rawText: 'old', cleanedText: 'old', messages: [], warnings: [], removedNoiseCount: 0 });
  store.setMinerUImportResult({ originalMarkdown: 'new', rawText: 'new', messages: [], warnings: [] });
  expect(useChatImportStore.getState().importResult).toBeNull();
});
