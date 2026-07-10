import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Sidebar, BottomTabBar } from './components/Sidebar';
import { OnboardingPage } from './components/OnboardingPage';
import { DashboardPage } from './components/DashboardPage';
import { ProfileSetupPage } from './components/ProfileSetupPage';
import { MaleQuestionnairePage } from './components/MaleQuestionnairePage';
import { FemaleQuestionnairePage } from './components/FemaleQuestionnairePage';
import { RelationshipPortraitPage } from './components/RelationshipPortraitPage';
import { ChatImportPage } from './components/ChatImportPage';
import { ChatPreviewPage } from './components/ChatPreviewPage';
import { AIAnalysisPage } from './components/AIAnalysisPage';
import { ReplyAssistPage } from './components/ReplyAssistPage';
import { SimulationPage } from './components/SimulationPage';
import { LoveCodePage } from './components/LoveCodePage';
import { EmergencyManualPage } from './components/EmergencyManualPage';
import { SettingsPage } from './components/SettingsPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalToast } from './components/GlobalToast';
import type { PageName } from './components/GlassUI';
import { useSettingsStore, useUserStore } from '@/stores';
import { questionnaireRepository } from '@/lib/db';

const PAGE_PATHS: Record<PageName, string> = {
  dashboard: '/dashboard',
  profile: '/profile',
  'male-questionnaire': '/male-questionnaire',
  'female-questionnaire': '/female-questionnaire',
  'relationship-portrait': '/relationship-portrait',
  'chat-import': '/chat-import',
  'chat-preview': '/chat-preview',
  'ai-analysis': '/ai-analysis',
  'reply-assist': '/reply-assist',
  simulation: '/simulation',
  'love-code': '/love-code',
  'emergency-manual': '/emergency-manual',
  settings: '/settings',
};

const PATH_PAGES = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page])
) as Record<string, PageName>;

function pageFromPath(pathname: string): PageName {
  return PATH_PAGES[pathname] || 'dashboard';
}

// Background ambient orbs
function BackgroundOrbs() {
  return (
    <>
      {/* Soft Rose — top left */}
      <div className="bg-orb" style={{ width: 680, height: 680, top: -200, left: -160, background: 'radial-gradient(circle, rgba(200,96,122,0.2) 0%, rgba(232,160,184,0.08) 55%, transparent 72%)', animation: 'orbPulse 13s ease-in-out infinite' }} />
      {/* Lavender Mist — top right */}
      <div className="bg-orb" style={{ width: 560, height: 560, top: -100, right: -120, background: 'radial-gradient(circle, rgba(176,160,204,0.22) 0%, rgba(200,180,230,0.08) 55%, transparent 72%)', animation: 'orbPulse 16s ease-in-out 3s infinite' }} />
      {/* Champagne Gold — center right */}
      <div className="bg-orb" style={{ width: 420, height: 420, top: '35%', right: '3%', background: 'radial-gradient(circle, rgba(196,160,112,0.18) 0%, transparent 65%)', animation: 'orbPulse 11s ease-in-out 2s infinite' }} />
      {/* Peach Glow — bottom center */}
      <div className="bg-orb" style={{ width: 720, height: 720, bottom: -260, left: '22%', background: 'radial-gradient(circle, rgba(232,168,136,0.18) 0%, rgba(240,200,180,0.07) 55%, transparent 72%)', animation: 'orbPulse 19s ease-in-out 6s infinite' }} />
      {/* Soft Mint — bottom left accent */}
      <div className="bg-orb" style={{ width: 300, height: 300, bottom: '8%', left: '4%', background: 'radial-gradient(circle, rgba(128,192,168,0.14) 0%, transparent 65%)', animation: 'floatSlow 22s ease-in-out 8s infinite' }} />
      {/* Pearl White — center */}
      <div className="bg-orb" style={{ width: 500, height: 500, top: '48%', left: '38%', background: 'radial-gradient(circle, rgba(248,244,240,0.6) 0%, transparent 62%)', filter: 'blur(60px)', animation: 'floatSlow 18s ease-in-out 4s infinite' }} />
      {/* Blush accent — center top */}
      <div className="bg-orb" style={{ width: 260, height: 260, top: '22%', left: '45%', background: 'radial-gradient(circle, rgba(240,192,208,0.15) 0%, transparent 68%)', animation: 'orbPulse 9s ease-in-out 1s infinite' }} />
    </>
  );
}

