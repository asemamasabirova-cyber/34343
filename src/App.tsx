import { AppProvider, useApp } from '@/context/AppContext';
import { Layout } from '@/components/Layout';
import { WelcomePage } from '@/pages/WelcomePage';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PlannerPage } from '@/pages/PlannerPage';
import { TasksPage } from '@/pages/TasksPage';
import { NotesPage } from '@/pages/NotesPage';
import { FocusPage } from '@/pages/FocusPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { BooksPage } from '@/pages/BooksPage';
import { FilmsPage } from '@/pages/FilmsPage';
import { SportPage } from '@/pages/SportPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { FreeTimePage } from '@/pages/FreeTimePage';
import { SettingsPage } from '@/pages/SettingsPage';

function AppContent() {
  const { currentPage } = useApp();

  if (currentPage === 'welcome') {
    return <WelcomePage />;
  }

  if (currentPage === 'auth-choice' || currentPage === 'login' || currentPage === 'register' || currentPage === 'forgot' || currentPage === 'reset-password') {
    return <AuthPage mode={currentPage} />;
  }

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    planner: <PlannerPage />,
    tasks: <TasksPage />,
    notes: <NotesPage />,
    focus: <FocusPage />,
    goals: <GoalsPage />,
    books: <BooksPage />,
    films: <FilmsPage />,
    sport: <SportPage />,
    progress: <ProgressPage />,
    freetime: <FreeTimePage />,
    settings: <SettingsPage />,
  };

  return <Layout>{pages[currentPage] || <DashboardPage />}</Layout>;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
