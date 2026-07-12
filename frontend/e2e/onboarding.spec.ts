import { test, expect, type Page } from '@playwright/test';

type Stage = 'observing' | 'warming' | 'ambiguous';
type Audience = 'self' | 'observation' | 'relationship';

const stores = [
  'userProfiles', 'girlProfiles', 'maleQuestionnaireResults', 'femaleQuestionnaireResults',
  'stageQuestionnaireResults', 'chatSessions', 'chatMessages', 'analysisReports',
  'replyHistory', 'simulationSessions', 'simulationMessages', 'importantDates',
  'relationshipPortraits', 'appSettings', 'simulateHistory', 'loveGuideArticles',
];

async function clearAllLocalData(page: Page) {
  await page.evaluate(async (storeNames) => {
    localStorage.clear();
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('LumiDB');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const available = storeNames.filter((name) => db.objectStoreNames.contains(name));
        if (!available.length) { db.close(); resolve(); return; }
        const tx = db.transaction(available, 'readwrite');
        available.forEach((name) => tx.objectStore(name).clear());
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, stores);
}

async function seedData(page: Page, options: { stage?: Stage; audiences?: Audience[]; onboardingCompleted?: boolean }) {
  const userId = 'e2e-onboarding-user';
  const girlId = 'e2e-onboarding-girl';
  const stage = options.stage ?? 'observing';
  const audiences = options.audiences ?? [];
  await page.evaluate(async ({ userId, girlId, stage, audiences }) => {
    const now = new Date().toISOString();
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('LumiDB');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['userProfiles', 'girlProfiles', 'maleQuestionnaireResults', 'femaleQuestionnaireResults', 'stageQuestionnaireResults'], 'readwrite');
        tx.objectStore('userProfiles').put({ id: userId, nickname: 'E2E 用户', ageRange: '23-27', relationshipStatus: 'single', loveExperience: 'some', createdAt: now, updatedAt: now });
        tx.objectStore('girlProfiles').put({ id: girlId, userId, nickname: 'E2E 女生', currentStage: stage, currentStageLabel: stage === 'warming' ? '升温期' : '初识接触期', createdAt: now, updatedAt: now });
        tx.objectStore('maleQuestionnaireResults').put({ id: `male-${userId}`, userId, answers: [], summary: [], completedAt: now });
        tx.objectStore('femaleQuestionnaireResults').put({ id: `female-${userId}`, userId, girlId, answers: [], summary: [], completedAt: now });
        audiences.forEach((audience) => tx.objectStore('stageQuestionnaireResults').put({ id: `${stage}-${audience}-${girlId}`, userId, girlId, relationshipStage: stage, audience, version: 1, answers: [{ questionId: 'e2e', optionId: 'e2e' }], summary: ['e2e'], completedAt: now }));
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
    localStorage.setItem('lumi-settings', JSON.stringify({ state: { onboardingCompleted: false, mockMode: true, theme: 'auto' }, version: 0 }));
  }, { userId, girlId, stage, audiences });
  if (options.onboardingCompleted) {
    await page.evaluate(() => {
      const raw = localStorage.getItem('lumi-settings');
      const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
      parsed.state.onboardingCompleted = true;
      localStorage.setItem('lumi-settings', JSON.stringify(parsed));
    });
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await clearAllLocalData(page);
});

test('新用户缺少当前阶段最后一份问卷时停留阶段专项页', async ({ page }) => {
  await seedData(page, { audiences: ['self', 'observation'] });
  await page.reload();
  await expect(page).toHaveURL(/\/stage-questionnaires/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: /礼貌边界检查/ })).toBeVisible();
  await expect(page.getByRole('button', { name: '开始填写' }).last()).toBeVisible();
  await page.goto('/relationship-portrait');
  await expect(page).toHaveURL(/\/stage-questionnaires/, { timeout: 10000 });
});

test('完整老用户进入首页并可查看重做入口', async ({ page }) => {
  await seedData(page, { audiences: ['self', 'observation', 'relationship'], onboardingCompleted: true });
  await page.reload();
  await expect(page.getByText('引导完成度 6/6')).toBeVisible();
  await page.goto('/profile');
  await expect(page.getByRole('button', { name: '保存资料' })).toBeVisible();
  await page.goto('/stage-questionnaires');
  await expect(page.getByText('重新填写').first()).toBeVisible();
});

test('阶段切换不会沿用旧阶段完成状态', async ({ page }) => {
  await seedData(page, { stage: 'observing', audiences: ['self', 'observation', 'relationship'] });
  await page.evaluate(async () => {
    const request = indexedDB.open('LumiDB');
    await new Promise<void>((resolve, reject) => { request.onerror = () => reject(request.error); request.onsuccess = () => { const db = request.result; const tx = db.transaction('girlProfiles', 'readwrite'); tx.objectStore('girlProfiles').put({ id: 'e2e-onboarding-girl', userId: 'e2e-onboarding-user', nickname: 'E2E 女生', currentStage: 'warming', currentStageLabel: '升温期', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error); }; });
  });
  await page.reload();
  await expect(page).toHaveURL(/\/stage-questionnaires/, { timeout: 15000 });
  await expect(page.getByText('升温期', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('开始填写').first()).toBeVisible();
});

test('阶段问卷完成状态刷新后仍保留', async ({ page }) => {
  await seedData(page, { audiences: ['self'] });
  await page.reload();
  await expect(page).toHaveURL(/\/stage-questionnaires/, { timeout: 15000 });
  await expect(page.getByText('已完成').first()).toBeVisible();
  await page.reload();
  await expect(page.getByText('已完成').first()).toBeVisible();
});
