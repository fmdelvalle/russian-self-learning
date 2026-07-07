import { filterWordsByCategories, type ICategoryId } from '../data/russian-words-full';
import type { HangmanQuestion, Question, QuestionType, Word } from '../types';

/**
 * Filter words suitable for hangman (7+ characters, single words)
 */
export function getHangmanWords(words: Word[]): Word[] {
  return words.filter(word =>
    word.cyrillic.length >= 7 &&
    !word.cyrillic.includes(' ') && // Single words only initially
    !word.cyrillic.includes('-') && // No hyphenated words
    word.category !== 'grammar' // Avoid grammar words for hangman
  );
}

/**
 * Generate a hangman question from a word
 */
export function generateHangmanQuestion(word: Word): HangmanQuestion {
  return {
    id: `hangman-${word.id}-${Date.now()}`,
    type: 'hangman',
    word
  };
}

/**
 * Generate random questions from a word list, optionally filtered by category.
 */
export function generateQuestions(
  words: Word[],
  count: number,
  categories?: ICategoryId[]
): Question[] {
  // Filter words by categories if provided
  const filteredWords = filterWordsByCategories(words, categories || []);
  return buildQuestions(filteredWords, filteredWords, count);
}

/**
 * Generate questions targeting a specific set of words (e.g. the mistakes bag),
 * drawing multiple-choice distractors from a separate pool so options are still
 * available even when the target set is tiny.
 */
export function generateQuestionsFromWords(
  targetWords: Word[],
  distractorPool: Word[],
  count: number
): Question[] {
  return buildQuestions(targetWords, distractorPool, count);
}

/**
 * Core question builder. Question subjects are drawn from `targetWords`;
 * multiple-choice distractors come from `distractorPool`.
 */
function buildQuestions(
  targetWords: Word[],
  distractorPool: Word[],
  count: number
): Question[] {
  const hangmanWords = getHangmanWords(targetWords);

  if (distractorPool.length < 4) {
    throw new Error('Need at least 4 words to generate questions');
  }

  const questions: Question[] = [];
  const usedWords = new Set<number>();

  // Add 1-2 hangman questions if available
  const hangmanCount = Math.min(2, Math.floor(Math.random() * 2) + 1);
  for (let i = 0; i < hangmanCount && hangmanWords.length > 0; i++) {
    const hangmanWord = hangmanWords.splice(Math.floor(Math.random() * hangmanWords.length), 1)[0];
    questions.push(generateHangmanQuestion(hangmanWord));
    usedWords.add(hangmanWord.id);
  }

  // Fill remaining slots with other question types
  const remainingSlots = count - questions.length;
  let writeRussianCount = 0; // Track write-russian questions

  for (let i = 0; i < remainingSlots; i++) {
    let questionType = getRandomQuestionType();

    // Limit write-russian questions to maximum of 2
    if (questionType === 'write-russian' && writeRussianCount >= 2) {
      // If we've reached the limit, pick a different question type
      const availableTypes: QuestionType[] = [
        'multiple-choice-to-russian',
        'multiple-choice-to-spanish',
        'write-spanish'
      ];
      questionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    }

    const word = getRandomWord(targetWords, usedWords);

    if (!word) break; // No more words available

    usedWords.add(word.id);

    const question: Question = {
      id: `q_${i}_${word.id}`,
      type: questionType,
      word,
    };

    // Add options for multiple choice questions
    if (questionType === 'multiple-choice-to-russian' || questionType === 'multiple-choice-to-spanish') {
      question.options = generateMultipleChoiceOptions(distractorPool, word);
    }

    // Increment counter for write-russian questions
    if (questionType === 'write-russian') {
      writeRussianCount++;
    }

    questions.push(question);
  }

  // Shuffle the questions to randomize the order
  return shuffleArray(questions);
}

/**
 * Get a random question type
 */
function getRandomQuestionType(): QuestionType {
  // All 4 question types as specified in STATE.md
  const availableTypes: QuestionType[] = [
    'multiple-choice-to-russian',
    'multiple-choice-to-spanish',
    'write-spanish',
    'write-russian'
  ];

  return availableTypes[Math.floor(Math.random() * availableTypes.length)];
}

/**
 * Get a random word that hasn't been used yet
 */