export default function App() {
  const routerNavigate = useNavigate();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true); // ✅ Onboarding 守卫：检查状态

  const currentPage = pageFromPath(location.pathname);
  const navigate = (page: PageName) => routerNavigate(PAGE_PATHS[page]);

  // ✅ Onboarding 守卫：挂载时检查引导状态和数据完整性
  useEffect(() => {
    async function checkOnboarding() {
      // ── 🧪 启动诊断：收集所有关键状态 ──
      let _hasSettingsStorage = false;
      try { _hasSettingsStorage = !!localStorage.getItem('lumi-settings'); } catch {}
      let _maleQ: any = undefined;
      let _femaleQ: any = undefined;

      /** 在每个分支出口处统一打印诊断日志 */
      const logDiag = (resolvedMode: string, nextPage: string) => {
        const s = useSettingsStore.getState();
        const u = useUserStore.getState();
        console.log('🧪 [StartupDiagnosis]', {
          onboardingCompleted: s.onboardingCompleted,
          hasSettingsStorage: _hasSettingsStorage,
          hasUser: !!u.currentUser,
          hasGirl: !!u.currentGirl,
          hasMaleQuestionnaire: _maleQ !== undefined ? !!_maleQ : '(not checked)',
          hasFemaleQuestionnaire: _femaleQ !== undefined ? !!_femaleQ : '(not checked)',
          resolvedMode,
          nextPage,
          currentPage: currentPage,            // 初始默认值 'dashboard'
        });
      };

      console.log('🧭 [OnboardingGuard] 开始检查新手引导状态');

      const settings = useSettingsStore.getState();
      console.log('📥 [OnboardingGuard] onboardingCompleted:', settings.onboardingCompleted);

      // 加载用户数据
      await useUserStore.getState().loadCurrentUser();

      const user = useUserStore.getState().currentUser;
      const girl = useUserStore.getState().currentGirl;

      console.log('📥 [OnboardingGuard] user:', user ? { id: user.id, nickname: user.nickname } : null);
      console.log('📥 [OnboardingGuard] girl:', girl ? { id: girl.id, nickname: girl.nickname, userId: girl.userId } : null);

      // ✅ 关键修复：LocalStorage 说完成，但 IndexedDB 没 user，说明状态不一致
      if (settings.onboardingCompleted && !user) {
        console.warn('⚠️ [OnboardingGuard] onboardingCompleted=true 但 user 不存在，重置引导状态');
        logDiag('onboarding+reset', 'onboarding (user missing, will reset)');
        settings.setOnboardingCompleted(false);
        console.log('🔀 [OnboardingGuard] 未找到 user，跳转欢迎页');
        setShowOnboarding(true); // ✅ 显示欢迎页
        return;
      }

      // 已完成引导且 user 存在，允许进入首页或当前页面
      if (settings.onboardingCompleted && user) {
        console.log('✅ [OnboardingGuard] 已完成引导，放行');
        logDiag('edit', 'dashboard (pass through)');
        setShowOnboarding(false);
        return;
      }

      // onboardingCompleted=false：按缺失步骤跳转
      if (!user) {
        console.log('🔀 [OnboardingGuard] 未找到 user，跳转欢迎页');
        logDiag('onboarding', 'onboarding (no user)');
        setShowOnboarding(true); // ✅ 显示欢迎页
        return;
      }

      if (!girl) {
        console.log('🔀 [OnboardingGuard] 未找到 girl，跳转 profile');
        logDiag('onboarding', 'profile (no girl)');
        navigate('profile');
        setShowOnboarding(false);
        return;
      }

      _maleQ = await questionnaireRepository.getLatestMale(user.id);
      console.log('📥 [OnboardingGuard] maleQ:', _maleQ ? _maleQ.id : null);

      if (!_maleQ) {
        console.log('🔀 [OnboardingGuard] 未完成男生问卷，跳转 male-questionnaire');
        logDiag('onboarding', 'male-questionnaire (no maleQ)');
        navigate('male-questionnaire');
        setShowOnboarding(false);
        return;
      }

      _femaleQ = await questionnaireRepository.getLatestFemale(user.id);
      console.log('📥 [OnboardingGuard] femaleQ:', _femaleQ ? { id: _femaleQ.id, girlId: _femaleQ.girlId } : null);

      if (!_femaleQ || !_femaleQ.girlId) {
        console.log('🔀 [OnboardingGuard] 未完成女生问卷或 girlId 缺失，跳转 female-questionnaire');
        logDiag('onboarding', 'female-questionnaire (no femaleQ or girlId)');
        navigate('female-questionnaire');
        setShowOnboarding(false);
        return;
      }

      // ✅ 完整旧用户兼容：所有数据都存在，说明是老用户
      // 无论 onboardingCompleted 是否为 true（localStorage 可能丢失），直接修复并放行
      if (!useSettingsStore.getState().onboardingCompleted) {
        useSettingsStore.getState().setOnboardingCompleted(true);
        console.log('🛠️ [OnboardingGuard] 检测到完整旧用户数据，已自动修复 onboardingCompleted=true');
      } else {
        console.log('✅ [OnboardingGuard] 完整旧用户，onboardingCompleted 已为 true');
      }
      logDiag('edit', 'dashboard (complete old user)');
      setShowOnboarding(false);
      // currentPage 默认就是 'dashboard'，无需额外设置
    }

    checkOnboarding().finally(() => setIsCheckingOnboarding(false));
  }, []);

  const bgStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #FDF8F4 0%, #F8EEF4 18%, #EEE8F4 36%, #F4EEE4 54%, #EEF4F0 72%, #F8F4F8 88%, #FDF4EE 100%)',
    position: 'relative',
    overflow: 'hidden',
  };

  // ✅ Onboarding 守卫：检查期间显示 loading
  if (isCheckingOnboarding) {
    return (
      <div style={bgStyle}>
        <BackgroundOrbs />
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
            <p style={{ margin: 0, fontSize: 16, color: 'var(--text-rose)', fontWeight: 500 }}>正在检查引导状态...</p>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding - full page, no sidebar
  if (showOnboarding) {
    return (
      <div style={bgStyle}>
        <BackgroundOrbs />
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
          <OnboardingPage onComplete={() => {
            console.log('🔀 [App] 欢迎页完成，跳转 profile');
            setShowOnboarding(false);
            navigate('profile');
          }} />
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case 'profile':
        return <ProfileSetupPage onNavigate={navigate} />;
      case 'male-questionnaire':
        return <MaleQuestionnairePage onNavigate={navigate} />;
      case 'female-questionnaire':
        return <FemaleQuestionnairePage onNavigate={navigate} />;
      case 'relationship-portrait':
        return <RelationshipPortraitPage onNavigate={navigate} />;
      case 'chat-import':
        return <ChatImportPage onNavigate={navigate} />;
      case 'chat-preview':
        return <ChatPreviewPage onNavigate={navigate} />;
      case 'ai-analysis':
        return <AIAnalysisPage onNavigate={navigate} />;
      case 'reply-assist':
        return <ReplyAssistPage onNavigate={navigate} />;
      case 'simulation':
        return <SimulationPage onNavigate={navigate} />;
      case 'love-code':
        return <LoveCodePage />;
      case 'emergency-manual':
        return <EmergencyManualPage />;
      case 'settings':
        return <SettingsPage onNavigate={navigate} />;
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <div style={{ ...bgStyle, minHeight: '100vh' }}>
      <BackgroundOrbs />

      {/* Main layout */}
      <div
        className="app-shell"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar (desktop) */}
        <Sidebar currentPage={currentPage} onNavigate={navigate} />

        {/* Main content — simulation page gets overflow:hidden so it can fill 100% height */}
        <main
          className={currentPage === 'reply-assist' ? 'hide-scrollbar' : undefined}
          style={{
            flex: 1,
            overflowY: currentPage === 'simulation' ? 'hidden' : 'auto',
            overflowX: 'hidden',
            paddingBottom: currentPage === 'simulation' ? 0 : 80,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
          key={currentPage}
        >
          <ErrorBoundary onResetToHome={() => navigate('dashboard')}>
            {renderPage()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar currentPage={currentPage} onNavigate={navigate} />
      <GlobalToast />
    </div>
  );
}
