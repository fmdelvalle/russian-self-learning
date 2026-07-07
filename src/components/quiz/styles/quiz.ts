export const quizStyles = {
    button: {
        primary: 'px-6 py-3 rounded-lg font-bold',
        disabled: 'disabled:opacity-50',
        fullWidth: 'w-full',
    },
    card: 'bg-card border border-border rounded-lg p-8 shadow-sm',
    input: {
        text: 'w-full px-4 py-3 rounded-lg border',
    },
    feedback: {
        container: 'mb-4 p-4 rounded-lg',
        correct: 'hsl(var(--secondary))',
        incorrect: 'hsl(var(--destructive) / 0.1)',
    },
    questionType: {
        badge: 'px-3 py-1 rounded text-sm',
        badgeBg: 'hsl(var(--secondary))',
        badgeColor: 'hsl(var(--secondary-foreground))',
    },
    option: {
        container: 'flex items-center space-x-3 p-4 rounded-lg border transition-colors',
        selected: 'ring-2',
        readonly: 'cursor-default opacity-75',
        interactive: 'cursor-pointer',
        number: 'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
    },
} as const;