function getRandomWord(words: Word[], usedWords: Set<number>): Word | null {
  const availableWords = words.filter(word => !usedWords.has(word.id));
  if (availableWords.length === 0) return null;

  return availableWords[Math.floor(Math.random() * availableWords.length)];
}

/**
 * Generate 4 options for multiple choice questions (1 correct + 3 wrong).
 *
 * Distractors are drawn from the SAME category as the correct word so the
 * choices stay semantically close (otherwise the known word stands out and the
 * question becomes trivial). Only if that category is too small do we top up
 * from the rest of the pool. Fresh picks each time keep the options varied.
 */
function generateMultipleChoiceOptions(pool: Word[], correctWord: Word): Word[] {
  const options = [correctWord];
  const usedIds = new Set([correctWord.id]);

  const sameCategory = pool.filter(
    word => word.id !== correctWord.id && word.category === correctWord.category
  );
  const otherCategory = pool.filter(
    word => word.id !== correctWord.id && word.category !== correctWord.category
  );

  // Same-category distractors first, then fall back to the rest of the pool
  const candidates = [...shuffleArray(sameCategory), ...shuffleArray(otherCategory)];
  for (const word of candidates) {
    if (options.length >= 4) break;
    if (!usedIds.has(word.id)) {
      options.push(word);
      usedIds.add(word.id);
    }
  }

  // Shuffle so the correct answer isn't always first
  return shuffleArray(options);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Validate an answer that may contain slash-separated alternatives
 * For example: 'amable/bueno' accepts 'amable', 'bueno', or 'amable/bueno'
 */
function validateSlashAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  // First check if the user's answer matches the full correct answer exactly
  if (userAnswer === normalizedCorrect) {
    return true;
  }

  // If the correct answer contains slashes, check each individual word
  if (normalizedCorrect.includes('/')) {
    const alternatives = normalizedCorrect.split('/').map(alt => alt.trim());
    return alternatives.some(alternative => userAnswer === alternative);
  }

  // If no slashes, do normal comparison
  return userAnswer === normalizedCorrect;
}

/**
 * Validate an answer for a given question
 */
export function validateAnswer(question: Question, userAnswer: string): boolean {
  const normalizedUserAnswer = normalizeAnswer(userAnswer);

  switch (question.type) {
    case 'multiple-choice-to-russian':
      // User selects Russian word for Spanish prompt
      return normalizedUserAnswer === normalizeAnswer(question.word.cyrillic) ||
        normalizedUserAnswer === normalizeAnswer(question.word.romanized);

    case 'multiple-choice-to-spanish':
      // User selects Spanish word for Russian prompt
      return normalizedUserAnswer === normalizeAnswer(question.word.spanish);

    case 'write-spanish':
      return validateSlashAnswer(normalizedUserAnswer, question.word.spanish);

    case 'write-russian':
      return normalizedUserAnswer === normalizeAnswer(question.word.romanized);

    case 'hangman':
      return normalizedUserAnswer === normalizeAnswer(question.word.romanized);

    default:
      return false;
  }
}

/**
 * Normalize a letter for comparison (remove accents/stress marks)
 */
function normalizeLetter(letter: string): string {
  return letter.toLowerCase().replace(/[áéíóúý]/g, (match) => {
    const map: { [key: string]: string } = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ý': 'y'
    };
    return map[match] || match;
  });
}

/**
 * Check if a letter exists in a hangman word (against romanized version)
 */
export function checkHangmanLetter(word: Word, letter: string): boolean {
  const normalizedLetter = normalizeLetter(letter);
  const normalizedWord = normalizeLetter(word.romanized);
  return normalizedWord.includes(normalizedLetter);
}

/**
 * Get all positions where a letter appears in a hangman word (against romanized version)
 */
export function getHangmanLetterPositions(word: Word, letter: string): number[] {
  const positions: number[] = [];
  const normalizedLetter = normalizeLetter(letter);
  const normalizedWord = normalizeLetter(word.romanized);

  for (let i = 0; i < normalizedWord.length; i++) {
    if (normalizedWord[i] === normalizedLetter) {
      positions.push(i);
    }
  }

  return positions;
}

/**
 * Normalize an answer for comparison (lowercase, trim, remove accents)
 */
function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[áéíóúý]/g, (match) => {
      const map: { [key: string]: string } = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ý': 'y'
      };
      return map[match] || match;
    });
}