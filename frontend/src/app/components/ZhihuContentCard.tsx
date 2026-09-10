import { ExternalLink, MessageCircle, Sparkles, ThumbsUp } from 'lucide-react';
import type { CuratedZhihuArticle, ZhihuSearchItem } from '@/types';

type ZhihuContent = CuratedZhihuArticle | ZhihuSearchItem;
const LIVE_EXCERPT_MAX_LENGTH = 220;

function isCuratedArticle(item: ZhihuContent): item is CuratedZhihuArticle {
  return 'lumiReason' in item;
}

function toLiveExcerpt(contentText: string): string {
  const normalized = contentText.replace(/\s+/g, ' ').trim();
  if (!normalized) return '知乎公开讨论内容，点击可阅读完整原文。';
  return normalized.length > LIVE_EXCERPT_MAX_LENGTH
    ? `${normalized.slice(0, LIVE_EXCERPT_MAX_LENGTH).trimEnd()}…`
    : normalized;
}

export function ZhihuContentCard({ item }: { item: ZhihuContent }) {
  const curated = isCuratedArticle(item);
  const summary = curated ? item.summary : toLiveExcerpt(item.contentText);

  return (
    <article style={{ border: '1px solid rgba(232,116,138,0.18)', borderRadius: 16, padding: 18, background: 'rgba(255,255,255,0.56)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <span style={{ color: 'var(--pink-primary)', fontSize: 12, fontWeight: 600 }}>来自知乎 · {item.contentType}</span>
        <span style={{ color: 'var(--text-purple)', fontSize: 12, opacity: 0.65 }}>{item.authorName || '知乎用户'}</span>
      </div>
      <h3 style={{ margin: '0 0 8px', color: 'var(--text-rose)', fontSize: 16, lineHeight: 1.45 }}>{item.title}</h3>
      <p style={{ margin: '0 0 12px', color: 'var(--text-purple)', fontSize: 13, lineHeight: 1.7, opacity: 0.88 }}>{summary}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: 'var(--text-purple)', fontSize: 12, opacity: 0.72 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ThumbsUp size={13} />{item.voteUpCount}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MessageCircle size={13} />{item.commentCount}</span>
      </div>
      {curated && (
        <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 12, background: 'rgba(249,200,213,0.25)', color: 'var(--text-purple)', fontSize: 12, lineHeight: 1.65 }}>
          <strong style={{ color: 'var(--text-rose)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Sparkles size={13} />Lumi 推荐理由</strong>
          <div style={{ marginTop: 4 }}>{item.lumiReason}</div>
        </div>
      )}
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`在知乎阅读：${item.title}`}
        style={{ marginTop: 16, color: 'var(--pink-primary)', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        去知乎阅读完整讨论 <ExternalLink size={14} />
      </a>
    </article>
  );
}
