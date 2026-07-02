import { Button } from '@/components/ui/button';
import { useLanguage } from '@/localization/language-context';

export function HeaderLanguageFlags() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-md border border-zinc-700/80 bg-zinc-900/70 px-1 py-1" data-no-localize="true">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('cs')}
        className={language === 'cs' ? 'h-7 min-w-0 px-2 bg-zinc-700 text-white hover:bg-zinc-600' : 'h-7 min-w-0 px-2 text-zinc-300 hover:text-white hover:bg-zinc-800'}
      >
        <span className="text-xs">CZ</span>
        <span className="ms-1" aria-hidden="true">🇨🇿</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('en')}
        className={language === 'en' ? 'h-7 min-w-0 px-2 bg-zinc-700 text-white hover:bg-zinc-600' : 'h-7 min-w-0 px-2 text-zinc-300 hover:text-white hover:bg-zinc-800'}
      >
        <span className="text-xs">EN</span>
        <span className="ms-1" aria-hidden="true">🇬🇧</span>
      </Button>
    </div>
  );
}
