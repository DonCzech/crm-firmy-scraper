/** Modul „Google recenze“ — důvěryhodnostní badge s hodnocením obchodu.
 * Hodnoty se nastavují v adminu (Nastavení obchodu → Google recenze). */

export interface GoogleReviewsConfig {
  rating?: number;
  count?: number;
  url?: string;
}

export function GoogleReviewsBadge({ rating = 4.9, count = 127, url }: GoogleReviewsConfig) {
  const safeRating = Math.min(5, Math.max(1, rating));
  const fullStars = Math.round(safeRating);
  const body = (
    <div className="inline-flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 shadow-sm">
      <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.2 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.2 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35.4 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z" />
      </svg>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-extrabold tabular-nums text-neutral-950">
            {safeRating.toLocaleString("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
          <span className="flex" aria-label={`Hodnocení ${safeRating.toLocaleString("cs-CZ")} z 5`}>
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= fullStars ? "#f59e0b" : "#e5e7eb"}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8z" /></svg>
            ))}
          </span>
        </div>
        <p className="text-[11.5px] text-neutral-500">{count.toLocaleString("cs-CZ")} recenzí na Google</p>
      </div>
    </div>
  );
  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="transition hover:opacity-80" title="Zobrazit recenze na Google">
        {body}
      </a>
    );
  }
  return body;
}
