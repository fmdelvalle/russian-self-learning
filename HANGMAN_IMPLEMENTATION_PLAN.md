# Hangman Question Type Implementation Plan

## Overview
Implement a fifth question type called "hangman" where users guess complex Russian words letter by letter. This will help users learn difficult-to-memorize Russian words/phrases through interactive letter guessing.

## Core Requirements
- **Question Type**: Hangman-style letter guessing
- **Target Words**: Russian words/phrases with 7+ characters
- **Spanish Translation**: Users know the Spanish meaning
- **Error Limit**: Maximum 3 incorrect guesses before losing
- **Retry Logic**: Failed questions can be retried later
- **Frequency**: Maximum 2 hangman questions per round
- **Simplified Input**: No accents or soft symbols required

## Technical Implementation

### 1. Question Generator Updates

#### File: `src/utils/questionGenerator.ts`

**New Question Type:**
```typescript
type QuestionType = ... | 'hangman';
```

**New Interface:**
```typescript
interface HangmanQuestion extends Question {
  type: 'hangman';
}
```

**Note:** The HangmanQuestion is intentionally simple - it only extends the base Question interface with the hangman type. All game state (guessed letters, revealed letters, error count, etc.) is managed by the UI component, not stored in the question object. This allows the state to be reset cleanly when moving between questions.

**Word Filtering Logic:**
```typescript
function getHangmanWords(words: Word[]): Word[] {
  return words.filter(word =>
    word.cyrillic.length >= 7 &&
    !word.cyrillic.includes(' ') && // Single words only initially
    !word.cyrillic.includes('-') && // No hyphenated words
    word.category !== 'grammar' // Avoid grammar words for hangman
  );
}
```

**Question Generation:**
```typescript
function generateHangmanQuestion(word: Word): HangmanQuestion {
  return {
    id: `hangman-${word.id}-${Date.now()}`,
    type: 'hangman',
    word
  };
}
```

**Utility Functions for UI State Management:**
```typescript
// Check if a letter exists in a hangman word
function checkHangmanLetter(word: Word, letter: string): boolean {
  return word.cyrillic.toLowerCase().includes(letter.toLowerCase());
}

// Get all positions where a letter appears in a hangman word
function getHangmanLetterPositions(word: Word, letter: string): number[] {
  const positions: number[] = [];
  const lowerLetter = letter.toLowerCase();
  const lowerWord = word.cyrillic.toLowerCase();

  for (let i = 0; i < lowerWord.length; i++) {
    if (lowerWord[i] === lowerLetter) {
      positions.push(i);
    }
  }

  return positions;
}
```

### 2. UI Component State Management

**Note:** With the simplified HangmanQuestion interface, the UI component manages its own state instead of storing it in the quiz store. This approach provides better separation of concerns and cleaner state management.

**UI Component State:**
```typescript
interface HangmanGameState {
  guessedLetters: string[];
  revealedLetters: string[];
  currentErrors: number;
  maxErrors: number;
  isComplete: boolean;
  isCorrect: boolean;
}
```

**State Management Pattern:**
- The UI component initializes its state when a hangman question starts
- Uses utility functions (`checkHangmanLetter`, `getHangmanLetterPositions`) to process guesses
- Resets state when moving to the next question
- Only reports final success/failure to the quiz store

### 3. UI Components

#### New Component: `src/components/quiz/HangmanQuestion.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { checkHangmanLetter, getHangmanLetterPositions } from '../../utils/questionGenerator';
import type { HangmanQuestion } from '../../types';

interface HangmanGameState {
  guessedLetters: string[];
  revealedLetters: string[];
  currentErrors: number;
  maxErrors: number;
  isComplete: boolean;
  isCorrect: boolean;
}

