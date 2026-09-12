import { useState, useEffect, lazy, Suspense } from 'react';
import { ArrowRight, Lock, Sparkles, Heart } from 'lucide-react';
import { BRAND_NAME, BRAND_SUBTITLE } from '../brand';

// three.js (~600 KB) only ships for the landing route.
const HeroScene = lazy(() => import('./HeroScene').then((m) => ({ default: m.HeroScene })));

interface OnboardingPageProps {
  onComplete: () => void;
}

/* ─── Main Onboarding Page ───────────────────────────────────────────────── */
function useDesktopStage(): boolean {
  const query = '(min-width: 769px)';
  const [desktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [agreed, setAgreed] = useState(false);
  const [visible, setVisible] = useState(false);
  // Only mount the WebGL stage (and download three.js) on layouts that show it.
  const showStage = useDesktopStage();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const anim = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.8s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms, transform 0.8s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
  });

  return (
    <div className="onboarding-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', position: 'relative' }}>
      {/* Decorative 3D rings */}
      <div className="onboarding-ring onboarding-ring-top" style={{ position: 'absolute', top: '10%', right: '5%', width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(212,96,122,0.12)', animation: 'floatSlow 8s ease-in-out infinite', pointerEvents: 'none' }} />
      <div className="onboarding-ring onboarding-ring-bottom" style={{ position: 'absolute', bottom: '15%', left: '8%', width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(200,168,212,0.15)', animation: 'floatSlow 10s ease-in-out 2s infinite', pointerEvents: 'none' }} />

      <div className="onboarding-layout" style={{ maxWidth: 1120, width: '100%', display: 'flex', alignItems: 'center', gap: 80 }}>
        {/* Left: Content */}
        <div className="onboarding-copy" style={{ flex: 1, minWidth: 0 }}>
          {/* Brand */}
          <div className="onboarding-brand" style={{ ...anim(100), marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'linear-gradient(135deg, #D4607A, #BF8E6E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(212,96,122,0.38), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}>
              <Heart size={24} color="white" fill="white" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--deep-plum)', letterSpacing: '-0.04em', lineHeight: 1 }}>{BRAND_NAME}</div>
              <div style={{ fontSize: 9, color: 'var(--champagne-gold)', letterSpacing: '0.1em', fontWeight: 600, marginTop: 2, textTransform: 'uppercase' }}>{BRAND_SUBTITLE}</div>
            </div>
          </div>

          {/* Hero title — gradient clipped text must live directly in <h1>;
              wrapping it in BlurText's inline-block spans made the glyphs
              transparent (background-clip:text can't reach child boxes). */}
          <div style={anim(260)}>
            <h1 className="onboarding-title" style={{
              margin: 0, marginBottom: 20,
              fontSize: 'clamp(34px, 5vw, 54px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              background: 'linear-gradient(145deg, #3A1F2A 0%, #8A3858 45%, #704060 75%, #904870 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              <span style={{ display: 'block' }}>让沟通更真诚，</span>
              <span style={{ display: 'block' }}>让靠近更有分寸</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div style={anim(400)}>
            <p className="onboarding-subtitle" style={{ margin: 0, marginBottom: 28, fontSize: 17, color: '#5E4A60', lineHeight: 1.7, opacity: 0.85 }}>
              从追求、暧昧到恋爱，帮你理解表达、尊重边界、减少误解。
            </p>
          </div>

          {/* Brand tagline */}
          <div className="onboarding-tagline" style={{ ...anim(480), marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 999,
              background: 'rgba(255,248,252,0.55)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(212,96,122,0.2)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
            }}>
              <Sparkles size={14} color="#BF8E6E" />
              <span style={{ fontSize: 13, color: '#5E4A60', fontStyle: 'italic' }}>先理解，再表达；先尊重，再靠近。</span>
            </div>
          </div>

          {/* Feature tags */}
          <div className="onboarding-features" style={{ ...anim(560), display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
            {['理解表达', '尊重边界', 'AI 分析', '模拟对话', '回复建议'].map((tag) => (
              <span key={tag} style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, background: 'rgba(242,189,204,0.3)', border: '1px solid rgba(212,96,122,0.2)', color: '#5E4A60' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Privacy notice */}
          <div className="onboarding-privacy" style={{ ...anim(620), marginBottom: 28 }}>
            <div className="privacy-notice" style={{ borderRadius: 18, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Lock size={13} color="#BF8E6E" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 12, color: '#5E4A60', lineHeight: 1.65 }}>
                聊天记录优先保存在本地，AI 分析仅供参考，不代表对方真实想法。分析结果请结合实际互动判断。
              </p>
            </div>
          </div>

          {/* Agreement */}
          <div className="onboarding-agreement" style={{ ...anim(680), marginBottom: 32, display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>
            <div style={{
              width: 20, height: 20, borderRadius: 7, flexShrink: 0, marginTop: 1,
              border: `1.5px solid ${agreed ? '#D4607A' : 'rgba(200,150,180,0.35)'}`,
              background: agreed ? 'linear-gradient(135deg,#D4607A,#BF8E6E)' : 'rgba(255,248,252,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: agreed ? '0 3px 10px rgba(212,96,122,0.3)' : undefined,
            }}>
              {agreed && <span style={{ color: 'white', fontSize: 11, lineHeight: 1 }}>✓</span>}
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#5E4A60', lineHeight: 1.65, userSelect: 'none' }}>
              我理解 AI 分析仅供参考，我会尊重对方的真实意愿和边界，不将此工具用于操控或施压他人。
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="onboarding-actions" style={{ ...anim(740), display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => {
                console.log('✅ [OnboardingPage] 用户点击开始，跳转 profile');
                onComplete();
              }}
              disabled={!agreed}
              style={{
                borderRadius: 999, padding: '15px 36px', fontSize: 15,
                display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600,
                letterSpacing: '-0.01em', minHeight: 52,
                opacity: agreed ? 1 : 0.4, cursor: agreed ? 'pointer' : 'default',
              }}
            >
              开始建立关系档案 <ArrowRight size={16} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                console.log('✅ [OnboardingPage] 用户点击示例，跳转 profile');
                onComplete();
              }}
              style={{
                borderRadius: 999, padding: '15px 28px', fontSize: 15,
                display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500,
                letterSpacing: '-0.01em', minHeight: 52,
              }}
            >
              查看 AI 分析示例
            </button>
          </div>
        </div>

        {/* Right: Blender-authored 3D hero (three.js) with the glass UI mock floating beneath */}
        {showStage && (
          <div className="onboarding-preview" style={{ ...anim(300), flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="onboarding-hero3d" style={{ position: 'relative' }}>
              <Suspense fallback={<div style={{ width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle at 50% 46%, rgba(248,224,232,0.85) 0%, rgba(236,206,222,0.4) 38%, transparent 70%)' }} />}>
                <HeroScene size={520} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
