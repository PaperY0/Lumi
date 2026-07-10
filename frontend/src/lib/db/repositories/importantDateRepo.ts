import { v4 as uuidv4 } from 'uuid';
import type { ImportantDate } from '@/types';
import { db } from '../database';

export type ImportantDateInput = {
  girlId: string;
  name: string;
  date: string;
  type: ImportantDate['type'];
};

export const importantDateRepository = {
  async listByGirlId(girlId: string): Promise<ImportantDate[]> {
    const list = await db.importantDates
      .where('girlId')
      .equals(girlId)
      .sortBy('date');
    return list;
  },

  async listAll(): Promise<ImportantDate[]> {
    const list = await db.importantDates.toArray();
    return list.sort((a, b) => a.date.localeCompare(b.date));
  },

  async create(input: ImportantDateInput): Promise<ImportantDate> {
    const now = new Date().toISOString();
    const entity: ImportantDate = {
      id: uuidv4(),
      girlId: input.girlId,
      name: input.name.trim(),
      date: input.date,
      type: input.type,
      reminded: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.importantDates.put(entity);
    return entity;
  },

  async update(id: string, input: Omit<ImportantDateInput, 'girlId'>): Promise<void> {
    await db.importantDates.update(id, {
      name: input.name.trim(),
      date: input.date,
      type: input.type,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.importantDates.delete(id);
  },

  async clearAll(): Promise<void> {
    await db.importantDates.clear();
  },
};
