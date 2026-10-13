import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select, Badge, ProgressBar } from '@/components/ui/Form';
import { EmptyState, Toast } from '@/components/ui/EmptyState';
import { startOfWeek, addDays, formatDateKey, parseDateKey, formatDateShort } from '@/lib/dates';
import type { SportRecord, SportCategory } from '@/types';
import { Plus, Trash2, Pencil, Activity, Check, Calendar } from 'lucide-react';

const catOpts = (t: (k: string) => string) => [
  { value: 'walk', label: t('sport.walk') },
  { value: 'stretch', label: t('sport.stretch') },
  { value: 'home', label: t('sport.home') },
  { value: 'dance', label: t('sport.dance') },
  { value: 'bike', label: t('sport.bike') },
  { value: 'other', label: t('sport.other') },
];

export function SportPage() {
  const { t, lang, data, addSportRecord, updateSportRecord, deleteSportRecord, updateSportGoal } = useApp();

  const [formOpen, setFormOpen] = useState(false);
  const [editRec, setEditRec] = useState<SportRecord | null>(null);
  const [form, setForm] = useState({
    name: '', category: 'walk' as SportCategory, date: formatDateKey(new Date()),
    duration: 30, notes: '', completed: true,
  });
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [targetInput, setTargetInput] = useState(String(data.sportGoal.weeklyTarget));

  const showToast = (m: string) => { setToastMsg(m); setToastShow(true); setTimeout(() => setToastShow(false), 2000); };

  const openCreate = () => {
    setEditRec(null);
    setForm({ name: '', category: 'walk', date: formatDateKey(new Date()), duration: 30, notes: '', completed: true });
    setError(''); setFormOpen(true);
  };

  const openEdit = (rec: SportRecord) => {
    setEditRec(rec);
    setForm({ name: rec.name, category: rec.category, date: rec.date, duration: rec.duration, notes: rec.notes, completed: rec.completed });
    setError(''); setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError(t('sport.name')); return; }
    const payload = {
      name: form.name.trim(), category: form.category, date: form.date,
      duration: Number(form.duration) || 0, notes: form.notes.trim(), completed: form.completed,
    };
    if (editRec) { updateSportRecord(editRec.id, payload); showToast(t('note.saved')); }
    else { addSportRecord(payload); showToast(t('note.saved')); }
    setFormOpen(false);
  };

  // Weekly summary
  const weekStart = startOfWeek(new Date());
  const weekEnd = addDays(weekStart, 6);
  const weekStartKey = formatDateKey(weekStart);
  const weekEndKey = formatDateKey(weekEnd);

  const weekRecords = useMemo(() =>
    data.sportRecords.filter(r => r.date >= weekStartKey && r.date <= weekEndKey)
    , [data.sportRecords, weekStartKey, weekEndKey]);

  const weekMinutes = weekRecords.filter(r => r.completed).reduce((sum, r) => sum + r.duration, 0);
  const target = data.sportGoal.weeklyTarget;
  const targetProgress = target > 0 ? Math.min(100, (weekMinutes / target) * 100) : 0;
  const targetReached = weekMinutes >= target;

  const sortedRecords = useMemo(() =>
    data.sportRecords.slice().sort((a, b) => b.date.localeCompare(a.date))
  , [data.sportRecords]);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Activity size={24} className="accent-text" />
          {t('sport.title')}
        </h1>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={16} /> {t('sport.add')}
        </Button>
      </div>

      {/* Weekly summary */}
      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('sport.weeklySummary')}</h2>
          <span className="text-sm text-slate-400">{t('sport.thisWeek')}: {formatDateShort(lang, weekStart)} — {formatDateShort(lang, weekEnd)}</span>
        </div>

        <div className="mb-4 flex items-end gap-3">
          <div className="text-3xl font-bold accent-text">{weekMinutes}</div>
          <div className="text-sm text-slate-400 pb-1">{t('common.min')}</div>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-slate-400">{t('sport.weeklyTarget')}:</label>
            <input
              type="number"
              className="input focus-ring w-24"
              value={targetInput}
              onChange={e => setTargetInput(e.target.value)}
              onBlur={() => updateSportGoal(Number(targetInput) || 0, data.sportGoal.activityType)}
            />
          </div>
        </div>

        <ProgressBar value={targetProgress} showLabel />

        <p className={`mt-2 text-sm ${targetReached ? 'accent-text font-medium' : 'text-slate-400'}`}>
          {targetReached ? t('sport.targetReached') : `${Math.round(targetProgress)}% — ${t('sport.keepGoing')}`}
        </p>

        {/* Day-by-day breakdown */}
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }, (_, i) => {
            const day = addDays(weekStart, i);
            const dayKey = formatDateKey(day);
            const dayMins = weekRecords.filter(r => r.date === dayKey && r.completed).reduce((s, r) => s + r.duration, 0);
            return (
              <div key={i} className="rounded-lg border border-slate-100 p-2 text-center dark:border-slate-700/40">
                <div className="text-xs text-slate-400">{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i]}</div>
                <div className={`mt-1 text-sm font-bold ${dayMins > 0 ? 'accent-text' : 'text-slate-300 dark:text-slate-600'}`}>
                  {dayMins > 0 ? dayMins : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Records */}
      {data.sportRecords.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Activity size={40} />} message={t('sport.empty')}
            action={<Button variant="primary" size="sm" onClick={openCreate}><Plus size={15} /> {t('sport.add')}</Button>} />
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedRecords.map(rec => (
            <Card key={rec.id} className="p-4 flex items-center gap-3">
              <button
                onClick={() => updateSportRecord(rec.id, { completed: !rec.completed })}
                className={`flex-shrink-0 rounded-full p-1.5 transition-all ${
                  rec.completed ? 'accent-bg accent-text' : 'border-2 border-slate-300 text-transparent dark:border-slate-500'
                }`}
              >
                <Check size={16} />
              </button>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${rec.completed ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                  {rec.name}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="default">{t(`sport.${rec.category}`)}</Badge>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar size={11} /> {formatDateShort(lang, parseDateKey(rec.date))}
                  </span>
                  <span className="text-xs text-slate-400">{rec.duration} {t('common.min')}</span>
                  {rec.notes && <span className="text-xs text-slate-400 line-clamp-1">{rec.notes}</span>}
                </div>
              </div>
              <button onClick={() => openEdit(rec)} className="flex-shrink-0 text-slate-300 hover:text-slate-500 dark:text-slate-500">
                <Pencil size={16} />
              </button>
              <button onClick={() => deleteSportRecord(rec.id)} className="flex-shrink-0 text-slate-300 hover:text-red-500 dark:text-slate-500">
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editRec ? t('sport.edit') : t('sport.add')} size="md">
        <div className="space-y-4">
          <div>
            <label className="label">{t('sport.name')}</label>
            <Input value={form.name} onChange={v => { setForm({ ...form, name: v }); if (error && v.trim()) setError(''); }} />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label={t('sport.category')} value={form.category} onChange={v => setForm({ ...form, category: v as SportCategory })} options={catOpts(t)} />
            <Input label={t('sport.date')} type="date" value={form.date} onChange={v => setForm({ ...form, date: v })} />
          </div>
          <Input label={t('sport.duration')} type="number" value={String(form.duration)} onChange={v => setForm({ ...form, duration: Number(v) || 0 })} />
          <Textarea label={t('sport.notes')} value={form.notes} onChange={v => setForm({ ...form, notes: v })} rows={2} />
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input type="checkbox" checked={form.completed} onChange={e => setForm({ ...form, completed: e.target.checked })}
              className="h-4 w-4" style={{ accentColor: 'var(--accent-primary)' }} />
            <span className="text-sm">{t('sport.completed')}</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>{t('sport.cancel')}</Button>
            <Button variant="primary" onClick={handleSave}>{t('sport.save')}</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toastMsg} show={toastShow} />
    </div>
  );
}
