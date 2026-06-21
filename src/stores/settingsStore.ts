/**
 * 设置 Store：应用全局设置。
 * 用 zustand 的 persist 中间件持久化到 localStorage（key: 'lumi-settings'），
 * 刷新页面后设置依然保留。
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 主题模式 */
type Theme = 'light' | 'dark' | 'auto';

/** settingsStore 的状态 + 动作类型定义 */
interface SettingsState {
  /** 是否已完成新手引导（默认 false） */
  onboardingCompleted: boolean;
  /** 是否开启 Mock 模式：未接 AI 后端时用假数据（默认 true） */
  mockMode: boolean;
  /** 主题：浅色 / 深色 / 跟随系统（默认 'auto'） */
  theme: Theme;

  /** 设置是否完成新手引导 */
  setOnboardingCompleted: (v: boolean) => void;
  /** 设置是否开启 Mock 模式 */
  setMockMode: (v: boolean) => void;
  /** 设置主题 */
  setTheme: (v: Theme) => void;
  /** 恢复所有设置为默认值 */
  reset: () => void;
}

/** 默认设置，reset 时复用 */
const DEFAULT_SETTINGS = {
  onboardingCompleted: false,
  mockMode: true,
  theme: 'auto' as Theme,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setOnboardingCompleted: (v) => set({ onboardingCompleted: v }),

      setMockMode: (v) => set({ mockMode: v }),

      setTheme: (v) => set({ theme: v }),

      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      // localStorage 里的存储 key
      name: 'lumi-settings',
    },
  ),
);
