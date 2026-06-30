import { test, expect, type Page } from '@playwright/test';

/** 在 IndexedDB 中写入最小测试数据，并设置 localStorage 绕过新手引导 */
async function seedTestDataAndBypassOnboarding(page: Page) {
  await page.evaluate(() => {
    return new Promise<boolean>((resolve, reject) => {
      const req = indexedDB.open('LumiDB');
      req.onsuccess = () => {
        try {
          const db = req.result;
          const now = new Date().toISOString();

          // 写入测试用户
          const userTx = db.transaction('userProfiles', 'readwrite');
          const userStore = userTx.objectStore('userProfiles');
          userStore.put({
            id: 'e2e-test-user',
            nickname: '测试用户',
            ageRange: '23-27',
            relationshipStatus: 'single',
            loveExperience: 'some',
            createdAt: now,
            updatedAt: now,
          });

          // 写入测试女生
          const girlTx = db.transaction('girlProfiles', 'readwrite');
          const girlStore = girlTx.objectStore('girlProfiles');
          girlStore.put({
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

  // 设置 localStorage 标记引导已完成
  await page.evaluate(() => {
    localStorage.setItem(
      'lumi-settings',
      JSON.stringify({
        state: { onboardingCompleted: true, mockMode: true, theme: 'auto' },
        version: 0,
      }),
    );
  });

  // 重新加载以应用状态
  await page.reload();
  await page.waitForLoadState('networkidle');
}

test.describe('Smoke — 首页可访问', () => {
  test('App 加载后显示非白屏内容（可能为新手引导或首页）', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // App 至少能加载：侧边栏品牌名 或 新手引导页
    const brandOrOnboarding = page.locator('text=Lumi').or(page.locator('text=开始'));
    await expect(brandOrOnboarding.first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Smoke — 主要页面可导航', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await seedTestDataAndBypassOnboarding(page);
  });

  const navLabels = [
    '首页',
    '关系画像',
    '聊天导入',
    'AI 分析',
    '帮我回复',
    '模拟对话',
    '恋爱法典',
    '设置',
  ];

  for (const label of navLabels) {
    test(`点击 "${label}" 侧边栏导航，页面加载不白屏`, async ({ page }) => {
      const navButton = page.locator('aside').getByText(label, { exact: true });
      await expect(navButton).toBeVisible({ timeout: 5000 });
      await navButton.click();
      await page.waitForTimeout(500);

      // 页面不应白屏（至少能看到一些内容）
      const body = page.locator('main');
      await expect(body).toBeVisible();
    });
  }
});

test.describe('Smoke — 设置页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await seedTestDataAndBypassOnboarding(page);
  });

  test('设置页显示关键信息', async ({ page }) => {
    await page.locator('aside').getByText('设置', { exact: true }).click();
    await page.waitForTimeout(800);

    await expect(page.getByText('本地数据概览')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('导出本地数据')).toBeVisible({ timeout: 5000 });
  });
});
