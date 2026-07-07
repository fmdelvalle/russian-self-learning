/**
 * Persistent "mistakes bag": word IDs the user has ever answered incorrectly.
 *
 * Behaviour (by design):
 * - A wrong answer adds the word to the bag (incrementing its failure count).
 * - Words never leave the bag automatically — within a quiz a failed question
 *   is re-asked until answered right, so "getting it right" isn't a reason to
 *   drop it. The bag only shrinks when the user empties it.
 *
 * Uses module-level state + listeners so every component stays in sync,
 * mirroring the daily-score localStorage hook.
 */

const STORAGE_KEY = 'mistakesBag';

export interface MistakeEntry {
    id: number; // Word id
    fails: number; // How many times it has been failed
    lastFailed: string; // YYYY-MM-DD of the most recent failure
}

let bag: MistakeEntry[] = load();
const listeners = new Set<() => void>();

function today(): string {
    return new Date().toISOString().split('T')[0];
}

function load(): MistakeEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (e): e is MistakeEntry => e && typeof e.id === 'number'
        );
    } catch (error) {
        console.warn('Failed to load mistakes bag from localStorage:', error);
        return [];
    }
}

function persist(): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bag));
    } catch (error) {
        console.warn('Failed to save mistakes bag to localStorage:', error);
    }
}

function notify(): void {
    listeners.forEach(listener => listener());
}

/** Current bag contents (stable reference until the bag changes). */
export function getMistakes(): MistakeEntry[] {
    return bag;
}

export function getMistakeIds(): number[] {
    return bag.map(entry => entry.id);
}

/** Record a failed word (adds it or increments its failure count). */
export function addMistake(id: number): void {
    const existing = bag.find(entry => entry.id === id);
    if (existing) {
        bag = bag.map(entry =>
            entry.id === id
                ? { ...entry, fails: entry.fails + 1, lastFailed: today() }
                : entry
        );
    } else {
        bag = [...bag, { id, fails: 1, lastFailed: today() }];
    }
    persist();
    notify();
}

/** Empty the whole bag. */
export function clearMistakes(): void {
    bag = [];
    persist();
    notify();
}

/** Subscribe to bag changes; returns an unsubscribe function. */
export function subscribeMistakes(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
