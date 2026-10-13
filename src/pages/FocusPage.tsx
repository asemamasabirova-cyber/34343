import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Select, Input } from '@/components/ui/Form';
import { Toast } from '@/components/ui/EmptyState';
import { Play, Pause, Square, RotateCcw, Timer as TimerIcon, Coffee, Sparkles, Bell } from 'lucide-react';
import { showNotification, requestNotificationPermission, notificationsSupported } from '@/lib/notifications';

type Mode = 'focus' | 'short' | 'long' | 'custom';

const DURATIONS: Record<Mode, number> = {
  focus: 25,
  short: 5,
  long: 15,
  custom: 25,
};

interface TimerState {
  mode: Mode;
  isRunning: boolean;
  isPaused: boolean;
  endTimestamp: number | null;
  remaining: number;
  selectedTaskId: string;
  customMin: number;
}

const TIMER_KEY = 'planora_timer_state';

function loadTimerState(): TimerState | null {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TimerState;
    if (parsed.isRunning && parsed.endTimestamp && parsed.endTimestamp <= Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveTimerState(state: TimerState): void {
  try {
    localStorage.setItem(TIMER_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function clearTimerState(): void {
  try {
    localStorage.removeItem(TIMER_KEY);
  } catch {
    // ignore
  }
}

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
  const [notifStatus, setNotifStatus] = useState<'idle' | 'asked'>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const duration = mode === 'custom' ? customMin : DURATIONS[mode];

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 3000);
  }, []);

  // Restore timer state on mount (handles page refresh and page switching)
  useEffect(() => {
    const saved = loadTimerState();
    if (saved) {
      setMode(saved.mode);
      setCustomMin(saved.customMin);
      setIsRunning(saved.isRunning);
      setIsPaused(saved.isPaused);
      setSelectedTaskId(saved.selectedTaskId);
      if (saved.isRunning && saved.endTimestamp) {
        const diff = Math.floor((saved.endTimestamp - Date.now()) / 1000);
        setRemaining(Math.max(0, diff));
        setEndTimestamp(saved.endTimestamp);
      } else {
        setRemaining(saved.remaining);
        setEndTimestamp(null);
      }
    }
  }, []);

  // Persist timer state whenever it changes
  useEffect(() => {
    if (isRunning || isPaused) {
      saveTimerState({ mode, isRunning, isPaused, endTimestamp, remaining, selectedTaskId, customMin });
    } else {
      clearTimerState();
    }
  }, [mode, isRunning, isPaused, endTimestamp, remaining, selectedTaskId, customMin]);

  // Ask for notification permission when starting a session
  const ensureNotificationPermission = useCallback(async () => {
    if (!notificationsSupported()) {
      if (notifStatus === 'idle') {
        showToast(t('notif.unsupported'));
        setNotifStatus('asked');
      }
      return;
    }
    if (Notification.permission === 'default' && notifStatus === 'idle') {
      const granted = await requestNotificationPermission();
      setNotifStatus('asked');
      showToast(granted ? t('notif.enabled') : t('notif.denied'));
    }
  }, [notifStatus, showToast, t]);

  const handleSessionComplete = useCallback(() => {
    setRemaining(0);
    setIsRunning(false);
    setIsPaused(false);
    setEndTimestamp(null);
    clearTimerState();
    addFocusSession({
      taskId: selectedTaskId || undefined,
      taskTitle: data.tasks.find(t => t.id === selectedTaskId)?.title,
      duration,
      completed: true,
      timestamp: Date.now(),
    });
    const msg = mode === 'focus' ? t('focus.sessionDone') : t('focus.breakDone');
    showToast(msg);
    showNotification(t('focus.notificationTitle'), t('focus.notificationBody'));
  }, [selectedTaskId, data.tasks, addFocusSession, duration, mode, showToast, t]);

  // Single ticking effect — runs while isRunning
  useEffect(() => {
    if (!isRunning || !endTimestamp) return;
    const tick = () => {
      const diff = Math.floor((endTimestamp - Date.now()) / 1000);
      if (diff <= 0) {
        handleSessionComplete();
      } else {
        setRemaining(diff);
      }
    };
    tick();
    intervalRef.current = setInterval(tick, 250);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, endTimestamp, handleSessionComplete]);

  const handleStart = async () => {
    const totalSec = duration * 60;
    setRemaining(totalSec);
    setEndTimestamp(Date.now() + totalSec * 1000);
    setIsRunning(true);
    setIsPaused(false);
    await ensureNotificationPermission();
    addFocusSession({
      taskId: selectedTaskId || undefined,
      taskTitle: data.tasks.find(t => t.id === selectedTaskId)?.title,
      duration,
      completed: false,
      timestamp: Date.now(),
    });
  };

  const handlePause = () => {
    if (endTimestamp) {
      const remainingMs = endTimestamp - Date.now();
      setRemaining(Math.max(0, Math.floor(remainingMs / 1000)));
    }
    setIsRunning(false);
    setIsPaused(true);
    setEndTimestamp(null);
  };

  const handleResume = () => {
    setEndTimestamp(Date.now() + remaining * 1000);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setEndTimestamp(null);
    setRemaining(duration * 60);
    clearTimerState();
  };

  const handleReset = () => {
    handleStop();
  };

  const switchMode = (m: Mode) => {
    setIsRunning(false);
    setIsPaused(false);
    setEndTimestamp(null);
    setMode(m);
    const d = m === 'custom' ? customMin : DURATIONS[m];
    setRemaining(d * 60);
    clearTimerState();
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
          {(isRunning || isPaused) && (
            <Button variant="ghost" size="lg" onClick={handleStop}>
              <Square size={18} /> {t('focus.stop')}
            </Button>
          )}
          {!(isRunning || isPaused) && remaining < duration * 60 && (
            <Button variant="ghost" size="lg" onClick={handleReset}>
              <RotateCcw size={18} /> {t('focus.reset')}
            </Button>
          )}
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
