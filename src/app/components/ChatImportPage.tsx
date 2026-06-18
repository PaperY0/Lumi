import { useState, useRef } from 'react';
import { Upload, FileText, Camera, Clipboard, ArrowRight, CheckCircle } from 'lucide-react';
import { GlassCard, LiquidButton, PrivacyNotice, ProgressStepper } from './GlassUI';
import { BlurText } from './BlurText';
import type { PageName } from './GlassUI';

interface Props { onNavigate: (page: PageName) => void; }

const steps = ['资料建档', '男生问卷', '女生问卷', '关系画像', '聊天导入'];

const importMethods = [
  {
    id: 'paste',
    icon: <Clipboard size={28} color="#E8748A" />,
    title: '复制粘贴',
    desc: '适合少量聊天，快速分析。直接粘贴聊天内容文本。',
    badge: '最简单',
    badgeColor: '#E8748A',
  },
  {
    id: 'ocr',
    icon: <Camera size={28} color="#D4A5C9" />,
    title: '截图 OCR',
    desc: '上传微信截图，本地识别文字，无需手动输入。',
    badge: '最常用',
    badgeColor: '#D4A5C9',
  },
  {
    id: 'file',
    icon: <FileText size={28} color="#C5956C" />,
    title: '文件导入',
    desc: '支持 .txt / .csv / .json 格式，适合大量记录分析。',
    badge: '最完整',
    badgeColor: '#C5956C',
  },
];

export function ChatImportPage({ onNavigate }: Props) {
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file.name);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file.name);
  };

  const canProceed = (activeMethod === 'paste' && pasteText.trim().length > 10) ||
    (activeMethod === 'ocr' && uploadedFile) ||
    (activeMethod === 'file' && uploadedFile);

  return (
    <div style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }} className="page-enter">
      <GlassCard hover={false} style={{ marginBottom: 32 }} padding="20px 24px">
        <ProgressStepper steps={steps} current={4} />
      </GlassCard>

      <div style={{ marginBottom: 28 }}>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, letterSpacing: '-0.03em' }}><BlurText text="聊天记录导入" startDelay={60} className="gradient-text" style={{ fontWeight: 700, display: 'inline' }} /></h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          AI 将分析你们的聊天风格、互动热度和关键信号。
        </p>
      </div>

      <PrivacyNotice text="聊天记录包含敏感信息，请确认你有权处理这些内容。系统优先本地处理，你可以随时清空数据。不会上传完整聊天内容至服务器。" />

      {/* Method selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, margin: '24px 0' }}>
        {importMethods.map((method) => {
          const isActive = activeMethod === method.id;
          return (
            <GlassCard
              key={method.id}
              padding="20px"
              onClick={() => setActiveMethod(method.id)}
              style={{
                cursor: 'pointer',
                border: isActive ? '1.5px solid rgba(232,116,138,0.5)' : '1px solid rgba(255,255,255,0.4)',
                background: isActive ? 'rgba(232,116,138,0.06)' : undefined,
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Selected indicator */}
              {isActive && (
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <CheckCircle size={18} color="#E8748A" />
                </div>
              )}

              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                color: 'white', background: method.badgeColor,
                padding: '2px 8px', borderRadius: 999, display: 'inline-block', marginBottom: 12,
              }}>
                {method.badge}
              </span>
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {method.icon}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 6 }}>{method.title}</div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-purple)', opacity: 0.8, lineHeight: 1.6 }}>{method.desc}</p>
            </GlassCard>
          );
        })}
      </div>

      {/* Active method UI */}
      {activeMethod === 'paste' && (
        <GlassCard style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 12 }}>粘贴聊天内容</div>
          <textarea
            className="glass-input"
            placeholder={`将聊天记录粘贴到此处...\n\n格式示例：\n我：你今天有空吗？\n她：看情况\n我：那就随便啦`}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            style={{
              width: '100%', minHeight: 200, borderRadius: 18,
              padding: '14px 16px', fontSize: 14, color: 'var(--text-rose)',
              resize: 'vertical',
            }}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.6 }}>建议至少 20 条消息以获得更准确的分析</span>
            <span style={{ fontSize: 12, color: pasteText.length > 50 ? 'var(--pink-primary)' : 'var(--text-purple)', opacity: 0.6 }}>
              {pasteText.length} 字符
            </span>
          </div>
        </GlassCard>
      )}

      {(activeMethod === 'ocr' || activeMethod === 'file') && (
        <GlassCard style={{ marginBottom: 20 }}>
          <div
            className="upload-zone"
            style={{ borderRadius: 24, padding: '48px 32px', textAlign: 'center', cursor: 'pointer' }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept={activeMethod === 'ocr' ? 'image/*' : '.txt,.csv,.json'}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            {uploadedFile ? (
              <>
                <CheckCircle size={40} color="#4CAF82" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 4 }}>已选择文件</div>
                <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.75 }}>{uploadedFile}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                  style={{ marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--pink-primary)' }}
                >
                  重新选择
                </button>
              </>
            ) : (
              <>
                <Upload size={40} color="var(--pink-primary)" style={{ opacity: 0.7, marginBottom: 16 }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 6 }}>
                  {isDragging ? '松开以上传' : `点击或拖拽${activeMethod === 'ocr' ? '截图' : '文件'}到此处`}
                </div>
                <p style={{ margin: '0 auto', fontSize: 13, color: 'var(--text-purple)', opacity: 0.65, maxWidth: 300, lineHeight: 1.6 }}>
                  {activeMethod === 'ocr'
                    ? '支持 PNG、JPG、WEBP 格式的微信聊天截图，本地 OCR 识别文字'
                    : '支持 .txt / .csv / .json 格式，文件大小不超过 5MB'}
                </p>
                <div style={{
                  marginTop: 20, display: 'inline-flex', padding: '6px 16px',
                  background: 'rgba(232,116,138,0.08)', borderRadius: 999,
                  border: '1px solid rgba(232,116,138,0.2)',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--pink-primary)' }}>
                    {activeMethod === 'ocr' ? 'PNG / JPG / WEBP · 最大 5MB' : 'TXT / CSV / JSON · 最大 5MB'}
                  </span>
                </div>
              </>
            )}
          </div>
        </GlassCard>
      )}

      {!activeMethod && (
        <GlassCard style={{ marginBottom: 20, textAlign: 'center', padding: '40px' }}>
          <Upload size={36} color="var(--pink-primary)" style={{ opacity: 0.4, marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-purple)', opacity: 0.7 }}>请先选择一种导入方式</p>
        </GlassCard>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <LiquidButton variant="secondary" onClick={() => onNavigate('relationship-portrait')}>
          返回画像
        </LiquidButton>
        <LiquidButton onClick={() => onNavigate('chat-preview')} disabled={!canProceed} style={{ opacity: canProceed ? 1 : 0.5 }}>
          预览与确认内容 <ArrowRight size={16} />
        </LiquidButton>
      </div>
    </div>
  );
}
