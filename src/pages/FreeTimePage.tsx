import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Badge } from '@/components/ui/Form';
import { EmptyState, Toast } from '@/components/ui/EmptyState';
import { Shuffle, Heart, Check, Plus, Sparkles, Star } from 'lucide-react';

const CATEGORY_KEYS = [
  'freetime.art', 'freetime.music', 'freetime.selfdev', 'freetime.it',
  'freetime.reading', 'freetime.creative', 'freetime.walking', 'freetime.games',
  'freetime.languages', 'freetime.rest', 'freetime.social',
];

export function FreeTimePage() {
  const { t, data, addFreeTimeIdea, toggleFreeTimeFavorite, toggleFreeTimeCompleted } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [favOnly, setFavOnly] = useState(false);
  const [randomIdea, setRandomIdea] = useState<typeof data.freeTimeIdeas[0] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [ideaText, setIdeaText] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('freetime.art');
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = (m: string) => { setToastMsg(m); setToastShow(true); setTimeout(() => setToastShow(false), 2000); };

  const catOptions = useMemo(() => [
    { value: 'all', label: t('freetime.all') },
    ...CATEGORY_KEYS.map(k => ({ value: k, label: t(k) })),
  ], [t]);

  const filteredIdeas = useMemo(() => {
    return data.freeTimeIdeas.filter(idea => {
      if (favOnly && !idea.favorite) return false;
      if (categoryFilter !== 'all' && idea.category !== categoryFilter) return false;
      return true;
    });
  }, [data.freeTimeIdeas, categoryFilter, favOnly]);

  const handleRandom = () => {
    const pool = data.freeTimeIdeas.filter(i => !i.completed);
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setRandomIdea(pick);
  };

  const handleSaveIdea = () => {
    if (!ideaText.trim()) return;
    addFreeTimeIdea(ideaText.trim(), ideaCategory);
    setIdeaText('');
    setFormOpen(false);
    showToast(t('note.saved'));
  };

  // Group ideas by category for display
  const groupedIdeas = useMemo(() => {
    const groups: Record<string, typeof data.freeTimeIdeas> = {};
    for (const idea of filteredIdeas) {
      if (!groups[idea.category]) groups[idea.category] = [];
      groups[idea.category].push(idea);
    }
    return groups;
  }, [filteredIdeas]);

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles size={24} className="accent-text" />
          {t('freetime.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-400">{t('freetime.subtitle')}</p>
      </div>

      {/* Random idea */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('freetime.random')}</h2>
            {randomIdea && (
              <div className="mt-3 animate-fade-in rounded-xl accent-bg p-4">
                <Badge variant="accent">{t(randomIdea.category)}</Badge>
                <p className="mt-2 text-base font-medium text-slate-700 dark:text-slate-200">{randomIdea.text}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleFreeTimeFavorite(randomIdea.id)}>
                    <Heart size={14} className={randomIdea.favorite ? 'fill-current text-yellow-400' : ''} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleFreeTimeCompleted(randomIdea.id)}>
                    <Check size={14} className={randomIdea.completed ? 'accent-text' : ''} />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <Button variant="primary" onClick={handleRandom}>
            <Shuffle size={16} /> {t('freetime.random')}
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={categoryFilter} onChange={setCategoryFilter} options={catOptions} className="flex-1 sm:max-w-xs" />
        <Button variant={favOnly ? 'primary' : 'secondary'} onClick={() => setFavOnly(v => !v)}>
          <Star size={16} className={favOnly ? 'fill-current' : ''} /> {t('freetime.favorites')}
        </Button>
        <Button variant="secondary" onClick={() => setFormOpen(true)}>
          <Plus size={16} /> {t('freetime.addCustom')}
        </Button>
      </div>

      {/* Ideas grouped by category */}
      {filteredIdeas.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Sparkles size={40} />} message={t('freetime.noIdeas')} />
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedIdeas).map(([cat, ideas]) => (
            <div key={cat}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                {t(cat)} <span className="ml-1 text-xs">({ideas.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ideas.map(idea => (
                  <Card key={idea.id} className={`p-4 flex flex-col gap-3 ${idea.completed ? 'opacity-60' : ''}`}>
                    <p className={`text-sm flex-1 ${idea.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                      {idea.text}
                    </p>
                    {idea.custom && <Badge variant="accent">{t('freetime.addCustom')}</Badge>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFreeTimeFavorite(idea.id)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                        aria-label={t('quote.favQuote')}
                      >
                        <Heart size={16} className={idea.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'} />
                      </button>
                      <button
                        onClick={() => toggleFreeTimeCompleted(idea.id)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                        aria-label={t('freetime.markDone')}
                      >
                        <Check size={16} className={idea.completed ? 'accent-text' : 'text-slate-300 dark:text-slate-600'} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={t('freetime.addCustom')} size="sm">
        <div className="space-y-4">
          <Input label={t('freetime.ideaText')} value={ideaText} onChange={setIdeaText} />
          <Select label={t('freetime.category')} value={ideaCategory} onChange={setIdeaCategory}
            options={CATEGORY_KEYS.map(k => ({ value: k, label: t(k) }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>{t('freetime.cancel')}</Button>
            <Button variant="primary" onClick={handleSaveIdea}>{t('freetime.save')}</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toastMsg} show={toastShow} />
    </div>
  );
}
