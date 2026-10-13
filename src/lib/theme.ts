import type { AccentColor, ThemeMode } from '@/types';

export const ACCENT_COLORS: Record<AccentColor, { name: string; primary: string; primaryRgb: string; light: string; lightRgb: string; ring: string }> = {
  pink: {
    name: 'accentPink',
    primary: '#ec4899',
    primaryRgb: '236, 72, 153',
    light: '#fdf2f8',
    lightRgb: '253, 242, 248',
    ring: '#f9a8d4',
  },
  blue: {
    name: 'accentBlue',
    primary: '#3b82f6',
    primaryRgb: '59, 130, 246',
    light: '#eff6ff',
    lightRgb: '239, 246, 255',
    ring: '#93c5fd',
  },
  yellow: {
    name: 'accentYellow',
    primary: '#eab308',
    primaryRgb: '234, 179, 8',
    light: '#fefce8',
    lightRgb: '254, 252, 232',
    ring: '#fde047',
  },
  lavender: {
    name: 'accentLavender',
    primary: '#a78bfa',
    primaryRgb: '167, 139, 250',
    light: '#f5f3ff',
    lightRgb: '245, 243, 255',
    ring: '#c4b5fd',
  },
  mint: {
    name: 'accentMint',
    primary: '#34d399',
    primaryRgb: '52, 211, 153',
    light: '#ecfdf5',
    lightRgb: '236, 253, 245',
    ring: '#6ee7b7',
  },
  peach: {
    name: 'accentPeach',
    primary: '#fb923c',
    primaryRgb: '251, 146, 60',
    light: '#fff7ed',
    lightRgb: '255, 247, 237',
    ring: '#fdba74',
  },
};

export function applyTheme(mode: ThemeMode, accent: AccentColor): void {
  const root = document.documentElement;

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = mode === 'dark' || (mode === 'system' && systemDark);

  root.classList.toggle('dark', isDark);
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.setAttribute('data-accent', accent);

  const c = ACCENT_COLORS[accent];
  root.style.setProperty('--accent-primary', c.primary);
  root.style.setProperty('--accent-primary-rgb', c.primaryRgb);
  root.style.setProperty('--accent-light', c.light);
  root.style.setProperty('--accent-light-rgb', c.lightRgb);
  root.style.setProperty('--accent-ring', c.ring);
}
