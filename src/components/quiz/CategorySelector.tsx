import { useTranslation } from 'react-i18next';
import type { ICategoryId } from '../../data/russian-words-full';
import type { Category } from '../../types';

interface CategorySelectorProps {
    categories: Category[];
    selectedCategories: ICategoryId[];
    onCategoriesChange: (categories: ICategoryId[]) => void;
    onStartQuiz: () => void;
}

export function CategorySelector({
    categories,
    selectedCategories,
    onCategoriesChange,
    onStartQuiz
}: CategorySelectorProps) {
    const { t } = useTranslation();
    const handleCategoryToggle = (categoryId: ICategoryId) => {
        if (selectedCategories.includes(categoryId)) {
            onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
        } else {
            onCategoriesChange([...selectedCategories, categoryId]);
        }
    };

    const handleStartQuiz = () => {
        onStartQuiz();
    };

    return (
        <div className="max-w-6xl mx-auto text-center">
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                <h2 className="text-4xl font-bold mb-4">{t('categories.title')}</h2>
                <p className="mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {t('categories.instructions')}
                    <br />
                    {t('categories.allCategories')}
                </p>

                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-left">
                        {categories.map((category) => (
                            <label
                                key={category.id}
                                className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                                style={{ borderColor: 'hsl(var(--border))' }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.id as ICategoryId)}
                                    onChange={() => handleCategoryToggle(category.id as ICategoryId)}
                                    className="w-4 h-4"
                                    style={{ accentColor: 'hsl(var(--primary))' }}
                                />
                                <div>
                                    <div className="font-medium">{category.name}</div>
                                    {category.description && (
                                        <div className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                            {category.description}
                                        </div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {t('categories.selected')} {selectedCategories.length === 0 ? t('categories.allCategoriesSelected') : t('categories.categoriesSelected', { count: selectedCategories.length })}
                    </p>
                </div>

                <button
                    onClick={handleStartQuiz}
                    className="px-6 py-3 rounded-lg font-bold"
                    style={{
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                    }}
                >
                    {t('categories.startQuiz')}
                </button>
            </div>
        </div>
    );
}
