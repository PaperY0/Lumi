import { useState } from 'react';
import { ArrowLeft, ArrowRight, Edit2, Trash2, RefreshCw, User, Users } from 'lucide-react';
import { GlassCard, LiquidButton, PrivacyNotice } from './GlassUI';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';

interface Props { onNavigate: (page: PageName) => void; }

interface Message {
  id: number;
  sender: 'me' | 'her';
  text: string;
  time: string;
  editing?: boolean;
}

const initialMessages: Message[] = [
  { id: 1, sender: 'me', text: '你今天好吗？', time: '14:02' },
  { id: 2, sender: 'her', text: '还行吧，你呢', time: '14:05' },
  { id: 3, sender: 'me', text: '我挺好的！今天天气不错，出去转了转', time: '14:06' },
  { id: 4, sender: 'her', text: '哦，去哪了', time: '14:12' },
  { id: 5, sender: 'me', text: '就附近公园，你上次说喜欢那边的咖啡店', time: '14:13' },
  { id: 6, sender: 'her', text: '哈哈是的，那家奶茶也不错', time: '14:18' },
  { id: 7, sender: 'me', text: '下次可以一起去！', time: '14:18' },
  { id: 8, sender: 'her', text: '看情况吧', time: '14:22' },
  { id: 9, sender: 'me', text: '嗯好，不着急', time: '14:23' },
  { id: 10, sender: 'her', text: '你最近在忙什么', time: '14:35' },
  { id: 11, sender: 'me', text: '工作项目收尾，下周应该能轻松一点', time: '14:36' },
  { id: 12, sender: 'her', text: '加油哦', time: '14:40' },
  { id: 13, sender: 'me', text: '谢谢你 😊', time: '14:41' },
  { id: 14, sender: 'her', text: '没事，你去忙吧', time: '14:42' },
  { id: 15, sender: 'me', text: '好，晚上再聊', time: '14:43' },
];

export function ChatPreviewPage({ onNavigate }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [myLabel, setMyLabel] = useState('我');
  const [herLabel, setHerLabel] = useState('她');

  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditText(msg.text);
  };

  const saveEdit = (id: number) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: editText } : m));
    setEditingId(null);
  };

  const deleteMsg = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const flipSender = (id: number) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, sender: m.sender === 'me' ? 'her' : 'me' } : m));
  };

  return (
    <div style={{ padding: '32px', maxWidth: 860, margin: '0 auto' }} className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, letterSpacing: '-0.03em' }}><BlurText text="聊天记录预览与修正" startDelay={60} className="gradient-text" style={{ fontWeight: 700, display: 'inline' }} /></h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          已识别 {messages.length} 条消息 · 确认发送者身份，修正错误内容后开始分析
        </p>
      </div>

      <PrivacyNotice text="聊天内容仅在本地处理，分析时只发送必要的摘要信息。" />

      {/* Sender Mapping */}
      <GlassCard style={{ margin: '20px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 14 }}>
          <Users size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          发送者映射
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7, display: 'block', marginBottom: 6 }}>右侧气泡（我）</label>
            <input
              className="glass-input"
              value={myLabel}
              onChange={e => setMyLabel(e.target.value)}
              style={{ borderRadius: 14, padding: '10px 14px', fontSize: 14, color: 'var(--text-rose)', width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.7, display: 'block', marginBottom: 6 }}>左侧气泡（她）</label>
            <input
              className="glass-input"
              value={herLabel}
              onChange={e => setHerLabel(e.target.value)}
              style={{ borderRadius: 14, padding: '10px 14px', fontSize: 14, color: 'var(--text-rose)', width: '100%' }}
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard padding="0" style={{ marginBottom: 24 }}>
        {/* Chat header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg,#F9C8D5,#D4A5C9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 16 }}>🌸</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)' }}>{herLabel}</div>
            <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.6 }}>聊天记录预览 · 可编辑</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-purple)', opacity: 0.6 }}>
            点击消息可编辑
          </div>
        </div>

        {/* Messages */}
        <div style={{ maxHeight: 480, overflowY: 'auto', padding: '20px' }}>
          {messages.map((msg) => {
            const isMe = msg.sender === 'me';
            const isEditing = editingId === msg.id;
            return (
              <div
                key={msg.id}
                style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, marginBottom: 12, alignItems: 'flex-end' }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 999, flexShrink: 0,
                  background: isMe ? 'linear-gradient(135deg,#E8748A,#C5956C)' : 'linear-gradient(135deg,#F9C8D5,#D4A5C9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <User size={14} color="white" />
                </div>

                <div style={{ maxWidth: '65%' }}>
                  {isEditing ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="glass-input"
                        style={{ borderRadius: 16, padding: '10px 14px', fontSize: 14, color: 'var(--text-rose)', width: '100%', minWidth: 200, resize: 'vertical' }}
                        autoFocus
                        rows={2}
                      />
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <button onClick={() => setEditingId(null)} style={{ fontSize: 12, color: 'var(--text-purple)', border: 'none', cursor: 'pointer', padding: '4px 10px', background: 'rgba(255,245,248,0.7)', borderRadius: 8 }}>取消</button>
                        <button onClick={() => saveEdit(msg.id)} style={{ fontSize: 12, color: 'white', background: 'linear-gradient(135deg,#E8748A,#C5956C)', border: 'none', cursor: 'pointer', padding: '4px 12px', borderRadius: 8 }}>保存</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <div className={isMe ? 'chat-bubble-mine' : 'chat-bubble-hers'} style={{ padding: '10px 14px', display: 'inline-block', fontSize: 14, lineHeight: 1.55 }}>
                        {msg.text}
                      </div>
                      <div style={{
                        display: 'flex', gap: 6, marginTop: 4,
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                        opacity: 0.6,
                      }}>
                        <span style={{ fontSize: 10, color: 'var(--text-purple)' }}>{msg.time}</span>
                        <button onClick={() => startEdit(msg)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-purple)', lineHeight: 1 }}>
                          <Edit2 size={11} />
                        </button>
                        <button onClick={() => flipSender(msg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-purple)', lineHeight: 1 }} title="切换发送者">
                          <RefreshCw size={11} />
                        </button>
                        <button onClick={() => deleteMsg(msg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#C96A6A', lineHeight: 1 }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <LiquidButton variant="secondary" onClick={() => onNavigate('chat-import')}>
          <ArrowLeft size={16} /> 返回重新导入
        </LiquidButton>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65, display: 'flex', alignItems: 'center' }}>
            共 {messages.length} 条消息
          </div>
          <LiquidButton onClick={() => onNavigate('ai-analysis')}>
            保存并开始 AI 分析 <ArrowRight size={16} />
          </LiquidButton>
        </div>
      </div>
    </div>
  );
}
