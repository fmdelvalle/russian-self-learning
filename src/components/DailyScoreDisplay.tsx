import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface DailyScoreDisplayProps {
    className?: string;
}

export function DailyScoreDisplay({ className = '' }: DailyScoreDisplayProps) {
    const { t } = useTranslation();
    const { dailyScore } = useLocalStorage();

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {t('dailyScore.today')}:
            </span>
            <span
                className="text-lg font-bold px-3 py-1 rounded"
                style={{
                    backgroundColor: dailyScore >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                    color: dailyScore >= 0 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--destructive-foreground))',
                }}
            >
                {dailyScore >= 0 ? '+' : ''}{dailyScore}
            </span>
        </div>
    );
}
