import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckSquare,
  StickyNote,
  Target,
  BookOpen,
  Coffee,
  Sparkles,
} from 'lucide-react';

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Планирование',
    text: 'Структурируй свою неделю — занятия, задачи и события в одном ясном виде.',
    tint: 'bg-pink-50 text-pink-500',
  },
  {
    icon: CheckSquare,
    title: 'Задачи',
    text: 'Создавай задачи с приоритетами, категориями и напоминаниями. Ни одно дело не потеряется.',
    tint: 'bg-blue-50 text-blue-500',
  },
  {
    icon: StickyNote,
    title: 'Заметки',
    text: 'Сохраняй идеи, конспекты и вдохновение. Всё под рукой и по категориям.',
    tint: 'bg-emerald-50 text-emerald-500',
  },
  {
    icon: Target,
    title: 'Цели',
    text: 'Разбивай большие цели на шаги и отслеживай прогресс до самого завершения.',
    tint: 'bg-amber-50 text-amber-500',
  },
  {
    icon: BookOpen,
    title: 'Книги и фильмы',
    text: 'Веди список прочитанного и просмотренного, отмечай оценки и отзывы.',
    tint: 'bg-purple-50 text-purple-500',
  },
  {
    icon: Coffee,
    title: 'Свободное время',
    text: 'Находи идеи для отдыха и развития — от прогулок до творчества и новых навыков.',
    tint: 'bg-rose-50 text-rose-500',
  },
];

export function AboutPage() {
  const { setPage } = useApp();

  return (
    <main className="planora-landing min-h-screen overflow-hidden text-slate-900">
      <div className="planora-orb planora-orb-pink" />
      <div className="planora-orb planora-orb-blue" />

      <nav className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-7 lg:px-10">
        <button
          onClick={() => setPage('welcome')}
          className="group flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-slate-400 hover:bg-white"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Назад
        </button>
        <div className="flex items-center gap-3">
          <div className="planora-mark flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg">
            <Sparkles size={18} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-[-0.04em]">PLANORA</span>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-8 lg:px-10 lg:pt-12">
        <div className="animate-fade-in">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/55 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            О проекте
          </div>
          <h1 className="text-5xl font-bold leading-[0.98] tracking-[-0.065em] text-slate-950 sm:text-6xl">
            О <span className="planora-gradient-text">Planora</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Planora появилась из простой идеи: планирование не должно быть stressом.
            Мы хотели создать пространство, где учёба, личные цели и отдых живут в гармонии —
            мягко, понятно и без давления. Planora помогает видеть свою неделю целиком,
            не забивать важные дела и при этом находить время для себя.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
          Возможности
        </h2>
        <p className="mb-10 text-2xl font-bold tracking-tight text-slate-950">
          Шесть разделов — одно спокойное пространство
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-[24px] border border-white/80 bg-white/75 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${f.tint}`}>
                <f.icon size={22} />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-800">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="rounded-[32px] border border-white/80 bg-white/70 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur-xl sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Для кого создана Planora?
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-pink-600">
                <Target size={14} /> Студентам
              </div>
              <p className="text-sm leading-7 text-slate-600">
                Planora помогает не теряться в потоке занятий, дедлайнов и конспектов.
                Расписание, задачи, заметки и цели — всё в одном месте.
                Учись в своём ритме и находи время для отдыха, не откладывая жизнь на потом.
              </p>
            </div>
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                <Coffee size={14} /> Каждому, кто организует свой день
              </div>
              <p className="text-sm leading-7 text-slate-600">
                Неважно, студент ты или нет — если ты хочешь структурировать свои дни,
                Planora станет твоим тихим помощником. Планируй задачи, ставь цели,
                отслеживай книги и фильмы, и не забывай о свободном времени.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20 text-center lg:px-10">
        <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
          Planora — твоё пространство.
          <br />
          <span className="planora-gradient-text">Твои планы. Твой ритм.</span>
        </h2>
        <button
          onClick={() => setPage('auth-choice')}
          className="planora-primary-button group mt-10 inline-flex items-center gap-3 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-xl transition hover:-translate-y-0.5"
        >
          Начать
          <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
        </button>
      </section>
    </main>
  );
}
