import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select, Badge } from '@/components/ui/Form';
import { EmptyState, Toast } from '@/components/ui/EmptyState';
import type { Film, FilmStatus, FilmType } from '@/types';
import { Plus, Trash2, Pencil, Search, Film as FilmIcon, Star, Heart } from 'lucide-react';

const statusOpts = (t: (k: string) => string) => [
  { value: 'want', label: t('film.want') },
  { value: 'watching', label: t('film.watching') },
  { value: 'watched', label: t('film.watched') },
];

const typeOpts = (t: (k: string) => string) => [
  { value: 'film', label: t('film.typeFilm') },
  { value: 'series', label: t('film.typeSeries') },
  { value: 'dorama', label: t('film.typeDorama') },
];

const statusBadge: Record<FilmStatus, 'default' | 'accent' | 'success'> = {
  want: 'default', watching: 'accent', watched: 'success',
};

export function FilmsPage() {
  const { t, data, addFilm, updateFilm, deleteFilm } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [favOnly, setFavOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editFilm, setEditFilm] = useState<Film | null>(null);
  const [form, setForm] = useState({
    title: '', type: 'film' as FilmType, genre: '', status: 'want' as FilmStatus,
    rating: 0, dateWatched: '', review: '', favorite: false,
  });
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = (m: string) => { setToastMsg(m); setToastShow(true); setTimeout(() => setToastShow(false), 2000); };

  const openCreate = () => {
    setEditFilm(null);
    setForm({ title: '', type: 'film', genre: '', status: 'want', rating: 0, dateWatched: '', review: '', favorite: false });
    setError(''); setFormOpen(true);
  };

  const openEdit = (film: Film) => {
    setEditFilm(film);
    setForm({
      title: film.title, type: film.type, genre: film.genre, status: film.status,
      rating: film.rating, dateWatched: film.dateWatched || '', review: film.review, favorite: film.favorite,
    });
    setError(''); setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { setError(t('film.titleField')); return; }
    const payload = {
      title: form.title.trim(), type: form.type, genre: form.genre.trim(),
      status: form.status, rating: Number(form.rating) || 0,
      dateWatched: form.dateWatched || undefined, review: form.review.trim(), favorite: form.favorite,
    };
    if (editFilm) { updateFilm(editFilm.id, payload); showToast(t('note.saved')); }
    else { addFilm(payload); showToast(t('note.saved')); }
    setFormOpen(false);
  };

  const filteredFilms = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.films
      .filter(f => {
        if (favOnly && !f.favorite) return false;
        if (statusFilter !== 'all' && f.status !== statusFilter) return false;
        if (term && !f.title.toLowerCase().includes(term) && !f.genre.toLowerCase().includes(term)) return false;
        return true;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [data.films, search, statusFilter, favOnly]);

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
          <FilmIcon size={24} className="accent-text" />
          {t('film.title')}
        </h1>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={16} /> {t('film.add')}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input focus-ring pl-9" placeholder={t('film.search')} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onChange={setStatusFilter}
          options={[{ value: 'all', label: t('film.all') }, ...statusOpts(t)]} className="sm:w-40" />
        <Button variant={favOnly ? 'primary' : 'secondary'} onClick={() => setFavOnly(v => !v)}>
          <Heart size={16} className={favOnly ? 'fill-current' : ''} /> {t('film.favorites')}
        </Button>
      </div>

      {data.films.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<FilmIcon size={40} />} message={t('film.empty')}
            action={<Button variant="primary" size="sm" onClick={openCreate}><Plus size={15} /> {t('film.add')}</Button>} />
        </Card>
      ) : filteredFilms.length === 0 ? (
        <Card className="p-6"><EmptyState icon={<Search size={40} />} message={t('common.search')} /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFilms.map(film => (
            <Card key={film.id} className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 line-clamp-2">{film.title}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="default">{t(`film.type${film.type.charAt(0).toUpperCase() + film.type.slice(1)}`)}</Badge>
                    {film.genre && <span className="text-xs text-slate-400">{film.genre}</span>}
                  </div>
                </div>
                <button onClick={() => updateFilm(film.id, { favorite: !film.favorite })} className="flex-shrink-0 rounded-lg p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                  <Heart size={16} className={film.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'} />
                </button>
              </div>

              <Badge variant={statusBadge[film.status]}>{t(`film.${film.status}`)}</Badge>

              {film.rating > 0 && renderStars(film.rating)}
              {film.dateWatched && <span className="text-xs text-slate-400">{film.dateWatched}</span>}
              {film.review && <p className="text-sm text-slate-400 line-clamp-2">{film.review}</p>}

              <div className="flex gap-2 pt-1">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEdit(film)}>
                  <Pencil size={14} /> {t('film.edit')}
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteFilm(film.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editFilm ? t('film.edit') : t('film.add')} size="md">
        <div className="space-y-4">
          <div>
            <label className="label">{t('film.titleField')}</label>
            <Input value={form.title} onChange={v => { setForm({ ...form, title: v }); if (error && v.trim()) setError(''); }} />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label={t('film.type')} value={form.type} onChange={v => setForm({ ...form, type: v as FilmType })} options={typeOpts(t)} />
            <Select label={t('film.status')} value={form.status} onChange={v => setForm({ ...form, status: v as FilmStatus })} options={statusOpts(t)} />
          </div>
          <Input label={t('film.genre')} value={form.genre} onChange={v => setForm({ ...form, genre: v })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('film.dateWatched')} type="date" value={form.dateWatched} onChange={v => setForm({ ...form, dateWatched: v })} />
            <div>
              <label className="label">{t('film.rating')}</label>
              <div className="flex gap-1 pt-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <button key={i} onClick={() => setForm({ ...form, rating: i + 1 === form.rating ? 0 : i + 1 })}>
                    <Star size={20} className={i < form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Textarea label={t('film.review')} value={form.review} onChange={v => setForm({ ...form, review: v })} rows={3} />
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input type="checkbox" checked={form.favorite} onChange={e => setForm({ ...form, favorite: e.target.checked })}
              className="h-4 w-4" style={{ accentColor: 'var(--accent-primary)' }} />
            <span className="flex items-center gap-1 text-sm"><Heart size={15} className="text-yellow-400" /> {t('film.favorite')}</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>{t('film.cancel')}</Button>
            <Button variant="primary" onClick={handleSave}>{t('film.save')}</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toastMsg} show={toastShow} />
    </div>
  );
}
