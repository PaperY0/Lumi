import { useHistoryCenterData } from '@/hooks/useHistoryCenterData';
import { GlassCard, LiquidButton } from './GlassUI';
import type { PageName } from './GlassUI';
import { formatDateTime } from '@/utils/date';
import type { ChatSession, AIAnalysisReport, ReplyHistory, SimulateHistoryRecord } from '@/types';

interface Props {
  onNavigate: (page: PageName) => void;
}

// ── 适配工具函数 ──────────────────────────────────────────

function getChatSessionTitle(session: ChatSession): string {
  return session.title || '聊天记录';
}

function getAnalysisSummary(report: AIAnalysisReport): string {
  return report.simpleAnswer || report.relationshipStage || 'AI 分析报告';
}

function getReplyInputSummary(record: ReplyHistory): string {
  const msg = record.userMessage || '';
  return msg.length > 30 ? msg.slice(0, 30) + '…' : msg || '回复建议';
}

function getSimulateSummary(record: SimulateHistoryRecord): string {
  const parts = [record.scenario, record.difficulty].filter(Boolean);
  return parts.join(' · ') || '模拟练习';
}

function getCreatedAt(item: { createdAt?: string; importedAt?: string }): string {
  return item.createdAt || item.importedAt || '';
}

function truncate(str: string, max: number): string {
  if (!str) return '未记录';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ── 最近动态条目 ──────────────────────────────────────────

interface ActivityItem {
  time: string;
  type: string;
  label: string;
}

function collectRecentActivities(data: {
  latestChatSession: ChatSession | null;
  latestAnalysisReport: AIAnalysisReport | null;
  latestReplyHistory: ReplyHistory | null;
  latestSimulateHistory: SimulateHistoryRecord | null;
}): ActivityItem[] {
  const items: ActivityItem[] = [];

  if (data.latestChatSession) {
    items.push({
      time: getCreatedAt(data.latestChatSession),
      type: '聊天记录',
      label: getChatSessionTitle(data.latestChatSession),
    });
  }
  if (data.latestAnalysisReport) {
    items.push({
      time: getCreatedAt(data.latestAnalysisReport),
      type: 'AI 分析',
      label: getAnalysisSummary(data.latestAnalysisReport),
    });
  }
  if (data.latestReplyHistory) {
    items.push({
      time: getCreatedAt(data.latestReplyHistory),
      type: '回复建议',
      label: getReplyInputSummary(data.latestReplyHistory),
    });
  }
  if (data.latestSimulateHistory) {
    items.push({
      time: getCreatedAt(data.latestSimulateHistory),
      type: '模拟练习',
      label: getSimulateSummary(data.latestSimulateHistory),
    });
  }

  // 按时间倒序，最多 4 条
  return items
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 4);
}

// ── 主组件 ──────────────────────────────────────────────

export function HistoryCenterPanel({ onNavigate }: Props) {
  const { data, reload } = useHistoryCenterData();

  // Loading
  if (data.loading) {
    return (
      <GlassCard style={{ marginTop: 28 }}>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 14, color: 'var(--text-purple)', opacity: 0.7 }}>
            正在整理你的历史记录...
          </div>
        </div>
      </GlassCard>
    );
  }

  // Error
  if (data.error) {
    return (
      <GlassCard style={{ marginTop: 28, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, color: '#EF4444' }}>{data.error}</span>
          <LiquidButton variant="secondary" onClick={reload}>
            重试
          </LiquidButton>
        </div>
      </GlassCard>
    );
  }

  const recentActivities = collectRecentActivities(data);

  // 分类卡片配置
  const categories = [
    {
      icon: '💬',
      label: '聊天记录',
      count: data.chatSessionCount,
      latest: data.latestChatSession
        ? formatDateTime(getCreatedAt(data.latestChatSession))
        : null,
      latestLabel: data.latestChatSession
        ? truncate(getChatSessionTitle(data.latestChatSession), 20)
        : null,
      target: 'chat-import' as PageName,
    },
    {
      icon: '📊',
      label: 'AI 分析报告',
      count: data.analysisReportCount,
      latest: data.latestAnalysisReport
        ? formatDateTime(getCreatedAt(data.latestAnalysisReport))
        : null,
      latestLabel: data.latestAnalysisReport
        ? truncate(getAnalysisSummary(data.latestAnalysisReport), 20)
        : null,
      target: 'ai-analysis' as PageName,
    },
    {
      icon: '💡',
      label: '回复建议',
      count: data.replyHistoryCount,
      latest: data.latestReplyHistory
        ? formatDateTime(getCreatedAt(data.latestReplyHistory))
        : null,
      latestLabel: data.latestReplyHistory
        ? truncate(getReplyInputSummary(data.latestReplyHistory), 20)
        : null,
      target: 'reply-assist' as PageName,
    },
    {
      icon: '🎭',
      label: '模拟练习',
      count: data.simulateHistoryCount,
      latest: data.latestSimulateHistory
        ? formatDateTime(getCreatedAt(data.latestSimulateHistory))
        : null,
      latestLabel: data.latestSimulateHistory
        ? truncate(getSimulateSummary(data.latestSimulateHistory), 20)
        : null,
      target: 'simulation' as PageName,
    },
  ];

  // 空状态
  if (data.totalCount === 0) {
    return (
      <div style={{ marginTop: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-rose)', margin: '0 0 6px' }}>
            历史中心
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>
            这里汇总了你导入过的聊天、生成过的分析、回复建议和模拟练习记录。
          </p>
        </div>

        <GlassCard style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>
            还没有历史记录
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.7, lineHeight: 1.6 }}>
            导入聊天、生成分析、使用帮我回复或完成模拟练习后，这里会自动汇总你的记录。
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 28 }}>
      {/* 标题 */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-rose)', margin: '0 0 6px' }}>
          历史中心
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>
          这里汇总了你导入过的聊天、生成过的分析、回复建议和模拟练习记录。
        </p>
      </div>

      {/* 总览 */}
      <GlassCard style={{ marginBottom: 20, background: 'rgba(232, 116, 138, 0.04)', border: '1px solid rgba(232, 116, 138, 0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pink-primary)' }}>
              共 {data.totalCount} 条本地记录
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7, marginTop: 4 }}>
              最近使用：{data.lastActiveAt ? formatDateTime(data.lastActiveAt) : '暂无'}
            </div>
          </div>
          <div style={{ fontSize: 36 }}>📚</div>
        </div>
      </GlassCard>

      {/* 四个分类卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {categories.map((cat) => (
          <GlassCard key={cat.label} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>{cat.label}</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pink-primary)' }}>
              {cat.count} 条
            </div>
            {cat.latestLabel && (
              <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7 }}>
                最近：{cat.latestLabel}
              </div>
            )}
            <button
              onClick={() => onNavigate(cat.target)}
              style={{
                marginTop: 'auto',
                background: 'rgba(232, 116, 138, 0.08)',
                border: '1px solid rgba(232, 116, 138, 0.2)',
                borderRadius: 10,
                padding: '8px 14px',
                color: 'var(--pink-primary)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'center',
              }}
            >
              查看{cat.label}
            </button>
          </GlassCard>
        ))}
      </div>

      {/* 最近动态 */}
      {recentActivities.length > 0 && (
        <GlassCard>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 16 }}>
            最近动态
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivities.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(255, 245, 248, 0.5)',
                  border: '1px solid rgba(255,255,255,0.4)',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.6, whiteSpace: 'nowrap' }}>
                  {item.time ? formatDateTime(item.time) : ''}
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--pink-primary)',
                  background: 'rgba(232,116,138,0.1)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                }}>
                  {item.type}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-rose)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
