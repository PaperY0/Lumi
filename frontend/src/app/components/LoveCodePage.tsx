import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  ArrowLeft,
  Check,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Search,
} from 'lucide-react';
import { GlassCard, LiquidButton } from './GlassUI';
import { IconBadge } from './IconBadge';
import { AnimatedCard } from './AnimatedCard';
import { articles as defaultArticles, categories } from '@/data/loveGuideArticles';
import { girlProfileRepository, loveGuideRepository, userProfileRepository } from '@/lib/db/repositories';
import { filterLoveGuideArticlesByStage } from '@/lib/loveGuideStage';
import { getRelationshipStageLabel, getRelationshipStageValue, relationshipStageOptions, type RelationshipStageValue } from '@/lib/relationshipStage';
import type { CustomLoveGuideArticle, LoveGuideArticle, LoveGuideCategory } from '@/types/loveGuide';

const READ_KEY = 'lumi_love_guide_read_article_ids';

type ArticleSource = 'default' | 'custom';
type ManagedArticle = LoveGuideArticle & {
  source: ArticleSource;
  createdAt?: string;
  updatedAt?: string;
};

interface ArticleFormState {
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  category: LoveGuideCategory;
  tagsText: string;
  readTimeMinutes: string;
  difficulty: LoveGuideArticle['difficulty'];
  stage: RelationshipStageValue;
}

const emptyForm: ArticleFormState = {
  title: '',
  subtitle: '',
  summary: '',
  content: '',
  category: 'chat',
  tagsText: '',
  readTimeMinutes: '3',
  difficulty: '入门',
  stage: 'pursuing',
};

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

function articleToForm(article: ManagedArticle, currentStage: RelationshipStageValue): ArticleFormState {
  return {
    title: article.title,
    subtitle: article.subtitle,
    summary: article.summary,
    content: article.content,
    category: article.category,
    tagsText: article.tags.join('、'),
    readTimeMinutes: String(article.readTimeMinutes),
    difficulty: article.difficulty,
    stage: article.stage ?? currentStage,
  };
}

