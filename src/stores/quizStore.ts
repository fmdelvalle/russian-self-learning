import { create } from 'zustand';
import { russianWords, type ICategoryId } from '../data/russian-words-full';
import type { Question } from '../types';
import { generateQuestions, validateAnswer } from '../utils/questionGenerator';

interface QuizStore {
    // Core State
    completedQuestions: number;        // Counter of answered questions
    score: number;                     // Current score
    remainingQuestions: Question[];    // Queue of unanswered questions
    pageMode: 'ASKING' | 'FEEDBACK';   // Current UI mode

    // Feedback State (only when in FEEDBACK mode)
    lastAnswer: {
        isCorrect: boolean;
        userAnswer: string;
        correctAnswer: string;
    } | null;

    // Actions
    startNewQuiz: (categories?: ICategoryId[]) => void;
    submitAnswer: (answer: string) => void;
    nextQuestion: () => void;
    restartQuiz: () => void;

    // Computed
    getCurrentQuestion: () => Question | null;
    isComplete: () => boolean;  // remainingQuestions.length === 0
    getProgress: () => { completed: number; total: number };
}

export const useQuizStore = create<QuizStore>((set, get) => ({
    // Initial State
    completedQuestions: 0,
    score: 0,
    remainingQuestions: [],
    pageMode: 'ASKING',
    lastAnswer: null,

    // Actions
    startNewQuiz: (categories?: ICategoryId[]) => {
        const questions = generateQuestions(russianWords, 20, categories);
        set({
            completedQuestions: 0,
            score: 0,
            remainingQuestions: questions,
            pageMode: 'ASKING',
            lastAnswer: null,
        });
    },

    submitAnswer: (answer: string) => {
        const state = get();
        const currentQuestion = state.remainingQuestions[0];

        if (!currentQuestion) return;

        const isCorrect = validateAnswer(currentQuestion, answer);

        // First, set feedback state with current question still in place
        set({
            completedQuestions: state.completedQuestions + (isCorrect ? 1 : 0),
            score: state.score + (isCorrect ? 1 : -1),
            pageMode: 'FEEDBACK',
            lastAnswer: {
                isCorrect,
                userAnswer: answer,
                correctAnswer: getCorrectAnswerText(currentQuestion),
            },
        });
    },

    nextQuestion: () => {
        const state = get();
        const currentQuestion = state.remainingQuestions[0];

        if (!currentQuestion) return;

        const newRemainingQuestions = state.remainingQuestions.slice(1);

        // Re-enqueue failed questions
        if (!state.lastAnswer?.isCorrect) {
            newRemainingQuestions.push(currentQuestion);
        }

        set({
            remainingQuestions: newRemainingQuestions,
            pageMode: 'ASKING',
            lastAnswer: null,
        });
    },

    restartQuiz: () => {
        set({
            completedQuestions: 0,
            score: 0,
            pageMode: 'ASKING',
            lastAnswer: null,
        });
    },

    // Computed
    getCurrentQuestion: () => {
        const state = get();
        return state.remainingQuestions[0] || null;
    },

    isComplete: () => {
        const state = get();
        return state.remainingQuestions.length === 0;
    },

    getProgress: () => {
        const state = get();
        return {
            completed: state.completedQuestions,
            total: state.completedQuestions + state.remainingQuestions.length,
        };
    },
}));

// Helper function
function getCorrectAnswerText(question: Question): string {
    switch (question.type) {
        case 'write-spanish':
        case 'multiple-choice-to-spanish':
            return question.word.spanish;
        case 'multiple-choice-to-russian':
            return question.word.cyrillic;
        case 'write-russian':
            return `${question.word.romanized} (${question.word.cyrillic})`;
        default:
            return `${question.word.romanized} (${question.word.cyrillic})`;
    }
}
