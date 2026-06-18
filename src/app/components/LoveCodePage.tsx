import { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { GlassCard } from './GlassUI';
import { IconBadge } from './IconBadge';
import { BlurText } from './BlurText';
import { AnimatedCard } from './AnimatedCard';

const categories = ['全部', '聊天原则', '女生视角', '邀约原则', '道歉原则', '冲突修复', '边界意识', '暧昧推进', '恋爱维护'];

const articles = [
  {
    title: '对方说"不想要"时，优先尊重明确表达',
    desc: '不要把拒绝当作测试。可以温和确认一次，但不能强行推进。拒绝是清晰的边界信号，尊重它，才能建立真正的信任。',
    tags: ['边界感', '尊重', '低压力沟通'],
    category: '边界意识',
    emoji: '🛡️',
  },
  {
    title: '聊天冷场不等于失去兴趣',
    desc: '冷场很常见，不是结束的信号。可以换个话题，或者主动暂停聊天，给彼此空间。冷场后自然重新接上，往往比强撑话题更自然。',
    tags: ['冷场处理', '节奏控制', '不焦虑'],
    category: '聊天原则',
    emoji: '💬',
  },
  {
    title: '邀约要具体，选项要简单',
    desc: '不要说"有空一起出来玩？"，而是"周六下午有空吗？我们去那家奶茶店？"——给出时间、地点、人数，降低对方的决策成本。',
    tags: ['邀约技巧', '低压力', '具体化'],
    category: '邀约原则',
    emoji: '☕',
  },
  {
    title: '道歉时，先承认感受，再解释原因',
    desc: '很多道歉失败，是因为先解释再道歉——这让对方感觉你在找借口。正确顺序是：先说"我知道这让你不舒服"，再说发生了什么。',
    tags: ['道歉方式', '情绪优先', '修复关系'],
    category: '道歉原则',
    emoji: '🙏',
  },
  {
    title: '她回复慢，可能只是在忙',
    desc: '不要在消息没收到回复时连续发送。等待是一种尊重。如果你实在放不下，去做一件让自己专注的事，而不是盯着对话框。',
    tags: ['回复节奏', '不催促', '自我调节'],
    category: '聊天原则',
    emoji: '⏳',
  },
  {
    title: '暧昧期推进，要用行动而非表白',
    desc: '暧昧期最有效的推进方式不是表白，而是创造共同经历。一次见面、一起做的事，比一千条消息更有分量。',
    tags: ['暧昧推进', '线下见面', '共同经历'],
    category: '暧昧推进',
    emoji: '🌱',
  },
  {
    title: '从女生视角看"已读不回"',
    desc: '"已读不回"的原因很多：在忙、不知道怎么回、需要时间思考、或者对这个话题没感觉。不等于冷淡，不等于不喜欢你。',
    tags: ['女生视角', '不过度解读', '冷静分析'],
    category: '女生视角',
    emoji: '👁️',
  },
  {
    title: '吵架后修复：等情绪平复再联系',
    desc: '争吵后立刻道歉或解释，往往效果不好——对方情绪还没平复，很难接收。等 1-2 小时，再用温和的方式重新建立接触。',
    tags: ['冲突修复', '情绪冷却', '时机选择'],
    category: '冲突修复',
    emoji: '🌊',
  },
  {
    title: '恋爱期：日常陪伴比仪式感更重要',
    desc: '恋爱稳定期，每天的细心关注比偶尔的大日子更有价值。问"今天好吗"、记住她说过的小事，比突然的大礼物更让人感动。',
    tags: ['恋爱维护', '日常陪伴', '细节关心'],
    category: '恋爱维护',
    emoji: '❤️',
  },
  {
    title: '不要用沉默惩罚对方',
    desc: '当感到不满时，用沉默让对方猜测和焦虑，是一种被动攻击。直接说出你的感受（"我有点不开心"），比沉默更健康、更有效。',
    tags: ['健康沟通', '直接表达', '不被动攻击'],
    category: '聊天原则',
    emoji: '🗣️',
  },
  {
    title: '她分享生活，是在邀请你进入她的世界',
    desc: '当她主动分享日常，是在降低边界。最好的回应是真诚的好奇，而不是评价或建议——问"那你喜欢吗"比"你应该..."好得多。',
    tags: ['女生视角', '倾听', '好奇心'],
    category: '女生视角',
    emoji: '🌸',
  },
  {
    title: '边界感不是冷漠，是尊重的起点',
    desc: '有边界感的人，会在对方说"我今天不想聊"时说"好的，去休息吧"，而不是追问原因。这种尊重，是建立安全感的基础。',
    tags: ['边界意识', '尊重', '安全感'],
    category: '边界意识',
    emoji: '🤝',
  },
];

export function LoveCodePage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = articles.filter(a => {
    const matchCategory = activeCategory === '全部' || a.category === activeCategory;
    const matchSearch = !searchQuery || a.title.includes(searchQuery) || a.desc.includes(searchQuery) || a.tags.some(t => t.includes(searchQuery));
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }} className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, letterSpacing: '-0.03em' }}><BlurText text="恋爱法典" startDelay={60} className="gradient-text" style={{ fontWeight: 700, display: 'inline' }} /></h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          健康恋爱沟通原则与场景指南 · 不是套路，是真诚的基础
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-purple)', opacity: 0.5 }} />
        <input
          className="glass-input"
          placeholder="搜索原则、场景或关键词..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ borderRadius: 999, padding: '12px 16px 12px 42px', fontSize: 14, color: 'var(--text-rose)', width: '100%' }}
        />
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '7px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
              border: activeCategory === cat ? 'none' : '1px solid rgba(232,116,138,0.22)',
              background: activeCategory === cat ? 'linear-gradient(135deg,#E8748A,#C5956C)' : 'rgba(255,245,248,0.55)',
              color: activeCategory === cat ? 'white' : 'var(--text-purple)',
              fontWeight: activeCategory === cat ? 600 : 400,
              transition: 'all 0.15s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Article count */}
      <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.6, marginBottom: 16 }}>
        共 {filtered.length} 条原则
      </div>

      {/* Articles grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {filtered.map((article, i) => (
          <AnimatedCard key={i} delay={Math.min(i, 6) * 70}>
            <GlassCard hover={false} className="reply-card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <IconBadge
                emoji={article.emoji}
                size={44}
                tone={(['rose', 'gold', 'lavender', 'mint'] as const)[i % 4]}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--pink-primary)', fontWeight: 500, marginBottom: 4 }}>{article.category}</div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-rose)', lineHeight: 1.4 }}>
                  {article.title}
                </h3>
              </div>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7, opacity: 0.9 }}>
              {article.desc}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {article.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 999,
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

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <BookOpen size={40} color="var(--pink-primary)" style={{ opacity: 0.3, marginBottom: 16 }} />
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-purple)', opacity: 0.6 }}>
            没有找到相关原则
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('全部'); }}
            style={{ marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--pink-primary)' }}
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}
