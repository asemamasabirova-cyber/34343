import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/EmptyState';
import { ACCENT_COLORS } from '@/lib/theme';
import type { ThemeMode, AccentColor, Language } from '@/types';
import {
  User, Globe, Palette, Database, Download, Trash2, AlertTriangle,
  Sun, Moon, Monitor, Upload, X, Check,
} from 'lucide-react';

export function SettingsPage() {
  const {
    t, lang, data, setLanguage, setTheme, setAccent,
    theme, accent, updateProfile, exportAllData, clearTasks, deleteEverything,
  } = useApp();

  const [name, setName] = useState(data.profile.name);
  const [description, setDescription] = useState(data.profile.description);
  const [photo, setPhoto] = useState<string | null>(data.profile.photo);
  const [photoError, setPhotoError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [showClearTasks, setShowClearTasks] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = (m: string) => { setToastMsg(m); setToastShow(true); setTimeout(() => setToastShow(false), 2500); };

  const handleSaveProfile = () => {
    updateProfile({ name: name.trim(), description: description.trim(), photo });
    showToast(t('settings.saved'));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError(t('settings.photoError'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError(t('settings.photoTooLarge'));
      return;
    }
    setPhotoError('');
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleExport = () => {
    exportAllData();
    showToast(t('settings.export'));
  };

  const handleClearTasks = () => {
    clearTasks();
    showToast(t('settings.clearTasks'));
  };

  const handleDeleteAll = () => {
    deleteEverything();
    showToast(t('settings.dataCleared'));
  };

  const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: t('settings.themeLight'), icon: Sun },
    { value: 'dark', label: t('settings.themeDark'), icon: Moon },
    { value: 'system', label: t('settings.themeSystem'), icon: Monitor },
  ];

  const accentList: AccentColor[] = ['pink', 'blue', 'yellow', 'lavender', 'mint', 'peach'];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('settings.title')}</h1>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <User size={20} className="accent-text" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('settings.profile')}</h2>
        </div>

        <div className="space-y-4">
          {/* Photo */}
          <div>
            <label className="label">{t('settings.profilePhoto')}</label>
            <div className="flex items-center gap-4">
              {photo ? (
                <div className="relative">
                  <img src={photo} alt="Profile" className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600" />
                  <button
                    onClick={handleRemovePhoto}
                    className="absolute -right-1 -top-1 rounded-full bg-white p-1 shadow-md dark:bg-slate-700"
                    aria-label={t('settings.removePhoto')}
                  >
                    <X size={14} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full accent-bg">
                  <User size={32} className="accent-text" />
                </div>
              )}
              <div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif" onChange={handlePhotoUpload} className="hidden" />
                <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload size={15} /> {t('settings.uploadPhoto')}
                </Button>
                {photoError && <p className="mt-1.5 text-xs text-red-500">{photoError}</p>}
              </div>
            </div>
          </div>

          <Input label={t('settings.profileName')} value={name} onChange={setName} />
          <Textarea label={t('settings.profileDesc')} value={description} onChange={setDescription} rows={2} />

          <Button variant="primary" onClick={handleSaveProfile}>
            <Check size={16} /> {t('settings.saveProfile')}
          </Button>
        </div>
      </Card>

      {/* Language */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe size={20} className="accent-text" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('settings.language')}</h2>
        </div>
        <div className="flex gap-3">
          {(['ru', 'en'] as Language[]).map(l => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                lang === l
                  ? 'accent-border accent-bg accent-text'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-600 dark:text-slate-400'
              }`}
            >
              {l === 'ru' ? t('settings.langRu') : t('settings.langEn')}
            </button>
          ))}
        </div>
      </Card>

      {/* Theme */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette size={20} className="accent-text" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('settings.theme')}</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all ${
                theme === opt.value
                  ? 'accent-border accent-bg accent-text'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-600 dark:text-slate-400'
              }`}
            >
              <opt.icon size={20} />
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Accent color */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette size={20} className="accent-text" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('settings.accent')}</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {accentList.map(c => (
            <button
              key={c}
              onClick={() => setAccent(c)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                accent === c ? 'border-slate-400 dark:border-slate-300' : 'border-transparent'
              }`}
            >
              <div
                className="h-10 w-10 rounded-full"
                style={{ backgroundColor: ACCENT_COLORS[c].primary }}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 text-center">{t(`settings.accent${ACCENT_COLORS[c].name.charAt(0).toUpperCase() + ACCENT_COLORS[c].name.slice(1)}`)}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Data management */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Database size={20} className="accent-text" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('settings.data')}</h2>
        </div>

        <div className="space-y-4">
          {/* Export */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-700/40">
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.export')}</div>
              <div className="mt-0.5 text-xs text-slate-400">{t('settings.exportDesc')}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download size={15} /> {t('settings.export')}
            </Button>
          </div>

          {/* Clear tasks */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-700/40">
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.clearTasks')}</div>
              <div className="mt-0.5 text-xs text-slate-400">{t('settings.clearTasksDesc')}</div>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowClearTasks(true)}>
              <Trash2 size={15} /> {t('settings.clearTasks')}
            </Button>
          </div>

          {/* Delete all */}
          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/30 p-4 dark:border-red-900/30 dark:bg-red-900/10">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                <AlertTriangle size={14} /> {t('settings.deleteAll')}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">{t('settings.deleteAllDesc')}</div>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteAll(true)}>
              <Trash2 size={15} /> {t('settings.deleteAll')}
            </Button>
          </div>

          {/* Local data note */}
          <p className="text-xs text-slate-400">{t('settings.dataLocalNote')}</p>
        </div>
      </Card>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={showClearTasks}
        onClose={() => setShowClearTasks(false)}
        onConfirm={handleClearTasks}
        title={t('settings.clearTasks')}
        message={t('settings.clearTasksDesc')}
        danger={true}
      />
      <ConfirmDialog
        open={showDeleteAll}
        onClose={() => setShowDeleteAll(false)}
        onConfirm={handleDeleteAll}
        title={t('settings.deleteAll')}
        message={t('settings.deleteConfirm')}
        secondMessage={t('settings.deleteConfirm2')}
        danger={true}
        requireDoubleConfirm={true}
      />

      <Toast message={toastMsg} show={toastShow} />
    </div>
  );
}
