import type { HangmanQuestion as HangmanQuestionType, Question } from '../../../types';
import { HangmanQuestion } from './HangmanQuestion';
import { MultipleChoiceToRussian } from './MultipleChoiceToRussian';
import { MultipleChoiceToSpanish } from './MultipleChoiceToSpanish';
import { WriteRussian } from './WriteRussian';
import { WriteSpanish } from './WriteSpanish';

interface QuestionRendererProps {
    question: Question;
    pageMode: 'ASKING' | 'FEEDBACK';
    lastAnswer: {
        isCorrect: boolean;
        userAnswer: string;
        correctAnswer: string;
    } | null;
    onSubmit: (answer: string) => void;
    onNext: () => void;
}

export function QuestionRenderer({
    question,
    pageMode,
    lastAnswer,
    onSubmit,
    onNext,
}: QuestionRendererProps) {
    // For hangman questions
    if (question.type === 'hangman') {
        return (
            <HangmanQuestion
                question={question as HangmanQuestionType}
                pageMode={pageMode}
                lastAnswer={lastAnswer}
                onSubmit={onSubmit}
                onNext={onNext}
            />
        );
    }

    // For write questions, pass simplified props
    if (question.type === 'write-spanish') {
        return (
            <WriteSpanish
                question={question}
                pageMode={pageMode}
                lastAnswer={lastAnswer}
                onSubmit={onSubmit}
                onNext={onNext}
            />
        );
    }

    if (question.type === 'write-russian') {
        return (
            <WriteRussian
                question={question}
                pageMode={pageMode}
                lastAnswer={lastAnswer}
                onSubmit={onSubmit}
                onNext={onNext}
            />
        );
    }

    // For multiple choice questions, pass simplified props
    if (question.type === 'multiple-choice-to-russian') {
        return (
            <MultipleChoiceToRussian
                question={question}
                pageMode={pageMode}
                lastAnswer={lastAnswer}
                onSubmit={onSubmit}
                onNext={onNext}
            />
        );
    }

    if (question.type === 'multiple-choice-to-spanish') {
        return (
            <MultipleChoiceToSpanish
                question={question}
                pageMode={pageMode}
                lastAnswer={lastAnswer}
                onSubmit={onSubmit}
                onNext={onNext}
            />
        );
    }

    throw new Error(`Unknown question type: ${question.type}`);
}
