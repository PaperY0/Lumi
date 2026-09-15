export type LLMSource = 'deepseek' | 'mock';

interface ExecuteLLMOptions<T> {
  mockMode: boolean;
  mock: () => T;
  live: () => Promise<T>;
}

/**
 * Mock output is allowed only when the deployment explicitly enables MOCK_MODE.
 * A live-provider failure must propagate so production never presents fixtures as AI output.
 */
export async function executeLLM<T>({ mockMode, mock, live }: ExecuteLLMOptions<T>): Promise<{
  value: T;
  source: LLMSource;
}> {
  if (mockMode) {
    return { value: mock(), source: 'mock' };
  }

  return { value: await live(), source: 'deepseek' };
}
