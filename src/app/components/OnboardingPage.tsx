import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Lock, Sparkles, Heart } from 'lucide-react';
import { BRAND_NAME, BRAND_SUBTITLE, BRAND_SUBTITLE_SHORT } from '../brand';

interface OnboardingPageProps {
  onComplete: () => void;
}

/* ─── Floating VisionOS-style App Mockup ─────────────────────────────────── */
function AppMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -9;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 9;
    setTilt({ x: rx, y: ry });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: 340,
        flexShrink: 0,
        perspective: '1000px',
        cursor: 'default',
      }}
    >
      <div
        style={{
          animation: 'float 5s ease-in-out infinite',
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Main panel */}
        <div
          style={{
            width: 340,
            background: 'linear-gradient(145deg, rgba(255,252,255,0.75) 0%, rgba(255,245,250,0.6) 100%)',
            backdropFilter: 'blur(40px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
            border: '1px solid rgba(255,255,255,0.65)',
            borderRadius: 32,
            padding: '20px 20px 24px',
            boxShadow: '0 32px 80px rgba(180,120,150,0.28), 0 8px 24px rgba(180,120,150,0.14), inset 0 1px 0 rgba(255,255,255,0.9)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top edge highlight */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)' }} />
          {/* Reflection */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '55%', height: '100%', background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)', borderRadius: 'inherit', pointerEvents: 'none' }} />

          {/* Status bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg,#D4607A,#BF8E6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(212,96,122,0.35)' }}>
                <Heart size={14} color="white" fill="white" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#4A2E38', letterSpacing: '-0.02em' }}>{BRAND_NAME}</div>
                <div style={{ fontSize: 9, color: 'var(--champagne-gold)', letterSpacing: '0.06em' }}>{BRAND_SUBTITLE_SHORT}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['#FFB3C1', '#FFD4A8', '#B8E0D2'].map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 999, background: c }} />)}
            </div>
          </div>

          {/* Chat bubbles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {/* Her message */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, background: 'linear-gradient(135deg,#F2BDCC,#C8A8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🌸</div>
              <div className="chat-bubble-hers" style={{ padding: '9px 13px', fontSize: 12, lineHeight: 1.5, maxWidth: 200 }}>
                那天没看到消息，忘了回了 😅
              </div>
            </div>
            {/* My message */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="chat-bubble-mine" style={{ padding: '9px 13px', fontSize: 12, lineHeight: 1.5 }}>
                没事的，你今天怎么样？
              </div>
            </div>
            {/* Her message */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, background: 'linear-gradient(135deg,#F2BDCC,#C8A8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🌸</div>
              <div className="chat-bubble-hers" style={{ padding: '9px 13px', fontSize: 12, lineHeight: 1.5 }}>
                还行～今天有点累 🥱
              </div>
            </div>
          </div>

          {/* AI Analysis card */}
          <div style={{ borderRadius: 18, padding: '12px 14px', marginBottom: 10, background: 'linear-gradient(135deg, rgba(212,96,122,0.08), rgba(200,168,212,0.1))', border: '1px solid rgba(212,96,122,0.18)' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <Sparkles size={12} color="#D4607A" />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#D4607A', letterSpacing: '0.04em', textTransform: 'uppercase' }}>AI 分析</span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: '#4A2E38', lineHeight: 1.5 }}>她在修复关系，不是冷淡。"今天有点累"是在分享状态，回复可以表达关心。</p>
          </div>

          {/* Reply suggestions */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#7B5C6E', opacity: 0.6, marginBottom: 7, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>推荐回复</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { style: '自然真诚', text: '辛苦了，早点休息～有什么想聊的吗？' },
                { style: '轻松幽默', text: '怎么了，被什么榨干了哈哈' },
              ].map((r, i) => (
                <div key={i} style={{ background: 'rgba(255,252,255,0.6)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 12, padding: '8px 11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 9, color: '#D4607A', fontWeight: 600 }}>{r.style}</span>
                    <div style={{ fontSize: 11, color: '#4A2E38', marginTop: 2, lineHeight: 1.4 }}>{r.text}</div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: 'linear-gradient(135deg,#D4607A,#BF8E6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ArrowRight size={10} color="white" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boundary notice */}
          <div style={{ background: 'rgba(200,168,212,0.12)', border: '1px solid rgba(200,168,212,0.28)', borderRadius: 12, padding: '8px 11px', display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 11, flexShrink: 0 }}>💜</span>
            <span style={{ fontSize: 10, color: '#5E4A60', lineHeight: 1.5 }}>先理解，再表达；先尊重，再靠近。</span>
          </div>
        </div>

        {/* Floating decorative cards behind main panel */}
        <div style={{
          position: 'absolute',
          bottom: -20,
          right: -20,
          width: 220,
          height: 80,
          background: 'rgba(242,189,204,0.3)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.45)',
          boxShadow: '0 8px 24px rgba(212,96,122,0.12)',
          transform: 'translateZ(-20px)',
          animation: 'float 6s ease-in-out 1s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: -16,
          left: -16,
          width: 100,
          height: 100,
          background: 'rgba(200,168,212,0.22)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 50,
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 8px 24px rgba(200,168,212,0.15)',
          transform: 'translateZ(-30px)',
          animation: 'float 7s ease-in-out 0.5s infinite',
        }} />
      </div>
    </div>
  );
}

/* ─── Main Onboarding Page ───────────────────────────────────────────────── */
export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [agreed, setAgreed] = useState(false);
  const [visible, setVisible] = useState(false);

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', position: 'relative' }}>
      {/* Decorative 3D rings */}
      <div style={{ position: 'absolute', top: '10%', right: '5%', width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(212,96,122,0.12)', animation: 'floatSlow 8s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '8%', width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(200,168,212,0.15)', animation: 'floatSlow 10s ease-in-out 2s infinite', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1120, width: '100%', display: 'flex', alignItems: 'center', gap: 80 }}>
        {/* Left: Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Brand */}
          <div style={{ ...anim(100), marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <h1 style={{
              margin: 0, marginBottom: 20,
              fontSize: 'clamp(34px, 5vw, 54px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              background: 'linear-gradient(145deg, #3A1F2A 0%, #8A3858 45%, #704060 75%, #904870 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              让沟通更真诚，让靠近更有分寸
            </h1>
          </div>

          {/* Subtitle */}
          <div style={anim(400)}>
            <p style={{ margin: 0, marginBottom: 28, fontSize: 17, color: '#5E4A60', lineHeight: 1.7, opacity: 0.85 }}>
              从追求、暧昧到恋爱，帮你理解表达、尊重边界、减少误解。
            </p>
          </div>

          {/* Brand tagline */}
          <div style={{ ...anim(480), marginBottom: 36 }}>
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
          <div style={{ ...anim(560), display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
            {['理解表达', '尊重边界', 'AI 分析', '模拟对话', '回复建议'].map((tag) => (
              <span key={tag} style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, background: 'rgba(242,189,204,0.3)', border: '1px solid rgba(212,96,122,0.2)', color: '#5E4A60' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Privacy notice */}
          <div style={{ ...anim(620), marginBottom: 28 }}>
            <div className="privacy-notice" style={{ borderRadius: 18, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Lock size={13} color="#BF8E6E" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 12, color: '#5E4A60', lineHeight: 1.65 }}>
                聊天记录优先保存在本地，AI 分析仅供参考，不代表对方真实想法。分析结果请结合实际互动判断。
              </p>
            </div>
          </div>

          {/* Agreement */}
          <div style={{ ...anim(680), marginBottom: 32, display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>
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
          <div style={{ ...anim(740), display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={onComplete}
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
              onClick={onComplete}
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

        {/* Right: 3D Mockup */}
        <div style={{ ...anim(300), flexShrink: 0, position: 'relative' }}>
          <AppMockup />
        </div>
      </div>
    </div>
  );
}
