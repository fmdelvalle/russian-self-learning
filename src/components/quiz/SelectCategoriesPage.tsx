import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES_CONFIG, type ICategoryId } from '../../data/russian-words-full';
import type { Category } from '../../types';
import { CategorySelector } from './CategorySelector';

interface SelectCategoriesPageProps {
    selectedCategories: ICategoryId[];
    onCategoriesChange: (categories: ICategoryId[]) => void;
    onStartQuiz: () => void;
    onShowCategorySelector: () => void;
    showCategorySelector: boolean;
}

export function SelectCategoriesPage({
    selectedCategories,
    onCategoriesChange,
    onStartQuiz,
    onShowCategorySelector,
    showCategorySelector,
}: SelectCategoriesPageProps) {
    const { t } = useTranslation();

    // Define available categories using configuration
    const categories: Category[] = useMemo(() =>
        CATEGORIES_CONFIG.map(cat => ({
            id: cat.id,
            name: t(cat.nameKey),
            description: t(cat.descriptionKey),
        })), [t]
    );

    if (showCategorySelector) {
        return (
            <CategorySelector
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoriesChange={onCategoriesChange}
                onStartQuiz={onStartQuiz}
            />
        );
    }

    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                <h2 className="text-4xl font-bold mb-4">{t('quiz.readyToStart')}</h2>
                <p className="mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {t('quiz.instructions')}
                    <br />
                    {t('quiz.retryInstructions')}
                    <br />
                    {t('quiz.scoringInstructions')}
                </p>
                <button
                    onClick={onShowCategorySelector}
                    className="px-6 py-3 rounded-lg font-bold"
                    style={{
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                    }}
                >
                    {t('quiz.selectCategoriesAndStart')}
                </button>
            </div>
        </div>
    );
}
