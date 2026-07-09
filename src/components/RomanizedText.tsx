import { segment } from '../utils/romanization';

/**
 * Renders a romanized Russian string, colouring the multi-letter sequences that
 * stand for a single Cyrillic sound (e.g. "zhzh", "shch") so they're easier to
 * read. See `segment` for the matching rules.
 */
interface RomanizedTextProps {
    text: string;
    className?: string;
}

export function RomanizedText({ text, className }: RomanizedTextProps) {
    return (
        <span className={className}>
            {segment(text).map((seg, index) =>
                seg.color ? (
                    <span key={index} style={{ color: seg.color }}>{seg.text}</span>
                ) : (
                    <span key={index}>{seg.text}</span>
                )
            )}
        </span>
    );
}
