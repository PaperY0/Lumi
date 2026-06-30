/**
 * AI 分析报告历史面板
 * 展示历史列表、历史详情、删除单条报告
 */

import { useEffect } from 'react';
import { Trash2, Eye, X, Clock, MessageSquare, Target, Flame, AlertCircle } from 'lucide-react';
import { GlassCard, LiquidButton, StageBadge, HeatMeter, AIInsightCard, WarningNotice, GlassInput } from './GlassUI';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { useAnalyzeChat } from '@/hooks/useAnalyzeChat';
import { userProfileRepository, girlProfileRepository } from '@/lib/db';
import { formatDateTime } from '@/utils/date';
import type { AIAnalysisReport } from '@/types';
import { Sparkles, Lightbulb, Ban } from 'lucide-react';

interface Props {
  onUseReport?: (report: AIAnalysisReport) => void;
}

export function AIAnalysisHistoryPanel({ onUseReport }: Props) {
  const {
    reports,
    selectedReport,
    loading,
    deletingId,
    error,
    loadByGirlId,
    loadByUserId,
    loadAll,
    selectReport,
    clearSelectedReport,
    deleteReport,
  } = useAnalysisHistory();

  const { data: currentReport } = useAnalyzeChat();

  // 加载历史报告
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // 优先按 girlId 查询
        const user = await userProfileRepository.getCurrent();
        if (!user) {
          console.log('📚 [AIAnalysisHistoryPanel] 没有用户信息，跳过加载');
          return;
        }

        const girls = await girlProfileRepository.getByUserId(user.id);
        if (girls.length > 0) {
          console.log('📚 [AIAnalysisHistoryPanel] 加载分析历史', {
            userId: user.id,
            girlId: girls[0].id,
          });
          await loadByGirlId(girls[0].id);
          return;
        }

        // 没有女生资料，按 userId 查询
        console.log('📚 [AIAnalysisHistoryPanel] 按 userId 加载分析历史', {
          userId: user.id,
        });
        await loadByUserId(user.id);
      } catch (e) {
        console.error('❌ [AIAnalysisHistoryPanel] 加载历史失败:', e);
        // 兜底加载所有
        await loadAll();
      }
    };

    loadHistory();
  }, [loadByGirlId, loadByUserId, loadAll]);

  // 删除报告
  const handleDelete = async (report: AIAnalysisReport) => {
    const confirmed = window.confirm('确定要删除这条 AI 分析报告吗？删除后不可恢复。');
    if (!confirmed) return;

    console.log('🗑️ [AIAnalysisHistoryPanel] 删除分析报告', { id: report.id });
    await deleteReport(report.id);
    console.log('✅ [AIAnalysisHistoryPanel] 删除成功', { id: report.id });
  };

  // 查看详情
  const handleViewDetail = (report: AIAnalysisReport) => {
    selectReport(report);
  };

  // 互动热度映射
  const getHeatValue = (heat: string) => {
    return heat === 'hot' ? 90 : heat === 'warm' ? 65 : 30;
  };

  // 错误状态
  if (error) {
    return (
      <GlassCard style={{ background: 'rgba(255,235,235,0.5)', border: '1px solid rgba(200,150,150,0.3)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertCircle size={20} color="#C96A6A" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#C96A6A', marginBottom: 6 }}>
              加载失败
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.6 }}>
              {error}
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Loading 状态
  if (loading) {
    return (
      <GlassCard style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>📚</div>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--pink-primary)' }}>
          正在加载 AI 分析历史...
        </p>
      </GlassCard>
    );
  }

  // 详情视图
  if (selectedReport) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-rose)' }}>
            分析报告详情
          </div>
          <button
            onClick={clearSelectedReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: '1px solid rgba(232,116,138,0.3)',
              borderRadius: 999,
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--pink-primary)',
            }}
          >
            <X size={14} /> 关闭详情
          </button>
        </div>

        {/* 报告元信息 */}
        <GlassCard style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-purple)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} />
              分析时间：{formatDateTime(selectedReport.createdAt)}
            </div>
            {selectedReport.sessionId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={14} />
                来源：聊天记录
              </div>
            )}
          </div>
        </GlassCard>

        {/* 完整报告内容 */}
        <AIAnalysisReportView report={selectedReport} />
      </div>
    );
  }

  // 空状态
  if (reports.length === 0) {
    return (
      <GlassCard style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>📝</div>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>
          还没有 AI 分析历史
        </p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', opacity: 0.75 }}>
          导入聊天记录并完成一次 AI 分析后，这里会出现你的分析报告。
        </p>
      </GlassCard>
    );
  }

  // 历史列表
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {reports.map((report) => (
        <GlassCard key={report.id} style={{ padding: 20 }}>
          {/* 报告标题和时间 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 4 }}>
                AI 分析报告
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7 }}>
                {formatDateTime(report.createdAt)}
              </div>
            </div>
            <StageBadge stage={report.relationshipStage} />
          </div>

          {/* 互动热度 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              互动热度
            </div>
            <HeatMeter value={getHeatValue(report.interactionHeat)} />
          </div>

          {/* AI 简答 */}
          <div style={{
            fontSize: 13,
            color: 'var(--text-purple)',
            lineHeight: 1.6,
            marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {report.simpleAnswer}
          </div>

          {/* 来源标识 */}
          {report.sessionId && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--champagne-gold)',
              background: 'rgba(182,155,100,0.1)',
              padding: '4px 10px',
              borderRadius: 999,
              marginBottom: 12,
            }}>
              <MessageSquare size={12} />
              来自聊天记录
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 10 }}>
            <LiquidButton
              variant="secondary"
              onClick={() => handleViewDetail(report)}
              style={{ flex: 1 }}
            >
              <Eye size={14} /> 查看详情
            </LiquidButton>
            <button
              onClick={() => handleDelete(report)}
              disabled={deletingId === report.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: deletingId === report.id ? 'rgba(200,106,106,0.3)' : 'rgba(200,106,106,0.1)',
                border: '1px solid rgba(200,106,106,0.3)',
                borderRadius: 14,
                padding: '10px 16px',
                cursor: deletingId === report.id ? 'not-allowed' : 'pointer',
                fontSize: 13,
                color: '#C96A6A',
                opacity: deletingId === report.id ? 0.6 : 1,
              }}
            >
              <Trash2 size={14} />
              {deletingId === report.id ? '删除中...' : '删除'}
            </button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

