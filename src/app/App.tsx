import React, { useState } from 'react';
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

  const navigate = (page: PageName) => setCurrentPage(page);

  const bgStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #FDF8F4 0%, #F8EEF4 18%, #EEE8F4 36%, #F4EEE4 54%, #EEF4F0 72%, #F8F4F8 88%, #FDF4EE 100%)',
    position: 'relative',
    overflow: 'hidden',
  };

  // Onboarding - full page, no sidebar
  if (showOnboarding) {
    return (
      <div style={bgStyle}>
        <BackgroundOrbs />
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
          <OnboardingPage onComplete={() => setShowOnboarding(false)} />
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
        return <SettingsPage />;
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
