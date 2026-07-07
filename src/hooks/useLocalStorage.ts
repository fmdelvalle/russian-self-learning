import { useCallback, useEffect, useState } from 'react';

interface DailyScore {
    date: string; // YYYY-MM-DD format
    score: number;
}

interface UseLocalStorageReturn {
    dailyScore: number;
    addToDailyScore: (points: number) => void;
    resetDailyScore: () => void;
}

// Global state for daily score to ensure all components stay in sync
let globalDailyScore = 0;
const listeners = new Set<() => void>();

// Notify all listeners when score changes
const notifyListeners = () => {
    listeners.forEach(listener => listener());
};

/**
 * Hook for managing daily score tracking in localStorage
 *
 * Features:
 * - Stores daily score with date in YYYY-MM-DD format
 * - Automatically resets if date changes
 * - Persists across browser sessions
 * - Handles missing or invalid data gracefully
 * - Global state ensures all components stay synchronized
 */
export function useLocalStorage(): UseLocalStorageReturn {
    const [dailyScore, setDailyScore] = useState<number>(globalDailyScore);

    // Get today's date in YYYY-MM-DD format
    const getTodayString = useCallback((): string => {
        return new Date().toISOString().split('T')[0];
    }, []);

    // Load daily score from localStorage
    const loadDailyScore = useCallback((): number => {
        try {
            const stored = localStorage.getItem('dailyScore');
            if (!stored) return 0;

            const data: DailyScore = JSON.parse(stored);

            // Check if the stored date is today
            if (data.date === getTodayString()) {
                return data.score;
            }

            // If it's a different date, return 0 (new day)
            return 0;
        } catch (error) {
            console.warn('Failed to load daily score from localStorage:', error);
            return 0;
        }
    }, [getTodayString]);

    // Save daily score to localStorage
    const saveDailyScore = useCallback((score: number): void => {
        try {
            const data: DailyScore = {
                date: getTodayString(),
                score: score
            };
            localStorage.setItem('dailyScore', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save daily score to localStorage:', error);
        }
    }, [getTodayString]);

    // Add points to daily score
    const addToDailyScore = useCallback((points: number): void => {
        const newScore = globalDailyScore + points;
        globalDailyScore = newScore;
        saveDailyScore(newScore);
        setDailyScore(newScore);
        notifyListeners();
    }, [saveDailyScore]);

    // Reset daily score to 0
    const resetDailyScore = useCallback((): void => {
        globalDailyScore = 0;
        saveDailyScore(0);
        setDailyScore(0);
        notifyListeners();
    }, [saveDailyScore]);

    // Initialize daily score on mount
    useEffect(() => {
        const initialScore = loadDailyScore();
        globalDailyScore = initialScore;
        setDailyScore(initialScore);
    }, [loadDailyScore]);

    // Subscribe to global state changes
    useEffect(() => {
        const listener = () => {
            setDailyScore(globalDailyScore);
        };

        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };
    }, []);

    // Check for date change and reset if needed
    useEffect(() => {
        const checkDateChange = (): void => {
            const currentScore = loadDailyScore();
            if (currentScore !== globalDailyScore) {
                globalDailyScore = currentScore;
                setDailyScore(currentScore);
                notifyListeners();
            }
        };

        // Check every minute for date changes
        const interval = setInterval(checkDateChange, 60000);

        return () => clearInterval(interval);
    }, [loadDailyScore]);

    return {
        dailyScore,
        addToDailyScore,
        resetDailyScore
    };
}
