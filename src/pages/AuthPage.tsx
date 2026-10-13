import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Page } from '@/types';

type AuthMode = 'auth-choice' | 'login' | 'register' | 'forgot' | 'reset-password';

const errorText = (error: string): string => {
  const normalized = error.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'Неверная электронная почта или пароль.';
  if (normalized.includes('password')) return 'Пароль должен содержать минимум 6 символов.';
  if (normalized.includes('rate limit')) return 'Слишком много попыток. Попробуй немного позже.';
  return 'Не удалось выполнить действие. Проверь данные и попробуй ещё раз.';
};

export function AuthPage({ mode }: { mode: AuthMode }) {
  const { setPage, login, register, resetPassword, updatePassword, continueAsGuest } = useApp();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const navigate = (page: Page) => {
    setError('');
    setNotice('');
    setPage(page);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (mode !== 'reset-password' && (!email.trim() || !email.includes('@'))) {
      setError('Введи корректную электронную почту.');
      return;
    }
    if (mode !== 'forgot' && password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов.');
      return;
    }
    if (mode === 'register' || mode === 'reset-password') {
      if (mode === 'register' && !name.trim()) {
        setError('Введи своё имя.');
        return;
      }
      if (password !== confirmation) {
        setError('Пароли не совпадают.');
        return;
      }
    }

    setBusy(true);
    const result: { error?: string; message?: string } = mode === 'login'
      ? await login(email.trim(), password)
      : mode === 'register'
        ? await register(name.trim(), email.trim(), password)
        : mode === 'forgot'
          ? await resetPassword(email.trim())
          : await updatePassword(password);
    setBusy(false);

    if (result.error) {
      setError(errorText(result.error));
    } else if (result.message) {
      setNotice(result.message);
    } else if (mode === 'forgot') {
      setNotice('Если такой аккаунт существует, мы отправили ссылку для восстановления пароля.');
    } else if (mode === 'reset-password') {
      setNotice('Пароль изменён. Перенаправляем тебя в Planora.');
    }
  };

  if (mode === 'auth-choice') {
    return (
      <AuthShell onBack={() => setPage('welcome')}>
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-pink-500">PLANORA</p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Добро пожаловать в Planora!</h1>
          <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>Как хочешь продолжить?</p>
        </div>
        <div className="space-y-3">
          <AuthButton onClick={() => navigate('login')} icon={<ArrowRight size={18} />}>Войти</AuthButton>
          <AuthButton onClick={() => navigate('register')} secondary icon={<UserRound size={18} />}>Зарегистрироваться</AuthButton>
          <button onClick={continueAsGuest} className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition hover:bg-black/5 dark:hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>Продолжить без регистрации</button>
        </div>
      </AuthShell>
    );
  }

  const title = mode === 'login' ? 'С возвращением' : mode === 'register' ? 'Создай свой Planora' : mode === 'reset-password' ? 'Новый пароль' : 'Восстановление пароля';
  const subtitle = mode === 'login' ? 'Войди, чтобы продолжить свой ритм.' : mode === 'register' ? 'Твои планы будут доступны на любом устройстве.' : mode === 'reset-password' ? 'Придумай новый пароль для своего аккаунта.' : 'Мы отправим ссылку на твою электронную почту.';

  return (
    <AuthShell onBack={() => navigate(mode === 'forgot' ? 'login' : 'auth-choice')}>
      <div className="mb-7">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-pink-500">PLANORA</p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {mode === 'register' && <Field label="Имя" value={name} onChange={setName} placeholder="Как к тебе обращаться?" icon={<UserRound size={17} />} />}
        <Field label="Электронная почта" value={email} onChange={setEmail} placeholder="you@example.com" type="email" icon={<Mail size={17} />} />
        {mode !== 'forgot' && <Field label={mode === 'reset-password' ? 'Новый пароль' : 'Пароль'} value={password} onChange={setPassword} placeholder="Минимум 6 символов" type={showPassword ? 'text' : 'password'} icon={<LockKeyhole size={17} />} trailing={<button type="button" onClick={() => setShowPassword(!showPassword)} style={{ color: 'var(--text-secondary)' }}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>} />}
        {(mode === 'register' || mode === 'reset-password') && <Field label="Подтвердите пароль" value={confirmation} onChange={setConfirmation} placeholder="Повтори пароль" type={showPassword ? 'text' : 'password'} icon={<LockKeyhole size={17} />} />}
        {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700">{error}</p>}
        {notice && <p role="status" className="rounded-xl bg-emerald-50 px-3.5 py-3 text-sm font-medium text-emerald-700">{notice}</p>}
        <button disabled={busy} className="planora-primary-button flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">
          {busy ? 'Подожди...' : mode === 'login' ? 'Войти' : mode === 'register' ? 'Зарегистрироваться' : 'Отправить ссылку'}
          {!busy && <ArrowRight size={17} />}
        </button>
      </form>
      <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        {mode === 'login' && <><button onClick={() => navigate('forgot')} className="font-semibold text-pink-600 hover:text-pink-700">Забыли пароль?</button><p className="mt-4">Нет аккаунта? <button onClick={() => navigate('register')} className="font-semibold underline decoration-pink-300 underline-offset-4" style={{ color: 'var(--text-primary)' }}>Зарегистрироваться</button></p></>}
        {mode === 'register' && <>Уже есть аккаунт? <button onClick={() => navigate('login')} className="font-semibold underline decoration-pink-300 underline-offset-4" style={{ color: 'var(--text-primary)' }}>Войти</button></>}
        {(mode === 'forgot' || mode === 'reset-password') && <button onClick={() => navigate('login')} className="font-semibold underline decoration-pink-300 underline-offset-4" style={{ color: 'var(--text-primary)' }}>Вернуться ко входу</button>}
      </div>
    </AuthShell>
  );
}

function AuthShell({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <main className="planora-auth min-h-screen px-5 py-6 sm:px-8 sm:py-10">
      <button onClick={onBack} className="relative z-10 mx-auto flex w-full max-w-md items-center gap-2 text-sm font-semibold transition hover:opacity-70" style={{ color: 'var(--text-secondary)' }}><ArrowLeft size={17} /> Назад</button>
      <div className="relative z-10 mx-auto mt-10 w-full max-w-md animate-scale-in rounded-[30px] border p-6 shadow-2xl backdrop-blur-xl sm:p-9" style={{ borderColor: 'var(--border-color)', backgroundColor: 'color-mix(in srgb, var(--bg-card) 85%, transparent)' }}>{children}</div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-200/40 blur-3xl" />
    </main>
  );
}

function AuthButton({ children, onClick, secondary = false, icon }: { children: React.ReactNode; onClick: () => void; secondary?: boolean; icon: React.ReactNode }) {
  if (secondary) {
    return <button onClick={onClick} className="group flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition hover:-translate-y-0.5" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>{children}{icon}</button>;
  }
  return <button onClick={onClick} className="group flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 planora-primary-button">{children}{icon}</button>;
}

function Field({ label, value, onChange, placeholder, type = 'text', icon, trailing }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; icon: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="flex items-center gap-2 rounded-2xl border px-3.5 transition focus-within:border-pink-300 focus-within:ring-4 focus-within:ring-pink-100" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-base)' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{icon}</span>
        <input required type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="planora-auth-input min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" style={{ color: 'var(--text-primary)' }} />
        {trailing}
      </span>
    </label>
  );
}
