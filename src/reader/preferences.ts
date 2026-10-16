import { Language, PAGE_IDS, PageId } from '../content/types';

export const FONT_SIZES = [18, 21, 24, 28] as const;
export type Preferences = { pageId: PageId; language: Language; fontSize: number };
export const DEFAULT_PREFERENCES: Preferences = { pageId: 'opening', language: 'en', fontSize: 21 };
export const STORAGE_KEY = '@new-way-of-the-cross/preferences/v1';

export function parsePreferences(value: string | null): Preferences {
  let saved: unknown;
  try { saved = value ? JSON.parse(value) : null; } catch { saved = null; }
  const record = saved && typeof saved === 'object' ? saved as Record<string, unknown> : {};
  return {
    pageId: PAGE_IDS.includes(record.pageId as PageId) ? record.pageId as PageId : 'opening',
    language: record.language === 'fil' ? 'fil' : 'en',
    fontSize: FONT_SIZES.some(size => size === record.fontSize) ? record.fontSize as number : 21,
  };
}

type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<unknown> };

export function createPreferenceStore(storage: Storage) {
  // Serialize writes so rapid swipes/toggles cannot finish out of order.
  let pending: Promise<unknown> = Promise.resolve();
  return {
    async load() { return parsePreferences(await storage.getItem(STORAGE_KEY)); },
    save(preferences: Preferences): Promise<unknown> {
      const value = JSON.stringify(preferences);
      pending = pending.catch(() => undefined).then(() => storage.setItem(STORAGE_KEY, value));
      return pending;
    },
  };
}
