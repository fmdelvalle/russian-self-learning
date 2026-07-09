/**
 * Splits a romanized Russian string into segments, marking the multi-letter
 * sequences that stand for a single Cyrillic sound so the UI can colour them.
 *
 * Matching is greedy longest-first, so order matters: "zhzh" is treated as one
 * unit rather than two "zh", and "shch" wins over "sh"/"ch".
 */

interface Digraph {
    seq: string;
    color: string;
}

// Ordered longest-first so the greedy matcher prefers the longer sequence.
const DIGRAPHS: Digraph[] = [
    { seq: 'zhzh', color: '#1e3a8a' }, // жж / зж — dark blue
    { seq: 'shch', color: '#5b21b6' }, // щ — dark violet
    { seq: 'sh', color: '#15803d' }, // ш — dark green
    { seq: 'zh', color: '#b45309' }, // ж — dark amber
    { seq: 'ch', color: '#9f1239' }, // ч — dark rose
];

export interface RomanizedSegment {
    text: string;
    color?: string;
}

export function segment(text: string): RomanizedSegment[] {
    const lower = text.toLowerCase();
    const segments: RomanizedSegment[] = [];
    let plain = '';

    for (let i = 0; i < text.length;) {
        const match = DIGRAPHS.find(d => lower.startsWith(d.seq, i));
        if (match) {
            if (plain) {
                segments.push({ text: plain });
                plain = '';
            }
            segments.push({ text: text.slice(i, i + match.seq.length), color: match.color });
            i += match.seq.length;
        } else {
            plain += text[i];
            i += 1;
        }
    }
    if (plain) segments.push({ text: plain });
    return segments;
}
