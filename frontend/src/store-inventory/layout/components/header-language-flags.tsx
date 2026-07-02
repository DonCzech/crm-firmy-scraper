import { Button } from '@/components/ui/button';
import { useLanguage } from '@/localization/language-context';

export function HeaderLanguageFlags() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1 py-1"
      data-no-localize="true"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('cs')}
        className={
          language === 'cs'
            ? 'h-7 min-w-0 px-2 bg-primary/15 text-foreground hover:bg-primary/20'
            : 'h-7 min-w-0 px-2 text-muted-foreground hover:text-foreground hover:bg-muted'
        }
      >
        <span className="text-xs">CZ</span>
        <span className="ms-1" aria-hidden="true">
          🇨🇿
        </span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('en')}
        className={
          language === 'en'
            ? 'h-7 min-w-0 px-2 bg-primary/15 text-foreground hover:bg-primary/20'
            : 'h-7 min-w-0 px-2 text-muted-foreground hover:text-foreground hover:bg-muted'
        }
      >
        <span className="text-xs">EN</span>
        <span className="ms-1" aria-hidden="true">
          🇬🇧
        </span>
      </Button>
    </div>
  );
}
