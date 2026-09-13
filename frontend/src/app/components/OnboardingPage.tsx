import { useState, useEffect, lazy, Suspense } from 'react';
import { ArrowRight } from 'lucide-react';

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
          {/* Hero title — gradient clipped text must live directly in <h1>;
              wrapping it in BlurText's inline-block spans made the glyphs
              transparent (background-clip:text can't reach child boxes). */}
          <div className="onboarding-title-wrap" style={anim(180)}>
            <h1 className="onboarding-title" style={{
              margin: 0,
              fontSize: 'clamp(44px, 5.5vw, 68px)',
              fontWeight: 800,
              letterSpacing: '-0.055em',
              lineHeight: 1.06,
              background: 'linear-gradient(145deg, #321923 0%, #77334f 52%, #5c3155 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              <span style={{ display: 'block' }}>让沟通更真诚，</span>
              <span style={{ display: 'block' }}>让靠近更有分寸</span>
            </h1>
          </div>

          {/* One clear primary action. Safety context is introduced inside the guided flow. */}
          <div className="onboarding-actions" style={{ ...anim(420), display: 'flex' }}>
            <button
              className="btn-primary"
              onClick={() => {
                console.log('✅ [OnboardingPage] 用户点击开始，跳转 profile');
                onComplete();
              }}
              style={{
                borderRadius: 999, padding: '16px 32px', fontSize: 15,
                display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600,
                letterSpacing: '-0.01em', minHeight: 54,
              }}
            >
              开始建立关系档案 <ArrowRight size={16} />
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
