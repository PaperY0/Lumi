import { describe, it, expect } from 'vitest';
import { readChatFiles } from './chatFileImporter';

function makeFile(name: string, content: string, type?: string): File {
  return new File([content], name, { type: type || 'text/plain' });
}

describe('readChatFiles', () => {
  describe('txt 文件', () => {
    it('读取单个 txt 文件', async () => {
      const file = makeFile('chat.txt', 'wh：hello\nwsy：hi');
      const results = await readChatFiles([file]);

      expect(results).toHaveLength(1);
      expect(results[0].fileName).toBe('chat.txt');
      expect(results[0].text).toContain('wh：hello');
      expect(results[0].warning).toBeUndefined();
    });

    it('读取多个 txt 文件', async () => {
      const f1 = makeFile('a.txt', 'wh：hello');
      const f2 = makeFile('b.txt', 'wsy：hi');
      const results = await readChatFiles([f1, f2]);

      expect(results.filter((r) => r.text)).toHaveLength(2);
      expect(results[0].text).toContain('wh：hello');
      expect(results[1].text).toContain('wsy：hi');
    });
  });

  describe('json 文件', () => {
    it('JSON 数组（sender/content）转换为冒号格式', async () => {
      const json = JSON.stringify([
        { sender: 'wh', content: 'hello' },
        { sender: 'wsy', content: 'hi' },
      ]);
      const file = makeFile('chat.json', json, 'application/json');
      const results = await readChatFiles([file]);

      expect(results).toHaveLength(1);
      expect(results[0].text).toContain('wh：hello');
      expect(results[0].text).toContain('wsy：hi');
    });

    it('JSON 数组（senderName/content）转换', async () => {
      const json = JSON.stringify([
        { senderName: 'wh', content: 'hello' },
        { senderName: 'wsy', content: 'hi' },
      ]);
      const file = makeFile('chat.json', json, 'application/json');
      const results = await readChatFiles([file]);

      expect(results[0].text).toContain('wh：hello');
    });

    it('JSON 数组（name/message）转换', async () => {
      const json = JSON.stringify([
        { name: 'wh', message: 'test msg' },
        { from: 'wsy', text: 'reply' },
      ]);
      const file = makeFile('chat.json', json, 'application/json');
      const results = await readChatFiles([file]);

      expect(results[0].text).toContain('wh：test msg');
      expect(results[0].text).toContain('wsy：reply');
    });

    it('CSV 文件 sender/content 列转换', async () => {
      const csv = 'sender,content,time\nwh,hello,14:30\nwsy,hi,14:31';
      const file = makeFile('chat.csv', csv, 'text/csv');
      const results = await readChatFiles([file]);

      expect(results[0].text).toContain('wh：hello');
      expect(results[0].text).toContain('wsy：hi');
    });

    it('CSV 无法识别列时 fallback', async () => {
      const csv = 'col_a,col_b\nv1,v2\nv3,v4';
      const file = makeFile('chat.csv', csv, 'text/csv');
      const results = await readChatFiles([file]);

      expect(results[0].warning).toContain('未识别到');
    });
    it('不支持的 JSON 结构 → fallback 保留原文', async () => {
      const json = JSON.stringify({ notAnArray: true });
      const file = makeFile('data.json', json, 'application/json');
      const results = await readChatFiles([file]);

      expect(results[0].text).toContain('"notAnArray"');
      expect(results[0].warning).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('超大文件返回 warning', async () => {
      // 创建大于 2MB 的 File（jsdom 中 Blob 可创建大字符串）
      const large = 'x'.repeat(3 * 1024 * 1024);
      const file = makeFile('large.txt', large);
      const results = await readChatFiles([file]);

      expect(results[0].text).toBe('');
      expect(results[0].warning).toContain('过大');
    });

    it('不支持格式返回 warning', async () => {
      const file = makeFile('image.png', 'not text', 'image/png');
      const results = await readChatFiles([file]);

      expect(results[0].text).toBe('');
      expect(results[0].warning).toContain('不支持的格式');
    });

    it('超过 10 个文件时警告', async () => {
      const files = Array.from({ length: 12 }, (_, i) =>
        makeFile(`chat${i}.txt`, 'wh：hello'),
      );
      const results = await readChatFiles(files);

      const warnings = results.filter((r) => r.warning);
      expect(warnings.length).toBeGreaterThan(0);
    });
  });

  describe('微信三行块格式预处理', () => {
    it('昵称/时间/内容 → 标准冒号格式', async () => {
      const md = [
        'Whiskey',
        '2026年06月30日 13:20',
        '今天还好吗？',
        '',
        'Paper Y',
        '2026年06月30日 13:21',
        '好啊，去哪里吃？',
      ].join('\n');
      const file = makeFile('chat.md', md, 'text/markdown');
      const results = await readChatFiles([file]);

      expect(results[0].text).toContain('Whiskey：今天还好吗？');
      expect(results[0].text).toContain('Paper Y：好啊，去哪里吃？');
      // 时间行不出现在结果中
      expect(results[0].text).not.toContain('2026年06月30日');
      expect(results[0].text).not.toContain('13:20');
    });

    it('多行消息内容合并', async () => {
      const md = [
        'Whiskey',
        '2026年06月30日 13:20',
        '第一行',
        '第二行',
        '第三行',
        '',
        'Paper Y',
        '2026年06月30日 13:21',
        '回复',
      ].join('\n');
      const file = makeFile('chat.md', md, 'text/markdown');
      const results = await readChatFiles([file]);

      expect(results[0].text).toContain('Whiskey：第一行\n第二行\n第三行');
    });

    it('过滤 --- 文件：xxx --- 元数据行', async () => {
      const md = [
        '--- 文件：chat.md ---',
        '# 聊天记录',
        '',
        'Whiskey',
        '2026年06月30日 13:20',
        'hello',
      ].join('\n');
      const file = makeFile('chat.md', md, 'text/markdown');
      const results = await readChatFiles([file]);

      expect(results[0].text).not.toContain('--- 文件');
      expect(results[0].text).not.toContain('# 聊天记录');
      expect(results[0].text).toContain('Whiskey：hello');
    });

    it('去掉引用符号 > 保留内容', async () => {
      const md = [
        'Paper Y',
        '2026年06月30日 13:21',
        '> 上次那家不错',
        '> 这次还去那里吧',
      ].join('\n');
      const file = makeFile('chat.md', md, 'text/markdown');
      const results = await readChatFiles([file]);

      expect(results[0].text).toContain('Paper Y：上次那家不错\n这次还去那里吧');
      expect(results[0].text).not.toContain('>');
    });

    it('过滤 Markdown 图片和链接语法', async () => {
      const md = [
        'Whiskey',
        '2026年06月30日 13:20',
        'hello',
        '',
        '![image](url)',
        '[link](url)',
        '',
        'Paper Y',
        '2026年06月30日 13:21',
        'hi',
      ].join('\n');
      const file = makeFile('chat.md', md, 'text/markdown');
      const results = await readChatFiles([file]);

      expect(results[0].text).not.toContain('![');
      expect(results[0].text).not.toContain('[link]');
      expect(results[0].text).toContain('Whiskey：hello');
      expect(results[0].text).toContain('Paper Y：hi');
    });

    it('日期不被识别为发送人', async () => {
      const md = [
        'Whiskey',
        '2026年06月30日 13:20',
        '消息内容',
        '',
        'Paper Y',
        '2026-06-30 13:21',
        '回复内容',
      ].join('\n');
      const file = makeFile('chat.md', md, 'text/markdown');
      const results = await readChatFiles([file]);

      // 日期不出现在 sender 位置
      expect(results[0].text).not.toMatch(/2026.*年.*月.*日：/);
      expect(results[0].text).not.toMatch(/2026-06-30：/);
      // 昵称正确
      expect(results[0].text).toContain('Whiskey：消息内容');
      expect(results[0].text).toContain('Paper Y：回复内容');
    });

    it('纯 txt 文件同样支持三行块预处理', async () => {
      const txt = [
        'Alice',
        '14:30',
        '你好',
        '',
        'Bob',
        '14:31',
        '你好啊',
      ].join('\n');
      const file = makeFile('chat.txt', txt, 'text/plain');
      const results = await readChatFiles([file]);

      expect(results[0].text).toContain('Alice：你好');
      expect(results[0].text).toContain('Bob：你好啊');
      expect(results[0].text).not.toContain('14:30');
    });

    it('无法识别三行块时保留原文', async () => {
      const plain = 'wh：hello\nwsy：hi';
      const file = makeFile('chat.md', plain, 'text/markdown');
      const results = await readChatFiles([file]);

      expect(results[0].text).toContain('wh：hello');
      expect(results[0].text).toContain('wsy：hi');
    });
  });
});
