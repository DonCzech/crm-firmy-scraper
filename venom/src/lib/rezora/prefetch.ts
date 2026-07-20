import "server-only";

/**
 * Serverové přednačtení nabídky poskytovatele pro rezervační widget.
 *
 * Widget dřív tahal data až v prohlížeči, po scrollu k sekci — návštěvník tedy
 * chvíli koukal na spinner a vyhledávače v HTML žádné služby neviděly. Tady je
 * načteme už při renderu stránky a předáme rovnou do sekce, takže widget je
 * vyplněný v prvním HTML.
 *
 * Cachuje se ZÁMĚRNĚ jen tahle část: služby, personál a nastavení se mění
 * zřídka. Volné dny a časy se přednačítat NESMÍ — musí zůstat živé, jinak by
 * dva návštěvníci mohli dostat stejný slot a vznikla by dvojitá rezervace.
 */

export interface RezoraPrefetch {
  user: Record<string, unknown>;
  services: Record<string, unknown>[];
  staff: Record<string, unknown>[];
}

/** Jak dlouho se smí nabídka servírovat z cache (v sekundách). */
const TTL = 300;

export async function prefetchRezora(
  apiBaseUrl: string,
  providerSlug: string
): Promise<RezoraPrefetch | null> {
  const base = String(apiBaseUrl || "").replace(/\/$/, "");
  const slug = String(providerSlug || "").trim();
  if (!base || !slug) return null;

  try {
    const res = await fetch(`${base}/api/users/${encodeURIComponent(slug)}`, {
      // Sdílená cache napříč návštěvníky — data jsou veřejná a stejná pro všechny.
      next: { revalidate: TTL, tags: [`rezora:${slug}`] },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as RezoraPrefetch & { error?: string };
    if (!data?.user) return null;

    return {
      user: data.user,
      services: Array.isArray(data.services) ? data.services : [],
      staff: Array.isArray(data.staff) ? data.staff : [],
    };
  } catch {
    // Výpadek rezervačního serveru nesmí shodit celou stránku — widget si data
    // v takovém případě dotáhne v prohlížeči jako dřív.
    return null;
  }
}

/**
 * Doplní přednačtená data do všech rezora-widget sekcí stránky.
 * Vrací nové pole; vstupní sekce se nemění.
 */
export async function withRezoraPrefetch<
  T extends { section_type: string; settings: Record<string, unknown> }
>(sections: T[]): Promise<T[]> {
  const targets = sections.filter((s) => s.section_type === "rezora-widget");
  if (targets.length === 0) return sections;

  // Stejný poskytovatel na více sekcích = jedno síťové volání.
  const cache = new Map<string, Promise<RezoraPrefetch | null>>();
  const keyOf = (s: T) => {
    const c = (s.settings?.content ?? {}) as Record<string, unknown>;
    return `${String(c.apiBaseUrl ?? "")}|${String(c.providerSlug ?? "")}`;
  };

  for (const s of targets) {
    const c = (s.settings?.content ?? {}) as Record<string, unknown>;
    const key = keyOf(s);
    if (!cache.has(key)) {
      cache.set(key, prefetchRezora(String(c.apiBaseUrl ?? ""), String(c.providerSlug ?? "")));
    }
  }

  const resolved = new Map<string, RezoraPrefetch | null>();
  await Promise.all(
    [...cache.entries()].map(async ([k, p]) => {
      resolved.set(k, await p);
    })
  );

  return sections.map((s) => {
    if (s.section_type !== "rezora-widget") return s;
    const data = resolved.get(keyOf(s));
    if (!data) return s;
    return {
      ...s,
      settings: {
        ...s.settings,
        content: { ...(s.settings?.content as object), __prefetch: data },
      },
    };
  });
}
