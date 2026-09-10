import type { CuratedZhihuArticle, ZhihuCategory } from '@/types';

export const zhihuCategories: ReadonlyArray<{
  key: ZhihuCategory;
  label: string;
  description: string;
}> = [
  { key: 'science', label: '关系科普', description: '理解安全感、依恋与亲密关系的基本机制。' },
  { key: 'communication', label: '沟通方法', description: '练习倾听、表达感受与讨论分歧。' },
  { key: 'action', label: '行动练习', description: '把想法变成可尝试的对话和相处行动。' },
  { key: 'realQuestion', label: '真实困惑', description: '从常见关系困境中寻找可验证的下一步。' },
  { key: 'repair', label: '冲突修复', description: '争吵后先稳定情绪，再讨论修复。' },
  { key: 'boundaries', label: '尊重边界', description: '在亲密里保留选择权，明确同意与拒绝。' },
  { key: 'interestConnection', label: '共同兴趣', description: '用轻量、双方都愿意的体验增加了解。' },
];

export const curatedZhihuArticles: readonly CuratedZhihuArticle[] = [
  {
    id: 'science-positive-relationship', zhihuContentId: '-2441039070687403648', category: 'science',
    title: '如何理解「人真正需要的是正向的亲密关系」?', summary: '从安全、支持与冲突后的修复角度讨论何为正向亲密关系。', contentType: 'Answer', authorName: '墨苍离', voteUpCount: 521, commentCount: 20,
    url: 'https://www.zhihu.com/question/2009798910969929929/answer/2011157571411673627?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['安全感', '亲密关系'], lumiReason: '适合先建立健康关系的判断框架。阅读时可记录哪些行为让你感到被尊重和支持。', stages: ['observing', 'warming', 'ambiguous'],
  },
  {
    id: 'science-security-source', zhihuContentId: '-7357154881141726534', category: 'science',
    title: '亲密关系中的安全感，主要应该由伴侣提供，还是由自己建立？', summary: '讨论安全感如何在自我调节和被他人回应之间逐步形成。', contentType: 'Answer', authorName: 'Syeri', voteUpCount: 91, commentCount: 5,
    url: 'https://www.zhihu.com/question/2072666413685379345/answer/2074190017409311999?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['安全感', '自我调节'], lumiReason: '帮助用户避免把安全感完全交给对方，也不否认支持关系的价值。', stages: ['warming', 'ambiguous', 'relationship'],
  },
  {
    id: 'science-emotion-is-not-chat', zhihuContentId: '-3919544515463622401', category: 'science',
    title: '情感交流不仅是聊天', summary: '把情感交流放回共同体验、理解需要和持续回应的关系语境中。', contentType: 'Article', authorName: '知乎用户（接口未提供）', voteUpCount: 32, commentCount: 10,
    url: 'https://zhuanlan.zhihu.com/p/91777462?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['情感交流', '共同体验'], lumiReason: '适合把“聊得多”与“被理解”区分开，寻找更有质量的连接方式。', stages: ['observing', 'warming', 'ambiguous'],
  },
  {
    id: 'communication-how-to-talk', zhihuContentId: '-5983392246032215498', category: 'communication',
    title: '情侣之间该怎么交流？', summary: '围绕情侣日常交流提出具体而可讨论的关系问题。', contentType: 'Answer', authorName: '简单心理', voteUpCount: 32, commentCount: 0,
    url: 'https://www.zhihu.com/question/21157476/answer/3288164407?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['情侣沟通', '表达'], lumiReason: '适合在沟通卡住时作为讨论入口，而不是替代双方直接表达。', stages: ['warming', 'ambiguous', 'relationship'],
  },
  {
    id: 'communication-no-lecturing', zhihuContentId: '945739326879922876', category: 'communication',
    title: '情侣沟通的时候，如何显得不是在说教？', summary: '聚焦如何减少居高临下的表达，保留对话的平等感。', contentType: 'Answer', authorName: '远叔', voteUpCount: 537, commentCount: 36,
    url: 'https://www.zhihu.com/question/26064188/answer/2027562747991275247?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['平等沟通', '倾听'], lumiReason: '适合练习先说感受和需要，再邀请对方回应，减少把交流变成指导。', stages: ['warming', 'ambiguous', 'relationship'],
  },
  {
    id: 'communication-conflict-pace', zhihuContentId: '2269620794391919720', category: 'communication',
    title: '情侣间面对矛盾时，一方习惯冷静后处理，一方希望当下热处理，怎样才是情侣吵架的有效沟通方式？', summary: '讨论双方对冲突处理节奏不同的时候，如何协商出可接受的方式。', contentType: 'Answer', authorName: '知乎用户（接口未提供）', voteUpCount: 25, commentCount: 3,
    url: 'https://www.zhihu.com/question/531168889/answer/2808892325?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['冲突节奏', '协商'], lumiReason: '适合把“立刻谈”或“先暂停”从对错题，转成双方可以协商的安排。', stages: ['ambiguous', 'relationship'],
  },
  {
    id: 'action-effective-conversation', zhihuContentId: '-4162016209695888366', category: 'action',
    title: '谈恋爱的时候，怎么有效交流啊？', summary: '以恋爱中的实际交流难题为入口，提供可尝试的沟通方向。', contentType: 'Answer', authorName: '银子心理有颗树', voteUpCount: 39, commentCount: 8,
    url: 'https://www.zhihu.com/question/520759290/answer/2764136850?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['沟通练习', '关系行动'], lumiReason: '适合读完后只挑一个小动作练习，例如把猜测改成一个具体问题。', stages: ['warming', 'ambiguous', 'relationship'],
  },
  {
    id: 'action-deep-conversation-topics', zhihuContentId: '7936734731034050273', category: 'action',
    title: '情侣深度沟通的30个话题', summary: '提供一组可用于深入了解彼此价值观和生活期待的话题线索。', contentType: 'Article', authorName: 'Ning', voteUpCount: 239, commentCount: 2,
    url: 'https://zhuanlan.zhihu.com/p/521928231?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['深度沟通', '话题'], lumiReason: '适合双方自愿挑选一个话题慢慢聊，不把清单当成审问或关系测试。', stages: ['warming', 'ambiguous', 'relationship'],
  },
  {
    id: 'action-shared-topics', zhihuContentId: '-1614829452802971511', category: 'action',
    title: '情侣之间聊什么话题能增进感情？', summary: '围绕日常话题与彼此了解，提供促进交流的切入点。', contentType: 'Answer', authorName: '言溪', voteUpCount: 7712, commentCount: 317,
    url: 'https://www.zhihu.com/question/292755353/answer/2629193770?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['聊天话题', '了解彼此'], lumiReason: '适合在无话可说时做轻量启发，优先选择双方都愿意分享的话题。', stages: ['observing', 'warming', 'ambiguous'],
  },
  {
    id: 'real-question-sudden-distance', zhihuContentId: '2928702900467978111', category: 'realQuestion',
    title: '男友莫名其妙突然冷淡怎么办？', summary: '从关系中感到对方疏远这一常见困惑出发，呈现不同的应对视角。', contentType: 'Answer', authorName: '傅一', voteUpCount: 525, commentCount: 36,
    url: 'https://www.zhihu.com/question/365305112/answer/969810988?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['冷淡', '关系困惑'], lumiReason: '适合先分开事实与猜测，再决定是否进行一次平静、明确的沟通。', stages: ['ambiguous', 'relationship'],
  },
  {
    id: 'real-question-long-distance-distance', zhihuContentId: '-5281429647688216297', category: 'realQuestion',
    title: '异地恋而且女生越来越冷淡男生应该如何处理？', summary: '围绕异地关系中互动减少的困惑，呈现可供反思的真实情境。', contentType: 'Answer', authorName: '远叔', voteUpCount: 268, commentCount: 58,
    url: 'https://www.zhihu.com/question/322070772/answer/970511392?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['异地恋', '互动减少'], lumiReason: '适合观察双方是否仍有稳定投入，避免用追问或施压替代了解真实状况。', stages: ['warming', 'ambiguous', 'relationship'],
  },
  {
    id: 'real-question-cold-repair', zhihuContentId: '3677450504997857289', category: 'realQuestion',
    title: '第19期：当关系出现裂缝——冷淡期的诊断与修复', summary: '把冷淡期作为需要理解和沟通的关系变化，而非单一结论。', contentType: 'Article', authorName: '墨苍离', voteUpCount: 45, commentCount: 4,
    url: 'https://zhuanlan.zhihu.com/p/2040493074409902710?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['冷淡期', '修复'], lumiReason: '适合梳理互动变化的原因，并把修复建立在双方愿意参与的前提上。', stages: ['ambiguous', 'relationship'],
  },
  {
    id: 'repair-cooling-down', zhihuContentId: '-8980819617957342755', category: 'repair',
    title: '恋人在争吵的冷静期间，适合做些什么？', summary: '讨论冲突后暂停期间，如何避免继续升级并为后续对话做准备。', contentType: 'Answer', authorName: '温柔半仙儿', voteUpCount: 247, commentCount: 55,
    url: 'https://www.zhihu.com/question/64061457/answer/221641703?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['争吵', '冷静期'], lumiReason: '适合在情绪高点先暂停，把“冷静”约定为会回来继续谈，而不是惩罚对方。', stages: ['ambiguous', 'relationship'],
  },
  {
    id: 'repair-sincere-apology', zhihuContentId: '2613036078400365688', category: 'repair',
    title: '如何诚恳地跟女朋友道歉？', summary: '以道歉的真诚、具体与后续行动为主题，讨论冲突后的修复。', contentType: 'Answer', authorName: '门德尔松', voteUpCount: 182, commentCount: 19,
    url: 'https://www.zhihu.com/question/24317400/answer/1569420638?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['道歉', '修复'], lumiReason: '适合把道歉从“尽快翻篇”改成承认影响、尊重对方感受并讨论下一次怎么做。', stages: ['ambiguous', 'relationship'],
  },
  {
    id: 'repair-after-argument', zhihuContentId: '-4593962774889936159', category: 'repair',
    title: '和对象吵架了，你们一般都是怎么处理的？', summary: '汇集伴侣冲突后的真实处理方式，便于比较不同修复路径。', contentType: 'Answer', authorName: '稳稳', voteUpCount: 96, commentCount: 19,
    url: 'https://www.zhihu.com/question/13614182162/answer/1932933623058784302?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['争吵处理', '修复'], lumiReason: '适合从多种经验中挑选尊重彼此、可实际执行的修复方式，而不照搬任何模板。', stages: ['ambiguous', 'relationship'],
  },
  {
    id: 'boundaries-adult-relationship', zhihuContentId: '-1963213568534296917', category: 'boundaries',
    title: '成年人谈恋爱的边界感有多重？', summary: '讨论成年人在恋爱中如何保留责任、尊重与个人空间。', contentType: 'Answer', authorName: '简单心理Uni', voteUpCount: 204, commentCount: 3,
    url: 'https://www.zhihu.com/question/530279782/answer/2460280486?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['边界感', '尊重'], lumiReason: '适合把边界理解为让双方都安心的约定，而不是冷漠或控制。', stages: ['observing', 'warming', 'ambiguous', 'relationship'],
  },
  {
    id: 'boundaries-versus-distance', zhihuContentId: '-9091623784785717968', category: 'boundaries',
    title: '亲密关系中的「边界感」和「疏离感」，真正的分界点在哪里？', summary: '比较健康边界与回避疏离的差别，帮助理解亲密中的空间感。', contentType: 'Answer', authorName: '泽乙', voteUpCount: 112, commentCount: 4,
    url: 'https://www.zhihu.com/question/2072666413693773438/answer/2074166690540152695?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['边界', '个人空间'], lumiReason: '适合在需要独处或调整节奏时，练习清楚表达而不是让对方猜测。', stages: ['warming', 'ambiguous', 'relationship'],
  },
  {
    id: 'boundaries-respect', zhihuContentId: '2218687247374097710', category: 'boundaries',
    title: '亲密关系中的「边界感」和「疏离感」，真正的分界点在哪里？', summary: '从另一种回答视角讨论干涉、尊重与关系距离的平衡。', contentType: 'Answer', authorName: '冷贰', voteUpCount: 53, commentCount: 32,
    url: 'https://www.zhihu.com/question/2072666413693773438/answer/2076584725787960090?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['边界', '相互尊重'], lumiReason: '适合把“我不舒服”转成可被理解的具体边界，并始终接受对方的拒绝。', stages: ['warming', 'ambiguous', 'relationship'],
  },
  {
    id: 'interest-date-ideas', zhihuContentId: '-112858853101551276', category: 'interestConnection',
    title: '约会都可以干什么？情侣可以一起做的100件事情！', summary: '提供多种共同体验的灵感，供双方按兴趣和舒适度选择。', contentType: 'Article', authorName: '遇到曦语', voteUpCount: 6550, commentCount: 142,
    url: 'https://zhuanlan.zhihu.com/p/441872758?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['约会', '共同体验'], lumiReason: '适合把“做什么”变成共同选择；优先低压力、可拒绝且双方都感兴趣的活动。', stages: ['observing', 'warming', 'ambiguous'],
  },
  {
    id: 'interest-beyond-dates', zhihuContentId: '4664243765139434295', category: 'interestConnection',
    title: '情侣除了约会还能一起做的事？', summary: '从运动、休闲与居家活动中提供共同兴趣的方向。', contentType: 'Article', authorName: '北熊', voteUpCount: 62, commentCount: 4,
    url: 'https://zhuanlan.zhihu.com/p/414273294?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['共同兴趣', '相处'], lumiReason: '适合从活动中观察双方节奏与偏好，而不是把共同爱好当作关系进展的交换条件。', stages: ['observing', 'warming', 'ambiguous'],
  },
  {
    id: 'interest-shared-hobby', zhihuContentId: '-5975880948632013034', category: 'interestConnection',
    title: '和女朋友培养什么共同兴趣好？正经一点？', summary: '围绕共同兴趣的选择和长期相处，提供讨论素材。', contentType: 'Answer', authorName: '戴宁慧', voteUpCount: 121, commentCount: 39,
    url: 'https://www.zhihu.com/question/263518984/answer/306886769?utm_medium=openapi_platform&utm_source=cf621feb3f2d', tags: ['共同兴趣', '长期相处'], lumiReason: '适合从各自已有的兴趣出发，邀请而非要求对方参与，保留不同爱好的空间。', stages: ['observing', 'warming', 'ambiguous', 'relationship'],
  },
];
