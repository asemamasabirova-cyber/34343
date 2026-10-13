import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select, ProgressBar } from '@/components/ui/Form';
import { EmptyState, Toast } from '@/components/ui/EmptyState';
import type { Goal, GoalCategory, Milestone } from '@/types';
import { Plus, Trash2, Pencil, Target, Check, X, Calendar } from 'lucide-react';

const goalCatOptions = (t: (k: string) => string) => [
  { value: 'study', label: t('cat.study') },
  { value: 'career', label: t('cat.career') },
  { value: 'personal', label: t('cat.personalDev') },
  { value: 'health', label: t('cat.health') },
  { value: 'creativity', label: t('cat.creativity') },
  { value: 'other', label: t('cat.other') },
];

export function GoalsPage() {
  const { t, data, addGoal, updateGoal, deleteGoal, toggleMilestone, addMilestone, deleteMilestone } = useApp();

  const [formOpen, setFormOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('study');
  const [targetDate, setTargetDate] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = (msg: string) => { setToastMsg(msg); setToastShow(true); setTimeout(() => setToastShow(false), 2000); };

  const openCreate = () => {
    setEditGoal(null);
    setTitle(''); setDescription(''); setCategory('study'); setTargetDate(''); setMilestones([]); setNewMilestone(''); setError('');
    setFormOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditGoal(goal);
    setTitle(goal.title); setDescription(goal.description); setCategory(goal.category);
    setTargetDate(goal.targetDate || ''); setMilestones(goal.milestones); setNewMilestone(''); setError('');
    setFormOpen(true);
  };

  const addTempMilestone = () => {
    if (!newMilestone.trim()) return;
    setMilestones([...milestones, { id: `tmp-${Date.now()}`, title: newMilestone.trim(), completed: false }]);
    setNewMilestone('');
  };

  const removeTempMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) { setError(t('goal.titleField')); return; }
    const payload = { title: title.trim(), description: description.trim(), category, targetDate: targetDate || undefined, milestones, completed: editGoal?.completed ?? false };
    if (editGoal) { updateGoal(editGoal.id, payload); showToast(t('note.saved')); }
    else { addGoal(payload); showToast(t('note.saved')); }
    setFormOpen(false);
  };

  const calcProgress = (goal: Goal) => {
    if (goal.milestones.length === 0) return goal.completed ? 100 : 0;
    return Math.round((goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100);
  };

  const handleAddMilestone = (goalId: string) => {
    const title = prompt(t('goal.milestoneTitle'));
    if (title && title.trim()) addMilestone(goalId, title.trim());
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Target size={24} className="accent-text" />
          {t('goal.title')}
        </h1>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={16} /> {t('goal.add')}
        </Button>
      </div>

      {data.goals.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Target size={40} />}
            message={t('goal.empty')}
            action={<Button variant="primary" size="sm" onClick={openCreate}><Plus size={15} /> {t('goal.add')}</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.goals.map(goal => {
            const progress = calcProgress(goal);
            return (
              <Card key={goal.id} className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold text-base ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                      {goal.title}
                    </h3>
                    {goal.description && <p className="mt-1 text-sm text-slate-400 line-clamp-2">{goal.description}</p>}
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <button onClick={() => openEdit(goal)} className="text-slate-300 hover:text-slate-500 dark:text-slate-500" aria-label={t('goal.edit')}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deleteGoal(goal.id)} className="text-slate-300 hover:text-red-500 dark:text-slate-500" aria-label={t('goal.delete')}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="badge accent-bg accent-text">{t(`cat.${goal.category === 'personal' ? 'personalDev' : goal.category === 'career' ? 'career' : goal.category}`)}</span>
                  {goal.targetDate && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar size={11} /> {goal.targetDate}
                    </span>
                  )}
                  {goal.completed && <span className="badge bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">{t('goal.completed')}</span>}
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{t('goal.progress')}</span>
                    <span className="text-xs font-medium text-slate-500">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div className="space-y-1.5">
                    {goal.milestones.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMilestone(goal.id, m.id)}
                          className={`flex-shrink-0 rounded-full p-0.5 transition-all ${
                            m.completed ? 'accent-bg accent-text' : 'border-2 border-slate-300 text-transparent dark:border-slate-500'
                          }`}
                        >
                          <Check size={12} />
                        </button>
                        <span className={`text-sm ${m.completed ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
                          {m.title}
                        </span>
                        <button onClick={() => deleteMilestone(goal.id, m.id)} className="ml-auto text-slate-300 hover:text-red-500">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <Button variant="ghost" size="sm" onClick={() => handleAddMilestone(goal.id)}>
                    <Plus size={13} /> {t('goal.addMilestone')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateGoal(goal.id, { completed: !goal.completed })}
                    className={goal.completed ? '' : 'accent-text'}
                  >
                    <Check size={14} /> {t('goal.markComplete')}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editGoal ? t('goal.edit') : t('goal.add')} size="md">
        <div className="space-y-4">
          <div>
            <label className="label">{t('goal.titleField')}</label>
            <Input value={title} onChange={v => { setTitle(v); if (error && v.trim()) setError(''); }} />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <Textarea label={t('goal.descField')} value={description} onChange={setDescription} rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Select label={t('goal.category')} value={category} onChange={v => setCategory(v as GoalCategory)} options={goalCatOptions(t)} />
            <Input label={t('goal.targetDate')} type="date" value={targetDate} onChange={setTargetDate} />
          </div>

          <div>
            <label className="label">{t('goal.milestones')}</label>
            <div className="mb-2 space-y-1.5">
              {milestones.map(m => (
                <div key={m.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-1.5 dark:border-slate-700/40">
                  <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{m.title}</span>
                  <button onClick={() => removeTempMilestone(m.id)} className="text-slate-300 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input focus-ring flex-1"
                placeholder={t('goal.milestoneTitle')}
                value={newMilestone}
                onChange={e => setNewMilestone(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTempMilestone(); } }}
              />
              <Button variant="secondary" size="sm" onClick={addTempMilestone}>
                <Plus size={14} />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>{t('goal.cancel')}</Button>
            <Button variant="primary" onClick={handleSave}>{t('goal.save')}</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toastMsg} show={toastShow} />
    </div>
  );
}
