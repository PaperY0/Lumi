import type { ParsedChatMessage } from './chatImportParser';

/** 从解析结果中提取去重发送人列表 */
export function getSenderCandidates(
  messages: Pick<ParsedChatMessage, 'senderName'>[],
): string[] {
  return Array.from(
    new Set(
      messages
        .map((m) => m.senderName?.trim())
        .filter((name): name is string => Boolean(name)),
    ),
  );
}

/** 根据用户选择的发送人映射消息角色 */
export function mapMessagesWithSenderSelection(
  messages: ParsedChatMessage[],
  userSenderName: string | null,
  girlSenderName: string | null,
): ParsedChatMessage[] {
  return messages.map((message) => ({
    ...message,
    role:
      userSenderName && message.senderName === userSenderName
        ? ('user' as const)
        : girlSenderName && message.senderName === girlSenderName
          ? ('girl' as const)
          : ('unknown' as const),
  }));
}

/** 检查发送人选择是否冲突（同一个人不能同时是"我"和"她"） */
export function hasSenderConflict(
  userSenderName: string | null,
  girlSenderName: string | null,
): boolean {
  return Boolean(userSenderName && girlSenderName && userSenderName === girlSenderName);
}
