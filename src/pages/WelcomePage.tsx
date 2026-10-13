import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Card';
import { ArrowRight } from 'lucide-react';

export function WelcomePage() {
  const { t, dismissWelcome, lang } = useApp();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl animate-fade-in text-center">
        <div className="mb-2 text-sm font-medium tracking-wide text-slate-400">
          Life Space
        </div>

        <h1 className="mb-8 text-4xl font-bold tracking-tight text-slate-800 md:text-5xl dark:text-slate-100">
          {t('welcome.hi')}
        </h1>

        <p className="mb-8 text-xl font-medium text-slate-600 dark:text-slate-300">
          {t('welcome.whatGives')}
        </p>

        <div className="space-y-4">
          {[
            t('welcome.t1'),
            t('welcome.t2'),
            t('welcome.t3'),
          ].map((text, i) => (
            <div
              key={i}
              className="animate-slide-up rounded-2xl border border-slate-200/60 bg-white/60 px-6 py-4 text-base text-slate-700 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-200"
              style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'backwards' }}
            >
              {text}
            </div>
          ))}
        </div>

        <p className="mb-6 mt-8 text-lg text-slate-500 dark:text-slate-400">
          {t('welcome.ready')}
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={dismissWelcome}
          className="animate-slide-up"
        >
          {t('welcome.start')}
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
