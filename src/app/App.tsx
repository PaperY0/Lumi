import React, { useState, useEffect } from 'react';
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
import { SettingsPage } from './components/SettingsPage';
import type { PageName } from './components/GlassUI';
import { useSettingsStore, useUserStore } from '@/stores';
import { questionnaireRepository } from '@/lib/db';

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
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageName>('dashboard');
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true); // ✅ Onboarding 守卫：检查状态

  const navigate = (page: PageName) => setCurrentPage(page);

  // ✅ Onboarding 守卫：挂载时检查引导状态和数据完整性
  useEffect(() => {
    async function checkOnboarding() {
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
        settings.setOnboardingCompleted(false);
        console.log('🔀 [OnboardingGuard] 未找到 user，跳转欢迎页');
        setShowOnboarding(true); // ✅ 显示欢迎页
        return;
      }

      // 已完成引导且 user 存在，允许进入首页或当前页面
      if (settings.onboardingCompleted && user) {
        console.log('✅ [OnboardingGuard] 已完成引导，放行');
        setShowOnboarding(false);
        return;
      }

      // onboardingCompleted=false：按缺失步骤跳转
      if (!user) {
        console.log('🔀 [OnboardingGuard] 未找到 user，跳转欢迎页');
        setShowOnboarding(true); // ✅ 显示欢迎页
        return;
      }

      if (!girl) {
        console.log('🔀 [OnboardingGuard] 未找到 girl，跳转 profile');
        setCurrentPage('profile');
        setShowOnboarding(false);
        return;
      }

      const maleQ = await questionnaireRepository.getLatestMale(user.id);
      console.log('📥 [OnboardingGuard] maleQ:', maleQ ? maleQ.id : null);

      if (!maleQ) {
        console.log('🔀 [OnboardingGuard] 未完成男生问卷，跳转 male-questionnaire');
        setCurrentPage('male-questionnaire');
        setShowOnboarding(false);
        return;
      }

      const femaleQ = await questionnaireRepository.getLatestFemale(user.id);
      console.log('📥 [OnboardingGuard] femaleQ:', femaleQ ? { id: femaleQ.id, girlId: femaleQ.girlId } : null);

      if (!femaleQ || !femaleQ.girlId) {
        console.log('🔀 [OnboardingGuard] 未完成女生问卷或 girlId 缺失，跳转 female-questionnaire');
        setCurrentPage('female-questionnaire');
        setShowOnboarding(false);
        return;
      }

      console.log('🔀 [OnboardingGuard] 资料和问卷都存在，但引导未完成，跳转 relationship-portrait');
      setCurrentPage('relationship-portrait');
      setShowOnboarding(false);
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
            setCurrentPage('profile');
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
          {renderPage()}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar currentPage={currentPage} onNavigate={navigate} />
    </div>
  );
}
