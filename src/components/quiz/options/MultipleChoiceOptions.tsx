import type { Question } from '../../../types';

interface MultipleChoiceOptionsProps {
  question: Question;
  selectedOption: string;
  onOptionSelect: (option: string) => void;
  lastAnswer: {
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
  } | null;
  pageMode: 'ASKING' | 'FEEDBACK';
  isRussianToSpanish?: boolean;
}

export function MultipleChoiceOptions({
  question,
  selectedOption,
  onOptionSelect,
  lastAnswer,
  pageMode,
  isRussianToSpanish = false,
}: MultipleChoiceOptionsProps) {

  if (!question.options) return null;

  return (
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const optionValue = isRussianToSpanish ? option.spanish : option.cyrillic;
        const isSelected = selectedOption === optionValue;
        const isCorrect = lastAnswer && lastAnswer.isCorrect && isSelected;
        const isIncorrect = lastAnswer && !lastAnswer.isCorrect && isSelected;
        const isCorrectAnswer = lastAnswer && optionValue === lastAnswer.correctAnswer;

        return (
          <label
            key={option.id}
            className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${pageMode === 'FEEDBACK'
              ? 'cursor-default opacity-75'
              : 'cursor-pointer'
              } ${isSelected ? 'ring-2' : ''}`}
            style={{
              borderColor: isCorrectAnswer
                ? 'hsl(var(--success))'
                : isCorrect
                  ? 'hsl(var(--success))'
                  : isIncorrect
                    ? 'hsl(var(--destructive))'
                    : isSelected
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--border))',
              backgroundColor: isCorrectAnswer
                ? 'hsl(var(--success) / 0.1)'
                : isCorrect
                  ? 'hsl(var(--success) / 0.1)'
                  : isIncorrect
                    ? 'hsl(var(--destructive) / 0.1)'
                    : isSelected
                      ? 'hsl(var(--primary) / 0.1)'
                      : 'transparent',
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: isCorrectAnswer
                    ? 'hsl(var(--success))'
                    : isCorrect
                      ? 'hsl(var(--success))'
                      : isIncorrect
                        ? 'hsl(var(--destructive))'
                        : isSelected
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--muted))',
                  color: isCorrectAnswer
                    ? 'hsl(var(--success-foreground))'
                    : isCorrect
                      ? 'hsl(var(--success-foreground))'
                      : isIncorrect
                        ? 'hsl(var(--destructive-foreground))'
                        : isSelected
                          ? 'hsl(var(--primary-foreground))'
                          : 'hsl(var(--muted-foreground))',
                }}
              >
                {index + 1}
              </div>
              {isRussianToSpanish ? (
                <div>
                  <div className="font-bold">{option.spanish}</div>
                </div>
              ) : (
                <>
                  <input
                    type="radio"
                    name="multiple-choice"
                    value={option.cyrillic}
                    checked={selectedOption === option.cyrillic}
                    onChange={(e) => onOptionSelect(e.target.value)}
                    disabled={pageMode === 'FEEDBACK'}
                    className="w-4 h-4"
                    style={{ accentColor: 'hsl(var(--primary))' }}
                  />
                  <div className="flex-1">
                    <div className="text-lg font-bold">{option.romanized}</div>
                    <div className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {option.cyrillic}
                    </div>
                  </div>
                </>
              )}
            </div>
            {isRussianToSpanish && (
              <input
                type="radio"
                name="answer"
                value={option.spanish}
                checked={selectedOption === option.spanish}
                onChange={(e) => onOptionSelect(e.target.value)}
                disabled={pageMode === 'FEEDBACK'}
                className="sr-only"
              />
            )}
          </label>
        );
      })}
    </div>
  );
}
