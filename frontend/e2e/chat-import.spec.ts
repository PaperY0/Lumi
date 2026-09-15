import { test, expect, type Page } from '@playwright/test';

/** 种子测试数据 + 绕过新手引导 */
async function seedAndBypass(page: Page) {
  await page.evaluate(() => {
    return new Promise<boolean>((resolve, reject) => {
      const req = indexedDB.open('LumiDB');
      req.onsuccess = () => {
        try {
          const db = req.result;
          const now = new Date().toISOString();

          const userTx = db.transaction('userProfiles', 'readwrite');
          userTx.objectStore('userProfiles').put({
            id: 'e2e-test-user',
            nickname: '测试用户',
            ageRange: '23-27',
            relationshipStatus: 'single',
            loveExperience: 'some',
            createdAt: now,
            updatedAt: now,
          });

          const girlTx = db.transaction('girlProfiles', 'readwrite');
          girlTx.objectStore('girlProfiles').put({
            id: 'e2e-test-girl',
            userId: 'e2e-test-user',
            nickname: '测试女生',
            currentStage: 'observing',
            currentStageLabel: '普通朋友',
            createdAt: now,
            updatedAt: now,
          });

          db.close();
          resolve(true);
        } catch (e) {
          reject(e);
        }
      };
      req.onerror = () => reject(req.error);
    });
  });

  await page.evaluate(() => {
    localStorage.setItem(
      'lumi-settings',
      JSON.stringify({
        state: { onboardingCompleted: true, mockMode: true, theme: 'auto' },
        version: 0,
      }),
    );
  });

  await page.reload();
  await page.waitForLoadState('networkidle');
}

test.describe('聊天导入 — 解析流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await seedAndBypass(page);
  });

  test('粘贴聊天记录 → 点击解析 → 显示统计', async ({ page }) => {
    // 导航到聊天导入
    await page.locator('aside').getByText('聊天导入', { exact: true }).click();
    await page.waitForTimeout(500);

    // 查找 textarea 并粘贴
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill('wh：今天还好吗？\nwsy：还行，有点累\nwh：那早点休息\nwsy：嗯嗯');

    // 点击解析
    await page.getByRole('button', { name: '解析聊天记录' }).click();
    await page.waitForTimeout(800);

    // 断言出现发送人选择区域
    await expect(page.getByText('我是谁')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('她是谁')).toBeVisible({ timeout: 5000 });

    // 断言统计存在（识别到有效消息）
    const statsText = page.getByText(/条有效消息/).or(page.getByText(/条/));
    await expect(statsText.first()).toBeVisible({ timeout: 3000 });
  });

  test('空文本时解析按钮为禁用状态', async ({ page }) => {
    await page.locator('aside').getByText('聊天导入', { exact: true }).click();
    await page.waitForTimeout(500);

    // 不输入文本，解析按钮应为 disabled
    const parseBtn = page.getByRole('button', { name: '解析聊天记录' });
    await expect(parseBtn).toBeDisabled({ timeout: 5000 });
  });

  test('title and favicon use Lumi branding', async ({ page }) => {
    await expect(page).toHaveTitle('Lumi 恋语 · AI 关系沟通陪伴');
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/lumi-heart-icon-v1.png');
    expect((await page.request.get('/lumi-heart-icon-v1.png')).ok()).toBe(true);
  });

  test('streamed OCR → preview → save → new text preview stays independent', async ({ page }) => {
    const result = { originalMarkdown: 'A：图片你好\nB：图片晚上好', rawText: '图片你好\n图片晚上好', warnings: [], messages: [
      { id: 'a', rawText: '图片你好', cleanedText: '图片你好', role: 'A', confidence: 0.9 },
      { id: 'b', rawText: '图片晚上好', cleanedText: '图片晚上好', role: 'B', confidence: 0.9 },
    ] };
    await page.route('**/api/mineru/parse-image-chat?*', route => route.fulfill({
      contentType: 'application/x-ndjson', body: [
        JSON.stringify({ type: 'progress', progress: 40, stage: '正在识别' }),
        JSON.stringify({ type: 'result', result }),
      ].join('\n'),
    }));
    await page.locator('aside').getByText('聊天导入', { exact: true }).click();
    await page.locator('input[type="file"][accept*="image/png"]').setInputFiles({
      name: 'synthetic.png', mimeType: 'image/png', buffer: Buffer.from('synthetic'),
    });
    await expect(page.getByText('A 和 B 分别是谁？')).toBeVisible();
    await page.getByRole('button', { name: 'A 是我，B 是她' }).click();
    await page.getByRole('button', { name: /^保存$/ }).click();
    await expect(page.locator('textarea').first()).toBeVisible();
    await page.locator('textarea').first().fill('我：新的文本消息\n她：新的回复');
    await page.getByRole('button', { name: '预览(清洗)' }).click();
    await expect(page.getByText('新的文本消息').first()).toBeVisible();
    await expect(page.getByText('A 和 B 分别是谁？')).toHaveCount(0);
    await expect(page.getByText('图片你好', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^保存$/ })).toBeEnabled();
  });
});
