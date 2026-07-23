"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { SiteContent, DEFAULT_CONTENT } from "@/astera/lib/content-types";
import { Lang, detectLang, getDefaultContent } from "@/astera/lib/i18n";
import { setAsteraHostTenant } from "@/astera/lib/host";

interface AdminState {
  isAdmin: boolean;
  email: string | null;
  setupRequired: boolean;
}

export type SaveStatus = "saved" | "saving" | "unsaved" | "idle";

interface ContentContextValue {
  content: SiteContent;
  savedContent: SiteContent;
  admin: AdminState;
  canUndo: boolean;
  saveStatus: SaveStatus;
  contentLoaded: boolean;
  currentLang: Lang;
  allLangContent: Record<Lang, SiteContent>;
  updateSection: <K extends keyof SiteContent>(
    section: K,
    data: SiteContent[K] | ((current: SiteContent[K]) => SiteContent[K]),
    lang?: Lang
  ) => void;
  saveSection: (section: keyof SiteContent, lang?: Lang) => Promise<void>;
  saveAll: () => Promise<void>;
  revertSection: (section: keyof SiteContent) => void;
  undo: () => void;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
  // Always returns the latest section data regardless of React render cycle
  getLatestSection: <K extends keyof SiteContent>(section: K, lang?: Lang) => SiteContent[K];
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}

export type InitialContent = Record<Lang, SiteContent>;

const MAX_HISTORY = 30;
const AUTOSAVE_DELAY = 1500;

const LANGS: Lang[] = ["cs", "en", "ua"];

// Initial state with empty navItems — prevents stale DEFAULT_CONTENT nav
// from flashing before the DB value loads.
function makeEmptyNavContent(base: SiteContent): SiteContent {
  return { ...base, header: { ...base.header, navItems: [] } };
}

export type AsteraSaveFn = (
  section: keyof SiteContent,
  content: SiteContent[keyof SiteContent],
  lang: Lang
) => Promise<void>;

