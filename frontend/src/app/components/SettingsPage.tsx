import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Trash2, Brain, Lock, Heart, AlertCircle, Smartphone, Search, Trash, Ban,
  Database, Download, RefreshCw, BookOpen, RotateCcw, CheckCircle, XCircle,
} from 'lucide-react';
import { GlassCard, LiquidButton, WarningNotice } from './GlassUI';
import { IconBadge, type IconToken } from './IconBadge';
import { BlurText } from './BlurText';
import { BRAND_NAME, BRAND_SUBTITLE, BRAND_VERSION } from '../brand';
import type { PageName } from './GlassUI';
import { useUiStore, useSettingsStore } from '@/stores';
import { formatDateTime } from '@/utils/date';
import {
  getLocalDataSummary,
  exportLocalData,
  clearAllLocalData,
  clearLoveGuideReadState,
  resetOnboardingFlag,
  type LocalDataSummary,
} from '@/utils/localDataManager';

interface Props {
  onNavigate: (page: PageName) => void;
}

/** 格式化文件名时间戳：20260624-1951 */
function formatFileTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export function SettingsPage({ onNavigate }: Props) {
  // ── 状态 ──
  const [summary, setSummary] = useState<LocalDataSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [resetting, setResetting] = useState(false);

  // ── 清空二次确认 ──
  const [confirmStep, setConfirmStep] = useState<0 | 1 | 2>(0);

  const ui = useUiStore.getState();

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  /** 加载数据概览 */
  const loadSummary = useCallback(async () => {
    clearMessages();
    setLoading(true);
    try {
      const data = await getLocalDataSummary();
      setSummary(data);
    } catch (e) {
      console.error('❌ [SettingsPage] 加载概览失败:', e);
      setError('本地数据读取失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  /** 导出 JSON */
  const handleExport = async () => {
    clearMessages();
    setExporting(true);
    try {
      const data = await exportLocalData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumi-local-data-${formatFileTime(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSuccessMessage('已导出本地数据');
    } catch (e) {
      console.error('❌ [SettingsPage] 导出失败:', e);
      setError('导出失败，请稍后重试');
    } finally {
      setExporting(false);
    }
  };

  /** 清空全部本地数据 */
  const handleClearAll = async () => {
    clearMessages();
    setClearing(true);
    try {
      await clearAllLocalData();
      useSettingsStore.getState().reset();
      useUiStore.getState().showToast('数据已清空', 'success');
      setConfirmStep(0);
      // 重新加载页面，回到新用户状态
      window.location.reload();
    } catch (e) {
      console.error('❌ [SettingsPage] 清空失败:', e);
      setError('清空失败，请稍后重试');
      setClearing(false);
    }
  };

  /** 重置新手引导标记 */
  const handleResetOnboarding = () => {
    clearMessages();
    if (!window.confirm('确定要重置新手引导标记吗？\n\n注意：由于 App 会自动识别完整旧用户数据，刷新后可能会再次自动恢复为已完成状态。若要完整测试新用户流程，请使用"清空全部本地数据"。')) return;
    setResetting(true);
    try {
      resetOnboardingFlag();
      useSettingsStore.getState().setOnboardingCompleted(false);
      setSuccessMessage('已重置新手引导标记');
      loadSummary();
    } catch (e) {
      console.error('❌ [SettingsPage] 重置失败:', e);
      setError('重置失败，请稍后重试');
    } finally {
      setResetting(false);
    }
  };

  /** 清除恋爱法典已读状态 */
  const handleClearGuideRead = () => {
    clearMessages();
    try {
      clearLoveGuideReadState();
      setSuccessMessage('已清除恋爱法典阅读状态');
      loadSummary();
    } catch (e) {
      console.error('❌ [SettingsPage] 清除失败:', e);
      setError('清除失败，请稍后重试');
    }
  };

  // ── 子组件 ──

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

  const DataRow = ({ label, value }: { label: string; value: number | string }) => (
    <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.8 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>{value}</span>
    </div>
  );

  // ── 渲染 ──

  return (
    <div style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }} className="page-enter">

      {/* 页面标题 */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, letterSpacing: '-0.03em' }}>
          <BlurText text="设置" startDelay={60} className="gradient-text" style={{ fontWeight: 700, display: 'inline' }} />
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          管理本地数据、隐私说明和使用偏好。
        </p>
      </div>

      {/* ── 消息提示 ── */}
      {successMessage && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 16, background: 'rgba(76,175,130,0.1)', border: '1px solid rgba(76,175,130,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle size={16} color="#4CAF82" />
          <span style={{ fontSize: 13, color: '#4CAF82', fontWeight: 500 }}>{successMessage}</span>
        </div>
      )}
      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 16, background: 'rgba(201,106,106,0.1)', border: '1px solid rgba(201,106,106,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <XCircle size={16} color="#C96A6A" />
          <span style={{ fontSize: 13, color: '#C96A6A', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          1. 本地数据概览
         ═══════════════════════════════════════════════════════════════════ */}
      <Section icon={<Database size={14} color="#C5956C" />} title="本地数据概览">
        {loading ? (
          <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>
            正在读取本地数据...
          </div>
        ) : summary ? (
          <>
            <DataRow label="我的资料" value={summary.userProfileCount} />
            <DataRow label="她的资料" value={summary.girlProfileCount} />
            <DataRow label="男生问卷" value={summary.maleQuestionnaireCount} />
            <DataRow label="女生问卷" value={summary.femaleQuestionnaireCount} />
            <DataRow label="关系画像" value={summary.relationshipPortraitCount} />
            <DataRow label="聊天消息" value={summary.chatMessageCount} />
            <DataRow label="AI 分析报告" value={summary.analysisReportCount} />
            <DataRow label="回复建议记录" value={summary.replyHistoryCount} />
            <DataRow label="模拟练习记录" value={summary.simulateHistoryCount} />
            <DataRow label="自定义法典文章" value={summary.loveGuideArticleCount} />
            <DataRow label="本地缓存项" value={summary.localStorageKeyCount} />
            <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.8 }}>最近更新时间</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-rose)' }}>
                {summary.lastUpdatedAt ? formatDateTime(summary.lastUpdatedAt) : '暂无'}
              </span>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
              <LiquidButton variant="secondary" onClick={loadSummary} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                <RefreshCw size={14} />
                刷新数据概览
              </LiquidButton>
            </div>
          </>
        ) : (
          <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>
            暂无数据
          </div>
        )}
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. 隐私说明
         ═══════════════════════════════════════════════════════════════════ */}
      <Section icon={<Lock size={14} color="#E8748A" />} title="隐私说明">
        <div style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.7 }}>
            {BRAND_NAME}优先把你的资料、问卷、分析记录和练习历史保存在当前浏览器本地。除非你主动调用 AI 分析、帮我回复或模拟对话，否则这些本地记录不会发送到服务端。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { Icon: Smartphone, text: '清空浏览器数据可能会删除这些记录' },
              { Icon: Search, text: '换浏览器或换设备不会自动同步' },
              { Icon: Ban, text: '请不要填写未经对方允许的敏感隐私' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'rgba(255,245,248,0.5)', borderRadius: 12 }}>
                <IconBadge icon={item.Icon} size={30} tone="gold" />
                <span style={{ fontSize: 12, color: 'var(--text-purple)', lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          3. 数据导出
         ═══════════════════════════════════════════════════════════════════ */}
      <Section icon={<Download size={14} color="#C5956C" />} title="导出本地数据">
        <div style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            你可以把当前浏览器里的 {BRAND_NAME} 本地数据导出为 JSON 文件，方便备份或排查问题。导出仅在本地完成，不会上传到任何服务器。
          </p>
          <LiquidButton
            variant="secondary"
            onClick={handleExport}
            disabled={exporting}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Download size={14} />
            {exporting ? '导出中...' : '导出 JSON'}
          </LiquidButton>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. 清空本地数据
         ═══════════════════════════════════════════════════════════════════ */}
      <Section icon={<AlertCircle size={14} color="#C96A6A" />} title="清空本地数据">
        <div style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            这会删除当前浏览器中保存的资料、问卷、画像、聊天记录、分析报告、回复历史和模拟练习历史。删除后不可恢复。
          </p>
          {confirmStep === 0 && (
            <LiquidButton
              variant="secondary"
              onClick={() => setConfirmStep(1)}
              disabled={clearing}
              style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,235,235,0.5)', border: '1px solid rgba(200,100,100,0.3)', color: '#C96A6A' }}
            >
              <Trash2 size={14} />
              清空全部本地数据
            </LiquidButton>
          )}
          {confirmStep === 1 && (
            <div style={{ padding: '16px', borderRadius: 16, background: 'rgba(201,106,106,0.08)', border: '1px solid rgba(201,106,106,0.2)' }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#C96A6A', fontWeight: 600 }}>
                ⚠️ 第一次确认
              </p>
              <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-purple)', lineHeight: 1.6 }}>
                确定要清空 {BRAND_NAME} 的全部本地数据吗？此操作不可恢复。
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <LiquidButton variant="secondary" onClick={() => setConfirmStep(0)} style={{ flex: 1, justifyContent: 'center' }}>
                  取消
                </LiquidButton>
                <LiquidButton onClick={() => setConfirmStep(2)} style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #C96A6A, #B05555)' }}>
                  继续
                </LiquidButton>
              </div>
            </div>
          )}
          {confirmStep === 2 && (
            <div style={{ padding: '16px', borderRadius: 16, background: 'rgba(201,106,106,0.12)', border: '1px solid rgba(201,106,106,0.3)' }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#C96A6A', fontWeight: 600 }}>
                ⚠️ 最终确认
              </p>
              <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-purple)', lineHeight: 1.6 }}>
                清空后会回到新用户状态，所有本地记录都会删除，且无法恢复。
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <LiquidButton variant="secondary" onClick={() => setConfirmStep(0)} style={{ flex: 1, justifyContent: 'center' }}>
                  取消
                </LiquidButton>
                <LiquidButton onClick={handleClearAll} disabled={clearing} style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #C96A6A, #B05555)' }}>
                  {clearing ? '清空中...' : '确认清空'}
                </LiquidButton>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          5. 新手引导测试
         ═══════════════════════════════════════════════════════════════════ */}
      <Section icon={<RotateCcw size={14} color="#D4A5C9" />} title="重置新手引导标记">
        <div style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            仅重置 onboardingCompleted 标记，不删除资料和问卷。
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, lineHeight: 1.6 }}>
            由于 App 会自动识别完整旧用户数据，刷新后可能会再次自动恢复为已完成状态。若要完整测试新用户流程，请使用上方"清空全部本地数据"。
          </p>
          <LiquidButton
            variant="secondary"
            onClick={handleResetOnboarding}
            disabled={resetting}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <RotateCcw size={14} />
            {resetting ? '重置中...' : '重置引导标记'}
          </LiquidButton>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          6. 恋爱法典已读状态
         ═══════════════════════════════════════════════════════════════════ */}
      <Section icon={<BookOpen size={14} color="#C5956C" />} title="清除恋爱法典阅读状态">
        <div style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            只清除文章已读标记，不影响资料、问卷、分析和练习历史。
          </p>
          <LiquidButton
            variant="secondary"
            onClick={handleClearGuideRead}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <BookOpen size={14} />
            清除已读状态
          </LiquidButton>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          7. AI 设置（保留原有）
         ═══════════════════════════════════════════════════════════════════ */}
      <Section icon={<Brain size={14} color="#D4A5C9" />} title="AI 设置">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: 14, color: 'var(--text-rose)', fontWeight: 500 }}>前端 Mock 偏好</div>
          <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginTop: 2, lineHeight: 1.5 }}>
            仅作为前端测试偏好，不代表服务端真实运行模式。后端运行模式以服务端启动日志为准。
          </div>
        </div>
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.6, lineHeight: 1.7 }}>
            若后端显示"运行模式：AI"，则当前会调用真实 AI；若显示"Mock 模式"，则使用本地模拟数据。
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          8. 健康沟通原则（保留原有）
         ═══════════════════════════════════════════════════════════════════ */}
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