function parseTags(input: string): string[] {
  return input
    .split(/[,，、\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function LoveCodePage() {
  const [activeCategory, setActiveCategory] = useState<LoveGuideCategory | 'all'>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);
  const [customArticles, setCustomArticles] = useState<CustomLoveGuideArticle[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(true);
  const [query, setQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ManagedArticle | null>(null);
  const [form, setForm] = useState<ArticleFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<RelationshipStageValue>('pursuing');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const user = await userProfileRepository.getCurrent();
      if (!user) return;
      const girl = (await girlProfileRepository.getByUserId(user.id))[0];
      if (!girl || cancelled) return;
      const label = getRelationshipStageLabel(girl);
      setCurrentStage(getRelationshipStageValue(label));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadCustomArticles = useCallback(async () => {
    setLoadingCustom(true);
    try {
      setCustomArticles(await loveGuideRepository.listCustomArticles());
    } finally {
      setLoadingCustom(false);
    }
  }, []);

  useEffect(() => {
    loadCustomArticles();
  }, [loadCustomArticles]);

  const allArticles = useMemo<ManagedArticle[]>(() => {
    const builtIn = defaultArticles.map((article) => ({ ...article, source: 'default' as const }));
    return [...customArticles, ...builtIn];
  }, [customArticles]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return filterLoveGuideArticlesByStage(allArticles, currentStage).filter((article) => {
      const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
      if (!matchesCategory) return false;
      if (!keyword) return true;
      return [
        article.title,
        article.subtitle,
        article.summary,
        article.content,
        article.tags.join(' '),
      ].some((text) => text.toLowerCase().includes(keyword));
    });
  }, [activeCategory, allArticles, currentStage, query]);

  const selectedArticle = selectedArticleId
    ? allArticles.find((a) => a.id === selectedArticleId) ?? null
    : null;

  const handleSelectCategory = useCallback((cat: LoveGuideCategory | 'all') => {
    setActiveCategory(cat);
    setSelectedArticleId(null);
  }, []);

  const handleViewDetail = useCallback((id: string) => {
    setSelectedArticleId(id);
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const handleCreate = useCallback(() => {
    setEditingArticle(null);
    setForm({ ...emptyForm, stage: currentStage });
    setFormError(null);
    setIsFormOpen(true);
  }, [currentStage]);

  const handleEdit = useCallback((article: ManagedArticle) => {
    if (article.source !== 'custom') return;
    setEditingArticle(article);
    setForm(articleToForm(article, currentStage));
    setFormError(null);
    setIsFormOpen(true);
    setSelectedArticleId(null);
  }, [currentStage]);

  const handleDelete = useCallback(async (article: ManagedArticle) => {
    if (article.source !== 'custom') return;
    if (!window.confirm(`确定删除《${article.title}》吗？`)) return;
    await loveGuideRepository.remove(article.id);
    setReadIds((prev) => {
      if (!prev.has(article.id)) return prev;
      const next = new Set(prev);
      next.delete(article.id);
      saveReadIds(next);
      return next;
    });
    setSelectedArticleId(null);
    await loadCustomArticles();
  }, [loadCustomArticles]);

  const handleSave = useCallback(async () => {
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) {
      setFormError('标题和正文不能为空');
      return;
    }

    const now = new Date().toISOString();
    const readTime = Number.parseInt(form.readTimeMinutes, 10);
    const article: CustomLoveGuideArticle = {
      id: editingArticle?.id ?? `love-guide-${crypto.randomUUID()}`,
      source: 'custom',
      title,
      subtitle: form.subtitle.trim() || '本地自定义内容',
      summary: form.summary.trim() || content.slice(0, 90),
      content,
      category: form.category,
      tags: parseTags(form.tagsText),
      readTimeMinutes: Number.isFinite(readTime) && readTime > 0 ? readTime : 3,
      difficulty: form.difficulty,
      stage: form.stage,
      createdAt: editingArticle?.createdAt ?? now,
      updatedAt: now,
    };

    await loveGuideRepository.save(article);
    setIsFormOpen(false);
    setEditingArticle(null);
    setForm(emptyForm);
    setFormError(null);
    await loadCustomArticles();
  }, [editingArticle, form, loadCustomArticles]);

  if (selectedArticle) {
    return (
      <ArticleDetail
        article={selectedArticle}
        isRead={readIds.has(selectedArticle.id)}
        onBack={() => setSelectedArticleId(null)}
        onEdit={selectedArticle.source === 'custom' ? () => handleEdit(selectedArticle) : undefined}
        onDelete={selectedArticle.source === 'custom' ? () => handleDelete(selectedArticle) : undefined}
      />
    );
  }

  const currentCat = categories.find((c) => c.key === activeCategory);
  const customCount = customArticles.length;

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }} className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, letterSpacing: '-0.03em' }}>
            恋爱法典
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
            常见沟通场景、关系推进和本地自定义笔记。
          </p>
        </div>

        <LiquidButton
          onClick={handleCreate}
          style={{ minWidth: 132, justifyContent: 'center' }}
        >
          <Plus size={16} />
          新增文章
        </LiquidButton>
      </div>

      <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 16, border: '1px solid rgba(232,116,138,0.18)', background: 'rgba(255,245,248,0.5)', color: 'var(--text-purple)', fontSize: 13 }}>
        当前法典：<strong style={{ color: 'var(--pink-primary)' }}>{getRelationshipStageLabel({ currentStage, currentStageLabel: undefined })}</strong>。阶段专属文章会随资料页中的关系阶段自动切换，旧文章仍作为通用指南保留。
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) auto', gap: 12, marginBottom: 18 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-purple)', opacity: 0.45 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题、标签或正文"
            style={{
              width: '100%',
              height: 44,
              borderRadius: 999,
              border: '1px solid rgba(232,116,138,0.2)',
              background: 'rgba(255,255,255,0.55)',
              padding: '0 16px 0 42px',
              color: 'var(--text-rose)',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ alignSelf: 'center', fontSize: 13, color: 'var(--text-purple)', opacity: 0.7 }}>
          自定义 {customCount} 篇
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
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

      <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 16 }}>
        {loadingCustom ? '正在读取本地文章...' : `${currentCat?.label} · ${filtered.length} 篇指南`}
      </div>

      {isFormOpen && (
        <ArticleEditor
          form={form}
          error={formError}
          editing={!!editingArticle}
          onChange={setForm}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingArticle(null);
            setFormError(null);
          }}
          onSave={handleSave}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((article, i) => (
          <AnimatedCard key={article.id} delay={Math.min(i, 6) * 70}>
            <GlassCard
              hover={false}
              className="reply-card"
              style={{ cursor: 'pointer', position: 'relative', height: '100%' }}
              onClick={() => handleViewDetail(article.id)}
            >
              <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                {article.source === 'custom' && (
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: 'rgba(212,165,201,0.18)', color: 'var(--text-purple)' }}>
                    自定义
                  </span>
                )}
                {readIds.has(article.id) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#4CAF50', opacity: 0.85 }}>
                    <Check size={12} /> 已读
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 12, paddingRight: article.source === 'custom' ? 92 : 54 }}>
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

              <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7, opacity: 0.9 }}>
                {article.summary}
              </p>

              <ArticleMeta article={article} />

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {article.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(249,200,213,0.3)', border: '1px solid rgba(232,116,138,0.2)', color: 'var(--text-rose)' }}>
                    {tag}
                  </span>
                ))}
              </div>

              {article.source === 'custom' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <LiquidButton
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(article);
                    }}
                    style={{ flex: 1, justifyContent: 'center', minHeight: 38, padding: '8px 18px', fontSize: 13 }}
                  >
                    <Pencil size={14} />
                    编辑
                  </LiquidButton>
                  <LiquidButton
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(article);
                    }}
                    style={{ width: 42, height: 38, minHeight: 38, padding: 0, justifyContent: 'center', color: '#C96A6A' }}
                    aria-label={`删除 ${article.title}`}
                  >
                    <Trash2 size={14} />
                  </LiquidButton>
                </div>
              )}
            </GlassCard>
          </AnimatedCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <BookOpen size={40} color="var(--pink-primary)" style={{ opacity: 0.3, marginBottom: 16 }} />
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-purple)', opacity: 0.65 }}>
            没有找到匹配的文章
          </p>
        </div>
      )}
    </div>
  );
}

