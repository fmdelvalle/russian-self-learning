import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HangmanQuestion } from '../../../types';
import { checkHangmanLetter, getHangmanLetterPositions } from '../../../utils/questionGenerator';
import { FeedbackDisplay } from '../feedback/FeedbackDisplay';

interface HangmanGameState {
    guessedLetters: string[];
    revealedLetters: string[];
    currentErrors: number;
    maxErrors: number;
    isComplete: boolean;
    isCorrect: boolean;
}

interface HangmanQuestionProps {
    question: HangmanQuestion;
    pageMode: 'ASKING' | 'FEEDBACK';
    lastAnswer: {
        isCorrect: boolean;
        userAnswer: string;
        correctAnswer: string;
    } | null;
    onSubmit: (answer: string) => void;
    onNext: () => void;
}

export function HangmanQuestion({
    question,
    pageMode,
    lastAnswer,
    onSubmit,
    onNext
}: HangmanQuestionProps) {
    const { t } = useTranslation();
    const hasSubmittedRef = useRef(false);
    const [gameState, setGameState] = useState<HangmanGameState>({
        guessedLetters: [],
        revealedLetters: Array(question.word.romanized.length).fill('_'),
        currentErrors: 0,
        maxErrors: 3,
        isComplete: false,
        isCorrect: false
    });

    // Reset game state when question changes or when transitioning to ASKING mode
    useEffect(() => {
        // Always reset when question ID changes (new question)
        // Also reset when transitioning to ASKING mode to ensure clean state
        if (pageMode === 'ASKING') {
            hasSubmittedRef.current = false;

            // Pre-reveal soft consonant accents (ý) so users can see them
            const initialRevealedLetters = Array(question.word.romanized.length).fill('_');
            for (let i = 0; i < question.word.romanized.length; i++) {
                const char = question.word.romanized[i];
                // Only pre-reveal this one
                if (char === "'") {
                    initialRevealedLetters[i] = char;
                }
            }

            setGameState({
                guessedLetters: [],
                revealedLetters: initialRevealedLetters,
                currentErrors: 0,
                maxErrors: 3,
                isComplete: false,
                isCorrect: false
            });
        }
    }, [question.id, question.word.romanized, pageMode]);

    const handleKeyPress = useCallback((letter: string) => {
        if (gameState.guessedLetters.includes(letter.toLowerCase()) ||
            gameState.isComplete ||
            gameState.currentErrors >= gameState.maxErrors) {
            return;
        }

        const letterExists = checkHangmanLetter(question.word, letter);
        const positions = getHangmanLetterPositions(question.word, letter);

        // Calculate new state
        const newGuessedLetters = [...gameState.guessedLetters, letter.toLowerCase()];
        const newRevealedLetters = [...gameState.revealedLetters];
        let newErrors = gameState.currentErrors;

        if (letterExists) {
            // Reveal all instances of the letter (show original letters with accents)
            positions.forEach(pos => {
                newRevealedLetters[pos] = question.word.romanized[pos];
            });
        } else {
            newErrors++;
        }

        const isComplete = !newRevealedLetters.includes('_');
        const isCorrect = isComplete && newErrors <= gameState.maxErrors;

        // Update state
        setGameState({
            guessedLetters: newGuessedLetters,
            revealedLetters: newRevealedLetters,
            currentErrors: newErrors,
            maxErrors: gameState.maxErrors,
            isComplete,
            isCorrect
        });

        // Check for game completion and submit immediately
        if ((isComplete || newErrors >= gameState.maxErrors) && !hasSubmittedRef.current) {
            hasSubmittedRef.current = true;

            const userSucceeded = isComplete && newErrors <= gameState.maxErrors;
            if (userSucceeded) {
                onSubmit(question.word.romanized);
            } else {
                onSubmit("wrong_answer");
            }
        }
    }, [gameState, question.word, onSubmit]);


    // Handle keyboard input for letter guessing
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (pageMode === 'ASKING' && !gameState.isComplete && gameState.currentErrors < gameState.maxErrors) {
                const key = e.key.toLowerCase();
                // Only process single letter keys (a-z)
                if (key.length === 1 && key >= 'a' && key <= 'z') {
                    e.preventDefault();
                    handleKeyPress(key);
                }
            } else if (pageMode === 'FEEDBACK' && e.key === 'Enter') {
                e.preventDefault();
                onNext();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [pageMode, gameState.isComplete, gameState.currentErrors, gameState.maxErrors, handleKeyPress, onNext]);

    const isGameOver = gameState.currentErrors >= gameState.maxErrors;

    return (
        <>
            <h3 className="text-2xl font-bold mb-4">
                {t('questions.hangman')}
            </h3>

            <div className="text-lg mb-4 text-gray-600">
                {t('questions.hangmanHint')}: {question.word.spanish}
            </div>

            {/* Hangman Display */}
            <div className="flex justify-center items-center gap-8 mb-6">
                {/* Word Display */}
                <div className="flex gap-2 text-3xl font-bold">
                    {gameState.revealedLetters.map((letter, index) => (
                        <span
                            key={index}
                            className="w-8 h-12 border-b-2 border-gray-800 flex items-center justify-center"
                        >
                            {letter}
                        </span>
                    ))}
                </div>

                {/* Hangman Drawing */}
                <div className="shrink-0">
                    <svg width="200" height="200" className="border border-gray-300 rounded">
                        {/* Gallows */}
                        <line x1="20" y1="180" x2="80" y2="180" stroke="black" strokeWidth="2" />
                        <line x1="50" y1="180" x2="50" y2="20" stroke="black" strokeWidth="2" />
                        <line x1="50" y1="20" x2="120" y2="20" stroke="black" strokeWidth="2" />
                        <line x1="120" y1="20" x2="120" y2="40" stroke="black" strokeWidth="2" />

                        {/* Hangman parts based on errors */}
                        {gameState.currentErrors >= 1 && (
                            <circle cx="120" cy="50" r="10" stroke="black" strokeWidth="2" fill="none" />
                        )}
                        {gameState.currentErrors >= 2 && (
                            <line x1="120" y1="60" x2="120" y2="120" stroke="black" strokeWidth="2" />
                        )}
                        {gameState.currentErrors >= 3 && (
                            <>
                                <line x1="120" y1="80" x2="100" y2="100" stroke="black" strokeWidth="2" />
                                <line x1="120" y1="80" x2="140" y2="100" stroke="black" strokeWidth="2" />
                                <line x1="120" y1="120" x2="100" y2="140" stroke="black" strokeWidth="2" />
                                <line x1="120" y1="120" x2="140" y2="140" stroke="black" strokeWidth="2" />
                            </>
                        )}
                    </svg>
                </div>
            </div>

            {/* Game Status */}
            <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                    {t('questions.guessedLetters')}: {gameState.guessedLetters.join(', ') || t('questions.none')}
                </p>
                <p className="text-sm text-gray-600">
                    {t('questions.errors')}: {gameState.currentErrors}/{gameState.maxErrors}
                </p>
            </div>

            {/* Instructions for keyboard input */}
            {pageMode === 'ASKING' && !isGameOver && !gameState.isComplete && (
                <div className="text-center text-sm text-gray-500 mb-4">
                    {t('questions.typeLetters')}
                </div>
            )}

            {/* Game Over or Complete Message */}
            {pageMode === 'ASKING' && (isGameOver || gameState.isComplete) && (
                <div className="text-center">
                    {gameState.isComplete ? (
                        <div className="text-green-600 text-lg font-bold mb-4">
                            {t('questions.hangmanSuccess')} {question.word.romanized}
                        </div>
                    ) : (
                        <div className="text-red-600 text-lg font-bold mb-4">
                            {t('questions.hangmanFailure')} {question.word.romanized}
                        </div>
                    )}
                </div>
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
