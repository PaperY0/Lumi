export type EmergencyManualCategory = '冷场' | '道歉' | '误会' | '边界' | '邀约' | '降温';

export interface EmergencyManualItem {
  id: string;
  category: EmergencyManualCategory;
  title: string;
  trigger: string;
  quickAnswer: string;
  explanation: string;
  suggestedReply: string;
  avoid: string;
}

export const emergencyManualCategories: Array<'全部' | EmergencyManualCategory> = [
  '全部',
  '冷场',
  '道歉',
  '误会',
  '边界',
  '邀约',
  '降温',
];

export const emergencyManualItems: EmergencyManualItem[] = [
  {
    id: 'cold-after-message',
    category: '冷场',
    title: '对方突然变冷淡',
    trigger: '她回复变少、语气变短、隔很久才回。',
    quickAnswer: '先降频，不追问，用一句轻量关心把空间留出来。',
    explanation: '冷淡不一定等于没兴趣，也可能是累、忙、情绪低或需要独处。此时连续追问会让对方压力更大，先稳住节奏更安全。',
    suggestedReply: '感觉你今天可能有点累，我先不打扰你。等你想说话的时候我在，也希望你能舒服一点。',
    avoid: '不要连续问“你怎么了”“是不是不喜欢我了”，也不要用冷处理报复对方。',
  },
  {
    id: 'forgot-reply',
    category: '道歉',
    title: '忘记回复消息',
    trigger: '你很久没回，对方表达不满、委屈或失望。',
    quickAnswer: '承认具体行为，少解释，多补偿感受。',
    explanation: '道歉的重点不是证明自己不是故意的，而是让对方知道“我看见了你的等待和不舒服”。',
    suggestedReply: '抱歉，我刚才确实没有及时回你，让你等着不舒服了。以后我忙的时候会先跟你说一声，不让你一直猜。',
    avoid: '不要说“我又不是故意的”“你怎么这么敏感”，这会把道歉变成辩解。',
  },
  {
    id: 'misunderstanding',
    category: '误会',
    title: '一句话被误会了',
    trigger: '你本来想开玩笑，但对方听起来像否定、嘲讽或敷衍。',
    quickAnswer: '先照顾感受，再解释本意。',
    explanation: '误会发生时，先争“我没错”很容易升级。先承认表达造成的感受，再补充真实意思，关系更容易回到同一边。',
    suggestedReply: '我刚才那句话表达得不好，听起来像是在否定你。我的本意不是这样，但让你不舒服是我的问题，我重新说一遍。',
    avoid: '不要直接说“你理解错了”，也不要用“开不起玩笑”来压对方。',
  },
  {
    id: 'boundary-respect',
    category: '边界',
    title: '对方说想一个人待会儿',
    trigger: '她说想静静、别问了、晚点再说或不想继续聊。',
    quickAnswer: '明确尊重边界，并留下低压力的回到对话入口。',
    explanation: '尊重边界不是放弃，而是让对方确认你不会逼她立刻回应。安全感往往来自“我可以不被追着解释”。',
    suggestedReply: '好，我尊重你想自己待一会儿。你不用急着回，等你愿意说的时候我会认真听。',
    avoid: '不要立刻要求解释、连续发长文，或把沉默解读成惩罚。',
  },
  {
    id: 'invite-dinner',
    category: '邀约',
    title: '想约她见面但怕冒犯',
    trigger: '聊天氛围还不错，想自然提出吃饭、散步或一起做事。',
    quickAnswer: '给具体选项，也给对方轻松拒绝的空间。',
    explanation: '好的邀约不是施压，而是提供一个明确、轻松、可拒绝的选择。对方越容易拒绝，越不会觉得被逼。',
    suggestedReply: '这周如果你有空，我想请你吃个饭。周五晚上或者周末都可以，你不方便也没关系，我们下次再约。',
    avoid: '不要说“你必须来”“不给面子”，也不要用反复追问逼她表态。',
  },
  {
    id: 'argument-cooldown',
    category: '降温',
    title: '争吵正在升级',
    trigger: '双方开始翻旧账、语气变重、想证明自己更委屈。',
    quickAnswer: '先暂停升级，约定稍后再谈具体问题。',
    explanation: '情绪上头时继续争输赢，通常只会留下更伤人的话。暂停不是逃避，而是保护后续沟通的质量。',
    suggestedReply: '我感觉我们现在都有点上头了。我不想把话说得更伤人，我们先停一下，晚点我再认真跟你聊这件事。',
    avoid: '不要继续争输赢，也不要直接消失。暂停时要说明会回来继续沟通。',
  },
];
