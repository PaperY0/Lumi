import type { LoveGuideArticle } from '@/types/loveGuide';

type StageArticleInput = Pick<LoveGuideArticle, 'id' | 'title' | 'subtitle' | 'summary' | 'category' | 'tags' | 'readTimeMinutes' | 'difficulty'> & {
  stage?: LoveGuideArticle['stage'];
  focus: string;
  situation: string;
  observe: string;
  recommendation: string;
  example: string;
  avoid: string;
  pause: string;
};

const makeArticle = (article: StageArticleInput): LoveGuideArticle => ({
  ...article,
  content: `## 适用阶段\n${article.stage === 'observing' ? '初识接触期' : article.stage === 'warming' ? '升温期' : article.stage === 'ambiguous' ? '暧昧观察期' : '通用基础'}\n\n## 你可能遇到的情况\n${article.situation}\n\n## 先观察什么\n${article.observe}\n\n## 推荐做法\n${article.recommendation}\n\n## 示例话术\n${article.example}\n\n## 不建议做什么\n${article.avoid}\n\n## 什么时候应该暂停\n${article.pause}`,
});

const common = (id: string, title: string, focus: string, situation: string, observe: string, recommendation: string, example: string, avoid: string, pause: string): StageArticleInput => ({
  id, title, subtitle: focus, summary: situation, category: 'relationship', tags: ['健康关系', '边界', '沟通'], readTimeMinutes: 4, difficulty: '入门', focus, situation, observe, recommendation, example, avoid, pause,
});

