import type { ICategoryId } from '../data/russian-words-full';
import { useQuizStore } from '../stores/quizStore';
import type { Question } from '../types';

interface UseQuizReturn {
  // Business logic state
  currentQuestion: Question | null;
  pageMode: 'ASKING' | 'FEEDBACK';
  lastAnswer: {
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
  } | null;
  completedQuestions: number;
  score: number;
  isComplete: boolean;
  progress: { completed: number; total: number };

  // Actions
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  startNewQuiz: (categories?: ICategoryId[]) => void;
  startMistakesQuiz: () => void;
  restartQuiz: () => void;
}

/**
 * Custom hook for managing quiz state using Zustand
 *
 * Features:
 * - Generates 20 questions per round
 * - Tracks current question, score, and failed questions
 * - Implements Duolingo-style retry: failed questions are re-asked
 * - Tracks quiz completion
 */
export function useQuiz(): UseQuizReturn {
  const store = useQuizStore();

  return {
    // Business logic state
    currentQuestion: store.getCurrentQuestion(),
    pageMode: store.pageMode,
    lastAnswer: store.lastAnswer,
    completedQuestions: store.completedQuestions,
    score: store.score,
    isComplete: store.isComplete(),
    progress: store.getProgress(),

    // Actions
    submitAnswer: store.submitAnswer,
    nextQuestion: store.nextQuestion,
    startNewQuiz: store.startNewQuiz,
    startMistakesQuiz: store.startMistakesQuiz,
    restartQuiz: store.restartQuiz,
  };
}