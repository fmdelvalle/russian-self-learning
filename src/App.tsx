import { useTranslation } from 'react-i18next';
import { DailyScoreDisplay } from './components/DailyScoreDisplay';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { QuizContainer } from './components/quiz/QuizContainer';
import './i18n';

function App() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <DailyScoreDisplay />
            <LanguageSwitcher />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
            {t('app.title')}
          </h1>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            {t('app.subtitle')}
          </p>
        </header>

        <main>
          <QuizContainer />
        </main>
      </div>
    </div>
  );
}

export default App;
