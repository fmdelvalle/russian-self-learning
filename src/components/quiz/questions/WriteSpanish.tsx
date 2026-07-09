import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Question } from '../../../types';
import { RomanizedText } from '../../RomanizedText';
import { FeedbackDisplay } from '../feedback/FeedbackDisplay';

interface WriteSpanishProps {
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

export function WriteSpanish({
    question,
    pageMode,
    lastAnswer,
    onSubmit,
    onNext
}: WriteSpanishProps) {
    const { t } = useTranslation();
    const [userInput, setUserInput] = useState('');

    // Reset input when transitioning to ASKING mode
    useEffect(() => {
        if (pageMode === 'ASKING') {
            setUserInput('');
        }
    }, [pageMode]);

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim()) {
            onSubmit(userInput);
        }
    };

    // Handle Enter key in feedback mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (pageMode === 'FEEDBACK' && e.key === 'Enter') {
                e.preventDefault();
                onNext();
            }
        };

        if (pageMode === 'FEEDBACK') {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [pageMode, onNext]);

    return (
        <>
            <h3 className="text-2xl font-bold mb-4">
                {t('questions.translateToSpanish')}
            </h3>
            <div className="text-3xl mb-4">
                {question.word.cyrillic} (<RomanizedText text={question.word.romanized} />)
            </div>

            {/* Input field for write questions */}
            {pageMode === 'ASKING' && (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full px-4 py-3 rounded-lg border mb-4"
                        style={{
                            borderColor: 'hsl(var(--border))',
                            backgroundColor: 'hsl(var(--background))',
                            color: 'hsl(var(--foreground))',
                        }}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!userInput.trim()}
                        className="w-full px-6 py-3 rounded-lg font-bold disabled:opacity-50"
                        style={{
                            backgroundColor: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary-foreground))',
                        }}
                    >
                        {t('quiz.checkAnswer')}
                    </button>
                </form>
            )}

            {/* Feedback */}
            {pageMode === 'FEEDBACK' && lastAnswer && (
                <form onSubmit={(e) => { e.preventDefault(); onNext(); }}>
                    <FeedbackDisplay lastAnswer={lastAnswer} />
                    <button
                        type="submit"
                        onClick={onNext}
                        className="w-full px-6 py-3 rounded-lg font-bold mt-4"
                        style={{
                            backgroundColor: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary-foreground))',
                        }}
                    >
                        {t('quiz.nextQuestion')}
                    </button>
                </form>
            )}
        </>
    );
}
