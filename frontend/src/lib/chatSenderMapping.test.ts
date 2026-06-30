import { describe, it, expect } from 'vitest';
import {
  getSenderCandidates,
  mapMessagesWithSenderSelection,
  hasSenderConflict,
} from './chatSenderMapping';
import type { ParsedChatMessage } from './chatImportParser';

function makeMsg(
  senderName: string,
  overrides?: Partial<ParsedChatMessage>,
): ParsedChatMessage {
  return {
    id: 'test-1',
    role: 'unknown' as const,
    senderName,
    content: 'test content',
    rawLine: `${senderName}：test content`,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('getSenderCandidates', () => {
  it('提取去重发送人', () => {
    const messages = [
      makeMsg('wh'),
      makeMsg('wsy'),
      makeMsg('wh'),
      makeMsg('friend'),
    ];
    const candidates = getSenderCandidates(messages);
    expect(candidates).toEqual(['wh', 'wsy', 'friend']);
  });

  it('过滤空 senderName', () => {
    const messages = [makeMsg('wh'), makeMsg(''), makeMsg('wsy')];
    const candidates = getSenderCandidates(messages);
    expect(candidates).toEqual(['wh', 'wsy']);
  });

  it('空数组返回空数组', () => {
    expect(getSenderCandidates([])).toEqual([]);
  });
});

describe('mapMessagesWithSenderSelection', () => {
  const messages = [makeMsg('wh'), makeMsg('wsy'), makeMsg('other')];

  it('userSenderName 映射为 role=user', () => {
    const result = mapMessagesWithSenderSelection(messages, 'wh', 'wsy');
    expect(result[0].role).toBe('user');
  });

  it('girlSenderName 映射为 role=girl', () => {
    const result = mapMessagesWithSenderSelection(messages, 'wh', 'wsy');
    expect(result[1].role).toBe('girl');
  });

  it('未匹配 sender 映射为 unknown', () => {
    const result = mapMessagesWithSenderSelection(messages, 'wh', 'wsy');
    expect(result[2].role).toBe('unknown');
  });

  it('null senderName 不抛异常', () => {
    const result = mapMessagesWithSenderSelection(messages, null, null);
    expect(result.every((m) => m.role === 'unknown')).toBe(true);
  });

  it('空数组不报错', () => {
    const result = mapMessagesWithSenderSelection([], 'wh', 'wsy');
    expect(result).toEqual([]);
  });
});

describe('hasSenderConflict', () => {
  it('同一个人选为双方时冲突', () => {
    expect(hasSenderConflict('wh', 'wh')).toBe(true);
  });

  it('不同人时不冲突', () => {
    expect(hasSenderConflict('wh', 'wsy')).toBe(false);
  });

  it('任一为 null 时不冲突', () => {
    expect(hasSenderConflict('wh', null)).toBe(false);
    expect(hasSenderConflict(null, 'wsy')).toBe(false);
  });
});
