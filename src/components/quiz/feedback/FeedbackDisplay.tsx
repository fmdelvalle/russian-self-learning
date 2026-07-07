import { useTranslation } from 'react-i18next';

interface FeedbackDisplayProps {
  lastAnswer: {
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
  };
}

export function FeedbackDisplay({ lastAnswer }: FeedbackDisplayProps) {
  const { t } = useTranslation();

  // For hangman failures, don't show "wrong_answer" as user answer
  const isHangmanFailure = !lastAnswer.isCorrect && lastAnswer.userAnswer === "wrong_answer";

  return (
    <div
      className="mb-4 p-4 rounded-lg"
      style={{
        backgroundColor: lastAnswer.isCorrect
          ? 'hsl(var(--secondary))'
          : 'hsl(var(--destructive) / 0.1)',
      }}
    >
      <div className="font-bold mb-2">
        {lastAnswer.isCorrect ? t('feedback.correct') : t('feedback.incorrect')}
      </div>
      {!lastAnswer.isCorrect && (
        <div>
          {!isHangmanFailure && (
            <div>{t('feedback.yourAnswer')} {lastAnswer.userAnswer}</div>
          )}
          <div>{t('feedback.correctAnswer')} {lastAnswer.correctAnswer}</div>
        </div>
      )}
    </div>
  );
}
