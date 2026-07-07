import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuiz } from '../../hooks/useQuiz';
import { QuestionRenderer } from './questions/QuestionRenderer';

export function QuizPage() {
    const { t } = useTranslation();
    const {
        currentQuestion,
        pageMode,
        lastAnswer,
        score,
        progress,
        submitAnswer,
        nextQuestion,
    } = useQuiz();

    const containerRef = useRef<HTMLDivElement>(null);

    // Focus the container when a new question appears
    useEffect(() => {
        if (currentQuestion && containerRef.current) {
            containerRef.current.focus();
        }
    }, [currentQuestion]);

    // Handle answer submission
    const handleSubmit = (answer: string) => {
        submitAnswer(answer);
    };

    // Handle moving to next question
    const handleNext = () => {
        nextQuestion();
    };

    if (!currentQuestion) return null;

    const progressPercentage = Math.round((progress.completed / progress.total) * 100);

    return (
        <div className="max-w-2xl mx-auto" tabIndex={0}>
            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex justify-between mb-2">
                    <span style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {t('quiz.question')} {progress.completed + 1} {t('quiz.of')}{' '}
                        {progress.total}
                    </span>
                    <span style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {t('quiz.score')}: {score}
                    </span>
                </div>
                <div
                    className="h-2 rounded-lg"
                    style={{ backgroundColor: 'hsl(var(--muted))' }}
                >
                    <div
                        className="h-full rounded-lg transition-all duration-300"
                        style={{
                            width: `${progressPercentage}%`,
                            backgroundColor: 'hsl(var(--primary))',
                        }}
                    />
                </div>
            </div>

            {/* Question card */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                {/* Question type indicator */}
                <div className="mb-4">
                    <span
                        className="px-3 py-1 rounded text-sm"
                        style={{
                            backgroundColor: 'hsl(var(--secondary))',
                            color: 'hsl(var(--secondary-foreground))',
                        }}
                    >
                        {currentQuestion.type === 'multiple-choice-to-russian' &&
                            t('questionTypes.multipleChoiceToRussian')}
                        {currentQuestion.type === 'multiple-choice-to-spanish' &&
                            t('questionTypes.multipleChoiceToSpanish')}
                        {currentQuestion.type === 'write-spanish' && t('questionTypes.writeSpanish')}
                        {currentQuestion.type === 'write-russian' &&
                            t('questionTypes.writeRussian')}
                        {currentQuestion.type === 'hangman' && t('questionTypes.hangman')}
                    </span>
                </div>

                {/* Question content */}
                <div className="mb-6">

                    <QuestionRenderer
                        question={currentQuestion}
                        pageMode={pageMode}
                        lastAnswer={lastAnswer}
                        onSubmit={handleSubmit}
                        onNext={handleNext}
                    />
                </div>
            </div>
        </div>
    );
}