import { describe, it, expect } from 'vitest';
import { parseChatText } from './chatImportParser';

describe('chatImportParser', () => {
  describe('基础冒号格式（中文冒号 ：）', () => {
    it('解析两行冒号消息', () => {
      const input = 'wh：今天还好吗？\nwsy：还行';
      const result = parseChatText(input);

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].senderName).toBe('wh');
      expect(result.messages[0].content).toBe('今天还好吗？');
      expect(result.messages[1].senderName).toBe('wsy');
      expect(result.messages[1].content).toBe('还行');
      expect(result.detectedFormat).toBe('colon');
    });

    it('自动统计角色数量', () => {
      const input = 'wh：今天还好吗？\nwsy：还行';
      const result = parseChatText(input);
      expect(result.userMessageCount).toBe(0);
      expect(result.girlMessageCount).toBe(0);
      expect(result.unknownMessageCount).toBe(2);
    });
  });

  describe('英文冒号格式（英文冒号 :）', () => {
    it('解析英文冒号消息', () => {
      const input = 'wh: hello\nwsy: hi';
      const result = parseChatText(input);

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].senderName).toBe('wh');
      expect(result.messages[0].content).toBe('hello');
      expect(result.messages[1].senderName).toBe('wsy');
      expect(result.messages[1].content).toBe('hi');
    });
  });

  describe('带时间格式 [YYYY/MM/DD HH:mm]', () => {
    it('解析方括号时间格式', () => {
      const input =
        '[2026/06/24 18:30] wh：今天吃饭了吗？\n[2026/06/24 18:31] wsy：吃了';
      const result = parseChatText(input);

      expect(result.messages).toHaveLength(2);
      expect(result.detectedFormat).toBe('bracket-time');
      expect(result.messages[0].content).toBe('今天吃饭了吗？');
      expect(result.messages[1].content).toBe('吃了');
      expect(result.messages[0].timestamp).toBeDefined();
      expect(result.messages[1].timestamp).toBeDefined();
    });

    it('时间戳为 ISO 格式', () => {
      const input = '[2026/06/24 18:30] wh：hello';
      const result = parseChatText(input);

      expect(result.messages[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    });
  });

  describe('过滤系统/图片/bbox/HTML/base64', () => {
    it('过滤图片、HTML、base64、bbox 等非聊天内容', () => {
      const input = [
        '聊天记录',
        '[图片]',
        'bbox 1',
        '<img src="x">',
        '![图片](x)',
        'data:image/png;base64,abc',
        'wh：有效消息',
      ].join('\n');

      const result = parseChatText(input);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe('有效消息');
      expect(result.skippedLines.length).toBeGreaterThan(0);
    });

    it('过滤撤回消息和系统提示', () => {
      const input = [
        'wsy撤回了一条消息',
        '你已添加了xxx，现在可以开始聊天了',
        '以上是打招呼内容',
        'wh：正常消息',
      ].join('\n');

      const result = parseChatText(input);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe('正常消息');
    });

    it('过滤纯时间行', () => {
      const input = '14:30\nwh：正常消息';
      const result = parseChatText(input);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe('正常消息');
    });
  });

  describe('空输入', () => {
    it('空字符串返回空消息', () => {
      const result = parseChatText('');
      expect(result.messages).toHaveLength(0);
    });

    it('只有空格返回空消息', () => {
      const result = parseChatText('   \n  \n   ');
      expect(result.messages).toHaveLength(0);
    });
  });

  describe('混合无效行', () => {
    it('无效行不抛异常，记录到 skippedLines', () => {
      const input = '这是一行没有冒号的无意义文本\nwh：有效消息\n又一行无效';
      const result = parseChatText(input);

      expect(result.messages).toHaveLength(1);
      // "又一行无效" 无发送人前缀，作为续行合并到上一条消息
      expect(result.messages[0].content).toBe('有效消息\n又一行无效');
      expect(result.skippedLines.length).toBeGreaterThanOrEqual(1);
    });

    it('全部无效行返回 warnings', () => {
      const input = '无意义文本\n又一行\n还一行';
      const result = parseChatText(input);

      expect(result.messages).toHaveLength(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('左侧/右侧 OCR 格式', () => {
    it('解析 左侧：/ 右侧：冒号格式', () => {
      const input = '左侧：hello\n右侧：hi';
      const result = parseChatText(input);

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].senderName).toBe('左侧');
      expect(result.messages[0].content).toBe('hello');
      expect(result.messages[1].senderName).toBe('右侧');
      expect(result.messages[1].content).toBe('hi');
    });

    it('senderCandidates 为 左侧 + 右侧', () => {
      const input = '左侧：msg1\n右侧：msg2\n左侧：msg3';
      const result = parseChatText(input);

      const names = [...new Set(result.messages.map((m) => m.senderName))];
      expect(names).toContain('左侧');
      expect(names).toContain('右侧');
    });

    it('文件导入分隔行被跳过', () => {
      const input = '--- 文件：chat.txt ---\nwh：hello\n--- 文件：log.json ---\nwsy：hi';
      const result = parseChatText(input);

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].content).toBe('hello');
      expect(result.messages[1].content).toBe('hi');
    });
  });
});
