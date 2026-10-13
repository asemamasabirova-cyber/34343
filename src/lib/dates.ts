import type { Language } from '@/types';

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return formatDateKey(new Date());
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day; // Monday as start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function addWeeks(date: Date, n: number): Date {
  return addDays(date, n * 7);
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function getMonthDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const endPad = lastDay.getDay() === 0 ? 0 : 7 - lastDay.getDay();
  const days: Date[] = [];
  for (let i = startPad; i > 0; i--) days.push(addDays(firstDay, -i));
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
  for (let i = 1; i <= endPad; i++) days.push(addDays(lastDay, i));
  return days;
}

const MONTH_KEYS = [
  'month.january', 'month.february', 'month.march', 'month.april',
  'month.may', 'month.june', 'month.july', 'month.august',
  'month.september', 'month.october', 'month.november', 'month.december',
];

const DAY_KEYS = [
  'day.sunday', 'day.monday', 'day.tuesday', 'day.wednesday',
  'day.thursday', 'day.friday', 'day.saturday',
];

const DAY_SHORT_KEYS = [
  'day.sun.short', 'day.mon.short', 'day.tue.short', 'day.wed.short',
  'day.thu.short', 'day.fri.short', 'day.sat.short',
];

export function tMonth(lang: Language, month: number): string {
  const keys: Record<Language, string[]> = {
    ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  };
  return keys[lang][month] ?? MONTH_KEYS[month];
}

export function tMonthGenitive(lang: Language, month: number): string {
  const keys: Record<Language, string[]> = {
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  };
  return keys[lang][month];
}

export function tDay(lang: Language, day: number): string {
  const keys: Record<Language, string[]> = {
    ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };
  return keys[lang][day] ?? DAY_KEYS[day];
}

export function tDayShort(lang: Language, day: number): string {
  const keys: Record<Language, string[]> = {
    ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };
  return keys[lang][day] ?? DAY_SHORT_KEYS[day];
}

export function formatFullDate(lang: Language, date: Date): string {
  if (lang === 'ru') {
    return `${tDay(lang, date.getDay())}, ${date.getDate()} ${tMonthGenitive(lang, date.getMonth())} ${date.getFullYear()}`;
  }
  return `${tDay(lang, date.getDay())}, ${tMonthGenitive(lang, date.getMonth())} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatDateShort(lang: Language, date: Date): string {
  if (lang === 'ru') {
    return `${date.getDate()} ${tMonthGenitive(lang, date.getMonth())}`;
  }
  return `${tMonthGenitive(lang, date.getMonth())} ${date.getDate()}`;
}

export function getGreetingKey(date: Date): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'greeting.morning';
  if (h >= 12 && h < 18) return 'greeting.afternoon';
  if (h >= 18 && h < 23) return 'greeting.evening';
  return 'greeting.night';
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfWeekRange(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
  return d;
}

export function endOfWeekRange(date: Date): Date {
  const start = startOfWeekRange(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}
