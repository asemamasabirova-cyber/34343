import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/EmptyState';
import { startOfWeek, addDays, formatDateKey, tMonth } from '@/lib/dates';
import { CheckSquare, Target, BookOpen, Timer, Activity, BarChart3, TrendingUp } from 'lucide-react';

export function ProgressPage() {
  const { t, lang, data } = useApp();

  const stats = useMemo(() => {
    const today = formatDateKey(new Date());
    const weekStart = startOfWeek(new Date());
    const weekStartKey = formatDateKey(weekStart);
    const weekEndKey = formatDateKey(addDays(weekStart, 6));

    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter(t => t.completed).length;
    const remainingTasks = totalTasks - completedTasks;

    const weekTasks = data.tasks.filter(t => t.date >= weekStartKey && t.date <= weekEndKey);
    const weekCompleted = weekTasks.filter(t => t.completed).length;
    const weeklyRate = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

    const goalsCompleted = data.goals.filter(g => g.completed).length;
    const totalGoals = data.goals.length;

    const booksRead = data.books.filter(b => b.status === 'done').length;
    const totalBooks = data.books.length;

    const focusSessions = data.focusStats.totalSessions;
    const focusMinutes = data.focusStats.totalMinutes;

    const weekSportRecords = data.sportRecords.filter(r => r.date >= weekStartKey && r.date <= weekEndKey && r.completed);
    const weekSportMinutes = weekSportRecords.reduce((s, r) => s + r.duration, 0);

    // Monthly stats
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthStartKey = formatDateKey(monthStart);
    const monthTasks = data.tasks.filter(t => t.date >= monthStartKey);
    const monthCompleted = monthTasks.filter(t => t.completed).length;

    return {
      totalTasks, completedTasks, remainingTasks,
      weeklyRate, weekCompleted, weekTasks: weekTasks.length,
      goalsCompleted, totalGoals,
      booksRead, totalBooks,
      focusSessions, focusMinutes,
      weekSportMinutes, weekSportRecords: weekSportRecords.length,
      monthCompleted, monthTasks: monthTasks.length,
    };
  }, [data]);

  const hasData = data.tasks.length > 0 || data.goals.length > 0 || data.books.length > 0 || data.focusStats.totalSessions > 0 || data.sportRecords.length > 0;

  const statCards = [
    { icon: CheckSquare, label: t('progress.tasksCompleted'), value: `${stats.completedTasks}`, sub: `${t('progress.totalTasks')}: ${stats.totalTasks}`, color: 'accent' },
    { icon: TrendingUp, label: t('progress.tasksRemaining'), value: `${stats.remainingTasks}`, sub: `${t('progress.thisWeek')}: ${stats.weekCompleted}/${stats.weekTasks}`, color: 'default' },
    { icon: BarChart3, label: t('progress.weeklyRate'), value: `${stats.weeklyRate}%`, sub: t('progress.thisWeek'), progress: stats.weeklyRate, color: 'accent' },
    { icon: Timer, label: t('progress.focusSessions'), value: `${stats.focusSessions}`, sub: `${t('progress.focusTime')}: ${Math.floor(stats.focusMinutes / 60)}h ${stats.focusMinutes % 60}m`, color: 'default' },
    { icon: Target, label: t('progress.goalsCompleted'), value: `${stats.goalsCompleted}`, sub: `${t('progress.totalGoals')}: ${stats.totalGoals}`, color: 'accent' },
    { icon: BookOpen, label: t('progress.booksRead'), value: `${stats.booksRead}`, sub: `${t('progress.totalBooks')}: ${stats.totalBooks}`, color: 'default' },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 size={24} className="accent-text" />
          {t('progress.title')}
        </h1>
      </div>

      {!hasData ? (
        <Card className="p-6">
          <EmptyState icon={<BarChart3 size={40} />} message={t('progress.empty')} />
        </Card>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((card, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-slate-400">{card.label}</div>
                    <div className="mt-2 text-3xl font-bold accent-text">{card.value}</div>
                    {card.sub && <div className="mt-1 text-xs text-slate-400">{card.sub}</div>}
                  </div>
                  <div className="rounded-xl accent-bg p-2.5">
                    <card.icon size={20} className="accent-text" />
                  </div>
                </div>
                {card.progress !== undefined && (
                  <div className="mt-3">
                    <ProgressBar value={card.progress} />
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Activity summary */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Activity size={20} className="accent-text" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('progress.activitySummary')}</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold accent-text">{stats.weekSportMinutes}</div>
              <div className="text-sm text-slate-400">{t('common.min')} — {t('progress.thisWeek')}</div>
              {data.sportGoal.weeklyTarget > 0 && (
                <div className="ml-auto w-40">
                  <div className="mb-1 text-xs text-slate-400">{t('sport.weeklyTarget')}: {data.sportGoal.weeklyTarget} {t('common.min')}</div>
                  <ProgressBar value={Math.min(100, (stats.weekSportMinutes / data.sportGoal.weeklyTarget) * 100)} />
                </div>
              )}
            </div>
          </Card>

          {/* Monthly overview */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              {t('progress.thisMonth')} — {tMonth(lang, new Date().getMonth())}
            </h2>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-500">{t('progress.tasksCompleted')}</span>
                  <span className="text-slate-400">{stats.monthCompleted} / {stats.monthTasks}</span>
                </div>
                <ProgressBar value={stats.monthTasks > 0 ? (stats.monthCompleted / stats.monthTasks) * 100 : 0} />
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
