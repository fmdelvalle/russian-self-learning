import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Question } from '../../../types';
import { FeedbackDisplay } from '../feedback/FeedbackDisplay';
import { MultipleChoiceOptions } from '../options/MultipleChoiceOptions';

interface MultipleChoiceToSpanishProps {
    question: Question;
    onSubmit: (answer: string) => void;
    onNext: () => void;
    pageMode: 'ASKING' | 'FEEDBACK';
    lastAnswer: {
        isCorrect: boolean;
        userAnswer: string;
        correctAnswer: string;
    } | null;
}

export function MultipleChoiceToSpanish({
    question,
    onSubmit,
    onNext,
    pageMode,
    lastAnswer,
}: MultipleChoiceToSpanishProps) {
    const { t } = useTranslation();
    const [selectedOption, setSelectedOption] = useState('');

    // Reset selection when transitioning to ASKING mode
    useEffect(() => {
        if (pageMode === 'ASKING') {
            setSelectedOption('');
        }
    }, [pageMode]);

    // Handle number key selection and submission
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (pageMode === 'ASKING') {
                const key = e.key;
                if (key >= '1' && key <= '4') {
                    e.preventDefault();
                    const optionIndex = parseInt(key) - 1;
                    const options = question.options;
                    if (options && options[optionIndex]) {
                        const selectedValue = options[optionIndex].spanish;
                        setSelectedOption(selectedValue);
                        onSubmit(selectedValue);
                    }
                }
            } else if (pageMode === 'FEEDBACK' && e.key === 'Enter') {
                e.preventDefault();
                onNext();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [pageMode, question.options, onSubmit, onNext]);

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    const handleSubmit = () => {
        if (selectedOption) {
            onSubmit(selectedOption);
        }
    };

    return (
        <>
            <h3 className="text-2xl font-bold mb-4">
                {t('questions.multipleChoiceToSpanish', { russian: `${question.word.cyrillic} (${question.word.romanized})` })}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {t('questions.chooseAnswer')}
            </p>

            {pageMode === 'ASKING' && (
                <>
                    <MultipleChoiceOptions
                        question={question}
                        selectedOption={selectedOption}
                        onOptionSelect={handleOptionSelect}
                        lastAnswer={null}
                        pageMode={pageMode}
                        isRussianToSpanish={true}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedOption}
                        className="w-full px-6 py-3 rounded-lg font-bold disabled:opacity-50 mt-4"
                        style={{
                            backgroundColor: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary-foreground))',
                        }}
                    >
                        {t('quiz.checkAnswer')}
                    </button>
                </>
            )}

            {pageMode === 'FEEDBACK' && lastAnswer && (
                <form onSubmit={(e) => { e.preventDefault(); onNext(); }}>
                    <MultipleChoiceOptions
                        question={question}
                        selectedOption={lastAnswer.userAnswer}
                        onOptionSelect={() => { }} // No selection in feedback mode
                        lastAnswer={lastAnswer}
                        pageMode={pageMode}
                        isRussianToSpanish={true}
                    />
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
