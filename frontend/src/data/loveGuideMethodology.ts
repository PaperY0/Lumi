import type { LoveGuideSourceId } from '@/types/loveGuide';

export interface LoveGuideSource {
  id: LoveGuideSourceId;
  title: string;
  organization: string;
  url: string;
  summary: string;
}

export const loveGuideSources: readonly LoveGuideSource[] = [
  {
    id: 'healthy-relationship',
    title: 'Healthy relationship principles',
    organization: 'Verywell Mind',
    url: 'https://www.verywellmind.com/strengthening-relationships-4162997',
    summary: '信任、开放、边界、相互尊重和有效沟通是健康关系的重要特征。',
  },
  {
    id: 'personality-traits',
    title: 'Personality as trait dimensions',
    organization: 'Psychology Today',
    url: 'https://www.psychologytoday.com/us/basics/personality',
    summary: '人格更适合用连续特质理解；类型标签不能替代对具体行为和情境的观察。',
  },
  {
    id: 'warning-signs',
    title: 'Warning signs of abuse',
    organization: 'love is respect',
    url: 'https://www.loveisrespect.org/dating-basics-for-healthy-relationships/warning-signs-of-abuse/',
    summary: '控制、未经允许查看设备、孤立社交、极端嫉妒、性施压和强迫都是需要认真对待的危险信号。',
  },
  {
    id: 'communication',
    title: 'Improve relationship communication',
    organization: 'The Gottman Institute',
    url: 'https://www.gottman.com/improve-communication-relationship/',
    summary: '沟通应以温和开场、倾听、理解对方视角和共情回应为基础，避免批评和施压。',
  },
] as const;

export function getLoveGuideSources(sourceIds: readonly LoveGuideSourceId[]): LoveGuideSource[] {
  return sourceIds.flatMap((id) => {
    const source = loveGuideSources.find((candidate) => candidate.id === id);
    return source ? [source] : [];
  });
}

export const loveGuideMethodology = {
  title: 'Lumi 内容原则与来源',
  summary: 'Lumi 提供关系决策辅助，不提供对他人心理、动机或感情的诊断。建议始终以可观察事实、双方自愿和现实安全为准。',
  boundaries: [
    '单次消息、回复速度或社交动态不能证明喜欢、不喜欢或任何人格结论。',
    'MBTI 只可用于轻量自我探索；不用于预测他人、判断兼容性或给人贴标签。',
    '出现威胁、跟踪、强迫、身体伤害、性施压或明显恐惧时，优先个人安全并向可信任的人或当地专业支持求助。',
  ],
  sources: loveGuideSources,
} as const;