/**
 * AI 分析报告展示组件（复用）
 * 用于当前分析页和历史详情页
 */
function AIAnalysisReportView({ report }: { report: AIAnalysisReport }) {
  const heatValue = report.interactionHeat === 'hot' ? 90 : report.interactionHeat === 'warm' ? 65 : 30;

  return (
    <>
      {/* 一句话结论 */}
      <GlassCard style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(232,116,138,0.08), rgba(212,165,201,0.08))' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#E8748A,#C5956C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI 简答</div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-rose)', lineHeight: 1.55, letterSpacing: '-0.01em' }}>
              {report.simpleAnswer}
            </p>
          </div>
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* 关系阶段 & 互动热度 */}
        <GlassCard>
          <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>关系阶段</div>
          <div style={{ marginBottom: 18 }}>
            <StageBadge stage={report.relationshipStage} active />
          </div>
          <HeatMeter value={heatValue} />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-purple)', opacity: 0.8 }}>
            她的情绪：{report.girlEmotion}
          </div>
        </GlassCard>

        {/* 女生视角 */}
        <GlassCard>
          <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>女生视角解释</div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.7 }}>
            {report.girlPerspective}
          </p>
        </GlassCard>
      </div>

      {/* 信号 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <AIInsightCard
          icon="✅"
          title="积极信号"
          variant="positive"
          content={
            <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
              {report.positiveSignals.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          }
        />
        <AIInsightCard
          icon="⚠️"
          title="风险信号"
          variant="risk"
          content={
            <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
              {report.riskSignals.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          }
        />
      </div>

      {/* 我的表达问题 */}
      {report.boyIssues.length > 0 && (
        <AIInsightCard
          icon="💬"
          title="你的表达分析"
          content={
            <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
              {report.boyIssues.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          }
          variant="default"
        />
      )}

      {/* 推荐回复 */}
      {report.recommendedReplies.length > 0 && (
        <GlassCard style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12 }}>推荐回复</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {report.recommendedReplies.map((reply, i) => (
              <div key={i} style={{ borderRadius: 14, padding: '12px 14px', background: 'rgba(212,165,201,0.1)', border: '1px solid rgba(212,165,201,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--champagne-gold)', marginBottom: 4 }}>{reply.style}</div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.6 }}>{reply.text}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* 下一步 & 避免 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, marginBottom: 16 }}>
        <GlassCard>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Lightbulb size={14} color="var(--champagne-gold)" /> 下一步建议
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7 }}>
            {report.nextStep}
          </p>
        </GlassCard>
        <GlassCard style={{ background: 'rgba(255,235,235,0.3)', border: '1px solid rgba(200,150,150,0.2)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#C96A6A', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Ban size={14} color="#C96A6A" /> 不建议的回复
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 2 }}>
            {report.avoidReplies.map((s, i) => <li key={i} style={{ color: 'var(--text-purple)', opacity: 0.9 }}>{s}</li>)}
          </ul>
        </GlassCard>
      </div>

      <WarningNotice text="AI 分析仅供参考，不代表对方真实想法。请结合现实互动，尊重对方表达和边界。" />
    </>
  );
}