const HangmanQuestion: React.FC<{ question: HangmanQuestion; onComplete: (success: boolean) => void }> = ({
  question,
  onComplete
}) => {
  const [gameState, setGameState] = useState<HangmanGameState>({
    guessedLetters: [],
    revealedLetters: Array(question.word.cyrillic.length).fill('_'),
    currentErrors: 0,
    maxErrors: 3,
    isComplete: false,
    isCorrect: false
  });

  const [inputLetter, setInputLetter] = useState('');

  const handleGuess = () => {
    if (inputLetter.length !== 1 || gameState.guessedLetters.includes(inputLetter.toLowerCase())) {
      return;
    }

    const letter = inputLetter.toLowerCase();
    const letterExists = checkHangmanLetter(question.word, letter);
    const positions = getHangmanLetterPositions(question.word, letter);

    setGameState(prevState => {
      const newGuessedLetters = [...prevState.guessedLetters, letter];
      const newRevealedLetters = [...prevState.revealedLetters];
      let newErrors = prevState.currentErrors;

      if (letterExists) {
        // Reveal all instances of the letter
        positions.forEach(pos => {
          newRevealedLetters[pos] = question.word.cyrillic[pos];
        });
      } else {
        newErrors++;
      }

      const isComplete = !newRevealedLetters.includes('_');
      const isCorrect = isComplete && newErrors <= prevState.maxErrors;

      return {
        ...prevState,
        guessedLetters: newGuessedLetters,
        revealedLetters: newRevealedLetters,
        currentErrors: newErrors,
        isComplete,
        isCorrect
      };
    });

    setInputLetter('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  // Check for game completion
  useEffect(() => {
    if (gameState.isComplete || gameState.currentErrors >= gameState.maxErrors) {
      const success = gameState.isComplete && gameState.currentErrors <= gameState.maxErrors;
      onComplete(success);
    }
  }, [gameState.isComplete, gameState.currentErrors, gameState.maxErrors, onComplete]);

  const isGameOver = gameState.currentErrors >= gameState.maxErrors;

  return (
    <div className="hangman-question">
      <div className="question-header">
        <h3>Hangman - Guess the Russian Word</h3>
        <p className="spanish-hint">Spanish: {question.word.spanish}</p>
      </div>

      <div className="hangman-display">
        <div className="word-display">
          {gameState.revealedLetters.map((letter, index) => (
            <span key={index} className="letter">
              {letter}
            </span>
          ))}
        </div>

        <div className="hangman-drawing">
          {/* Simple hangman drawing based on errors */}
          <svg width="200" height="200">
            {/* Gallows */}
            <line x1="20" y1="180" x2="80" y2="180" stroke="black" strokeWidth="2"/>
            <line x1="50" y1="180" x2="50" y2="20" stroke="black" strokeWidth="2"/>
            <line x1="50" y1="20" x2="120" y2="20" stroke="black" strokeWidth="2"/>
            <line x1="120" y1="20" x2="120" y2="40" stroke="black" strokeWidth="2"/>

            {/* Hangman parts based on errors */}
            {gameState.currentErrors >= 1 && <circle cx="120" cy="50" r="10" stroke="black" strokeWidth="2" fill="none"/>}
            {gameState.currentErrors >= 2 && <line x1="120" y1="60" x2="120" y2="120" stroke="black" strokeWidth="2"/>}
            {gameState.currentErrors >= 3 && (
              <>
                <line x1="120" y1="80" x2="100" y2="100" stroke="black" strokeWidth="2"/>
                <line x1="120" y1="80" x2="140" y2="100" stroke="black" strokeWidth="2"/>
                <line x1="120" y1="120" x2="100" y2="140" stroke="black" strokeWidth="2"/>
                <line x1="120" y1="120" x2="140" y2="140" stroke="black" strokeWidth="2"/>
              </>
            )}
          </svg>
        </div>
      </div>

      <div className="guessed-letters">
        <p>Guessed letters: {gameState.guessedLetters.join(', ')}</p>
        <p>Errors: {gameState.currentErrors}/{gameState.maxErrors}</p>
      </div>

      {!isGameOver && !gameState.isComplete && (
        <div className="input-section">
          <input
            type="text"
            value={inputLetter}
            onChange={(e) => setInputLetter(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={1}
            placeholder="Enter a letter"
            className="letter-input"
          />
          <button onClick={handleGuess} disabled={!inputLetter}>
            Guess
          </button>
        </div>
      )}

      {(isGameOver || gameState.isComplete) && (
        <div className="result-section">
          {gameState.isComplete ? (
            <div className="success">
              <h3>¡Correcto! The word was: {question.word.cyrillic}</h3>
            </div>
          ) : (
            <div className="failure">
              <h3>Game Over! The word was: {question.word.cyrillic}</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HangmanQuestion;
```

### 4. Question Selection Logic

#### Updated Question Generation Strategy

```typescript
function generateQuestions(
  words: Word[],
  count: number,
  categories?: ICategoryId[]
): Question[] {
  // Filter words by categories if provided
  const filteredWords = filterWordsByCategories(words, categories || []);
  const hangmanWords = getHangmanWords(filteredWords);

  if (filteredWords.length < 4) {
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
  for (let i = 0; i < remainingSlots; i++) {
    const questionType = getRandomQuestionType();
    const word = getRandomWord(filteredWords, usedWords);

    if (!word) break; // No more words available

    usedWords.add(word.id);

    const question: Question = {
      id: `q_${i}_${word.id}`,
      type: questionType,
      word,
    };

    // Add options for multiple choice questions
    if (questionType === 'multiple-choice-to-russian' || questionType === 'multiple-choice-to-spanish') {
      question.options = generateMultipleChoiceOptions(filteredWords, word);
    }

    questions.push(question);
  }

  return questions;
}
```

### 5. Styling

#### CSS Classes for Hangman Component

```css
.hangman-question {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.question-header {
  text-align: center;
  margin-bottom: 20px;
}

.spanish-hint {
  font-size: 1.2em;
  color: #666;
  font-style: italic;
}

.hangman-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.word-display {
  display: flex;
  gap: 5px;
  font-size: 2em;
  font-weight: bold;
}

.letter {
  display: inline-block;
  width: 30px;
  height: 40px;
  border-bottom: 2px solid #333;
  text-align: center;
  line-height: 40px;
}

.hangman-drawing {
  flex-shrink: 0;
}

.guessed-letters {
  text-align: center;
  margin-bottom: 20px;
}

.input-section {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.letter-input {
  width: 50px;
  height: 40px;
  font-size: 1.5em;
  text-align: center;
  border: 2px solid #333;
  border-radius: 4px;
}

.result-section {
  text-align: center;
}

.success {
  color: #28a745;
}

.failure {
  color: #dc3545;
}
```

## Implementation Phases

### Phase 1: Core Logic ✅ COMPLETED
1. ✅ Update question generator with hangman question type
2. ✅ Implement word filtering for hangman words
3. ✅ Add hangman question generation logic
4. ✅ Create utility functions for UI state management

### Phase 2: UI Components
1. Create HangmanQuestion component with local state management
2. Implement hangman drawing
3. Add letter input and feedback
4. Integrate with quiz flow

### Phase 3: Integration & Testing
1. Update question selection logic
2. Test with various word lengths
3. Ensure proper error counting
4. Add proper error handling

### Phase 4: Polish & Enhancement
1. Add animations and polish
2. Test edge cases (repeated letters, special characters)
3. Optimize performance
4. Add accessibility features

## Testing Strategy

### Test Cases
1. **Word Selection**: Verify only 7+ character words are selected
2. **Letter Guessing**: Test correct and incorrect letter guesses
3. **Error Counting**: Ensure errors are counted correctly
4. **Game Completion**: Test both success and failure scenarios
5. **Question Limits**: Verify max 2 hangman questions per round
6. **Retry Logic**: Test failed question retry functionality

### Edge Cases
1. Words with repeated letters
2. Words with special characters
3. Very long words (15+ characters)
4. Words with soft signs (ь, ъ)

## Future Enhancements

### Phase 2 Features
1. **Multi-word Phrases**: Support for phrases with spaces
2. **Difficulty Levels**: Different error limits based on difficulty
3. **Hints System**: Provide additional hints after errors
4. **Sound Effects**: Audio feedback for correct/incorrect guesses
5. **Statistics**: Track hangman success rates
6. **Custom Words**: Allow users to add their own words

### Advanced Features
1. **Themed Hangman**: Category-specific hangman games
2. **Time Limits**: Add time pressure to hangman
3. **Multiplayer**: Competitive hangman between users
4. **Achievements**: Unlock achievements for hangman mastery

## Key Design Decisions

### Simplified State Management
- **HangmanQuestion interface is minimal**: Only contains `id`, `type`, and `word` properties
- **UI manages game state**: All game state (guessed letters, errors, etc.) is handled by the component
- **Clean state reset**: Moving between questions automatically resets all game state
- **Utility functions**: `checkHangmanLetter` and `getHangmanLetterPositions` provide the logic the UI needs

### Benefits of This Approach
1. **Separation of concerns**: Data model is simple, UI handles complexity
2. **No state persistence issues**: Game state doesn't need to be saved/restored
3. **Easier testing**: UI logic is isolated and testable
4. **Better performance**: No unnecessary state updates in global store
5. **Cleaner architecture**: Follows React best practices for component state

## Conclusion

This implementation plan provides a comprehensive approach to adding hangman functionality to the Russian learning app. The simplified design focuses on making complex Russian words more accessible through interactive letter guessing while maintaining clean separation between data and UI concerns.

The phased approach allows for incremental development and testing, ensuring a robust and user-friendly implementation that follows modern React patterns.
