import React from 'react';
import { Home, Heart, MessageCircle, Upload, BarChart2, BookOpen, Settings, Sparkles, MessageSquare, User, ShieldAlert, CalendarDays } from 'lucide-react';
import type { PageName } from './GlassUI';
import { BRAND_NAME, BRAND_SUBTITLE_SHORT } from '../brand';

const navItems: { id: PageName; icon: React.ReactNode; label: string }[] = [
  { id: 'dashboard', icon: <Home size={18} />, label: '首页' },
  { id: 'relationship-portrait', icon: <Heart size={18} />, label: '关系画像' },
  { id: 'chat-import', icon: <Upload size={18} />, label: '聊天导入' },
  { id: 'ai-analysis', icon: <BarChart2 size={18} />, label: 'AI 分析' },
  { id: 'reply-assist', icon: <MessageSquare size={18} />, label: '帮我回复' },
  { id: 'simulation', icon: <MessageCircle size={18} />, label: '模拟对话' },
  { id: 'love-code', icon: <BookOpen size={18} />, label: '恋爱法典' },
  { id: 'emergency-manual', icon: <ShieldAlert size={18} />, label: '应急手册' },
  { id: 'important-dates', icon: <CalendarDays size={18} />, label: '重要日子' },
  { id: 'settings', icon: <Settings size={18} />, label: '设置' },
];

interface SidebarProps {
  currentPage: PageName;
  onNavigate: (page: PageName) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="sidebar-desktop glass-sidebar"
      style={{
        width: 240,
        minWidth: 240,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 0 24px 0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'linear-gradient(135deg, #E8748A, #C5956C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(232,116,138,0.35)',
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--deep-plum)', letterSpacing: '-0.03em' }}>{BRAND_NAME}</div>
            <div style={{ fontSize: 9, color: 'var(--champagne-gold)', letterSpacing: '0.1em', fontWeight: 600, marginTop: 1, textTransform: 'uppercase' }}>{BRAND_SUBTITLE_SHORT}</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={isActive ? 'nav-item-active' : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 14,
                border: 'none',
                background: isActive ? undefined : 'transparent',
                cursor: 'pointer',
                color: isActive ? 'var(--pink-primary)' : 'var(--text-purple)',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.65 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User profile area */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 14,
            background: 'rgba(255,245,248,0.5)',
            border: '1px solid rgba(255,255,255,0.4)',
            cursor: 'pointer',
          }}
          onClick={() => onNavigate('profile')}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 999,
            background: 'linear-gradient(135deg, #F9C8D5, #D4A5C9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={16} color="var(--pink-primary)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-rose)', lineHeight: 1.2 }}>我的档案</div>
            <div style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.7, marginTop: 2 }}>暧昧观察期</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Mobile Bottom Tab Bar ────────────────────────────────────────────────────────
const mobileNav: { id: PageName; icon: React.ReactNode; label: string }[] = [
  { id: 'dashboard', icon: <Home size={20} />, label: '首页' },
  { id: 'reply-assist', icon: <MessageSquare size={20} />, label: '帮我回复' },
  { id: 'simulation', icon: <MessageCircle size={20} />, label: '模拟' },
  { id: 'love-code', icon: <BookOpen size={20} />, label: '法典' },
  { id: 'settings', icon: <Settings size={20} />, label: '设置' },
];

export function BottomTabBar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <div
      className="bottom-tabbar glass-card"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '8px 0 env(safe-area-inset-bottom)',
        borderRadius: '20px 20px 0 0',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {mobileNav.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: isActive ? 'var(--pink-primary)' : 'var(--text-purple)',
                opacity: isActive ? 1 : 0.55,
                minWidth: 44,
                minHeight: 44,
              }}
            >
              {item.icon}
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
