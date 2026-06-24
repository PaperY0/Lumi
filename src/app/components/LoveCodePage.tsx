import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Clock, ArrowLeft, Check } from 'lucide-react';
import { GlassCard } from './GlassUI';
import { IconBadge } from './IconBadge';
import { BlurText } from './BlurText';
import { AnimatedCard } from './AnimatedCard';
import { articles, categories } from '@/data/loveGuideArticles';
import type { LoveGuideCategory, LoveGuideArticle } from '@/types/loveGuide';

const READ_KEY = 'lumi_love_guide_read_article_ids';

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

export function LoveCodePage() {
  const [activeCategory, setActiveCategory] = useState<LoveGuideCategory | 'all'>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);

  const filtered = articles.filter(
    (a) => activeCategory === 'all' || a.category === activeCategory,
  );

  const selectedArticle = selectedArticleId
    ? articles.find((a) => a.id === selectedArticleId) ?? null
    : null;

  const handleSelectCategory = useCallback(
    (cat: LoveGuideCategory | 'all') => {
      setActiveCategory(cat);
      setSelectedArticleId(null);
    },
    [],
  );

  const handleViewDetail = useCallback(
    (id: string) => {
      setSelectedArticleId(id);
      setReadIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        saveReadIds(next);
        return next;
      });
    },
    [],
  );

  const handleBack = useCallback(() => {
    setSelectedArticleId(null);
  }, []);

  // Detail view
  if (selectedArticle) {
    return (
      <ArticleDetail
        article={selectedArticle}
        isRead={readIds.has(selectedArticle.id)}
        onBack={handleBack}
      />
    );
  }

  // List view
  const currentCat = categories.find((c) => c.key === activeCategory);

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, letterSpacing: '-0.03em' }}>
          <BlurText text="恋爱法典" startDelay={60} className="gradient-text" style={{ fontWeight: 700, display: 'inline' }} />
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          把常见的聊天、邀约、暧昧和关系修复问题，整理成可以随时翻看的行动指南。
        </p>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleSelectCategory(cat.key)}
            style={{
              padding: '7px 16px',
              borderRadius: 999,
              fontSize: 13,
              cursor: 'pointer',
              border: activeCategory === cat.key ? 'none' : '1px solid rgba(232,116,138,0.22)',
              background:
                activeCategory === cat.key
                  ? 'linear-gradient(135deg,#E8748A,#C5956C)'
                  : 'rgba(255,245,248,0.55)',
              color: activeCategory === cat.key ? 'white' : 'var(--text-purple)',
              fontWeight: activeCategory === cat.key ? 600 : 400,
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Article count */}
      <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 16 }}>
        {currentCat?.label} · {filtered.length} 篇指南
      </div>

      {/* Article cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {filtered.map((article, i) => (
          <AnimatedCard key={article.id} delay={Math.min(i, 6) * 70}>
            <GlassCard
              hover={false}
              className="reply-card"
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => handleViewDetail(article.id)}
            >
              {/* Read badge */}
              {readIds.has(article.id) && (
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: '#4CAF50',
                    opacity: 0.8,
                  }}
                >
                  <Check size={12} /> 已读
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <IconBadge
                  emoji={categories.find((c) => c.key === article.category)?.emoji ?? '📖'}
                  size={44}
                  tone={(['rose', 'gold', 'lavender', 'mint'] as const)[i % 4]}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--pink-primary)', fontWeight: 500, marginBottom: 4 }}>
                    {categories.find((c) => c.key === article.category)?.label ?? article.category}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-rose)', lineHeight: 1.4 }}>
                    {article.title}
                  </h3>
                </div>
              </div>

              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 13,
                  color: 'var(--text-purple)',
                  lineHeight: 1.7,
                  opacity: 0.9,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {article.summary}
              </p>

              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {article.readTimeMinutes} 分钟
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background:
                      article.difficulty === '入门'
                        ? 'rgba(76,175,80,0.12)'
                        : article.difficulty === '进阶'
                          ? 'rgba(255,152,0,0.12)'
                          : 'rgba(232,116,138,0.12)',
                    color:
                      article.difficulty === '入门'
                        ? '#4CAF50'
                        : article.difficulty === '进阶'
                          ? '#FF9800'
                          : '#E8748A',
                    fontWeight: 500,
                  }}
                >
                  {article.difficulty}
                </span>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: 'rgba(249,200,213,0.3)',
                      border: '1px solid rgba(232,116,138,0.2)',
                      color: 'var(--text-rose)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </GlassCard>
          </AnimatedCard>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <BookOpen size={40} color="var(--pink-primary)" style={{ opacity: 0.3, marginBottom: 16 }} />
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-purple)', opacity: 0.6 }}>
            该分类暂无指南
          </p>
          <button
            onClick={() => handleSelectCategory('all')}
            style={{ marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--pink-primary)' }}
          >
            查看全部
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Article Detail ─────────────────────────────────────────────
function ArticleDetail({
  article,
  isRead,
  onBack,
}: {
  article: LoveGuideArticle;
  isRead: boolean;
  onBack: () => void;
}) {
  const catMeta = categories.find((c) => c.key === article.category);

  const renderContent = (text: string) => {
    const lines = text.split('\n').filter(Boolean);
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h3
            key={i}
            style={{
              margin: '24px 0 10px',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-rose)',
            }}
          >
            {line.replace('## ', '')}
          </h3>
        );
      }
      // Numbered list items
      if (/^\d+\./.test(line)) {
        return (
          <p
            key={i}
            style={{
              margin: '4px 0',
              fontSize: 14,
              color: 'var(--text-purple)',
              lineHeight: 1.8,
              paddingLeft: 8,
            }}
          >
            {line}
          </p>
        );
      }
      return (
        <p
          key={i}
          style={{
            margin: '0 0 14px',
            fontSize: 14,
            color: 'var(--text-purple)',
            lineHeight: 1.8,
          }}
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          color: 'var(--pink-primary)',
          marginBottom: 24,
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> 返回列表
      </button>

      <GlassCard hover={false}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--pink-primary)', fontWeight: 500 }}>
              {catMeta?.emoji} {catMeta?.label}
            </span>
            {isRead && (
              <span style={{ fontSize: 11, color: '#4CAF50', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Check size={12} /> 已读
              </span>
            )}
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: 'var(--text-rose)', lineHeight: 1.4 }}>
            {article.title}
          </h1>

          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
            {article.subtitle}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {article.readTimeMinutes} 分钟阅读
            </span>
            <span
              style={{
                fontSize: 12,
                padding: '3px 10px',
                borderRadius: 999,
                background:
                  article.difficulty === '入门'
                    ? 'rgba(76,175,80,0.12)'
                    : article.difficulty === '进阶'
                      ? 'rgba(255,152,0,0.12)'
                      : 'rgba(232,116,138,0.12)',
                color:
                  article.difficulty === '入门'
                    ? '#4CAF50'
                    : article.difficulty === '进阶'
                      ? '#FF9800'
                      : '#E8748A',
                fontWeight: 500,
              }}
            >
              {article.difficulty}
            </span>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {article.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'rgba(249,200,213,0.3)',
                  border: '1px solid rgba(232,116,138,0.2)',
                  color: 'var(--text-rose)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(232,116,138,0.15)', marginBottom: 24 }} />

        {/* Content */}
        <div>{renderContent(article.content)}</div>
      </GlassCard>
    </div>
  );
}
