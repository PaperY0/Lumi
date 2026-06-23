import { useState, useMemo, useEffect } from 'react';
import { ArrowRight, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard, LiquidButton, ProgressStepper } from './GlassUI';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';
import { parseChatText, type ParseResult } from '@/lib/chatParser';
import { chatRepository } from '@/lib/db/repositories/chatRepo';
import { useUserStore, useUiStore } from '@/stores';

interface Props {
  onNavigate: (page: PageName) => void;
}

const steps = ['资料建档', '男生问卷', '女生问卷', '关系画像', '聊天导入'];

export function ChatImportPage({ onNavigate }: Props) {
  const { currentUser, currentGirl, loadCurrentUser } = useUserStore();
  const { showToast } = useUiStore();

  // 步骤 1: 输入
  const [rawText, setRawText] = useState('');
  const [helpExpanded, setHelpExpanded] = useState(true);

  // 步骤 2: 解析结果 + 选择"我"
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [myName, setMyName] = useState<string>('');

  // 步骤 3: 导入中
  const [importing, setImporting] = useState(false);

  // 组件挂载时检查并加载用户数据
  useEffect(() => {
    console.log('[ChatImport] 页面挂载，currentUser:', currentUser);
    console.log('[ChatImport] 页面挂载，currentGirl:', currentGirl);

    if (!currentUser) {
      console.log('[ChatImport] currentUser 为空，尝试加载当前用户');
      loadCurrentUser?.();
    }
  }, []);

  const handleParse = () => {
    if (!rawText.trim()) {
      showToast('请先粘贴聊天记录', 'error');
      return;
    }

    const result = parseChatText(rawText);
    setParseResult(result);

    if (result.errors.length > 0) {
      showToast(`解析完成，但有 ${result.errors.length} 处格式问题`, 'info');
    }

    // 默认选第一个昵称为"我"
    if (result.detectedNames.length >= 1) {
      setMyName(result.detectedNames[0]);
    }

    if (result.detectedNames.length === 0) {
      showToast('未检测到任何消息，请检查格式', 'error');
    }
  };

  // 当 myName 变化时，重新映射 sender
  const displayMessages = useMemo(() => {
    if (!parseResult) return [];
    return parseResult.messages.map(m => ({
      ...m,
      sender: m.senderName === myName ? ('user' as const) : ('other' as const),
    }));
  }, [parseResult, myName]);

  const handleConfirm = async () => {
    console.log('[ChatImport] ✅ 点击确认导入按钮');
    console.log('[ChatImport] 当前 currentUser:', currentUser);
    console.log('[ChatImport] 当前 currentGirl:', currentGirl);
    console.log('[ChatImport] 当前 myName:', myName);
    console.log('[ChatImport] parseResult 是否存在:', !!parseResult);
    console.log('[ChatImport] displayMessages 数量:', displayMessages.length);
    console.log('[ChatImport] displayMessages 前 3 条:', displayMessages.slice(0, 3));

    if (importing) {
      console.warn('[ChatImport] 阻止重复导入：当前正在导入中');
      return;
    }

    if (!currentUser?.id) {
      console.warn('[ChatImport] 阻止导入：currentUser 为空或没有 id', currentUser);
      showToast('请先完成资料建档', 'error');
      return;
    }

    if (!myName) {
      console.warn('[ChatImport] 阻止导入：未选择自己昵称');
      showToast('请先选择哪个昵称是你自己', 'error');
      return;
    }

    if (!parseResult) {
      console.warn('[ChatImport] 阻止导入：parseResult 为空');
      showToast('请先解析聊天记录', 'error');
      return;
    }

    if (!displayMessages || displayMessages.length === 0) {
      console.warn('[ChatImport] 阻止导入：没有可导入消息');
      showToast('没有可导入的消息', 'error');
      return;
    }

    // MVP 阶段：currentGirl 可选，为空时使用兜底值
    const girlId = currentGirl?.id ?? 'default-girl';
    console.log('[ChatImport] 使用 girlId:', girlId);
    console.log('[ChatImport] 注意：currentGirl 为空时使用 default-girl 兜底，不阻止导入');

    setImporting(true);
    console.log('[ChatImport] 🚀 开始调用 chatRepository.createSessionWithMessages');

    try {
      const session = await chatRepository.createSessionWithMessages(
        currentUser.id,
        girlId,
        displayMessages.map(m => ({
          sender: m.sender,
          content: m.content,
          sentAt: m.sentAt,
          senderName: m.senderName,
        })),
        'paste',
      );

      console.log('[ChatImport] ✅ chatRepository 返回 session:', session);

      if (!session?.id) {
        console.warn('[ChatImport] repository 没有返回有效的 session');
        showToast('导入异常：没有生成会话 ID', 'error');
        return;
      }

      showToast(`成功导入 ${displayMessages.length} 条消息`, 'success');
      console.log('[ChatImport] ✅ 导入成功，准备跳转页面');

      // 跳转到首页
      onNavigate('dashboard');
    } catch (error) {
      console.error('[ChatImport] ❌ 导入失败，完整错误:', error);
      showToast('导入失败，请打开控制台查看错误', 'error');
    } finally {
      console.log('[ChatImport] 🏁 导入流程结束，恢复按钮状态');
      setImporting(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }} className="page-enter">
      <GlassCard hover={false} style={{ marginBottom: 32 }} padding="20px 24px">
        <ProgressStepper steps={steps} current={4} />
      </GlassCard>

      <div style={{ marginBottom: 28 }}>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, letterSpacing: '-0.03em' }}>
          <BlurText text="聊天记录导入" startDelay={60} className="gradient-text" style={{ fontWeight: 700, display: 'inline' }} />
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          粘贴微信聊天记录，AI 将分析你们的互动风格和关键信号。
        </p>
      </div>

      {/* 导入帮助面板 */}
      <GlassCard style={{ marginBottom: 24, background: 'rgba(255, 243, 224, 0.3)' }}>
        <div
          onClick={() => setHelpExpanded(!helpExpanded)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: helpExpanded ? 16 : 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HelpCircle size={18} color="#F59E0B" />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)' }}>📌 如何导出微信聊天记录？</span>
          </div>
          {helpExpanded ? <ChevronUp size={18} color="var(--text-purple)" /> : <ChevronDown size={18} color="var(--text-purple)" />}
        </div>

        {helpExpanded && (
          <div style={{ fontSize: 13, color: 'var(--text-rose)', lineHeight: 1.7 }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px 14px', borderRadius: 12, marginBottom: 12, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <AlertCircle size={16} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: '#D97706' }}>
                  微信限制：单次复制最多 100 条消息，且无法直接粘贴到 QQ 等其他 App。
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <strong>推荐方法：</strong>
            </div>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>单条复制：</strong>长按消息 → 复制
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>多选复制（推荐）：</strong>长按任意一条消息 → 选择"多选" → 勾选要导入的消息（最多 100 条）→ 点底部"复制"
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>中转粘贴：</strong>复制后先粘贴到手机备忘录 / 备忘 App，再从备忘录复制完整内容，最后粘贴到本页面
                <span style={{ opacity: 0.7 }}> （直接从微信粘贴到 QQ/邮件等可能丢失内容）</span>
              </li>
              <li>
                <strong>超过 100 条：</strong>分多次复制粘贴拼接即可
              </li>
            </ol>
          </div>
        )}
      </GlassCard>

      {/* 步骤 1: 输入区域 */}
      {!parseResult && (
        <GlassCard style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12 }}>
            粘贴聊天内容
          </div>
          <textarea
            className="glass-input"
            placeholder={`将从微信复制的聊天记录粘贴到此处...\n\n格式示例：\nPaper Y\n2026年06月23日 08:00\n醒来啦\nWhiskey\n2026年06月23日 08:00\n[动画表情]`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            style={{
              width: '100%',
              minHeight: 240,
              borderRadius: 18,
              padding: '14px 16px',
              fontSize: 14,
              color: 'var(--text-rose)',
              resize: 'vertical',
            }}
          />
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.6 }}>
              建议至少 20 条消息以获得更准确的分析
            </span>
            <span style={{ fontSize: 12, color: rawText.length > 50 ? 'var(--pink-primary)' : 'var(--text-purple)', opacity: 0.6 }}>
              {rawText.length} 字符
            </span>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <LiquidButton onClick={handleParse} disabled={!rawText.trim()}>
              解析聊天记录 <ArrowRight size={16} />
            </LiquidButton>
          </div>
        </GlassCard>
      )}

      {/* 步骤 2: 解析结果 + 选择"我" */}
      {parseResult && !importing && (
        <>
          {/* 解析摘要 */}
          <GlassCard style={{ marginBottom: 20, background: 'rgba(232, 116, 138, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32 }}>✅</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 4 }}>
                  检测到 {parseResult.messages.length} 条消息
                </div>
                {parseResult.errors.length > 0 && (
                  <div style={{ fontSize: 12, color: '#F59E0B' }}>
                    ⚠️ 有 {parseResult.errors.length} 处格式异常，已自动跳过
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* 选择"我"是谁 */}
          <GlassCard style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12 }}>
              请选择哪个昵称是你自己
            </div>

            {parseResult.detectedNames.length < 2 && (
              <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, marginBottom: 12, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <span style={{ fontSize: 13, color: '#D97706' }}>
                  消息中只检测到一个发送者，请检查格式是否正确
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {parseResult.detectedNames.map((name) => (
                <label
                  key={name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: myName === name ? '2px solid var(--pink-primary)' : '1px solid rgba(255,255,255,0.3)',
                    background: myName === name ? 'rgba(232, 116, 138, 0.08)' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="myName"
                    value={name}
                    checked={myName === name}
                    onChange={(e) => setMyName(e.target.value)}
                    style={{ width: 18, height: 18, accentColor: 'var(--pink-primary)' }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-rose)' }}>{name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7, marginLeft: 'auto' }}>
                    ({parseResult.messages.filter(m => m.senderName === name).length} 条消息)
                  </span>
                </label>
              ))}
            </div>
          </GlassCard>

          {/* 预览气泡 */}
          <GlassCard style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12 }}>
              预览（前 20 条）
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {displayMessages.slice(0, 20).map((msg, idx) => {
                const isMe = msg.sender === 'user';
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 4, textAlign: isMe ? 'right' : 'left' }}>
                        {msg.senderName} · {msg.sentAt.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 12,
                          background: isMe ? 'rgba(232, 116, 138, 0.15)' : 'rgba(255,255,255,0.5)',
                          border: isMe ? '1px solid rgba(232, 116, 138, 0.3)' : '1px solid rgba(255,255,255,0.4)',
                          fontSize: 13,
                          color: 'var(--text-rose)',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {displayMessages.length > 20 && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-purple)', opacity: 0.6, textAlign: 'center' }}>
                还有 {displayMessages.length - 20} 条消息未显示
              </div>
            )}
          </GlassCard>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <LiquidButton variant="secondary" onClick={() => { setParseResult(null); setMyName(''); }}>
              重新输入
            </LiquidButton>
            <LiquidButton
              onClick={handleConfirm}
              disabled={!myName || displayMessages.length === 0 || importing}
            >
              {importing ? '导入中...' : `确认导入 ${displayMessages.length} 条消息`} <ArrowRight size={16} />
            </LiquidButton>
          </div>
        </>
      )}

      {/* 导入中状态 */}
      {importing && (
        <GlassCard style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 8 }}>导入中...</div>
          <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>正在保存 {displayMessages.length} 条消息到本地数据库</div>
        </GlassCard>
      )}

      {/* 底部导航（未解析时显示） */}
      {!parseResult && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <LiquidButton variant="secondary" onClick={() => onNavigate('relationship-portrait')}>
            返回画像
          </LiquidButton>
        </div>
      )}
    </div>
  );
}
