import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type {
  AppData, Task, ClassEntry, Note, Goal, Book, Film, SportRecord,
  Quote, FocusSession, FreeTimeIdea, Profile, ThemeMode, AccentColor,
  Language, Page, Priority, TaskCategory, NoteCategory, GoalCategory,
  BookStatus, FilmStatus, FilmType, SportCategory, Milestone,
} from '@/types';
import { loadData, saveData, defaultData, uid, exportData, clearAllData } from '@/lib/storage';
import { applyTheme } from '@/lib/theme';
import { translate } from '@/lib/i18n';

interface AppContextValue {
  data: AppData;
  currentPage: Page;
  setPage: (page: Page) => void;

  // i18n
  lang: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;

  // Theme
  theme: ThemeMode;
  accent: AccentColor;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;

  // Welcome
  dismissWelcome: () => void;

  // Profile
  updateProfile: (profile: Profile) => void;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  restoreLastDeletedTask: () => boolean;

  // Classes
  addClass: (entry: Omit<ClassEntry, 'id'>) => void;
  updateClass: (id: string, updates: Partial<ClassEntry>) => void;
  deleteClass: (id: string) => void;

  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  addMilestone: (goalId: string, title: string) => void;
  updateMilestone: (goalId: string, milestoneId: string, title: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;

  // Books
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;

  // Films
  addFilm: (film: Omit<Film, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFilm: (id: string, updates: Partial<Film>) => void;
  deleteFilm: (id: string) => void;

  // Sport
  addSportRecord: (rec: Omit<SportRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSportRecord: (id: string, updates: Partial<SportRecord>) => void;
  deleteSportRecord: (id: string) => void;
  updateSportGoal: (weeklyTarget: number, activityType: SportCategory | 'all') => void;

  // Quotes
  addQuote: (text: string, author: string) => void;
  toggleQuoteFavorite: (id: string) => void;
  getRandomQuote: () => Quote;

  // Focus
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void;

  // Free time
  addFreeTimeIdea: (text: string, category: string) => void;
  toggleFreeTimeFavorite: (id: string) => void;
  toggleFreeTimeCompleted: (id: string) => void;

  // Data management
  exportAllData: () => void;
  clearTasks: () => void;
  deleteEverything: () => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const d = loadData();
    return d.hasSeenWelcome ? 'dashboard' : 'welcome';
  });
  const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);

  // Persist data on every change
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Apply theme
  useEffect(() => {
    applyTheme(data.theme, data.accent);
  }, [data.theme, data.accent]);

