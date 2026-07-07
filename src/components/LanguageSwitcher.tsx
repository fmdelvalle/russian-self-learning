import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {t('language.switchTo')}:
      </span>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          i18n.language === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
        style={{
          backgroundColor: i18n.language === 'en' ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
          color: i18n.language === 'en' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
        }}
      >
        {t('language.english')}
      </button>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          i18n.language === 'es'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
        style={{
          backgroundColor: i18n.language === 'es' ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
          color: i18n.language === 'es' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
        }}
      >
        {t('language.spanish')}
      </button>
    </div>
  );
}