function ArticleEditor({
  form,
  error,
  editing,
  onChange,
  onCancel,
  onSave,
}: {
  form: ArticleFormState;
  error: string | null;
  editing: boolean;
  onChange: (next: ArticleFormState) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const categoryOptions = categories.filter((cat): cat is typeof cat & { key: LoveGuideCategory } => cat.key !== 'all');

  return (
    <GlassCard hover={false} style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 17, color: 'var(--text-rose)' }}>
          {editing ? '编辑自定义文章' : '新增自定义文章'}
        </h2>
        <LiquidButton variant="secondary" onClick={onCancel} style={{ width: 42, height: 42, minHeight: 42, padding: 0, justifyContent: 'center' }} ariaLabel="关闭编辑">
          <X size={16} />
        </LiquidButton>
      </div>

      {error && (
        <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 12, background: 'rgba(201,106,106,0.1)', color: '#C96A6A', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="标题">
          <input value={form.title} onChange={(e) => onChange({ ...form, title: e.target.value })} />
        </Field>
        <Field label="副标题">
          <input value={form.subtitle} onChange={(e) => onChange({ ...form, subtitle: e.target.value })} />
        </Field>
        <Field label="分类">
          <select value={form.category} onChange={(e) => onChange({ ...form, category: e.target.value as LoveGuideCategory })}>
            {categoryOptions.map((cat) => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </Field>
        <Field label="难度">
          <select value={form.difficulty} onChange={(e) => onChange({ ...form, difficulty: e.target.value as LoveGuideArticle['difficulty'] })}>
            <option value="入门">入门</option>
            <option value="进阶">进阶</option>
            <option value="高阶">高阶</option>
          </select>
        </Field>
        <Field label="适用阶段">
          <select value={form.stage} onChange={(e) => onChange({ ...form, stage: e.target.value as RelationshipStageValue })}>
            {relationshipStageOptions.map((stage) => (
              <option key={stage.value} value={stage.value}>{stage.label}</option>
            ))}
          </select>
        </Field>
        <Field label="标签">
          <input value={form.tagsText} onChange={(e) => onChange({ ...form, tagsText: e.target.value })} placeholder="用逗号或顿号分隔" />
        </Field>
        <Field label="阅读分钟">
          <input value={form.readTimeMinutes} onChange={(e) => onChange({ ...form, readTimeMinutes: e.target.value })} inputMode="numeric" />
        </Field>
      </div>

      <Field label="摘要">
        <textarea value={form.summary} onChange={(e) => onChange({ ...form, summary: e.target.value })} rows={3} />
      </Field>
      <Field label="正文">
        <textarea value={form.content} onChange={(e) => onChange({ ...form, content: e.target.value })} rows={8} placeholder="可用 ## 小标题 分段" />
      </Field>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
        <LiquidButton variant="secondary" onClick={onCancel} style={{ minWidth: 96, justifyContent: 'center' }}>
          取消
        </LiquidButton>
        <LiquidButton onClick={onSave} style={{ minWidth: 132, justifyContent: 'center' }}>
          <Save size={15} />
          保存文章
        </LiquidButton>
      </div>
    </GlassCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.75 }}>{label}</span>
      <div className="love-code-field">{children}</div>
    </label>
  );
}

function ArticleMeta({ article }: { article: LoveGuideArticle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, color: 'var(--text-purple)', opacity: 0.55, display: 'flex', alignItems: 'center', gap: 4 }}>
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
  );
}

