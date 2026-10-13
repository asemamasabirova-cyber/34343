import type { AppData, Quote, FreeTimeIdea } from '@/types';
import { QUOTES, FREE_TIME_IDEAS } from './i18n';

const STORAGE_KEY = 'lifespace_data_v1';

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultData(): AppData {
  const quotes: Quote[] = QUOTES.map((q, i) => ({
    id: `q-${i}`,
    text: q.text,
    author: q.author,
    custom: false,
    favorite: false,
  }));

  const freeTimeIdeas: FreeTimeIdea[] = FREE_TIME_IDEAS.map((idea, i) => ({
    id: `ft-${i}`,
    category: idea.category,
    text: idea.text,
    custom: false,
    favorite: false,
    completed: false,
  }));

  return {
    tasks: [],
    classes: [],
    notes: [],
    goals: [],
    books: [],
    films: [],
    sportRecords: [],
    sportGoal: { weeklyTarget: 150, activityType: 'all' },
    quotes,
    focusStats: { totalSessions: 0, totalMinutes: 0, sessions: [] },
    freeTimeIdeas,
    profile: { name: '', description: '', photo: null },
    theme: 'light',
    accent: 'pink',
    language: 'ru',
    hasSeenWelcome: false,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const base = defaultData();

    // Merge with defaults to handle missing fields safely
    const merged: AppData = {
      ...base,
      ...parsed,
      sportGoal: { ...base.sportGoal, ...parsed.sportGoal },
      focusStats: {
        ...base.focusStats,
        ...parsed.focusStats,
        sessions: parsed.focusStats?.sessions ?? [],
      },
      profile: { ...base.profile, ...parsed.profile },
    };

    // Ensure default quotes/ideas exist (in case of new additions)
    const existingQuoteIds = new Set(merged.quotes.map(q => q.id));
    for (const q of base.quotes) {
      if (!existingQuoteIds.has(q.id)) merged.quotes.push(q);
    }

    const existingFtIds = new Set(merged.freeTimeIdeas.map(f => f.id));
    for (const f of base.freeTimeIdeas) {
      if (!existingFtIds.has(f.id)) merged.freeTimeIdeas.push(f);
    }

    return merged;
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
}

export function exportData(data: AppData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lifespace-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
