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
});
