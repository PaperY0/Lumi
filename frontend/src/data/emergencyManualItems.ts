export interface EmergencyManualItem {
  id: string;
  category: '冷场' | '道歉' | '误会' | '边界' | '邀约' | '降温';
  title: string;
  trigger: string;
  doFirst: string;
  suggestedReply: string;
  avoid: string;
}

export const emergencyManualItems: EmergencyManualItem[] = [
  {
    id: 'cold-after-message',
    category: '冷场',
    title: '对方突然变冷淡',
    trigger: '她回复变少、语气变短、隔很久才回。',
    doFirst: '先降低追问频率，给对方空间，同时用一句轻量关心确认状态。',
    suggestedReply: '感觉你今天有点累，我先不打扰你。等你想说话的时候我在。',
    avoid: '不要连续追问“你怎么了”“是不是不喜欢我了”。',
  },
  {
    id: 'forgot-reply',
    category: '道歉',
    title: '忘记回复消息',
    trigger: '你很久没回，对方表达不满或失望。',
    doFirst: '先承认具体行为，不解释太多，再补一句以后怎么避免。',
    suggestedReply: '抱歉，我那天确实没有及时回你，让你等着不舒服了。以后我忙的时候会先跟你说一声。',
    avoid: '不要说“我又不是故意的”“你怎么这么敏感”。',
  },
  {
    id: 'misunderstanding',
    category: '误会',
    title: '一句话被误会',
    trigger: '你原本开玩笑，对方听起来像否定或嘲讽。',
    doFirst: '先照顾感受，再解释本意，不急着证明自己没错。',
    suggestedReply: '我刚才那句话表达得不好，听起来像是在否定你。我的本意不是这样，但让你不舒服是我的问题。',
    avoid: '不要直接说“你理解错了”。',
  },
  {
    id: 'boundary-respect',
    category: '边界',
    title: '对方说想一个人待会儿',
    trigger: '她说想静静、别问了、晚点再说。',
    doFirst: '明确尊重边界，给一个低压力的回到对话入口。',
    suggestedReply: '好，我尊重你想自己待一会儿。你不用急着回，等你愿意说的时候我会认真听。',
    avoid: '不要立刻要求解释或继续输出长篇情绪。',
  },
  {
    id: 'invite-dinner',
    category: '邀约',
    title: '想约她吃饭但怕突兀',
    trigger: '聊天氛围还不错，想自然提出见面。',
    doFirst: '给具体但可拒绝的选项，让对方有选择空间。',
    suggestedReply: '这周如果你有空，我想请你吃个饭。周五晚上或者周末都可以，你不方便也没关系。',
    avoid: '不要用“你必须来”“不给面子”这类施压表达。',
  },
  {
    id: 'argument-cooldown',
    category: '降温',
    title: '争吵正在升级',
    trigger: '双方都开始翻旧账、语气变重。',
    doFirst: '先暂停升级，约定稍后再谈具体问题。',
    suggestedReply: '我感觉我们现在都有点上头了。我不想把话说得更伤人，我们先停一下，晚点我再认真跟你聊这件事。',
    avoid: '不要继续争输赢，也不要冷暴力消失。',
  },
];
