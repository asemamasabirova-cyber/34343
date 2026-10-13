import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Input, Select, Badge } from '@/components/ui/Form';
import { EmptyState, Toast } from '@/components/ui/EmptyState';
import { TaskForm } from '@/components/TaskForm';
import { todayKey, parseDateKey, formatDateShort } from '@/lib/dates';
import type { Task, Priority } from '@/types';
import { Plus, Check, Trash2, Pencil, Search, RotateCcw, Clock, AlertCircle, Calendar } from 'lucide-react';

type Filter = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';
type SortBy = 'date' | 'priority' | 'status';

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const priorityVariant = (p: Priority): 'success' | 'warning' | 'danger' =>
  p === 'low' ? 'success' : p === 'medium' ? 'warning' : 'danger';

export function TasksPage() {
  const { t, lang, data, toggleTaskComplete, deleteTask, restoreLastDeletedTask } = useApp();

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2500);
  };

  const today = todayKey();

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = data.tasks.filter(task => {
      if (term && !task.title.toLowerCase().includes(term) && !task.description.toLowerCase().includes(term)) return false;
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
      switch (filter) {
        case 'today': return task.date === today && !task.completed;
        case 'upcoming': return task.date > today && !task.completed;
        case 'completed': return task.completed;
        case 'overdue': return task.date < today && !task.completed;
        default: return true;
      }
    });
    list = list.slice().sort((a, b) => {
      if (sortBy === 'date') return a.date.localeCompare(b.date) || (a.startTime || '99').localeCompare(b.startTime || '99');
      if (sortBy === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
      return Number(a.completed) - Number(b.completed);
    });
    return list;
  }, [data.tasks, filter, search, sortBy, categoryFilter, today]);

  const handleDelete = (task: Task) => {
    deleteTask(task.id);
    showToast(t('task.deleted'));
  };

  const handleUndo = () => {
    if (restoreLastDeletedTask()) {
      showToast(t('task.undo'));
    }
  };

  const openAdd = () => { setEditTask(null); setFormOpen(true); };
  const openEdit = (task: Task) => { setEditTask(task); setFormOpen(true); };

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: t('task.all'), count: data.tasks.length },
    { key: 'today', label: t('task.today'), count: data.tasks.filter(x => x.date === today && !x.completed).length },
    { key: 'upcoming', label: t('task.upcoming'), count: data.tasks.filter(x => x.date > today && !x.completed).length },
    { key: 'completed', label: t('task.completed'), count: data.tasks.filter(x => x.completed).length },
    { key: 'overdue', label: t('task.overdue'), count: data.tasks.filter(x => x.date < today && !x.completed).length },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Check size={24} className="accent-text" />
          {t('task.title')}
        </h1>
        <Button variant="primary" onClick={openAdd}>
          <Plus size={16} /> {t('task.add')}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
              filter === f.key
                ? 'accent-bg accent-text'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {f.label} <span className="ml-1 text-xs">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Search & sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input focus-ring pl-9"
            placeholder={t('task.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: 'all', label: t('common.all') },
            { value: 'study', label: t('cat.study') },
            { value: 'personal', label: t('cat.personal') },
            { value: 'work', label: t('cat.work') },
            { value: 'health', label: t('cat.health') },
            { value: 'other', label: t('cat.other') },
          ]}
          className="sm:w-40"
        />
        <Select
          value={sortBy}
          onChange={v => setSortBy(v as SortBy)}
          options={[
            { value: 'date', label: t('task.sortDate') },
            { value: 'priority', label: t('task.sortPriority') },
            { value: 'status', label: t('task.sortStatus') },
          ]}
          className="sm:w-40"
        />
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Check size={40} />}
            message={t('task.empty')}
            action={<Button variant="primary" size="sm" onClick={openAdd}><Plus size={15} /> {t('task.add')}</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map(task => {
            const isOverdue = task.date < today && !task.completed;
            const taskDate = parseDateKey(task.date);
            return (
              <Card key={task.id} className="p-4 flex items-center gap-3">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className={`flex-shrink-0 rounded-full p-1.5 transition-all ${
                    task.completed
                      ? 'accent-bg accent-text'
                      : 'border-2 border-slate-300 text-transparent hover:border-slate-400 dark:border-slate-500'
                  }`}
                  aria-label={t('task.complete')}
                >
                  <Check size={16} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="mt-0.5 text-xs text-slate-400 line-clamp-1">{task.description}</div>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar size={11} /> {formatDateShort(lang, taskDate)}
                    </span>
                    {task.startTime && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={11} /> {task.startTime}{task.endTime ? `–${task.endTime}` : ''}
                      </span>
                    )}
                    <Badge variant={priorityVariant(task.priority)}>{t(`priority.${task.priority}`)}</Badge>
                    <Badge variant="default">{t(`cat.${task.category}`)}</Badge>
                    {isOverdue && <Badge variant="danger"><AlertCircle size={10} className="mr-0.5" /> {t('task.overdueLabel')}</Badge>}
                  </div>
                </div>
                <button onClick={() => openEdit(task)} className="flex-shrink-0 text-slate-300 hover:text-slate-500 dark:text-slate-500" aria-label={t('task.edit')}>
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(task)} className="flex-shrink-0 text-slate-300 hover:text-red-500 dark:text-slate-500" aria-label={t('task.delete')}>
                  <Trash2 size={16} />
                </button>
              </Card>
            );
          })}
        </div>
      )}

      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} editTask={editTask} />
      <Toast message={toastMsg} show={toastShow} />
      {toastShow && toastMsg === t('task.deleted') && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up" style={{ marginBottom: '50px' }}>
          <Button variant="ghost" size="sm" onClick={handleUndo}>
            <RotateCcw size={14} /> {t('task.undo')}
          </Button>
        </div>
      )}
    </div>
  );
}
