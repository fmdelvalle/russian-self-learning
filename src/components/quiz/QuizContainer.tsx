import { useCallback, useState } from 'react';
import type { ICategoryId } from '../../data/russian-words-full';
import { useQuiz } from '../../hooks/useQuiz';
import { QuizCompletionPage } from './QuizCompletionPage';
import { QuizPage } from './QuizPage';
import { SelectCategoriesPage } from './SelectCategoriesPage';

export function QuizContainer() {
  const {
    isComplete,
    progress,
    score,
    startNewQuiz,
    restartQuiz,
  } = useQuiz();

  // Local UI state for category selection
  const [showCategorySelector, setShowCategorySelector] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<ICategoryId[]>([]);

  // Handle starting a new quiz - go back to category selection
  const handleStartNewQuiz = useCallback(() => {
    setShowCategorySelector(true);
    setSelectedCategories([]);
    restartQuiz(); // Reset quiz state to show category selection
  }, [restartQuiz]);

  // Handle starting quiz with categories
  const handleStartQuiz = useCallback(() => {
    setShowCategorySelector(false);
    startNewQuiz(selectedCategories.length > 0 ? selectedCategories : undefined);
  }, [selectedCategories, startNewQuiz]);

  // Router logic: determine which component to show
  if (progress.total === 0) {
    // Pre-quiz: Show category selection
    return (
      <SelectCategoriesPage
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        onStartQuiz={handleStartQuiz}
        onShowCategorySelector={() => setShowCategorySelector(true)}
        showCategorySelector={showCategorySelector}
      />
    );
  }

  if (isComplete) {
    // Post-quiz: Show completion screen
    return (
      <QuizCompletionPage
        score={score}
        totalQuestions={progress.total}
        onStartNewQuiz={handleStartNewQuiz}
      />
    );
  }

  // Active quiz: Show quiz page
  return <QuizPage />;
}
