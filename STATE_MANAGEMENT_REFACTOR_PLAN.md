# 🎯 **State Management Refactoring Plan**

## **Correct Architecture Principles** ✅

### **Business Logic State (Zustand Store)**
- **Completed Questions Counter**: Track how many questions have been answered
- **Score**: Current score (+1 for correct, -1 for incorrect)
- **Remaining Questions**: Array of unanswered questions (shrinks over time)
- **Failed Questions**: Re-enqueued at the end when answered incorrectly
- **Current Question**: First item in remaining questions array
- **Page Mode**: 'ASKING' or 'FEEDBACK' - determines UI state
- **Feedback Data**: Last answer result (correct/incorrect, user answer, correct answer)

### **UI State (Component State)**
- **Current User Input**: Only the current, unsent user input (text field value, selected option)
- **Nothing Else**: All other state comes from business logic store

### **Hook Responsibility**
- **Validate User Input**: Check if answer is correct
- **Update Counters**: Increment completed questions, update score
- **Manage Question Queue**: Remove current question, re-enqueue if failed
- **Set Page Mode**: Switch between ASKING and FEEDBACK modes
- **Provide Feedback Data**: Last answer result for display

---

## **Phase 1: Correct Architecture Design** ✅

### **1.1 Simplified Store Structure**

#### **Quiz Store** - Single source of truth for business logic
```typescript
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
  startNewQuiz: (categories?: string[]) => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  restartQuiz: () => void;

  // Computed
  getCurrentQuestion: () => Question | null;
  isComplete: () => boolean;  // remainingQuestions.length === 0
  getProgress: () => { completed: number; total: number };
}
```

### **1.2 UI State Management**

#### **Component State** - Only current user input
```typescript
// In each question component
const [userInput, setUserInput] = useState('');  // Text input value
const [selectedOption, setSelectedOption] = useState('');  // Selected option

// Nothing else - all other state comes from store
```

### **1.3 Hook Responsibility**

#### **useQuiz Hook** - Business logic coordinator
```typescript
export function useQuiz() {
  const store = useQuizStore();

  const submitAnswer = (answer: string) => {
    const currentQuestion = store.getCurrentQuestion();
    if (!currentQuestion) return;

    const isCorrect = validateAnswer(currentQuestion, answer);

    // Update business logic
    store.set({
      completedQuestions: store.completedQuestions + 1,
      score: store.score + (isCorrect ? 1 : -1),
      remainingQuestions: store.remainingQuestions.slice(1), // Remove current
      pageMode: 'FEEDBACK',
      lastAnswer: {
        isCorrect,
        userAnswer: answer,
        correctAnswer: getCorrectAnswerText(currentQuestion)
      }
    });

    // Re-enqueue failed questions
    if (!isCorrect) {
      store.set({
        remainingQuestions: [...store.remainingQuestions, currentQuestion]
      });
    }
  };

  const nextQuestion = () => {
    store.set({
      pageMode: 'ASKING',
      lastAnswer: null
    });
  };

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
    submitAnswer,
    nextQuestion,
    startNewQuiz: store.startNewQuiz,
    restartQuiz: store.restartQuiz,
  };
}
```

---

## **Phase 2: Implementation** 📋

### **2.1 Create Simplified Quiz Store**

#### **Store Implementation**
```typescript
import { create } from 'zustand';
import { russianWords } from '../data/russian-words-full';
import { generateQuestions, validateAnswer } from '../utils/questionGenerator';

interface QuizStore {
  // Core State
  completedQuestions: number;
  score: number;
  remainingQuestions: Question[];
  pageMode: 'ASKING' | 'FEEDBACK';
  lastAnswer: {
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
  } | null;

  // Actions
  startNewQuiz: (categories?: string[]) => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  restartQuiz: () => void;

  // Computed
  getCurrentQuestion: () => Question | null;
  isComplete: () => boolean;
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
  startNewQuiz: (categories?: string[]) => {
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
    const newRemainingQuestions = state.remainingQuestions.slice(1);

    // Re-enqueue failed questions
    if (!isCorrect) {
      newRemainingQuestions.push(currentQuestion);
    }

    set({
      completedQuestions: state.completedQuestions + 1,
      score: state.score + (isCorrect ? 1 : -1),
      remainingQuestions: newRemainingQuestions,
      pageMode: 'FEEDBACK',
      lastAnswer: {
        isCorrect,
        userAnswer: answer,
        correctAnswer: getCorrectAnswerText(currentQuestion),
      },
    });
  },

  nextQuestion: () => {
    set({
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
      return question.word.romanized;
    default:
      return `${question.word.romanized} (${question.word.cyrillic})`;
  }
}
```

### **2.2 Update useQuiz Hook**

#### **Simplified Hook Implementation**
```typescript
import { useQuizStore } from '../stores/quizStore';

export function useQuiz() {
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
    restartQuiz: store.restartQuiz,
  };
}
```

---

## **Phase 3: Component Updates** 🎨

### **3.1 Update QuizContainer**

#### **Simplified Component Logic**
```typescript
export function QuizContainer() {
  const { t } = useTranslation();
  const {
    currentQuestion,
    pageMode,
    lastAnswer,
    completedQuestions,
    score,
    isComplete,
    progress,
    submitAnswer,
    nextQuestion,
    startNewQuiz,
  } = useQuiz();

  // Handle answer submission
  const handleSubmit = (answer: string) => {
    submitAnswer(answer);
  };

  // Handle moving to next question
  const handleNext = () => {
    nextQuestion();
  };

  // Show completion screen
  if (isComplete) {
    return (
      <div className="quiz-completion">
        <h2>{t('quiz.completed')}</h2>
        <p>{t('quiz.finalScore', { score, total: progress.total })}</p>
        <button onClick={() => startNewQuiz()}>
          {t('quiz.startNew')}
        </button>
      </div>
    );
  }

  // Show current question
  return (
    <div className="quiz-container">
      {/* Progress indicator */}
      <div className="quiz-progress">
        <span>{progress.completed} / {progress.total}</span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <QuestionRenderer
        question={currentQuestion!}
        pageMode={pageMode}
        lastAnswer={lastAnswer}
        onSubmit={handleSubmit}
        onNext={handleNext}
      />
    </div>
  );
}
```

