import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select, Badge, ProgressBar } from '@/components/ui/Form';
import { EmptyState, Toast } from '@/components/ui/EmptyState';
import type { Book, BookStatus } from '@/types';
import { Plus, Trash2, Pencil, Search, BookOpen, Star, Heart } from 'lucide-react';

const statusOptions = (t: (k: string) => string) => [
  { value: 'want', label: t('book.want') },
  { value: 'reading', label: t('book.reading') },
  { value: 'done', label: t('book.done') },
];

const statusBadge: Record<BookStatus, 'default' | 'accent' | 'success'> = {
  want: 'default', reading: 'accent', done: 'success',
};

export function BooksPage() {
  const { t, data, addBook, updateBook, deleteBook } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [form, setForm] = useState({
    title: '', author: '', totalPages: 0, currentPage: 0, status: 'want' as BookStatus,
    startDate: '', completionDate: '', rating: 0, notes: '', favorite: false,
  });
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = (m: string) => { setToastMsg(m); setToastShow(true); setTimeout(() => setToastShow(false), 2000); };

  const openCreate = () => {
    setEditBook(null);
    setForm({ title: '', author: '', totalPages: 0, currentPage: 0, status: 'want', startDate: '', completionDate: '', rating: 0, notes: '', favorite: false });
    setError(''); setFormOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditBook(book);
    setForm({
      title: book.title, author: book.author, totalPages: book.totalPages,
      currentPage: book.currentPage, status: book.status,
      startDate: book.startDate || '', completionDate: book.completionDate || '',
      rating: book.rating, notes: book.notes, favorite: book.favorite,
    });
    setError(''); setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { setError(t('book.titleField')); return; }
    const payload = {
      title: form.title.trim(), author: form.author.trim(),
      totalPages: Number(form.totalPages) || 0, currentPage: Number(form.currentPage) || 0,
      status: form.status, startDate: form.startDate || undefined,
      completionDate: form.completionDate || undefined, rating: Number(form.rating) || 0,
      notes: form.notes.trim(), favorite: form.favorite,
    };
    if (editBook) { updateBook(editBook.id, payload); showToast(t('note.saved')); }
    else { addBook(payload); showToast(t('note.saved')); }
    setFormOpen(false);
  };

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.books
      .filter(b => {
        if (statusFilter !== 'all' && b.status !== statusFilter) return false;
        if (term && !b.title.toLowerCase().includes(term) && !b.author.toLowerCase().includes(term)) return false;
        return true;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [data.books, search, statusFilter]);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-600'} />
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BookOpen size={24} className="accent-text" />
          {t('book.title')}
        </h1>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={16} /> {t('book.add')}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input focus-ring pl-9" placeholder={t('book.search')} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: t('common.all') },
            ...statusOptions(t),
          ]}
          className="sm:w-40"
        />
      </div>

      {data.books.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<BookOpen size={40} />} message={t('book.empty')}
            action={<Button variant="primary" size="sm" onClick={openCreate}><Plus size={15} /> {t('book.add')}</Button>} />
        </Card>
      ) : filteredBooks.length === 0 ? (
        <Card className="p-6"><EmptyState icon={<Search size={40} />} message={t('common.search')} /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map(book => {
            const progress = book.totalPages > 0 ? Math.min(100, (book.currentPage / book.totalPages) * 100) : 0;
            return (
              <Card key={book.id} className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 line-clamp-2">{book.title}</h3>
                    {book.author && <p className="mt-0.5 text-sm text-slate-400">{book.author}</p>}
                  </div>
                  <button onClick={() => updateBook(book.id, { favorite: !book.favorite })} className="flex-shrink-0 rounded-lg p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                    <Heart size={16} className={book.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'} />
                  </button>
                </div>

                <Badge variant={statusBadge[book.status]}>{t(`book.${book.status}`)}</Badge>

                {book.totalPages > 0 && (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                      <span>{book.currentPage} / {book.totalPages} {t('common.pages')}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <ProgressBar value={progress} />
                  </div>
                )}

                {book.rating > 0 && renderStars(book.rating)}

                {book.notes && <p className="text-sm text-slate-400 line-clamp-2">{book.notes}</p>}

                <div className="flex gap-2 pt-1">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEdit(book)}>
                    <Pencil size={14} /> {t('book.edit')}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteBook(book.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editBook ? t('book.edit') : t('book.add')} size="md">
        <div className="space-y-4">
          <div>
            <label className="label">{t('book.titleField')}</label>
            <Input value={form.title} onChange={v => { setForm({ ...form, title: v }); if (error && v.trim()) setError(''); }} />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <Input label={t('book.author')} value={form.author} onChange={v => setForm({ ...form, author: v })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('book.totalPages')} type="number" value={String(form.totalPages)} onChange={v => setForm({ ...form, totalPages: Number(v) || 0 })} />
            <Input label={t('book.currentPage')} type="number" value={String(form.currentPage)} onChange={v => setForm({ ...form, currentPage: Number(v) || 0 })} />
          </div>
          <Select label={t('book.status')} value={form.status} onChange={v => setForm({ ...form, status: v as BookStatus })} options={statusOptions(t)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('book.startDate')} type="date" value={form.startDate} onChange={v => setForm({ ...form, startDate: v })} />
            <Input label={t('book.completionDate')} type="date" value={form.completionDate} onChange={v => setForm({ ...form, completionDate: v })} />
          </div>
          <div>
            <label className="label">{t('book.rating')}</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} onClick={() => setForm({ ...form, rating: i + 1 === form.rating ? 0 : i + 1 })}>
                  <Star size={22} className={i < form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'} />
                </button>
              ))}
            </div>
          </div>
          <Textarea label={t('book.notes')} value={form.notes} onChange={v => setForm({ ...form, notes: v })} rows={2} />
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input type="checkbox" checked={form.favorite} onChange={e => setForm({ ...form, favorite: e.target.checked })}
              className="h-4 w-4" style={{ accentColor: 'var(--accent-primary)' }} />
            <span className="flex items-center gap-1 text-sm"><Heart size={15} className="text-yellow-400" /> {t('book.favorite')}</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>{t('book.cancel')}</Button>
            <Button variant="primary" onClick={handleSave}>{t('book.save')}</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toastMsg} show={toastShow} />
    </div>
  );
}
