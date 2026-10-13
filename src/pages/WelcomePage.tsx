import { useApp } from '@/context/AppContext';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Goal,
  Quote,
  Sparkles,
  Target,
} from 'lucide-react';

const WEEK_DAYS = [
  { day: 'ПН', date: '12', active: false },
  { day: 'ВТ', date: '13', active: true },
  { day: 'СР', date: '14', active: false },
  { day: 'ЧТ', date: '15', active: false },
  { day: 'ПТ', date: '16', active: false },
];

export function WelcomePage() {
  const { dismissWelcome } = useApp();

  return (
    <main className="planora-landing min-h-screen overflow-hidden text-slate-900">
      <div className="planora-orb planora-orb-pink" />
      <div className="planora-orb planora-orb-blue" />

      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="planora-mark flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg">
            <Sparkles size={18} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-[-0.04em]">PLANORA</span>
        </div>
        <button
          onClick={dismissWelcome}
          className="group hidden items-center gap-2 rounded-full border border-slate-300/70 bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-slate-400 hover:bg-white md:flex"
        >
          Открыть планер
          <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </nav>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 px-6 pb-16 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:pb-28 lg:pt-16">
        <div className="max-w-xl animate-fade-in">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/55 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            Личное пространство для важных дел
          </div>
          <h1 className="max-w-lg text-5xl font-bold leading-[0.98] tracking-[-0.065em] text-slate-950 sm:text-6xl lg:text-[5.35rem]">
            Твоё время.
            <span className="planora-gradient-text block">Твои цели.</span>
            Твоя жизнь.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-slate-600 sm:text-xl">
            Организуй свои дни, достигай целей и находи время для себя.
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              onClick={dismissWelcome}
              className="planora-primary-button group inline-flex items-center gap-3 rounded-2xl px-6 py-3.5 text-base font-bold text-white shadow-xl transition hover:-translate-y-0.5"
            >
              Начать
              <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
            </button>
            <span className="text-sm font-medium text-slate-500">Твой спокойный ритм — с первого дня</span>
          </div>
        </div>

        <div className="planora-stage relative mx-auto h-[540px] w-full max-w-[650px] animate-slide-up sm:h-[590px]">
          <div className="planora-glow absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-3xl" />

          <div className="planora-preview planora-weekly-card absolute left-0 top-8 w-[min(90%,360px)] rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:left-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Эта неделя</p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-800">Мягкий фокус</h2>
              </div>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-500"><CalendarDays size={18} /></div>
            </div>
            <div className="mb-5 grid grid-cols-5 gap-1.5">
              {WEEK_DAYS.map((item) => (
                <div key={item.day} className={`rounded-xl px-1 py-2 text-center ${item.active ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-50 text-slate-500'}`}>
                  <p className="text-[9px] font-bold">{item.day}</p>
                  <p className="mt-1 text-sm font-bold">{item.date}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 rounded-xl bg-pink-50/80 px-3 py-2.5"><div className="h-2 w-2 rounded-full bg-pink-400" /><span className="text-xs font-semibold text-slate-700">Подготовить презентацию</span><span className="ml-auto text-[10px] font-bold text-slate-400">09:00</span></div>
              <div className="flex items-center gap-3 rounded-xl bg-blue-50/80 px-3 py-2.5"><div className="h-2 w-2 rounded-full bg-blue-400" /><span className="text-xs font-semibold text-slate-700">Прогулка и перерыв</span><span className="ml-auto text-[10px] font-bold text-slate-400">18:30</span></div>
            </div>
          </div>

          <div className="planora-preview planora-tasks-card absolute right-0 top-40 w-52 rounded-[24px] border border-white/90 bg-white/85 p-4 shadow-2xl shadow-pink-900/10 backdrop-blur-xl sm:right-1">
            <div className="mb-4 flex items-center justify-between"><p className="text-xs font-bold text-slate-700">Сегодня</p><CheckCircle2 size={17} className="text-emerald-500" /></div>
            <div className="mb-3 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500"><Check size={17} /></div><div><p className="text-[11px] font-bold text-slate-700">3 задачи</p><p className="text-[10px] font-medium text-slate-400">завершено</p></div></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-4/5 rounded-full bg-emerald-400" /></div>
          </div>

          <div className="planora-preview planora-goal-card absolute bottom-14 left-4 w-56 rounded-[24px] border border-white/90 bg-slate-900 p-4 text-white shadow-2xl shadow-slate-900/20 sm:bottom-10 sm:left-14">
            <div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Моя цель</p><p className="mt-1 text-sm font-bold">Больше энергии</p></div><Target size={19} className="text-pink-300" /></div>
            <div className="flex items-end justify-between"><p className="text-3xl font-bold tracking-tight">68%</p><p className="pb-1 text-[10px] font-semibold text-slate-400">до 30 ноября</p></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-pink-300 to-blue-300" /></div>
          </div>

          <div className="planora-preview planora-quote-card absolute bottom-1 right-4 w-52 rounded-[24px] border border-white/90 bg-white/80 p-4 shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:bottom-4 sm:right-12">
            <Quote size={18} className="mb-3 text-pink-400" />
            <p className="text-xs font-semibold leading-5 text-slate-700">«Маленькие шаги каждый день создают большие перемены.»</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Твоя заметка</p>
          </div>

          <div className="absolute right-28 top-8 hidden h-3 w-3 rounded-full bg-blue-300 shadow-lg shadow-blue-300/50 sm:block" />
          <div className="absolute bottom-28 right-1 hidden h-2 w-2 rounded-full bg-pink-300 sm:block" />
        </div>
      </section>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center gap-x-10 gap-y-3 px-6 pb-8 text-xs font-bold uppercase tracking-[0.16em] text-slate-400 lg:px-10">
        <span className="flex items-center gap-2"><Goal size={15} /> Планируй</span>
        <span className="flex items-center gap-2"><Circle size={10} /> Действуй</span>
        <span className="flex items-center gap-2"><CheckCircle2 size={15} /> Живи в своём ритме</span>
      </div>
    </main>
  );
}
