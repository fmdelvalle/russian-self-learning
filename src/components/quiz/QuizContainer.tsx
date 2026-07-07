import { useCallback, useEffect, useState } from 'react';
import { CATEGORIES_CONFIG, type ICategoryId } from '../../data/russian-words-full';
import { useMistakesBag } from '../../hooks/useMistakesBag';
import { useQuiz } from '../../hooks/useQuiz';
import { QuizCompletionPage } from './QuizCompletionPage';
import { QuizPage } from './QuizPage';
import { SelectCategoriesPage } from './SelectCategoriesPage';

const SELECTED_CATEGORIES_KEY = 'selectedCategories';
const VALID_CATEGORY_IDS = new Set<string>(CATEGORIES_CONFIG.map(cat => cat.id));

// Load the last category selection from localStorage, ignoring anything invalid.
function loadSelectedCategories(): ICategoryId[] {
  try {
    const raw = localStorage.getItem(SELECTED_CATEGORIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is ICategoryId => typeof id === 'string' && VALID_CATEGORY_IDS.has(id));
  } catch {
    return [];
  }
}

export function QuizContainer() {
  const {
    isComplete,
    progress,
    score,
    startNewQuiz,
    startMistakesQuiz,
    restartQuiz,
  } = useQuiz();

  const { count: mistakesCount, clear: clearMistakes } = useMistakesBag();

  // Local UI state for category selection
  const [showCategorySelector, setShowCategorySelector] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<ICategoryId[]>(loadSelectedCategories);

  // Remember the last selection across sessions
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_CATEGORIES_KEY, JSON.stringify(selectedCategories));
    } catch {
      // localStorage unavailable (e.g. private mode) - selection just won't persist
    }
  }, [selectedCategories]);

  // Handle starting a new quiz - go back to category selection (keeping last selection)
  const handleStartNewQuiz = useCallback(() => {
    setShowCategorySelector(true);
    restartQuiz(); // Reset quiz state to show category selection
  }, [restartQuiz]);

  // Handle starting quiz with categories
  const handleStartQuiz = useCallback(() => {
    setShowCategorySelector(false);
    startNewQuiz(selectedCategories.length > 0 ? selectedCategories : undefined);
  }, [selectedCategories, startNewQuiz]);

  // Handle starting a quiz built from the mistakes bag
  const handleStartMistakes = useCallback(() => {
    setShowCategorySelector(false);
    startMistakesQuiz();
  }, [startMistakesQuiz]);

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
        mistakesCount={mistakesCount}
        onStartMistakes={handleStartMistakes}
        onClearMistakes={clearMistakes}
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
