import type { CustomLoveGuideArticle } from '@/types';
import { db } from '../database';

export const loveGuideRepository = {
  async listCustomArticles(): Promise<CustomLoveGuideArticle[]> {
    return db.loveGuideArticles.orderBy('updatedAt').reverse().toArray();
  },

  async get(id: string): Promise<CustomLoveGuideArticle | undefined> {
    return db.loveGuideArticles.get(id);
  },

  async save(article: CustomLoveGuideArticle): Promise<void> {
    await db.loveGuideArticles.put(article);
  },

  async remove(id: string): Promise<void> {
    await db.loveGuideArticles.delete(id);
  },
};
