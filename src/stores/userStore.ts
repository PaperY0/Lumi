/**
 * 用户 Store：管理"当前登录用户"和"当前关注的女生"。
 * 这是全局共享的身份上下文，几乎每个页面都会读它。
 * 真正的数据来源是 IndexedDB（通过 repository），这里只做内存缓存与同步。
 */

import { create } from 'zustand';
import type { UserProfile, GirlProfile } from '@/types';
import { userProfileRepository, girlProfileRepository } from '@/lib/db';

/** userStore 的状态 + 动作类型定义 */
interface UserState {
  /** 当前登录的男生用户；未加载或不存在时为 null */
  currentUser: UserProfile | null;
  /** 当前关注的女生；未选择时为 null */
  currentGirl: GirlProfile | null;
  /** 是否正在从数据库加载 */
  isLoading: boolean;

  /** 从数据库加载当前用户，并自动带出其名下第一个女生 */
  loadCurrentUser: () => Promise<void>;
  /** 直接设置当前用户 */
  setCurrentUser: (user: UserProfile | null) => void;
  /** 直接设置当前女生 */
  setCurrentGirl: (girl: GirlProfile | null) => void;
  /** 重置为初始状态 */
  clear: () => void;
  /** ✅ 重置为初始状态（别名，与其他 store 统一） */
  reset: () => void;
}

/** ✅ 初始状态提取为常量，供 reset 复用 */
const initialState = {
  currentUser: null,
  currentGirl: null,
  isLoading: false,
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  loadCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const user = await userProfileRepository.getCurrent();
      let girl: GirlProfile | null = null;
      if (user?.id) {
        const girls = await girlProfileRepository.getByUserId(user.id);
        girl = girls[0] ?? null;
      }
      set({ currentUser: user ?? null, currentGirl: girl });
    } finally {
      // 无论成功失败都要关掉 loading
      set({ isLoading: false });
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  setCurrentGirl: (girl) => set({ currentGirl: girl }),

  clear: () => set({ ...initialState }),

  // ✅ reset 方法（与 clear 功能相同）
  reset: () => set({ ...initialState }),
}));
