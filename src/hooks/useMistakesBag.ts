import { useEffect, useState } from 'react';
import {
    clearMistakes,
    getMistakes,
    subscribeMistakes,
    type MistakeEntry,
} from '../data/mistakesBag';

interface UseMistakesBagReturn {
    mistakes: MistakeEntry[];
    count: number;
    clear: () => void;
}

/**
 * Hook exposing the persistent mistakes bag and keeping components in sync.
 */
export function useMistakesBag(): UseMistakesBagReturn {
    const [mistakes, setMistakes] = useState<MistakeEntry[]>(getMistakes());

    useEffect(() => {
        // Sync in case the bag changed before this subscription was set up
        setMistakes(getMistakes());
        return subscribeMistakes(() => setMistakes(getMistakes()));
    }, []);

    return {
        mistakes,
        count: mistakes.length,
        clear: clearMistakes,
    };
}
