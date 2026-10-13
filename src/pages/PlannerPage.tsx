import { useState, useMemo } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Check, Clock,
  Trash2, Pencil, CalendarCheck,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select, Badge } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskForm } from '@/components/TaskForm';
import {
  formatFullDate, getWeekDays, addWeeks, addDays, isToday, formatDateKey,
  parseDateKey, tDay, tDayShort, tMonth, getMonthDays, isSameMonth, formatDateShort,
} from '@/lib/dates';
import type { Task, ClassEntry, Priority } from '@/types';

type PlannerView = 'daily' | 'weekly' | 'monthly';

// Monday-first column ordering (day numbers: 1=Mon … 6=Sat, 0=Sun)
const MON_SUN = [1, 2, 3, 4, 5, 6, 0];

const priorityVariant = (p: Priority): 'success' | 'warning' | 'danger' =>
  p === 'low' ? 'success' : p === 'medium' ? 'warning' : 'danger';

export function PlannerPage() {
  const { t, lang, data, addClass, updateClass, deleteClass, toggleTaskComplete, deleteTask } = useApp();

  const [view, setView] = useState<PlannerView>('daily');
  const [selectedDay, setSelectedDay] = useState(formatDateKey(new Date()));
  const [weekRef, setWeekRef] = useState(new Date());
  const [monthRef, setMonthRef] = useState(new Date());

  // Task form
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [defaultDate, setDefaultDate] = useState('');

  // Class form
  const [classFormOpen, setClassFormOpen] = useState(false);
  const [editClass, setEditClass] = useState<ClassEntry | null>(null);
  const [classForm, setClassForm] = useState({
    subject: '',
    day: 1,
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
  });
  const [classError, setClassError] = useState('');

  // ---- Derived data -------------------------------------------------------

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of data.tasks) {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    }
    return map;
  }, [data.tasks]);

  const weekDays = useMemo(() => getWeekDays(weekRef), [weekRef]);
  const monthDays = useMemo(() => getMonthDays(monthRef), [monthRef]);

  const selectedDate = parseDateKey(selectedDay);
  const selectedTasks = (tasksByDay[selectedDay] || [])
    .slice()
    .sort((a, b) => (a.startTime || '99').localeCompare(b.startTime || '99'));
  const selectedCompleted = selectedTasks.filter(t => t.completed).length;

  // Class schedule – unique sorted start times become table rows
  const timeSlots = useMemo(
    () => [...new Set(data.classes.map(c => c.startTime))].sort(),
    [data.classes],
  );

  const classesForCell = (day: number, time: string) =>
    data.classes
      .filter(c => c.day === day && c.startTime === time)
      .sort((a, b) => a.endTime.localeCompare(b.endTime));

  const classesByDay = useMemo(
    () =>
      MON_SUN.map(day => ({
        day,
        classes: data.classes
          .filter(c => c.day === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      })),
    [data.classes],
  );

  // ---- Handlers -----------------------------------------------------------

  const goToday = () => {
    const today = formatDateKey(new Date());
    setSelectedDay(today);
    setWeekRef(new Date());
    setMonthRef(new Date());
  };

  const handlePrevDay = () => {
    const prev = addDays(parseDateKey(selectedDay), -1);
    setSelectedDay(formatDateKey(prev));
  };
  const handleNextDay = () => {
    const next = addDays(parseDateKey(selectedDay), 1);
    setSelectedDay(formatDateKey(next));
  };

  const openAddTask = (date?: string) => {
    setEditTask(null);
    setDefaultDate(date || selectedDay);
    setTaskFormOpen(true);
  };
  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setDefaultDate('');
    setTaskFormOpen(true);
  };

  const openAddClass = () => {
    setEditClass(null);
    setClassForm({ subject: '', day: 1, startTime: '', endTime: '', location: '', notes: '' });
    setClassError('');
    setClassFormOpen(true);
  };
  const openEditClass = (cls: ClassEntry) => {
    setEditClass(cls);
    setClassForm({
      subject: cls.subject,
      day: cls.day,
      startTime: cls.startTime,
      endTime: cls.endTime,
      location: cls.location,
      notes: cls.notes,
    });
    setClassError('');
    setClassFormOpen(true);
  };
  const handleClassSubmit = () => {
    if (!classForm.subject.trim()) {
      setClassError(t('classSchedule.subject'));
      return;
    }
    if (!classForm.startTime || !classForm.endTime) {
      setClassError(t('classSchedule.startTime'));
      return;
    }
    const payload = {
      subject: classForm.subject.trim(),
      day: classForm.day,
      startTime: classForm.startTime,
      endTime: classForm.endTime,
      location: classForm.location.trim(),
      notes: classForm.notes.trim(),
    };
    if (editClass) {
      updateClass(editClass.id, payload);
    } else {
      addClass(payload);
    }
    setClassFormOpen(false);
  };

  // ---- Render helpers -----------------------------------------------------

  const renderTaskItem = (task: Task) => (
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
        aria-label={task.completed ? t('common.edit') : t('task.add')}
      >
        <Check size={14} />
      </button>
      <div className="min-w-0 flex-1">
        <div
          className={`text-sm font-medium ${
            task.completed
              ? 'text-slate-400 line-through dark:text-slate-500'
              : 'text-slate-700 dark:text-slate-200'
          }`}
        >
          {task.title}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {task.startTime && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={11} /> {task.startTime}
              {task.endTime ? `–${task.endTime}` : ''}
            </span>
          )}
          <Badge variant={priorityVariant(task.priority)}>
            {t(`priority.${task.priority}`)}
          </Badge>
          <Badge variant="default">{t(`cat.${task.category}`)}</Badge>
        </div>
      </div>
      <button
        onClick={() => handleEditTask(task)}
        className="text-slate-300 transition-colors hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300"
        aria-label={t('common.edit')}
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => deleteTask(task.id)}
        className="text-slate-300 transition-colors hover:text-red-500 dark:text-slate-500"
        aria-label={t('common.delete')}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  const renderSelectedDayTasks = () => (
    <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700/50">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {tDay(lang, selectedDate.getDay())}
          </span>
          <span className="text-sm text-slate-400">
            {formatDateShort(lang, selectedDate)}
          </span>
          {selectedTasks.length > 0 && (
            <Badge variant="accent">
              {selectedCompleted}/{selectedTasks.length}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => openAddTask(selectedDay)}>
          <Plus size={15} /> {t('planner.addTask')}
        </Button>
      </div>

      {selectedTasks.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={40} />}
          message={t('planner.noTasks')}
          action={
            <Button variant="primary" size="sm" onClick={() => openAddTask(selectedDay)}>
              <Plus size={15} /> {t('planner.addTask')}
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">{selectedTasks.map(renderTaskItem)}</div>
      )}
    </div>
  );

  // ---- Views --------------------------------------------------------------

  const renderDailyView = () => (
    <Card className="p-6">
      {/* Day navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {formatFullDate(lang, selectedDate)}
          </h2>
          {isToday(selectedDate) && (
            <span className="text-xs accent-text">{t('task.today2')}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handlePrevDay} aria-label={t('planner.prevDay')}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>
            <CalendarCheck size={15} /> {t('planner.today')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNextDay} aria-label={t('planner.nextDay')}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Task summary */}
      {selectedTasks.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
          <Check size={15} className="accent-text" />
          {selectedCompleted} / {selectedTasks.length} {t('planner.daily').toLowerCase()}
        </div>
      )}

      {/* Add task button */}
      <div className="mb-3">
        <Button variant="primary" size="sm" onClick={() => openAddTask(selectedDay)}>
          <Plus size={15} /> {t('planner.addTask')}
        </Button>
      </div>

      {/* Task list */}
      {selectedTasks.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={40} />}
          message={t('planner.noTasks')}
        />
      ) : (
        <div className="space-y-2">{selectedTasks.map(renderTaskItem)}</div>
      )}
    </Card>
  );

  const renderWeeklyView = () => (
    <Card className="p-6">
      {/* Week navigation */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {formatDateShort(lang, weekDays[0])} — {formatDateShort(lang, weekDays[6])}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setWeekRef(addWeeks(weekRef, -1))}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>
            <CalendarCheck size={15} /> {t('planner.today')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setWeekRef(addWeeks(weekRef, 1))}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
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
              <div
                className={`mt-1 text-lg font-bold ${
                  today ? 'accent-text' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {day.getDate()}
              </div>
              {dayTasks.length > 0 && (
                <div className="mt-1 text-xs text-slate-400">
                  {completed}/{dayTasks.length}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {renderSelectedDayTasks()}
    </Card>
  );

  const renderMonthlyView = () => (
    <Card className="p-6">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {tMonth(lang, monthRef.getMonth())} {monthRef.getFullYear()}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMonthRef(new Date(monthRef.getFullYear(), monthRef.getMonth() - 1, 1))}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>
            <CalendarCheck size={15} /> {t('planner.today')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMonthRef(new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 1))}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {MON_SUN.map(d => (
          <div key={d} className="py-1 text-center text-xs font-medium text-slate-400">
            {tDayShort(lang, d)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map(day => {
          const dayKey = formatDateKey(day);
          const dayTasks = tasksByDay[dayKey] || [];
          const inMonth = isSameMonth(day, monthRef);
          const isSelected = selectedDay === dayKey;
          const today = isToday(day);
          return (
            <button
              key={dayKey}
              onClick={() => setSelectedDay(dayKey)}
              className={`aspect-square rounded-lg border p-1 text-center transition-all ${
                isSelected
                  ? 'accent-border accent-bg'
                  : 'border-slate-100 hover:border-slate-200 dark:border-slate-700/40 dark:hover:border-slate-600'
              } ${!inMonth ? 'opacity-40' : ''}`}
            >
              <div
                className={`text-sm font-medium ${
                  today
                    ? 'accent-text'
                    : inMonth
                    ? 'text-slate-700 dark:text-slate-200'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              >
                {day.getDate()}
              </div>
              {dayTasks.length > 0 && (
                <div className="mt-0.5 flex justify-center">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      dayTasks.some(t => !t.completed) ? 'accent-bg' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {renderSelectedDayTasks()}
    </Card>
  );

  // ---- Class schedule -----------------------------------------------------

  const renderClassSchedule = () => (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={20} className="accent-text" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {t('classSchedule.title')}
          </h2>
        </div>
        <Button variant="primary" size="sm" onClick={openAddClass}>
          <Plus size={15} /> {t('classSchedule.add')}
        </Button>
      </div>

      {data.classes.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={40} />}
          message={t('classSchedule.empty')}
          action={
            <Button variant="primary" size="sm" onClick={openAddClass}>
              <Plus size={15} /> {t('classSchedule.add')}
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block scrollbar-thin">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-24 border-b border-slate-100 pb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-700/50">
                    {t('classSchedule.time')}
                  </th>
                  {MON_SUN.map(d => (
                    <th
                      key={d}
                      className="border-b border-slate-100 pb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-700/50"
                    >
                      {tDayShort(lang, d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td className="border-b border-slate-50 py-2 pr-2 text-xs font-medium text-slate-500 dark:border-slate-700/30 dark:text-slate-400">
                      {time}
                    </td>
                    {MON_SUN.map(d => {
                      const cellClasses = classesForCell(d, time);
                      return (
                        <td
                          key={d}
                          className="border-b border-slate-50 p-1 align-top dark:border-slate-700/30"
                        >
                          {cellClasses.map(cls => (
                            <div
                              key={cls.id}
                              className="group mb-1 rounded-lg border border-slate-100 bg-slate-50/50 p-2 dark:border-slate-700/40 dark:bg-slate-700/30"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="min-w-0">
                                  <div className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                                    {cls.subject}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {cls.startTime}–{cls.endTime}
                                  </div>
                                  {cls.location && (
                                    <div className="truncate text-xs text-slate-400">
                                      {cls.location}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <button
                                    onClick={() => openEditClass(cls)}
                                    className="text-slate-300 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300"
                                    aria-label={t('classSchedule.edit')}
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    onClick={() => deleteClass(cls.id)}
                                    className="text-slate-300 hover:text-red-500 dark:text-slate-500"
                                    aria-label={t('classSchedule.delete')}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked layout */}
          <div className="space-y-3 md:hidden">
            {classesByDay.map(({ day, classes }) => {
              if (classes.length === 0) return null;
              const isTodayCol = new Date().getDay() === day;
              return (
                <div key={day}>
                  <h3
                    className={`mb-2 text-xs font-semibold uppercase tracking-wide ${
                      isTodayCol ? 'accent-text' : 'text-slate-400'
                    }`}
                  >
                    {tDay(lang, day)}
                  </h3>
                  <div className="space-y-2">
                    {classes.map(cls => (
                      <div
                        key={cls.id}
                        className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-700/40 dark:bg-slate-700/30"
                      >
                        <Clock size={15} className="mt-0.5 flex-shrink-0 text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {cls.subject}
                          </div>
                          <div className="text-xs text-slate-400">
                            {cls.startTime}–{cls.endTime}
                          </div>
                          {cls.location && (
                            <div className="text-xs text-slate-400">{cls.location}</div>
                          )}
                          {cls.notes && (
                            <div className="mt-1 text-xs text-slate-400">{cls.notes}</div>
                          )}
                        </div>
                        <div className="flex flex-shrink-0 gap-2">
                          <button
                            onClick={() => openEditClass(cls)}
                            className="text-slate-300 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300"
                            aria-label={t('classSchedule.edit')}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteClass(cls.id)}
                            className="text-slate-300 hover:text-red-500 dark:text-slate-500"
                            aria-label={t('classSchedule.delete')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );

  // ---- Class form modal ---------------------------------------------------

  const dayOptions = MON_SUN.map(d => ({ value: String(d), label: tDay(lang, d) }));

  const renderClassForm = () => (
    <Modal
      open={classFormOpen}
      onClose={() => setClassFormOpen(false)}
      title={editClass ? t('classSchedule.edit') : t('classSchedule.add')}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label={t('classSchedule.subject')}
          value={classForm.subject}
          onChange={v => setClassForm({ ...classForm, subject: v })}
        />
        {classError && <p className="text-xs text-red-500">{classError}</p>}
        <Select
          label={t('classSchedule.day')}
          value={String(classForm.day)}
          onChange={v => setClassForm({ ...classForm, day: Number(v) })}
          options={dayOptions}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('classSchedule.startTime')}
            type="time"
            value={classForm.startTime}
            onChange={v => setClassForm({ ...classForm, startTime: v })}
          />
          <Input
            label={t('classSchedule.endTime')}
            type="time"
            value={classForm.endTime}
            onChange={v => setClassForm({ ...classForm, endTime: v })}
          />
        </div>
        <Input
          label={t('classSchedule.location')}
          value={classForm.location}
          onChange={v => setClassForm({ ...classForm, location: v })}
        />
        <Textarea
          label={t('classSchedule.notes')}
          value={classForm.notes}
          onChange={v => setClassForm({ ...classForm, notes: v })}
          rows={2}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setClassFormOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleClassSubmit}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );

  // ---- Page ---------------------------------------------------------------

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {t('planner.title')}
        </h1>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-700/50">
          {(['daily', 'weekly', 'monthly'] as PlannerView[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                view === v
                  ? 'accent-bg accent-text shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t(`planner.${v}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Active view */}
      {view === 'daily' && renderDailyView()}
      {view === 'weekly' && renderWeeklyView()}
      {view === 'monthly' && renderMonthlyView()}

      {/* Class schedule */}
      {renderClassSchedule()}

      {/* Modals */}
      <TaskForm
        open={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        editTask={editTask}
        defaultDate={defaultDate}
      />
      {renderClassForm()}
    </div>
  );
}