function ArticleDetail({
  article,
  isRead,
  onBack,
  onEdit,
  onDelete,
}: {
  article: ManagedArticle;
  isRead: boolean;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const catMeta = categories.find((c) => c.key === article.category);

  const renderContent = (text: string) => {
    const lines = text.split('\n').filter(Boolean);
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} style={{ margin: '24px 0 10px', fontSize: 16, fontWeight: 600, color: 'var(--text-rose)' }}>
            {line.replace('## ', '')}
          </h3>
        );
      }
      return (
        <p key={i} style={{ margin: '0 0 14px', fontSize: 14, color: 'var(--text-purple)', lineHeight: 1.8 }}>
          {line}
        </p>
      );
    });
  };

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--pink-primary)', padding: 0 }}>
          <ArrowLeft size={16} /> 返回列表
        </button>
        {article.source === 'custom' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <LiquidButton variant="secondary" onClick={onEdit} style={{ minHeight: 38, padding: '8px 18px', fontSize: 13 }}>
              <Pencil size={14} />
              编辑
            </LiquidButton>
            <LiquidButton variant="secondary" onClick={onDelete} style={{ minHeight: 38, padding: '8px 18px', fontSize: 13, color: '#C96A6A' }}>
              <Trash2 size={14} />
              删除
            </LiquidButton>
          </div>
        )}
      </div>

      <GlassCard hover={false}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--pink-primary)', fontWeight: 500 }}>
              {catMeta?.emoji} {catMeta?.label}
            </span>
            {article.source === 'custom' && (
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: 'rgba(212,165,201,0.18)', color: 'var(--text-purple)' }}>
                自定义
              </span>
            )}
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

          <ArticleMeta article={article} />

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
            {article.tags.map((tag) => (
              <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(249,200,213,0.3)', border: '1px solid rgba(232,116,138,0.2)', color: 'var(--text-rose)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(232,116,138,0.15)', marginBottom: 24 }} />
        <div>{renderContent(article.content)}</div>
      </GlassCard>
    </div>
  );
}
