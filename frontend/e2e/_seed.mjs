// Shared seed for ad-hoc screenshot scripts.
export async function seed(page) {
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => new Promise((resolve, reject) => {
    const req = indexedDB.open('LumiDB');
    req.onsuccess = () => {
      try {
        const db = req.result;
        const now = new Date().toISOString();
        db.transaction('userProfiles', 'readwrite').objectStore('userProfiles').put({
          id: 'shot-user', nickname: '测试用户', ageRange: '23-27', relationshipStatus: 'single', loveExperience: 'some', createdAt: now, updatedAt: now,
        });
        db.transaction('girlProfiles', 'readwrite').objectStore('girlProfiles').put({
          id: 'shot-girl', userId: 'shot-user', nickname: '测试女生', currentStage: 'observing', currentStageLabel: '普通朋友', createdAt: now, updatedAt: now,
        });
        db.transaction('maleQuestionnaireResults', 'readwrite').objectStore('maleQuestionnaireResults').put({
          id: 'shot-male', userId: 'shot-user', answers: [], typeTags: ['理性解决型'], weaknesses: [], suggestions: [], completedAt: now,
        });
        db.transaction('femaleQuestionnaireResults', 'readwrite').objectStore('femaleQuestionnaireResults').put({
          id: 'shot-female', userId: 'shot-user', girlId: 'shot-girl', answers: [], completedAt: now,
        });
        db.transaction('chatSessions', 'readwrite').objectStore('chatSessions').put({
          id: 'shot-session', userId: 'shot-user', girlId: 'shot-girl', title: '周末聊天', importedAt: now, messageCount: 12, sourceMethod: 'paste',
        });
        const msgStore = db.transaction('chatMessages', 'readwrite').objectStore('chatMessages');
        const lines = ['今天还好吗？', '还行，有点累', '那早点休息', '嗯嗯', '周末有空吗', '看情况吧', '好的，不打扰你了', '没事～', '晚安', '晚安', '明天见', '好'];
        lines.forEach((c, i) => msgStore.put({
          id: 'shot-msg-' + i, sessionId: 'shot-session', sender: i % 2 === 0 ? 'user' : 'other', sentAt: new Date(Date.now() - (12 - i) * 60000).toISOString(), content: c, messageType: 'text', sourceMethod: 'paste',
        }));
        db.transaction('analysisReports', 'readwrite').objectStore('analysisReports').put({
          id: 'shot-report', sessionId: 'shot-session', createdAt: now,
          simpleAnswer: '她在礼貌回应，但没有主动推进，节奏偏慢，不必着急。',
          relationshipStage: '普通朋友', interactionHeat: 'warm', girlEmotion: '平静、略疲惫',
          positiveSignals: ['每条消息都有回复', '主动说晚安', '没有明显抗拒'],
          riskSignals: ['回复偏短', '对周末邀约保留态度', '缺少主动提问'],
          boyIssues: ['连续追问容易让她有压力', '“不打扰你了”略显退缩'],
          girlPerspective: '她可能真的比较累，回复简短并不等于冷淡，但当前她对更近一步还没有明确意愿。',
          recommendedReplies: [{ style: '自然真诚', text: '辛苦啦，好好休息，周末看你安排～' }, { style: '轻松幽默', text: '那我先把周末空出来，等你的通知官宣。' }],
          avoidReplies: ['你是不是不想见我？', '为什么总是这么冷淡'],
          nextStep: '接下来两天保持轻量互动，分享一件有趣的小事，不再追问周末安排。',
        });
        db.close(); resolve(true);
      } catch (e) { reject(e); }
    };
    req.onerror = () => reject(req.error);
  }));
  await page.evaluate(() => {
    localStorage.setItem('lumi-settings', JSON.stringify({ state: { onboardingCompleted: true, mockMode: true, theme: 'auto' }, version: 0 }));
  });
}