export const stageArticles: LoveGuideArticle[] = [
  makeArticle(common('foundation-refusal', '尊重拒绝，先让关系安全', '把“不”当作完整信息，而不是待破解的信号', '对方明确拒绝邀约或继续聊天，你可能想再解释一次。', '是否已经表达得足够清楚、对方是否需要空间。', '简短确认、停止推进，并把选择权交还给对方。', '“收到，谢谢你说清楚。我会尊重你的决定，之后如果你愿意再联系就好。”', '反复追问理由、讨价还价、用付出换改变。', '对方重复拒绝、表现不安或要求停止联系时。')),
  makeArticle(common('foundation-privacy', '隐私边界不是神秘', '信任来自自愿分享，而不是不断查证', '你想了解住址、行程、社交账号或过去经历。', '对方是否主动分享、是否回避或明确说不想聊。', '先征得同意，只问与当下相处真正相关的内容。', '“这个问题如果你不方便回答可以跳过，我只是想确认你是否舒服。”', '翻看设备、追问隐私、通过朋友打听。', '对方表现紧张、沉默或明确要求不要再问时。')),
  makeArticle(common('foundation-communication', '温和沟通，先理解再回应', '用具体观察和感受开场，避免把猜测当事实', '一次回复变慢就引发不安，双方开始互相指责。', '事实、感受、需要是否被区分。', '用“我注意到…我感到…”表达，再邀请对方补充。', '“我注意到这两天联系少了，我有点不确定。你现在更需要空间还是方便聊聊？”', '贴标签、逼问、冷暴力、把沉默当惩罚。', '对话持续升级、对方要求暂停或感到不安全时。')),
  makeArticle(common('foundation-danger', '识别危险信号，优先保护自己', '控制、窥探、强迫和极端嫉妒不是关心', '相处中出现监控行踪、限制社交、威胁或情绪勒索。', '行为是否反复、是否让你感到害怕和失去选择。', '记录事实、寻求可信任的人帮助，必要时保持距离。', '“我不接受被检查手机或被限制和谁来往。如果继续发生，我会暂停这段接触。”', '为危险行为找借口、独自承担、用更多付出来换安全。', '出现威胁、跟踪、强迫或人身安全风险时。')),
  ...[
    ['initial-opening', '自然开场', '用具体、轻松、可退出的话题开启联系', '你想发消息却担心打扰。', '对方是否有回应空间和主动延展。', '从共同情境切入，一次只抛一个轻问题。', '“刚看到你提过的那家店，菜单看起来不错，你最推荐哪道？”', '连续发送多个问题或复制套路。', '对方多次不回、只给结束性回复时。'],
    ['initial-distance', '礼貌距离', '在好奇和尊重之间保持分寸', '你们刚认识，想快速了解很多个人信息。', '对方的分享程度、语气和主动性。', '让分享逐步发生，不把热情变成索取。', '“如果你愿意，可以聊聊；不方便也完全没关系。”', '过早使用亲昵称呼、过度送礼、窥探隐私。', '对方退缩或明确表示不舒服时。'],
    ['initial-meeting', '第一次见面', '公共、轻量、可随时结束的安排更安心', '第一次见面不知道时间地点如何选择。', '双方是否都参与安排并感到放松。', '选择公共场所、短时活动，提前确认交通和边界。', '“周六下午去附近咖啡店坐一小时？如果你不方便，我们改天再说。”', '安排私密地点、临时增加时长、把见面当承诺。', '对方犹豫、改变主意或现场不适时。'],
    ['initial-boundary', '绅士边界', '体贴应当增加选择，而不是替对方决定', '你想表现照顾，却不确定对方是否需要。', '对方是否接受触碰、礼物和帮助。', '先询问再行动，接受拒绝不追问。', '“需要我送你到地铁站吗？不需要也没关系。”', '未经同意触碰、跟踪、强行帮忙。', '对方说“不”或身体语言明显退避时.'],
  ].map(([id, title, focus, situation, observe, recommendation, example, avoid, pause]) => makeArticle({ ...common(id, title, focus, situation, observe, recommendation, example, avoid, pause), stage: 'observing', category: 'chat', tags: ['初识接触期', '自然相处'] })),
  ...[
    ['warming-window', '邀约窗口', '在双方都有回应时增加互动', '你想邀约却不确定时机。', '对方是否主动、是否愿意安排时间。', '给具体选项并保留退路，一次邀约后等待回应。', '“这周末想去看展，你有兴趣一起吗？没空也没关系。”', '把一次积极回复当成确定喜欢、连续催促。', '对方回避、拒绝或长期不投入时。'],
    ['warming-probe', '轻度试探', '用小幅度表达观察真实回应', '你想确认彼此是否在升温。', '回应是否稳定、是否有双向提议。', '分享感受而非索要答案，接受不确定性。', '“和你聊天挺舒服的，想知道你最近也有这种感觉吗？”', '逼迫表态、用付出换承诺。', '对方明显有压力或说还没准备好时。'],
    ['warming-shared', '共同体验', '共同做事比单方面表现更能建立了解', '聊天停留在表面，互动难以延展。', '双方是否都提出想做的事并参与安排。', '选择低压力、可复盘的小活动。', '“要不要一起试试那家新店？你更想周六还是下周？”', '把活动设计成考验、过度消费。', '活动变成单方面付出或对方不再回应时。'],
    ['warming-rhythm', '回应节奏', '稳定、可预期比秒回更重要', '你因回复速度波动而焦虑。', '整体趋势和双方是否都在投入。', '保持自己的节奏，忙时提前说明，不连续追问。', '“我今晚要忙一会儿，明天再好好聊。”', '用冷处理制造嫉妒、把慢回复判定为拒绝。', '长期只剩你单方面发起时。'],
  ].map(([id, title, focus, situation, observe, recommendation, example, avoid, pause]) => makeArticle({ ...common(id, title, focus, situation, observe, recommendation, example, avoid, pause), stage: 'warming', category: 'relationship', tags: ['升温期', '双向投入'] })),
  ...[
    ['ambiguous-signals', '双向信号', '看持续行为，不猜一条消息', '你在暧昧中反复解读细节。', '主动性、时间投入和是否愿意深入交流。', '记录一段时间的互动趋势，保持自己的生活。', '“我感受到我们最近互动不错，也想听听你的感受。”', '把一次热情当确定关系、沉迷猜测。', '长期只有单方面投入时。'],
    ['ambiguous-confirm', '温和确认关系', '确认是邀请对话，不是要求立即表态', '暧昧持续很久，你希望知道方向。', '对方是否愿意讨论边界和期待。', '说明自己的感受，允许对方说不知道。', '“我喜欢和你相处，想和你聊聊我们各自期待，不急着今天决定。”', '反复确认、情绪绑架、用离开威胁。', '对方明确不想讨论或拒绝继续时。'],
    ['ambiguous-rumination', '减少内耗', '把注意力从猜测移回可行动的事实', '你频繁查看聊天记录、等待回应。', '焦虑是否影响睡眠、工作和自我评价。', '设定查看边界，投入自己的活动，必要时寻求支持。', '“我先去做自己的事，等双方都方便时再聊。”', '反复测试、发试探消息、把沉默当答案。', '内耗持续并影响日常生活时。'],
    ['ambiguous-stop-loss', '及时止损', '长期单方面投入时，退出也是自我尊重', '你持续主动却看不到稳定回应。', '对方是否持续拒绝安排时间或回避沟通。', '降低投入并明确一次，之后把选择权交回对方。', '“我发现最近主要是我在推进，我会先停下来。如果你之后想联系，可以告诉我。”', '继续加码、等待无限期改变、否定自己的需要。', '长期没有双向行动或边界被反复忽视时。'],
  ].map(([id, title, focus, situation, observe, recommendation, example, avoid, pause]) => makeArticle({ ...common(id, title, focus, situation, observe, recommendation, example, avoid, pause), stage: 'ambiguous', category: 'relationship', tags: ['暧昧观察期', '关系确认'] })),
];
