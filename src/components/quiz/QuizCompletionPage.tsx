import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface QuizCompletionPageProps {
    score: number;
    totalQuestions: number;
    onStartNewQuiz: () => void;
}

export function QuizCompletionPage({
    score,
    totalQuestions,
    onStartNewQuiz,
}: QuizCompletionPageProps) {
    const { t } = useTranslation();
    const { addToDailyScore } = useLocalStorage();

    // Add quiz score to daily score when component mounts
    useEffect(() => {
        addToDailyScore(score);
    }, [score, addToDailyScore]);

    // Calculate correct and incorrect answers
    const correctAnswers = Math.max(0, score); // Score can't be negative
    const incorrectAnswers = totalQuestions - correctAnswers;

    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                <h2 className="text-4xl font-bold mb-4">{t('quiz.quizComplete')}</h2>
                <div className="mb-6">
                    <div className="text-6xl font-bold mb-2">{score}</div>
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {t('quiz.score')}: {score}
                    </p>
                    <div className="mt-4 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        <div>{t('quiz.correctAnswers')}: {correctAnswers}</div>
                        <div>{t('quiz.incorrectAnswers')}: {incorrectAnswers}</div>
                        <div>{t('quiz.totalQuestions')}: {totalQuestions}</div>
                    </div>
                </div>
                <button
                    onClick={onStartNewQuiz}
                    className="px-6 py-3 rounded-lg font-bold"
                    style={{
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                    }}
                >
                    {t('quiz.startNewQuiz')}
                </button>
            </div>
        </div>
    );
}