export function ContentProvider({
  children,
  initialContent,
  admin: injectedAdmin,
  lang: injectedLang,
  onSave,
  onLogout,
  tenantSlug,
}: {
  children: ReactNode;
  initialContent?: InitialContent;
  // ── Venom injection ──────────────────────────────────────────────────────
  // When these are supplied the provider runs in "hosted" mode: content, admin
  // state and persistence all come from the host (a Venom tenant section) and
  // the astera /api/* endpoints are never contacted. Omitting them preserves
  // the original astera-web self-hosted behaviour 1:1.
  admin?: AdminState;
  lang?: Lang;
  onSave?: AsteraSaveFn;
  onLogout?: () => Promise<void>;
  /** Venom tenant slug — scopes uploads / wheel / contact to this tenant. */
  tenantSlug?: string;
}) {
  const pathname = usePathname();
  const currentLang: Lang = injectedLang ?? detectLang(pathname ?? "/");

  // Record the active tenant so the astera host helpers (upload/wheel/contact)
  // can scope their requests. Runs before paint so first interaction is scoped.
  if (typeof window !== "undefined") setAsteraHostTenant(tenantSlug ?? null);

  const emptyNav = {
    cs: makeEmptyNavContent(DEFAULT_CONTENT),
    en: makeEmptyNavContent(getDefaultContent("en")),
    ua: makeEmptyNavContent(getDefaultContent("ua")),
  };

  const [allLangContent, setAllLangContent] = useState<Record<Lang, SiteContent>>(
    initialContent ?? emptyNav
  );
  const [savedAllLangContent, setSavedAllLangContent] = useState<Record<Lang, SiteContent>>(
    initialContent ?? emptyNav
  );
  const [admin, setAdmin] = useState<AdminState>(injectedAdmin ?? { isAdmin: false, email: null, setupRequired: false });
  const [canUndo, setCanUndo] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [contentLoaded, setContentLoaded] = useState(false);

  const historyRef = useRef<Record<Lang, SiteContent>[]>([]);
  const allLangContentRef = useRef<Record<Lang, SiteContent>>(allLangContent);
  const pendingSectionsRef = useRef<Map<string, Lang>>(new Map()); // "section:lang" → Lang
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef<Promise<void> | null>(null);
  const initialContentRef = useRef(initialContent);
  const injectedAdminRef = useRef(injectedAdmin);
  const hostedRef = useRef<boolean>(Boolean(injectedAdmin || onSave));
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  injectedAdminRef.current = injectedAdmin;

  // Keep injected admin state in sync when the host updates it.
  useEffect(() => {
    if (injectedAdmin) setAdmin(injectedAdmin);
  }, [injectedAdmin]);

  // ── Load on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    // Hosted (Venom) mode: content + admin + persistence are all injected, so
    // the astera self-hosted /api/* endpoints are never contacted.
    if (hostedRef.current) {
      if (injectedAdminRef.current) setAdmin(injectedAdminRef.current);
      setContentLoaded(true);
      return;
    }

    const initial = initialContentRef.current;
    if (initial) {
      // SSR content is served from a cache that may be up to an hour old. That
      // is fine for visitors, but an admin must never edit on top of a stale
      // snapshot — autosave would write those old values back and undo recent
      // uploads. So once we know the user is an admin, reload uncached.
      setContentLoaded(true);
      fetch("/api/admin/me").then(r => r.json()).then(async meData => {
        const isAdmin = meData.admin === true;
        setAdmin({
          isAdmin,
          email: meData.email || null,
          setupRequired: meData.setupRequired === true,
        });
        if (!isAdmin) return;
        // Do not clobber edits the admin already started while this was in flight.
        if (pendingSectionsRef.current.size > 0) return;
        const [cs, en, ua] = await Promise.all(
          LANGS.map(lang =>
            fetch(`/api/content?lang=${lang}`, { cache: "no-store" }).then(r => r.json())
          )
        );
        if (pendingSectionsRef.current.size > 0) return;
        const fresh = { cs, en, ua } as Record<Lang, SiteContent>;
        allLangContentRef.current = fresh;
        setAllLangContent(fresh);
        setSavedAllLangContent(fresh);
        historyRef.current = [];
        setCanUndo(false);
      });
      return;
    }

    Promise.all([
      fetch("/api/content?lang=cs", { cache: "no-store" }).then(r => r.json()),
      fetch("/api/content?lang=en", { cache: "no-store" }).then(r => r.json()),
      fetch("/api/content?lang=ua", { cache: "no-store" }).then(r => r.json()),
      fetch("/api/admin/me").then(r => r.json()),
    ]).then(([cs, en, ua, meData]) => {
      const loaded = { cs, en, ua } as Record<Lang, SiteContent>;
      setAllLangContent(loaded);
      setSavedAllLangContent(loaded);
      allLangContentRef.current = loaded;
      historyRef.current = [];
      setCanUndo(false);
      setSaveStatus("idle");
      setContentLoaded(true);
      setAdmin({
        isAdmin: meData.admin === true,
        email: meData.email || null,
        setupRequired: meData.setupRequired === true,
      });
    });
  }, []);

  // ── Autosave helper ──────────────────────────────────────────────────────
  const flushSave = useCallback(async () => {
    // Only one save drain may run at a time. Without serialization, an older,
    // slower request can finish after a newer one and restore stale images.
    if (saveInFlightRef.current) {
      await saveInFlightRef.current;
      return;
    }

    const run = (async () => {
      let failed = false;
      while (pendingSectionsRef.current.size > 0) {
        const pending = Array.from(pendingSectionsRef.current.entries());
        pendingSectionsRef.current.clear();
        if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
        setSaveStatus("saving");

        const snapshot = allLangContentRef.current;
        const batch = pending.map(([key, lang]) => {
          const section = key.split(":")[0] as keyof SiteContent;
          return { key, lang, section, content: snapshot[lang][section] };
        });

        try {
          const results = await Promise.all(
            batch.map(async item => {
              // Hosted mode: persist through the injected save callback (writes
              // to the Venom tenant section) instead of astera's /api/content.
              if (onSaveRef.current) {
                try {
                  await onSaveRef.current(item.section, item.content, item.lang);
                  return { item, response: { ok: true, status: 200, url: "hosted", text: async () => "" } as unknown as Response };
                } catch (e) {
                  return { item, response: { ok: false, status: 0, url: "hosted", text: async () => String(e) } as unknown as Response };
                }
              }
              const response = await fetch("/api/content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  section: item.section,
                  content: item.content,
                  lang: item.lang,
                }),
              });
              return { item, response };
            })
          );
          const rejected = results.filter(({ response }) => !response.ok);
          if (rejected.length > 0) {
            const details = await Promise.all(
              rejected.map(async ({ response }) =>
                `${response.status} ${response.url}: ${await response.text().catch(() => "")}`
              )
            );
            // Put only failed keys back. A newer local change for the same key
            // already present in the map always wins over this failed snapshot.
            rejected.forEach(({ item }) => {
              if (!pendingSectionsRef.current.has(item.key)) {
                pendingSectionsRef.current.set(item.key, item.lang);
              }
            });
            console.error("[ContentContext] Save failed:", details);
            failed = true;
            break;
          }

          setSavedAllLangContent(previous => {
            const next = { ...previous };
            for (const item of batch) {
              next[item.lang] = {
                ...next[item.lang],
                [item.section]: item.content,
              };
            }
            return next;
          });
        } catch (error) {
          batch.forEach(item => {
            if (!pendingSectionsRef.current.has(item.key)) {
              pendingSectionsRef.current.set(item.key, item.lang);
            }
          });
          console.error("[ContentContext] flushSave error:", error);
          failed = true;
          break;
        }
      }

      if (failed) {
        setSaveStatus("unsaved");
      } else {
        setSaveStatus("saved");
        saveStatusTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
      }
    })();

    saveInFlightRef.current = run;
    try {
      await run;
    } finally {
      saveInFlightRef.current = null;
    }
  }, []);

  useEffect(() => {
    const flushPending = () => {
      if (pendingSectionsRef.current.size > 0) void flushSave();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") flushPending();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", flushPending);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", flushPending);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
    };
  }, [flushSave]);

  // ── updateSection ────────────────────────────────────────────────────────
  const updateSection = useCallback(
    <K extends keyof SiteContent>(
      section: K,
      data: SiteContent[K] | ((current: SiteContent[K]) => SiteContent[K]),
      lang?: Lang
    ) => {
      const targetLang = lang ?? currentLang;
      // Compute next state and update the ref SYNCHRONOUSLY — so any immediate
      // saveSection() call reads the correct new data, not the stale value.
      const prev = allLangContentRef.current;
      const currentSection = prev[targetLang][section];
      const nextSection = typeof data === "function"
        ? (data as (current: SiteContent[K]) => SiteContent[K])(currentSection)
        : data;
      const next = {
        ...prev,
        [targetLang]: { ...prev[targetLang], [section]: nextSection },
      };
      allLangContentRef.current = next;
      historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), prev];
      setAllLangContent(next);
      setCanUndo(true);
      pendingSectionsRef.current.set(`${String(section)}:${targetLang}`, targetLang);
      setSaveStatus("unsaved");
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(flushSave, AUTOSAVE_DELAY);
    },
    [flushSave, currentLang]
  );

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    const history = historyRef.current;
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const current = allLangContentRef.current;
    historyRef.current = history.slice(0, -1);
    allLangContentRef.current = prev;
    setAllLangContent(prev);
    setCanUndo(historyRef.current.length > 0);
    // Enqueue only what this undo actually changed. Marking every section of
    // every language dirty meant a single undo in Czech wrote the in-memory
    // EN and UA snapshots straight back to the DB, overwriting images that had
    // been uploaded in those languages.
    LANGS.forEach(lang =>
      Object.keys(prev[lang]).forEach(sec => {
        const key = sec as keyof SiteContent;
        if (prev[lang][key] !== current[lang][key]) {
          pendingSectionsRef.current.set(`${sec}:${lang}`, lang);
        }
      })
    );
    if (pendingSectionsRef.current.size === 0) return;
    setSaveStatus("unsaved");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(flushSave, AUTOSAVE_DELAY);
  }, [flushSave]);

  // ── Explicit save (single section) ───────────────────────────────────────
  const saveSection = useCallback(async (section: keyof SiteContent, lang?: Lang) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    const targetLang = lang ?? currentLang;
    pendingSectionsRef.current.set(`${String(section)}:${targetLang}`, targetLang);
    await flushSave();
  }, [flushSave, currentLang]);

  // ── Save all pending changes ──────────────────────────────────────────────
  const saveAll = useCallback(async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    // updateSection() already records the exact language + section pairs that
    // changed. Re-enqueueing every section for every language here can write an
    // older SSR snapshot back over unrelated images when switching languages.
    await flushSave();
  }, [flushSave]);

  // ── Revert section ────────────────────────────────────────────────────────
  // Scoped to the language being edited. Reverting a section used to reset and
  // re-save that section in all three languages at once.
  const revertSection = useCallback((section: keyof SiteContent) => {
    const prev = allLangContentRef.current;
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), prev];
    setCanUndo(true);
    const next = {
      ...prev,
      [currentLang]: { ...prev[currentLang], [section]: savedAllLangContent[currentLang][section] },
    };
    pendingSectionsRef.current.set(`${String(section)}:${currentLang}`, currentLang);
    allLangContentRef.current = next;
    setAllLangContent(next);
    setSaveStatus("unsaved");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(flushSave, AUTOSAVE_DELAY);
  }, [flushSave, savedAllLangContent, currentLang]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const refreshAdmin = useCallback(async () => {
    // Hosted mode: admin state is owned by the host; nothing to refresh.
    if (hostedRef.current) {
      if (injectedAdminRef.current) setAdmin(injectedAdminRef.current);
      return;
    }
    const meData = await fetch("/api/admin/me").then(r => r.json());
    setAdmin({
      isAdmin: meData.admin === true,
      email: meData.email || null,
      setupRequired: meData.setupRequired === true,
    });
  }, []);

  const logout = useCallback(async () => {
    if (onLogout) {
      await onLogout();
    } else {
      await fetch("/api/admin/logout", { method: "POST" });
    }
    setAdmin({ isAdmin: false, email: null, setupRequired: false });
    historyRef.current = [];
    setCanUndo(false);
  }, [onLogout]);

  const content = allLangContent[currentLang];
  const savedContent = savedAllLangContent[currentLang];

  // Reads from the mutable ref — always returns the latest data even during async operations
  // where the React state in the caller's closure may be stale (e.g. after an image upload).
  const getLatestSection = useCallback(<K extends keyof SiteContent>(section: K, lang?: Lang): SiteContent[K] => {
    const targetLang = lang ?? currentLang;
    return allLangContentRef.current[targetLang][section];
  }, [currentLang]);

  const value: ContentContextValue = {
    content,
    savedContent,
    admin,
    canUndo,
    saveStatus,
    contentLoaded,
    currentLang,
    allLangContent,
    updateSection,
    saveSection,
    saveAll,
    revertSection,
    undo,
    logout,
    refreshAdmin,
    getLatestSection,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}
