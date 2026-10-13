import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { useApp } from '@/context/AppContext';
import type { Task, Priority, TaskCategory } from '@/types';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  editTask?: Task | null;
  defaultDate?: string;
}

export function TaskForm({ open, onClose, editTask, defaultDate }: TaskFormProps) {
  const { t, addTask, updateTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('study');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description);
        setDate(editTask.date);
        setStartTime(editTask.startTime || '');
        setEndTime(editTask.endTime || '');
        setPriority(editTask.priority);
        setCategory(editTask.category);
        setRecurrence(editTask.recurrence || 'none');
      } else {
        setTitle('');
        setDescription('');
        setDate(defaultDate || new Date().toISOString().slice(0, 10));
        setStartTime('');
        setEndTime('');
        setPriority('medium');
        setCategory('study');
        setRecurrence('none');
      }
      setError('');
    }
  }, [open, editTask, defaultDate]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError(t('task.titleField'));
      return;
    }
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      priority,
      category,
      completed: editTask?.completed ?? false,
      recurrence,
    };
    if (editTask) {
      updateTask(editTask.id, taskData);
    } else {
      addTask(taskData);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editTask ? t('task.edit') : t('task.add')}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label={t('task.titleField')}
          value={title}
          onChange={setTitle}
          placeholder=""
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Textarea
          label={t('task.descField')}
          value={description}
          onChange={setDescription}
          rows={2}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('task.dateField')} value={date} onChange={setDate} type="date" />
          <Select
            label={t('task.priority')}
            value={priority}
            onChange={(v) => setPriority(v as Priority)}
            options={[
              { value: 'low', label: t('priority.low') },
              { value: 'medium', label: t('priority.medium') },
              { value: 'high', label: t('priority.high') },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('task.startTime')} value={startTime} onChange={setStartTime} type="time" />
          <Input label={t('task.endTime')} value={endTime} onChange={setEndTime} type="time" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('task.category')}
            value={category}
            onChange={(v) => setCategory(v as TaskCategory)}
            options={[
              { value: 'study', label: t('cat.study') },
              { value: 'personal', label: t('cat.personal') },
              { value: 'work', label: t('cat.work') },
              { value: 'health', label: t('cat.health') },
              { value: 'other', label: t('cat.other') },
            ]}
          />
          <Select
            label={t('task.recurrence')}
            value={recurrence}
            onChange={(v) => setRecurrence(v as 'none' | 'daily' | 'weekly')}
            options={[
              { value: 'none', label: t('common.none2') },
              { value: 'daily', label: t('common.daily') },
              { value: 'weekly', label: t('common.weekly') },
            ]}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>{t('task.cancel')}</Button>
          <Button variant="primary" onClick={handleSubmit}>{t('task.save')}</Button>
        </div>
      </div>
    </Modal>
  );
}
