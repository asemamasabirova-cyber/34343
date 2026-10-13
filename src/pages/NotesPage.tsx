import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select, Badge } from '@/components/ui/Form';
import { EmptyState, Toast } from '@/components/ui/EmptyState';
import type { Note, NoteCategory } from '@/types';
import { Plus, Trash2, Pencil, Search, Star, FileText, Heart } from 'lucide-react';

export function NotesPage() {
  const { data, addNote, updateNote, deleteNote, t, lang } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('study');
  const [favorite, setFavorite] = useState(false);
  const [titleError, setTitleError] = useState(false);

  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2000);
  };

  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  const catOptions = useMemo(() => [
    { value: 'all', label: t('common.all') },
    { value: 'study', label: t('cat.study') },
    { value: 'ideas', label: t('cat.ideas') },
    { value: 'personal', label: t('cat.personal') },
    { value: 'projects', label: t('cat.projects') },
    { value: 'other', label: t('cat.other') },
  ], [t]);

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.notes
      .filter(n => {
        if (favoritesOnly && !n.favorite) return false;
        if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
        if (term && !n.title.toLowerCase().includes(term) && !n.content.toLowerCase().includes(term)) return false;
        return true;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [data.notes, search, categoryFilter, favoritesOnly]);

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('study');
    setFavorite(false);
    setTitleError(false);
    setEditorOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setFavorite(note.favorite);
    setTitleError(false);
    setEditorOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    const payload = { title: title.trim(), content: content.trim(), category, favorite };
    if (editingId) {
      updateNote(editingId, payload);
      showToast(t('note.saved'));
    } else {
      addNote(payload);
      showToast(t('note.saved'));
    }
    setEditorOpen(false);
  };

  const handleDelete = (note: Note) => {
    deleteNote(note.id);
    showToast(t('common.delete'));
  };

  const toggleFav = (note: Note) => {
    updateNote(note.id, { favorite: !note.favorite });
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText size={24} className="accent-text" />
          {t('note.title')}
        </h1>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={16} /> {t('note.add')}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input focus-ring pl-9"
            placeholder={t('note.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={catOptions}
          className="sm:w-44"
        />
        <Button
          variant={favoritesOnly ? 'primary' : 'secondary'}
          onClick={() => setFavoritesOnly(v => !v)}
          className="sm:w-auto"
        >
          <Star size={16} className={favoritesOnly ? 'fill-current' : ''} />
          {t('quote.favorites')}
        </Button>
      </div>

      {data.notes.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<FileText size={40} />}
            message={t('note.empty')}
            action={<Button variant="primary" size="sm" onClick={openCreate}><Plus size={15} /> {t('note.add')}</Button>}
          />
        </Card>
      ) : filteredNotes.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Search size={40} />} message={t('common.search')} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map(note => (
            <Card key={note.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base leading-snug text-slate-800 dark:text-slate-100 line-clamp-2">
                  {note.title}
                </h3>
                <button
                  onClick={() => toggleFav(note)}
                  className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                  aria-label={t('note.favorite')}
                >
                  <Star
                    size={18}
                    className={note.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}
                  />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 flex-1 whitespace-pre-wrap line-clamp-4">
                {note.content || <span className="italic text-slate-400">{t('note.contentField')}</span>}
              </p>
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-700/50">
                <Badge variant="accent">{t(`cat.${note.category}`)}</Badge>
                <span className="text-xs text-slate-400">{fmt(note.updatedAt)}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEdit(note)}>
                  <Pencil size={14} /> {t('note.edit')}
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(note)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingId ? t('note.edit') : t('note.add')}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">{t('note.titleField')}</label>
            <Input value={title} onChange={v => { setTitle(v); if (titleError && v.trim()) setTitleError(false); }} />
            {titleError && <p className="mt-1 text-xs text-red-500">{t('note.saveError')}</p>}
          </div>
          <Textarea
            label={t('note.contentField')}
            value={content}
            onChange={setContent}
            rows={5}
          />
          <Select
            label={t('note.category')}
            value={category}
            onChange={v => setCategory(v as NoteCategory)}
            options={[
              { value: 'study', label: t('cat.study') },
              { value: 'ideas', label: t('cat.ideas') },
              { value: 'personal', label: t('cat.personal') },
              { value: 'projects', label: t('cat.projects') },
              { value: 'other', label: t('cat.other') },
            ]}
          />
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={favorite}
              onChange={e => setFavorite(e.target.checked)}
              className="h-4 w-4"
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            <span className="flex items-center gap-1 text-sm">
              <Heart size={15} className="text-yellow-400" />
              {t('note.favorite')}
            </span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>{t('note.cancel')}</Button>
            <Button variant="primary" onClick={handleSave}>{t('note.save')}</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toastMsg} show={toastShow} />
    </div>
  );
}
