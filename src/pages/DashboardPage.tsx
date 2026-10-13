import { useState, useMemo } from 'react';
import {
  RefreshCw, Heart, Plus, Copy, Quote as QuoteIcon,
  ChevronLeft, ChevronRight, CalendarCheck,
  Check, Clock, Trash2, Pencil, Plus as PlusIcon,
  StickyNote, Target, Timer,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Badge } from '@/components/ui/Form';
import { EmptyState, Toast } from '@/components/ui/EmptyState';
import { TaskForm } from '@/components/TaskForm';
import {
  formatFullDate, getWeekDays, addWeeks, isToday, formatDateKey,
  parseDateKey, tDay, tDayShort, formatDateShort, getGreetingKey,
} from '@/lib/dates';
import type { Quote, Task } from '@/types';

export function DashboardPage() {
  const { t, lang, data, setPage, toggleTaskComplete, deleteTask, toggleQuoteFavorite, addQuote } = useApp();
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [showFavQuotes, setShowFavQuotes] = useState(false);
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [weekRef, setWeekRef] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(formatDateKey(new Date()));
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [defaultDate, setDefaultDate] = useState('');

  const now = new Date();
  const greetingKey = getGreetingKey(now);
  const weekDays = useMemo(() => getWeekDays(weekRef), [weekRef]);

  const displayQuote = currentQuote || data.quotes[0] || { id: 'none', text: '', author: '', custom: false, favorite: false };

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of data.tasks) {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    }
    return map;
  }, [data.tasks]);

  const selectedDayTasks = tasksByDay[selectedDay] || [];
  const selectedDayCompleted = selectedDayTasks.filter(t => t.completed).length;

  const handleNewQuote = () => {
    const available = data.quotes.filter(q => q.id !== displayQuote.id);
    if (available.length > 0) {
      setCurrentQuote(available[Math.floor(Math.random() * available.length)]);
    }
  };

  const handleCopy = () => {
    const text = `"${displayQuote.text}" — ${displayQuote.author}`;
    navigator.clipboard.writeText(text).then(() => {
      setToastMsg(t('quote.copied'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const handleSaveQuote = () => {
    if (!quoteText.trim()) return;
    addQuote(quoteText.trim(), quoteAuthor.trim());
    setQuoteText('');
    setQuoteAuthor('');
    setShowAddQuote(false);
    setToastMsg(t('note.saved'));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleAddTaskForDay = (day: string) => {
    setEditTask(null);
    setDefaultDate(day);
    setTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setDefaultDate('');
    setTaskFormOpen(true);
  };

  const favoriteQuotes = data.quotes.filter(q => q.favorite);

  const quickActions = [
    { icon: PlusIcon, label: t('quick.addTask'), action: () => { setEditTask(null); setDefaultDate(formatDateKey(new Date())); setTaskFormOpen(true); } },
    { icon: StickyNote, label: t('quick.addNote'), action: () => setPage('notes') },
    { icon: Target, label: t('quick.addGoal'), action: () => setPage('goals') },
    { icon: Timer, label: t('quick.startFocus'), action: () => setPage('focus') },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {t(greetingKey)}
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t('greeting.sub')}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {formatFullDate(lang, now)}
        </p>
      </div>

      {/* Quote of the day */}
      <Card className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <QuoteIcon size={18} className="accent-text" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t('quote.title')}</h2>
        </div>
        <blockquote className="mb-4 text-lg font-medium leading-relaxed text-slate-700 dark:text-slate-200">
          "{displayQuote.text}"
        </blockquote>
        <p className="mb-4 text-sm text-slate-400">— {displayQuote.author}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={handleNewQuote}>
            <RefreshCw size={15} /> {t('quote.newQuote')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleQuoteFavorite(displayQuote.id)}
            className={displayQuote.favorite ? 'accent-text' : ''}
          >
            <Heart size={15} className={displayQuote.favorite ? 'fill-current' : ''} /> {t('quote.favQuote')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowAddQuote(true)}>
            <Plus size={15} /> {t('quote.addOwn')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy size={15} /> {t('quote.copy')}
          </Button>
          {favoriteQuotes.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowFavQuotes(true)}>
              <Heart size={15} className="fill-current accent-text" /> {t('quote.favorites')} ({favoriteQuotes.length})
            </Button>
          )}
        </div>
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{t('quick.title')}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={qa.action}
              className="card card-hover flex flex-col items-center gap-2 p-4 text-center"
            >
              <qa.icon size={22} className="accent-text" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly plan */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('dash.weeklyPlan')}</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setWeekRef(addWeeks(weekRef, -1))}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setWeekRef(new Date()); setSelectedDay(formatDateKey(new Date())); }}>
              <CalendarCheck size={15} /> {t('weekly.today')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setWeekRef(addWeeks(weekRef, 1))}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayKey = formatDateKey(day);
            const dayTasks = tasksByDay[dayKey] || [];
            const completed = dayTasks.filter(t => t.completed).length;
            const isSelected = selectedDay === dayKey;
            const today = isToday(day);
            return (
              <button
                key={dayKey}
                onClick={() => setSelectedDay(dayKey)}
                className={`rounded-xl border p-2.5 text-center transition-all ${
                  isSelected
                    ? 'accent-border accent-bg'
                    : 'border-slate-100 hover:border-slate-200 dark:border-slate-700/50 dark:hover:border-slate-600'
                }`}
              >
                <div className={`text-xs font-medium ${today ? 'accent-text' : 'text-slate-400'}`}>
                  {tDayShort(lang, day.getDay())}
                </div>
                <div className={`mt-1 text-lg font-bold ${today ? 'accent-text' : 'text-slate-700 dark:text-slate-200'}`}>
                  {day.getDate()}
                </div>
                {dayTasks.length > 0 && (
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="text-xs text-slate-400">{completed}/{dayTasks.length}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day tasks */}
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700/50">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {tDay(lang, parseDateKey(selectedDay).getDay())}
              </span>
              <span className="text-sm text-slate-400">
                {formatDateShort(lang, parseDateKey(selectedDay))}
              </span>
              {selectedDayTasks.length > 0 && (
                <Badge variant="accent">
                  {selectedDayCompleted}/{selectedDayTasks.length} {t('weekly.completed').toLowerCase()}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleAddTaskForDay(selectedDay)}>
              <Plus size={15} /> {t('weekly.addTask')}
            </Button>
          </div>

          {selectedDayTasks.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">{t('weekly.noTasks')}</p>
          ) : (
            <div className="space-y-2">
              {selectedDayTasks
                .slice()
                .sort((a, b) => (a.startTime || '99').localeCompare(b.startTime || '99'))
                .map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 dark:border-slate-700/40 dark:bg-slate-700/30"
                  >
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`flex-shrink-0 rounded-full p-1 transition-all ${
                        task.completed
                          ? 'accent-bg accent-text'
                          : 'border-2 border-slate-300 text-transparent hover:border-slate-400 dark:border-slate-500'
                      }`}
                    >
                      <Check size={14} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
                        {task.title}
                      </div>
                      {task.startTime && (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={11} /> {task.startTime}{task.endTime ? `–${task.endTime}` : ''}
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleEditTask(task)} className="text-slate-300 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 dark:text-slate-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Card>

      {/* Class schedule preview */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('dash.classSchedule')}</h2>
          <Button variant="ghost" size="sm" onClick={() => setPage('planner')}>
            {t('nav.planner')} →
          </Button>
        </div>
        {data.classes.length === 0 ? (
          <EmptyState message={t('classSchedule.empty')} />
        ) : (
          <ClassSchedulePreview />
        )}
      </Card>

      {/* Add quote modal */}
      <Modal open={showAddQuote} onClose={() => setShowAddQuote(false)} title={t('quote.addQuoteTitle')} size="sm">
        <div className="space-y-4">
          <Textarea label={t('quote.quoteText')} value={quoteText} onChange={setQuoteText} rows={3} />
          <Input label={t('quote.author')} value={quoteAuthor} onChange={setQuoteAuthor} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAddQuote(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleSaveQuote}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Favorite quotes modal */}
      <Modal open={showFavQuotes} onClose={() => setShowFavQuotes(false)} title={t('quote.favQuotes')} size="md">
        {favoriteQuotes.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">{t('quote.noFavorites')}</p>
        ) : (
          <div className="space-y-3">
            {favoriteQuotes.map(q => (
              <div key={q.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-700/40">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">"{q.text}"</p>
                <p className="mt-1 text-xs text-slate-400">— {q.author}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <TaskForm open={taskFormOpen} onClose={() => setTaskFormOpen(false)} editTask={editTask} defaultDate={defaultDate} />

      <Toast message={toastMsg} show={showToast} />
    </div>
  );
}

function ClassSchedulePreview() {
  const { data, lang, t } = useApp();
  const today = new Date().getDay();
  const todayClasses = data.classes
    .filter(c => c.day === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todayClasses.length === 0) {
    const allDays = [...new Set(data.classes.map(c => c.day))].sort();
    if (allDays.length === 0) return null;
    const preview = data.classes
      .filter(c => c.day === allDays[0])
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-400">{tDay(lang, allDays[0])}</p>
        {preview.map(c => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-700/40">
            <Clock size={14} className="text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-300">{c.startTime}–{c.endTime}</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.subject}</span>
            {c.location && <span className="text-xs text-slate-400">{c.location}</span>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400">{t('task.today2')}</p>
      {todayClasses.map(c => (
        <div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-700/40">
          <Clock size={14} className="text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-300">{c.startTime}–{c.endTime}</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.subject}</span>
          {c.location && <span className="text-xs text-slate-400">{c.location}</span>}
        </div>
      ))}
    </div>
  );
}
