import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Select, Input } from '@/components/ui/Form';
import { Toast } from '@/components/ui/EmptyState';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Coffee, Sparkles } from 'lucide-react';

type Mode = 'focus' | 'short' | 'long' | 'custom';

const DURATIONS: Record<Mode, number> = {
  focus: 25,
  short: 5,
  long: 15,
  custom: 25,
};

export function FocusPage() {
  const { t, data, addFocusSession } = useApp();

  const [mode, setMode] = useState<Mode>('focus');
  const [customMin, setCustomMin] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remaining, setRemaining] = useState(25 * 60);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const duration = mode === 'custom' ? customMin : DURATIONS[mode];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 3000);
  };

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const tick = useCallback(() => {
    if (!endTimestamp) return;
    const now = Date.now();
    const diff = Math.floor((endTimestamp - now) / 1000);
    if (diff <= 0) {
      setRemaining(0);
      setIsRunning(false);
      setIsPaused(false);
      setEndTimestamp(null);
      clearTimer();
      addFocusSession({
        taskId: selectedTaskId || undefined,
        taskTitle: data.tasks.find(t => t.id === selectedTaskId)?.title,
        duration,
        completed: true,
        timestamp: Date.now(),
      });
      showToast(mode === 'focus' ? t('focus.sessionDone') : t('focus.breakDone'));
    } else {
      setRemaining(diff);
    }
  }, [endTimestamp, duration, mode, selectedTaskId, data.tasks, addFocusSession, showToast, t]);

  useEffect(() => {
    if (isRunning && endTimestamp) {
      intervalRef.current = setInterval(tick, 250);
      return () => clearTimer();
    }
  }, [isRunning, endTimestamp, tick]);

  const handleStart = () => {
    const totalSec = duration * 60;
    setRemaining(totalSec);
    setEndTimestamp(Date.now() + totalSec * 1000);
    setIsRunning(true);
    setIsPaused(false);
    addFocusSession({
      taskId: selectedTaskId || undefined,
      taskTitle: data.tasks.find(t => t.id === selectedTaskId)?.title,
      duration,
      completed: false,
      timestamp: Date.now(),
    });
  };

  const handlePause = () => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(true);
    if (endTimestamp) {
      const now = Date.now();
      const remainingMs = endTimestamp - now;
      setEndTimestamp(null);
      setRemaining(Math.max(0, Math.floor(remainingMs / 1000)));
    }
  };

  const handleResume = () => {
    setEndTimestamp(Date.now() + remaining * 1000);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleReset = () => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setEndTimestamp(null);
    setRemaining(duration * 60);
  };

  const switchMode = (m: Mode) => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setEndTimestamp(null);
    setMode(m);
    const d = m === 'custom' ? customMin : DURATIONS[m];
    setRemaining(d * 60);
  };

  const handleCustomChange = (v: string) => {
    const n = Math.max(1, Math.min(180, Number(v) || 1));
    setCustomMin(n);
    if (mode === 'custom' && !isRunning && !isPaused) {
      setRemaining(n * 60);
    }
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const totalSec = duration * 60;
  const progress = totalSec > 0 ? ((totalSec - remaining) / totalSec) * 100 : 0;

  const modes: { key: Mode; label: string; icon: typeof TimerIcon }[] = [
    { key: 'focus', label: t('focus.session'), icon: TimerIcon },
    { key: 'short', label: t('focus.shortBreak'), icon: Coffee },
    { key: 'long', label: t('focus.longBreak'), icon: Coffee },
    { key: 'custom', label: t('focus.custom'), icon: Sparkles },
  ];

  const incompleteTasks = data.tasks.filter(t => !t.completed);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <TimerIcon size={24} className="accent-text" />
          {t('focus.title')}
        </h1>
      </div>

      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2">
        {modes.map(m => (
          <button
            key={m.key}
            onClick={() => switchMode(m.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              mode === m.key
                ? 'accent-bg accent-text'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700/50 dark:text-slate-400'
            }`}
          >
            <m.icon size={16} /> {m.label}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <Card className="p-8 flex flex-col items-center gap-6">
        <div className="relative flex h-56 w-56 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" strokeWidth="8" className="stroke-slate-100 dark:stroke-slate-700" />
            <circle
              cx="100" cy="100" r="90" fill="none" strokeWidth="8"
              stroke="var(--accent-primary)"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
          <div className="text-center">
            <div className="text-5xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
              {timeStr}
            </div>
            <div className="mt-1 text-sm text-slate-400">
              {duration} {t('focus.minutes')}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isRunning && !isPaused && (
            <Button variant="primary" size="lg" onClick={handleStart}>
              <Play size={18} /> {t('focus.start')}
            </Button>
          )}
          {isRunning && (
            <Button variant="secondary" size="lg" onClick={handlePause}>
              <Pause size={18} /> {t('focus.pause')}
            </Button>
          )}
          {isPaused && (
            <Button variant="primary" size="lg" onClick={handleResume}>
              <Play size={18} /> {t('focus.resume')}
            </Button>
          )}
          <Button variant="ghost" size="lg" onClick={handleReset}>
            <RotateCcw size={18} /> {t('focus.reset')}
          </Button>
        </div>

        {mode === 'custom' && !isRunning && !isPaused && (
          <div className="w-48">
            <Input
              label={t('focus.customDuration')}
              type="number"
              value={String(customMin)}
              onChange={handleCustomChange}
            />
          </div>
        )}
      </Card>

      {/* Task selector */}
      <Card className="p-6">
        <Select
          label={t('focus.selectTask')}
          value={selectedTaskId}
          onChange={setSelectedTaskId}
          options={[
            { value: '', label: t('focus.noTask') },
            ...incompleteTasks.map(task => ({ value: task.id, label: task.title })),
          ]}
        />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <div className="text-sm text-slate-400">{t('focus.completed')}</div>
          <div className="mt-2 text-3xl font-bold accent-text">{data.focusStats.totalSessions}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-slate-400">{t('focus.totalTime')}</div>
          <div className="mt-2 text-3xl font-bold accent-text">
            {Math.floor(data.focusStats.totalMinutes / 60)}h {data.focusStats.totalMinutes % 60}m
          </div>
        </Card>
      </div>

      <Toast message={toastMsg} show={toastShow} />
    </div>
  );
}