### **3.2 Update Question Components**

#### **Component with Local Input State**
```typescript
interface QuestionRendererProps {
  question: Question;
  pageMode: 'ASKING' | 'FEEDBACK';
  lastAnswer: { isCorrect: boolean; userAnswer: string; correctAnswer: string } | null;
  onSubmit: (answer: string) => void;
  onNext: () => void;
}

export function QuestionRenderer({ question, pageMode, lastAnswer, onSubmit, onNext }: QuestionRendererProps) {
  // Local state for current user input
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  // Reset local state when question changes
  useEffect(() => {
    setUserInput('');
    setSelectedOption('');
  }, [question.id]);

  const handleSubmit = () => {
    const answer = question.type.includes('multiple-choice') ? selectedOption : userInput;
    if (answer.trim()) {
      onSubmit(answer);
    }
  };

  if (pageMode === 'FEEDBACK' && lastAnswer) {
    return (
      <FeedbackDisplay
        result={lastAnswer}
        onNext={onNext}
      />
    );
  }

  // Render question based on type
  switch (question.type) {
    case 'write-spanish':
      return (
        <WriteSpanish
          question={question}
          userInput={userInput}
          onInputChange={setUserInput}
          onSubmit={handleSubmit}
        />
      );

    case 'write-russian':
      return (
        <WriteRussian
          question={question}
          userInput={userInput}
          onInputChange={setUserInput}
          onSubmit={handleSubmit}
        />
      );

    case 'multiple-choice-to-russian':
      return (
        <MultipleChoiceToRussian
          question={question}
          selectedOption={selectedOption}
          onOptionSelect={setSelectedOption}
          onSubmit={handleSubmit}
        />
      );

    case 'multiple-choice-to-spanish':
      return (
        <MultipleChoiceToSpanish
          question={question}
          selectedOption={selectedOption}
          onOptionSelect={setSelectedOption}
          onSubmit={handleSubmit}
        />
      );

    default:
      return <div>Unknown question type</div>;
  }
}
```

---

## **Phase 4: Testing Strategy** ✅

### **4.1 Unit Tests**

#### **Store Tests**
- Test `startNewQuiz` initializes correctly
- Test `submitAnswer` updates counters and queue
- Test failed questions are re-enqueued
- Test `nextQuestion` switches to ASKING mode
- Test `isComplete` returns true when no remaining questions

#### **Hook Tests**
- Test hook returns correct state from store
- Test actions call store methods correctly
- Test computed values are calculated properly

### **4.2 Integration Tests**

#### **Component Tests**
- Test complete quiz flow from start to finish
- Test question transitions work correctly
- Test feedback display shows proper information
- Test keyboard navigation works with new state

### **4.3 Performance Tests**

#### **Optimization Tests**
- Test components only re-render when relevant state changes
- Test no unnecessary object recreation
- Test memory usage is optimized

---

## **Phase 5: Migration Strategy** 🔄

### **5.1 Gradual Migration**

#### **Step 1: Create New Store**
- Create new simplified store alongside existing one
- Implement all business logic in new store
- Test new store independently

#### **Step 2: Update Hook**
- Update `useQuiz` hook to use new store
- Maintain backward compatibility for components
- Test hook functionality

#### **Step 3: Update Components**
- Update components one by one to use new patterns
- Remove old state management code
- Test each component individually

#### **Step 4: Cleanup**
- Remove old store and unused code
- Update documentation
- Final testing

### **5.2 Rollback Strategy**

#### **Feature Flag Approach**
```typescript
const USE_NEW_STATE_MANAGEMENT = process.env.REACT_APP_USE_NEW_STATE === 'true';

export function QuizContainer() {
  if (USE_NEW_STATE_MANAGEMENT) {
    return <NewQuizContainer />;
  }
  return <LegacyQuizContainer />;
}
```

---

## **Success Criteria** 🎯

### **Architecture**
- ✅ Single store manages all business logic
- ✅ Components only manage local input state
- ✅ Clear separation of concerns
- ✅ No redundant state management

### **Performance**
- ✅ Components only re-render when relevant state changes
- ✅ No unnecessary object recreation
- ✅ Optimized memory usage
- ✅ Fast state updates

### **Maintainability**
- ✅ Simple, predictable state flow
- ✅ Easy to test business logic
- ✅ Clear component responsibilities
- ✅ Consistent patterns throughout

### **Functionality**
- ✅ All quiz features work correctly
- ✅ Proper question queue management
- ✅ Correct score tracking
- ✅ Proper feedback display

---

## **Implementation Timeline** 📅

### **Week 1: Foundation**
- Day 1-2: Create new simplified store
- Day 3-4: Update useQuiz hook
- Day 5: Test store and hook functionality

### **Week 2: Component Updates**
- Day 1-2: Update QuizContainer
- Day 3-4: Update question components
- Day 5: Update feedback components

### **Week 3: Testing & Migration**
- Day 1-2: Comprehensive testing
- Day 3-4: Implement migration strategy
- Day 5: Deploy and monitor

### **Week 4: Cleanup**
- Day 1-2: Remove old code
- Day 3-4: Update documentation
- Day 5: Team training

---

*This simplified plan focuses on the correct architecture: business logic in Zustand store, UI input state in components, and clear separation of responsibilities.*