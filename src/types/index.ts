export type View =
  | 'dashboard'
  | 'planner'
  | 'tasks'
  | 'notes'
  | 'focus'
  | 'goals'
  | 'books'
  | 'films'
  | 'sport'
  | 'progress'
  | 'freetime'
  | 'settings';

export type Priority = 'low' | 'medium' | 'high';
export type TaskCategory = 'study' | 'personal' | 'work' | 'health' | 'other';
export type GoalCategory = 'study' | 'career' | 'personal' | 'health' | 'creativity' | 'other';
export type NoteCategory = 'study' | 'ideas' | 'personal' | 'projects' | 'other';
export type BookStatus = 'want' | 'reading' | 'done';
export type FilmStatus = 'want' | 'watching' | 'watched';
export type FilmType = 'film' | 'series' | 'dorama';
export type SportCategory = 'walk' | 'stretch' | 'home' | 'dance' | 'bike' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  priority: Priority;
  category: TaskCategory;
  completed: boolean;
  recurrence?: 'none' | 'daily' | 'weekly';
  createdAt: number;
  updatedAt: number;
}

export interface ClassEntry {
  id: string;
  day: number; // 0=Sun ... 6=Sat
  subject: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetDate?: string;
  milestones: Milestone[];
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  startDate?: string;
  completionDate?: string;
  rating: number; // 0-5
  notes: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Film {
  id: string;
  title: string;
  type: FilmType;
  genre: string;
  status: FilmStatus;
  rating: number; // 0-5
  dateWatched?: string;
  review: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SportRecord {
  id: string;
  name: string;
  category: SportCategory;
  date: string; // YYYY-MM-DD
  duration: number; // minutes
  notes: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SportGoal {
  weeklyTarget: number; // minutes per week
  activityType: SportCategory | 'all';
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  custom: boolean;
  favorite: boolean;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  duration: number; // minutes
  completed: boolean;
  timestamp: number;
}

export interface FocusStats {
  totalSessions: number;
  totalMinutes: number;
  sessions: FocusSession[];
}

export interface FreeTimeIdea {
  id: string;
  category: string;
  text: string;
  custom: boolean;
  favorite: boolean;
  completed: boolean;
}

export interface Profile {
  name: string;
  description: string;
  photo: string | null;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'pink' | 'blue' | 'yellow' | 'lavender' | 'mint' | 'peach';
export type Language = 'ru' | 'en';

export interface AppData {
  tasks: Task[];
  classes: ClassEntry[];
  notes: Note[];
  goals: Goal[];
  books: Book[];
  films: Film[];
  sportRecords: SportRecord[];
  sportGoal: SportGoal;
  quotes: Quote[];
  focusStats: FocusStats;
  freeTimeIdeas: FreeTimeIdea[];
  profile: Profile;
  theme: ThemeMode;
  accent: AccentColor;
  language: Language;
  hasSeenWelcome: boolean;
}

export type Page = View | 'welcome' | 'auth-choice' | 'login' | 'register' | 'forgot' | 'reset-password';
