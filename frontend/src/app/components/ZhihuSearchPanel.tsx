import { useState } from 'react';
import { Search } from 'lucide-react';
import { searchZhihu } from '@/lib/zhihu/client';
import type { ZhihuSearchData } from '@/types';
import { ZhihuContentCard } from './ZhihuContentCard';

const HOT_QUERIES = ['爱情与交流', '情侣有效沟通', '对方冷淡怎么办', '恋爱边界'];

export function ZhihuSearchPanel({ search = searchZhihu }: { search?: (input: { query: string; count?: number }) => Promise<ZhihuSearchData> }) {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<ZhihuSearchData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (requestedQuery = query) => {
    const keyword = requestedQuery.trim();
    if (!keyword) return;
    setQuery(keyword);
    setLoading(true);
    setError(null);
    try {
      setData(await search({ query: keyword, count: 6 }));
    } catch (cause) {
      setData(null);
      setError(cause instanceof Error ? cause.message : '知乎内容请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-label="知乎实时搜索" className="zhihu-search-panel">
      <form onSubmit={(event) => { event.preventDefault(); void submit(); }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <label style={{ flex: '1 1 260px', position: 'relative' }}>
          <span className="sr-only">搜索知乎内容</span>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-purple)', opacity: 0.45 }} />
          <input aria-label="搜索知乎内容" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：爱情与交流" style={{ width: '100%', height: 44, borderRadius: 999, border: '1px solid rgba(232,116,138,0.2)', background: 'rgba(255,255,255,0.55)', padding: '0 16px 0 42px', color: 'var(--text-rose)', outline: 'none' }} />
        </label>
        <button type="submit" disabled={loading || !query.trim()} style={{ border: 'none', borderRadius: 999, padding: '0 20px', minHeight: 44, cursor: loading ? 'wait' : 'pointer', background: 'linear-gradient(135deg,#E8748A,#C5956C)', color: 'white', fontWeight: 600, opacity: loading || !query.trim() ? 0.6 : 1 }}>
          {loading ? '搜索中...' : '搜索'}
        </button>
      </form>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {HOT_QUERIES.map((hotQuery) => <button key={hotQuery} type="button" onClick={() => void submit(hotQuery)} style={{ border: '1px solid rgba(232,116,138,0.2)', borderRadius: 999, padding: '6px 11px', background: 'rgba(255,245,248,0.55)', color: 'var(--text-purple)', cursor: 'pointer', fontSize: 12 }}>{hotQuery}</button>)}
      </div>
      {loading && <div aria-label="正在加载知乎内容" style={{ display: 'grid', gap: 12, marginTop: 18 }}>{[0, 1, 2].map((index) => <div key={index} style={{ height: 128, borderRadius: 16, background: 'rgba(232,116,138,0.09)' }} />)}</div>}
      {error && <div role="alert" style={{ marginTop: 18, padding: 14, borderRadius: 14, background: 'rgba(201,106,106,0.1)', color: '#A64E58', fontSize: 13 }}>{error}<button type="button" onClick={() => void submit()} style={{ marginLeft: 10, border: 'none', background: 'none', color: 'var(--pink-primary)', cursor: 'pointer', fontWeight: 600 }}>重试</button></div>}
      {data && !loading && data.items.length === 0 && <p style={{ marginTop: 20, color: 'var(--text-purple)', fontSize: 14 }}>没有找到结果，试试换一个更具体的问题</p>}
      {data && !loading && data.items.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 18 }}>{data.items.map((item) => <ZhihuContentCard key={item.contentId} item={item} />)}</div>}
    </section>
  );
}
