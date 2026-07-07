export interface Word {
  id: number;
  cyrillic: string;
  romanized: string;
  spanish: string;
  category?: ICategoryId; // Optional category for future use
}

export type QuestionType = 'multiple-choice-to-russian' | 'multiple-choice-to-spanish' | 'write-spanish' | 'write-russian' | 'hangman';

export interface Question {
  id: string;
  type: QuestionType;
  word: Word;
  options?: Word[]; // For multiple-choice questions
}

export interface HangmanQuestion extends Question {
  type: 'hangman';
}

import type { ICategoryId } from '../data/russian-words-full';

export interface Category {
  id: ICategoryId;
  name: string;
  description?: string;
}
