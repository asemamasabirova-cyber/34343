import { useState } from 'react';
import {
  Home, CalendarDays, CheckSquare, StickyNote, Timer,
  Target, BookOpen, Film, Activity, BarChart3, Sparkles,
  Settings, Menu, X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Page } from '@/types';

const NAV_ITEMS: { page: Page; icon: typeof Home; key: string }[] = [
  { page: 'dashboard', icon: Home, key: 'nav.dashboard' },
  { page: 'planner', icon: CalendarDays, key: 'nav.planner' },
  { page: 'tasks', icon: CheckSquare, key: 'nav.tasks' },
  { page: 'notes', icon: StickyNote, key: 'nav.notes' },
  { page: 'focus', icon: Timer, key: 'nav.focus' },
  { page: 'goals', icon: Target, key: 'nav.goals' },
  { page: 'books', icon: BookOpen, key: 'nav.books' },
  { page: 'films', icon: Film, key: 'nav.films' },
  { page: 'sport', icon: Activity, key: 'nav.sport' },
  { page: 'progress', icon: BarChart3, key: 'nav.progress' },
  { page: 'freetime', icon: Sparkles, key: 'nav.freetime' },
  { page: 'settings', icon: Settings, key: 'nav.settings' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentPage, setPage, t, data } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: Page) => {
    setPage(page);
    setMobileOpen(false);
  };

  const profileName = data.profile.name || (data.language === 'ru' ? 'Студент' : 'Student');

  return (
    <div className="min-h-screen">
      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-lg md:hidden dark:border-slate-700/50 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <span className="accent-text text-lg font-bold">Life Space</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 md:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setMobileOpen(false)}>
          <nav
            className="animate-slide-up absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-4 shadow-xl dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent
              currentPage={currentPage}
              onNav={handleNav}
              t={t}
              profileName={profileName}
              photo={data.profile.photo}
            />
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-10 hidden h-full w-64 flex-col border-r border-slate-200/60 bg-white/50 backdrop-blur-sm md:flex dark:border-slate-700/50 dark:bg-slate-800/40">
        <NavContent
          currentPage={currentPage}
          onNav={handleNav}
          t={t}
          profileName={profileName}
          photo={data.profile.photo}
        />
      </aside>

      {/* Main content */}
      <main className="md:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavContent({
  currentPage, onNav, t, profileName, photo,
}: {
  currentPage: Page;
  onNav: (p: Page) => void;
  t: (k: string) => string;
  profileName: string;
  photo: string | null;
}) {
  return (
    <>
      <div className="mb-6 px-3 pt-5">
        <div className="text-xl font-bold tracking-tight">
          <span className="accent-text">Life Space</span>
        </div>
        <div className="mt-0.5 text-xs text-slate-400">Student Planner</div>
      </div>

      {/* Profile preview */}
      <button
        onClick={() => onNav('settings')}
        className="mb-4 flex w-full items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-3 py-2.5 transition-all hover:shadow-sm dark:border-slate-700/50 dark:bg-slate-800/60"
      >
        {photo ? (
          <img src={photo} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full accent-bg accent-text text-sm font-semibold">
            {profileName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{profileName}</div>
          <div className="text-xs text-slate-400">{t('nav.settings')}</div>
        </div>
      </button>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ page, icon: Icon, key }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNav(page)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'sidebar-active'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon size={18} className={active ? '' : 'text-slate-400'} />
              <span>{t(key)}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-3 py-4">
        <div className="text-xs text-slate-300 dark:text-slate-600">Life Space © 2026</div>
      </div>
    </>
  );
}
