import { useState, useEffect } from 'react';
import { Shield, Trash2, Brain, Lock, Heart, AlertCircle, Smartphone, Search, Trash, Ban } from 'lucide-react';
import { GlassCard, LiquidButton, WarningNotice } from './GlassUI';
import { IconBadge, type IconToken } from './IconBadge';
import { BlurText } from './BlurText';
import { BRAND_NAME, BRAND_SUBTITLE, BRAND_VERSION } from '../brand';
import type { PageName } from './GlassUI';
// ✅ 导入数据库和 stores
import { db } from '@/lib/db';
import { useUserStore, useChatImportStore, useUiStore, useSettingsStore } from '@/stores';

interface Props {
  onNavigate: (page: PageName) => void;
}

export function SettingsPage({ onNavigate }: Props) {
  console.log('📄 [SettingsPage] 页面加载');

  const [mockMode, setMockMode] = useState(true);
  const [confirmBeforeAnalysis, setConfirmBeforeAnalysis] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<string[]>([]);

  // ✅ 二次确认对话框状态
  const [confirmClearAllOpen, setConfirmClearAllOpen] = useState(false);

  // ✅ 清空所有本地数据
  const handleClearAll = async () => {
    console.log('[SettingsPage] 开始清空所有本地数据');

    try {
      // 1. 清空 IndexedDB
      await db.clearAllData();
      console.log('[SettingsPage] IndexedDB 已清空');

      // 2. 重置所有 Zustand stores
      useUserStore.getState().reset();
      useChatImportStore.getState().reset();
      useUiStore.getState().reset();
      useSettingsStore.getState().reset();
      console.log('[SettingsPage] Zustand stores 已重置');

      // 3. 清空 localStorage（兜底）
      localStorage.clear();
      console.log('[SettingsPage] localStorage 已清空');

      // 4. 显示成功提示
      useUiStore.getState().showToast('数据已清空', 'success');

      // 5. 关闭确认框
      setConfirmClearAllOpen(false);

      // 6. 跳转到资料建档页，让用户重新开始
      console.log('[SettingsPage] 跳转到资料建档页');
      onNavigate('profile');
    } catch (e) {
      console.error('[SettingsPage] 清空失败:', e);
      useUiStore.getState().showToast('清空失败，请重试', 'error');
    }
  };

  const handleDelete = (type: string) => {
    setDeleted(prev => [...prev, type]);
    setShowDeleteConfirm(null);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 28, borderRadius: 999, cursor: 'pointer',
        background: value ? 'linear-gradient(135deg,#E8748A,#C5956C)' : 'rgba(200,180,190,0.3)',
        position: 'relative', transition: 'background 0.25s ease',
        border: '1px solid rgba(255,255,255,0.4)',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 22 : 3,
        width: 20, height: 20, borderRadius: 999,
        background: 'white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        transition: 'left 0.25s ease',
      }} />
    </div>
  );

  const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg,rgba(232,116,138,0.15),rgba(212,165,201,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>{title}</span>
      </div>
      <GlassCard padding="0">{children}</GlassCard>
    </div>
  );

  const SettingRow = ({ label, desc, right }: { label: string; desc?: string; right: React.ReactNode }) => (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
      <div>
        <div style={{ fontSize: 14, color: 'var(--text-rose)', fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginTop: 2, lineHeight: 1.5 }}>{desc}</div>}
      </div>
      {right}
    </div>
  );

  const dataItems = [
    { id: 'chat', label: '清空聊天记录', desc: '删除所有已导入的聊天内容' },
    { id: 'report', label: '清空分析报告', desc: '删除所有 AI 生成的分析结果' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }} className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, letterSpacing: '-0.03em' }}><BlurText text="设置与隐私" startDelay={60} className="gradient-text" style={{ fontWeight: 700, display: 'inline' }} /></h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          你的数据，你来掌控。
        </p>
      </div>

      {/* Local Data Management */}
      <Section icon={<Trash2 size={14} color="#C5956C" />} title="本地数据管理">
        {dataItems.map((item, i) => (
          <div key={item.id}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, color: deleted.includes(item.id) ? '#999' : 'var(--text-rose)', fontWeight: 500, display: 'flex', gap: 6, alignItems: 'center' }}>
                  {item.label}
                  {deleted.includes(item.id) && <span style={{ fontSize: 11, color: '#4CAF82' }}>已清空</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginTop: 2 }}>{item.desc}</div>
              </div>
              {showDeleteConfirm === item.id ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowDeleteConfirm(null)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer', background: 'rgba(255,245,248,0.7)', border: '1px solid rgba(200,150,180,0.25)', color: 'var(--text-purple)' }}>
                    取消
                  </button>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer', background: '#C96A6A', border: 'none', color: 'white', fontWeight: 500 }}>
                    确认清空
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(item.id)}
                  disabled={deleted.includes(item.id)}
                  style={{
                    padding: '7px 16px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
                    border: '1px solid rgba(200,120,120,0.3)',
                    background: 'rgba(255,235,235,0.4)',
                    color: deleted.includes(item.id) ? '#aaa' : '#C96A6A',
                    fontWeight: 500,
                  }}
                >
                  清空
                </button>
              )}
            </div>
          </div>
        ))}
      </Section>

      {/* ✅ 危险操作区域 */}
      <Section icon={<AlertCircle size={14} color="#C96A6A" />} title="危险操作">
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#C96A6A', marginBottom: 6 }}>清空所有本地数据</div>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.75, lineHeight: 1.6, marginBottom: 16 }}>
              这将永久删除你的资料、问卷结果、聊天记录、模拟对话等所有本地数据，且无法恢复。
            </div>
            <LiquidButton
              variant="secondary"
              onClick={() => setConfirmClearAllOpen(true)}
              style={{
                background: 'rgba(255,235,235,0.5)',
                border: '1px solid rgba(200,100,100,0.3)',
                color: '#C96A6A',
              }}
            >
              <Trash2 size={16} />
              清空所有本地数据
            </LiquidButton>
          </div>
        </div>
      </Section>

      {/* ✅ 二次确认对话框 */}
      {confirmClearAllOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setConfirmClearAllOpen(false)}
        >
          <div
            style={{
              maxWidth: 420,
              margin: '20px',
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <GlassCard>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#C96A6A', marginBottom: 8 }}>
                确认清空所有数据？
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-purple)', lineHeight: 1.7 }}>
                这将永久删除你的资料、问卷结果、聊天记录、模拟对话等<strong>所有本地数据</strong>，且无法恢复。
              </div>
            </div>
            <WarningNotice text="此操作不可撤销，请确保你已备份重要信息。" />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <LiquidButton
                variant="secondary"
                onClick={() => setConfirmClearAllOpen(false)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                取消
              </LiquidButton>
              <LiquidButton
                onClick={handleClearAll}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #C96A6A, #B05555)',
                }}
              >
                确认清空
              </LiquidButton>
            </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* AI Settings */}
      <Section icon={<Brain size={14} color="#D4A5C9" />} title="AI 设置">
        <SettingRow
          label="前端 Mock 偏好"
          desc="仅作为前端测试偏好，不代表服务端真实运行模式"
          right={<Toggle value={mockMode} onChange={(v) => { setMockMode(v); console.log('⚙️ [SettingsPage] 前端 Mock 偏好切换:', v); }} />}
        />
        <SettingRow
          label="AI 分析前确认"
          desc="每次发送数据给 AI 前弹出确认提示"
          right={<Toggle value={confirmBeforeAnalysis} onChange={setConfirmBeforeAnalysis} />}
        />
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.6, lineHeight: 1.7 }}>
            前端 Mock 开关：{mockMode ? '开启' : '关闭'}（仅前端偏好）<br />
            后端运行模式：以服务端启动日志为准。若后端显示"运行模式：AI"，则当前会调用真实 AI；若显示"Mock 模式"，则使用本地模拟数据。
          </div>
        </div>
      </Section>

      {/* Privacy Statement */}
      <Section icon={<Lock size={14} color="#E8748A" />} title="隐私说明">
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { Icon: Smartphone, title: '聊天记录优先保存在本地', desc: '除非你主动上传，否则聊天内容不会离开你的设备。' },
              { Icon: Search, title: 'AI 分析仅发送必要上下文', desc: '我们只发送分析必要的摘要信息，而不是完整聊天记录。' },
              { Icon: Trash, title: '用户可以随时删除数据', desc: '使用上方"本地数据管理"随时清空所有信息。' },
              { Icon: Ban, title: '不出售、不分享用户数据', desc: '你的个人信息和关系数据绝不会用于商业目的。' },
            ].map((item) => (
              <div key={item.title} style={{ display: 'flex', gap: 12, padding: '12px', background: 'rgba(255,245,248,0.5)', borderRadius: 14, alignItems: 'center' }}>
                <IconBadge icon={item.Icon} size={36} tone="gold" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.75, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Health Communication Principles */}
      <Section icon={<Heart size={14} color="#E8748A" />} title="健康沟通原则">
        <div style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-rose)', lineHeight: 1.65 }}>
            {BRAND_NAME}建立在以下原则之上，这也是我们对每位用户的期待：
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {([
              { token: 'no-control' as IconToken, text: '不操控' },
              { token: 'no-pressure' as IconToken, text: '不施压' },
              { token: 'boundary' as IconToken, text: '不侵犯边界' },
              { token: 'calm' as IconToken, text: '不制造焦虑' },
              { token: 'express' as IconToken, text: '真诚表达' },
              { token: 'listen' as IconToken, text: '尊重对方意愿' },
              { token: 'love' as IconToken, text: '健康关系优先' },
              { token: 'grow' as IconToken, text: '慢慢来，急不得' },
            ]).map((p, i) => (
              <div key={p.text} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'rgba(255,245,248,0.5)', borderRadius: 12 }}>
                <IconBadge token={p.token} size={30} tone={(['rose', 'lavender', 'gold', 'mint'] as const)[i % 4]} />
                <span style={{ fontSize: 13, color: 'var(--text-rose)', fontWeight: 500 }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <WarningNotice text="如果你正在使用本产品对他人施压、操控或骚扰，请立即停止。本产品的目的是帮助你成为更好的沟通者，而不是提供操控他人的工具。" />

      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <p style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.5 }}>
          {BRAND_NAME} {BRAND_VERSION} · {BRAND_SUBTITLE}
        </p>
      </div>
    </div>
  );
}