  // Listen for system theme changes
  useEffect(() => {
    if (data.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system', data.accent);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [data.theme, data.accent]);

  const t = useCallback((key: string) => translate(data.language, key), [data.language]);

  const setPage = useCallback((page: Page) => setCurrentPage(page), []);

  const setLanguage = useCallback((lang: Language) => {
    setData(d => ({ ...d, language: lang }));
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    setData(d => ({ ...d, theme }));
  }, []);

  const setAccent = useCallback((accent: AccentColor) => {
    setData(d => ({ ...d, accent }));
  }, []);

  const dismissWelcome = useCallback(() => {
    setData(d => ({ ...d, hasSeenWelcome: true }));
    setCurrentPage('dashboard');
  }, []);

  const updateProfile = useCallback((profile: Profile) => {
    setData(d => ({ ...d, profile }));
  }, []);

  // Tasks
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newTask: Task = { ...task, id: uid(), createdAt: now, updatedAt: now };
    setData(d => ({ ...d, tasks: [...d.tasks, newTask] }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData(d => {
      const task = d.tasks.find(t => t.id === id);
      if (task) setLastDeletedTask(task);
      return { ...d, tasks: d.tasks.filter(t => t.id !== id) };
    });
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t),
    }));
  }, []);

  const restoreLastDeletedTask = useCallback((): boolean => {
    if (!lastDeletedTask) return false;
    setData(d => ({ ...d, tasks: [...d.tasks, lastDeletedTask] }));
    setLastDeletedTask(null);
    return true;
  }, [lastDeletedTask]);

  // Classes
  const addClass = useCallback((entry: Omit<ClassEntry, 'id'>) => {
    setData(d => ({ ...d, classes: [...d.classes, { ...entry, id: uid() }] }));
  }, []);

  const updateClass = useCallback((id: string, updates: Partial<ClassEntry>) => {
    setData(d => ({ ...d, classes: d.classes.map(c => c.id === id ? { ...c, ...updates } : c) }));
  }, []);

  const deleteClass = useCallback((id: string) => {
    setData(d => ({ ...d, classes: d.classes.filter(c => c.id !== id) }));
  }, []);

  // Notes
  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    setData(d => ({ ...d, notes: [...d.notes, { ...note, id: uid(), createdAt: now, updatedAt: now }] }));
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setData(d => ({
      ...d,
      notes: d.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setData(d => ({ ...d, notes: d.notes.filter(n => n.id !== id) }));
  }, []);

  // Goals
  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    setData(d => ({ ...d, goals: [...d.goals, { ...goal, id: uid(), createdAt: now, updatedAt: now }] }));
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setData(d => ({
      ...d,
      goals: d.goals.map(g => g.id === id ? { ...g, ...updates, updatedAt: Date.now() } : g),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setData(d => ({ ...d, goals: d.goals.filter(g => g.id !== id) }));
  }, []);

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setData(d => ({
      ...d,
      goals: d.goals.map(g => g.id === goalId ? {
        ...g,
        milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m),
        updatedAt: Date.now(),
      } : g),
    }));
  }, []);

  const addMilestone = useCallback((goalId: string, title: string) => {
    const milestone: Milestone = { id: uid(), title, completed: false };
    setData(d => ({
      ...d,
      goals: d.goals.map(g => g.id === goalId ? {
        ...g,
        milestones: [...g.milestones, milestone],
        updatedAt: Date.now(),
      } : g),
    }));
  }, []);

  const updateMilestone = useCallback((goalId: string, milestoneId: string, title: string) => {
    setData(d => ({
      ...d,
      goals: d.goals.map(g => g.id === goalId ? {
        ...g,
        milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, title } : m),
        updatedAt: Date.now(),
      } : g),
    }));
  }, []);

  const deleteMilestone = useCallback((goalId: string, milestoneId: string) => {
    setData(d => ({
      ...d,
      goals: d.goals.map(g => g.id === goalId ? {
        ...g,
        milestones: g.milestones.filter(m => m.id !== milestoneId),
        updatedAt: Date.now(),
      } : g),
    }));
  }, []);

  // Books
  const addBook = useCallback((book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    setData(d => ({ ...d, books: [...d.books, { ...book, id: uid(), createdAt: now, updatedAt: now }] }));
  }, []);

  const updateBook = useCallback((id: string, updates: Partial<Book>) => {
    setData(d => ({
      ...d,
      books: d.books.map(b => b.id === id ? { ...b, ...updates, updatedAt: Date.now() } : b),
    }));
  }, []);

  const deleteBook = useCallback((id: string) => {
    setData(d => ({ ...d, books: d.books.filter(b => b.id !== id) }));
  }, []);

  // Films
  const addFilm = useCallback((film: Omit<Film, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    setData(d => ({ ...d, films: [...d.films, { ...film, id: uid(), createdAt: now, updatedAt: now }] }));
  }, []);

  const updateFilm = useCallback((id: string, updates: Partial<Film>) => {
    setData(d => ({
      ...d,
      films: d.films.map(f => f.id === id ? { ...f, ...updates, updatedAt: Date.now() } : f),
    }));
  }, []);

  const deleteFilm = useCallback((id: string) => {
    setData(d => ({ ...d, films: d.films.filter(f => f.id !== id) }));
  }, []);

  // Sport
  const addSportRecord = useCallback((rec: Omit<SportRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    setData(d => ({ ...d, sportRecords: [...d.sportRecords, { ...rec, id: uid(), createdAt: now, updatedAt: now }] }));
  }, []);

  const updateSportRecord = useCallback((id: string, updates: Partial<SportRecord>) => {
    setData(d => ({
      ...d,
      sportRecords: d.sportRecords.map(r => r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r),
    }));
  }, []);

  const deleteSportRecord = useCallback((id: string) => {
    setData(d => ({ ...d, sportRecords: d.sportRecords.filter(r => r.id !== id) }));
  }, []);

  const updateSportGoal = useCallback((weeklyTarget: number, activityType: SportCategory | 'all') => {
    setData(d => ({ ...d, sportGoal: { weeklyTarget, activityType } }));
  }, []);

  // Quotes
  const addQuote = useCallback((text: string, author: string) => {
    const quote: Quote = { id: uid(), text, author: author || 'Неизвестный автор', custom: true, favorite: false };
    setData(d => ({ ...d, quotes: [...d.quotes, quote] }));
  }, []);

  const toggleQuoteFavorite = useCallback((id: string) => {
    setData(d => ({
      ...d,
      quotes: d.quotes.map(q => q.id === id ? { ...q, favorite: !q.favorite } : q),
    }));
  }, []);

  const getRandomQuote = useCallback((): Quote => {
    const nonFavorite = data.quotes;
    if (nonFavorite.length === 0) return { id: 'none', text: '', author: '', custom: false, favorite: false };
    return nonFavorite[Math.floor(Math.random() * nonFavorite.length)];
  }, [data.quotes]);

  // Focus
  const addFocusSession = useCallback((session: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = { ...session, id: uid() };
    setData(d => ({
      ...d,
      focusStats: {
        totalSessions: d.focusStats.totalSessions + (session.completed ? 1 : 0),
        totalMinutes: d.focusStats.totalMinutes + (session.completed ? session.duration : 0),
        sessions: [...d.focusStats.sessions, newSession],
      },
    }));
  }, []);

  // Free time
  const addFreeTimeIdea = useCallback((text: string, category: string) => {
    const idea: FreeTimeIdea = { id: uid(), category, text, custom: true, favorite: false, completed: false };
    setData(d => ({ ...d, freeTimeIdeas: [...d.freeTimeIdeas, idea] }));
  }, []);

  const toggleFreeTimeFavorite = useCallback((id: string) => {
    setData(d => ({
      ...d,
      freeTimeIdeas: d.freeTimeIdeas.map(i => i.id === id ? { ...i, favorite: !i.favorite } : i),
    }));
  }, []);

  const toggleFreeTimeCompleted = useCallback((id: string) => {
    setData(d => ({
      ...d,
      freeTimeIdeas: d.freeTimeIdeas.map(i => i.id === id ? { ...i, completed: !i.completed } : i),
    }));
  }, []);

  // Data management
  const exportAllData = useCallback(() => {
    exportData(data);
  }, [data]);

  const clearTasks = useCallback(() => {
    setData(d => ({ ...d, tasks: [] }));
  }, []);

  const deleteEverything = useCallback(() => {
    clearAllData();
    setData(defaultData());
    setCurrentPage('welcome');
  }, []);

  const resetToDefaults = useCallback(() => {
    setData(defaultData());
  }, []);

  const value: AppContextValue = {
    data,
    currentPage,
    setPage,
    lang: data.language,
    t,
    setLanguage,
    theme: data.theme,
    accent: data.accent,
    setTheme,
    setAccent,
    dismissWelcome,
    updateProfile,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    restoreLastDeletedTask,
    addClass,
    updateClass,
    deleteClass,
    addNote,
    updateNote,
    deleteNote,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleMilestone,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addBook,
    updateBook,
    deleteBook,
    addFilm,
    updateFilm,
    deleteFilm,
    addSportRecord,
    updateSportRecord,
    deleteSportRecord,
    updateSportGoal,
    addQuote,
    toggleQuoteFavorite,
    getRandomQuote,
    addFocusSession,
    addFreeTimeIdea,
    toggleFreeTimeFavorite,
    toggleFreeTimeCompleted,
    exportAllData,
    clearTasks,
    deleteEverything,
    resetToDefaults,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
