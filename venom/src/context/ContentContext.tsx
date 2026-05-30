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
import { SiteContent, DEFAULT_CONTENT } from "@/lib/content-types";

interface AdminState {
  isAdmin: boolean;
  email: string | null;
  setupRequired: boolean;
}

export type SaveStatus = "saved" | "saving" | "unsaved" | "idle";

export interface HighlightChange {
  path: string;
  snippets: string[];
}

interface ContentContextValue {
  content: SiteContent;
  savedContent: SiteContent;
  admin: AdminState;
  canUndo: boolean;
  canRedo: boolean;
  highlightedPaths: string[];
  highlightedChanges: HighlightChange[];
  saveStatus: SaveStatus;
  contentLoaded: boolean;
  updateSection: <K extends keyof SiteContent>(
    section: K,
    data: SiteContent[K],
    changedField?: string,
    options?: { recordHistory?: boolean }
  ) => void;
  saveSection: (section: keyof SiteContent) => Promise<void>;
  saveAll: () => Promise<void>;
  revertSection: (section: keyof SiteContent) => void;
  undo: () => void;
  redo: () => void;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

type ContentHistoryEntry = {
  content: SiteContent;
  paths: string[];
  changes: HighlightChange[];
};

function contentPath(section: keyof SiteContent, field?: string) {
  return field ? `${String(section)}.${field}` : String(section);
}

function getPathValue(obj: unknown, path?: string): string {
  if (!path || !obj) return "";
  return String(path.split(".").reduce((current: any, key: string) => current?.[key], obj as any) ?? "");
}

function textSnippets(before: string, after: string) {
  const oldWords = before.match(/\S+/g) ?? [];
  const afterWords = after.match(/\S+/g) ?? [];
  const newWords = new Set(afterWords);
  const oldWordSet = new Set(oldWords);
  const removed = oldWords.filter(word => !newWords.has(word));
  const added = afterWords.filter(word => !oldWordSet.has(word));
  return Array.from(new Set([...removed, ...added]))
    .map(word => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(word => word.length > 1)
    .slice(0, 8);
}

function contentChange(section: keyof SiteContent, field: string | undefined, before: SiteContent, afterSection: SiteContent[keyof SiteContent]): HighlightChange {
  const path = contentPath(section, field);
  if (!field) return { path, snippets: [] };
  return {
    path,
    snippets: textSnippets(getPathValue(before[section], field), getPathValue(afterSection, field)),
  };
}

function sameContent(a: SiteContent, b: SiteContent) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}

export function StaticContentProvider({
  content,
  children,
  admin,
  onSaveContent,
  onLogout,
}: {
  content: SiteContent;
  children: ReactNode;
  admin?: AdminState;
  onSaveContent?: (content: SiteContent) => Promise<void>;
  onLogout?: () => Promise<void>;
}) {
  const [currentContent, setCurrentContent] = useState<SiteContent>(content);
  const [savedContent, setSavedContent] = useState<SiteContent>(content);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [highlightedPaths, setHighlightedPaths] = useState<string[]>([]);
  const [highlightedChanges, setHighlightedChanges] = useState<HighlightChange[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const historyRef = useRef<ContentHistoryEntry[]>([]);
  const redoRef = useRef<ContentHistoryEntry[]>([]);
  const contentRef = useRef<SiteContent>(content);
  const pendingSectionsRef = useRef<Set<string>>(new Set());
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  contentRef.current = currentContent;

  useEffect(() => {
    if (sameContent(content, contentRef.current)) {
      setSavedContent(content);
      return;
    }

    const hasLocalHistory =
      historyRef.current.length > 0 ||
      redoRef.current.length > 0 ||
      pendingSectionsRef.current.size > 0 ||
      saveStatus === "saving" ||
      saveStatus === "unsaved";

    if (admin?.isAdmin && hasLocalHistory) {
      return;
    }

    setCurrentContent(content);
    setSavedContent(content);
    contentRef.current = content;
    historyRef.current = [];
    redoRef.current = [];
    setHighlightedPaths([]);
    setHighlightedChanges([]);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    pendingSectionsRef.current.clear();
    setCanUndo(false);
    setCanRedo(false);
    setSaveStatus("idle");
  }, [content, admin?.isAdmin, saveStatus]);

  const flushSave = useCallback(async () => {
    if (pendingSectionsRef.current.size === 0) return;
    pendingSectionsRef.current.clear();
    setSaveStatus("saving");
    try {
      if (onSaveContent) {
        await onSaveContent(contentRef.current);
      }
      setSavedContent({ ...contentRef.current });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("unsaved");
    }
  }, [onSaveContent]);

  const showHighlight = useCallback((paths: string[], changes: HighlightChange[] = []) => {
    if (paths.length === 0) return;
    setHighlightedPaths(paths);
    setHighlightedChanges(changes);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedPaths([]);
      setHighlightedChanges([]);
    }, HIGHLIGHT_DELAY);
  }, []);

  const updateSection = useCallback(
    <K extends keyof SiteContent>(section: K, data: SiteContent[K], changedField?: string, options?: { recordHistory?: boolean }) => {
      setCurrentContent(prev => {
        const next = { ...prev, [section]: data };
        contentRef.current = next;
        if (options?.recordHistory !== false) {
          const change = contentChange(section, changedField, prev, data);
          historyRef.current = [
            ...historyRef.current.slice(-(MAX_HISTORY - 1)),
            { content: prev, paths: [change.path], changes: [change] },
          ];
          redoRef.current = [];
          setCanUndo(true);
          setCanRedo(false);
        } else {
          const path = contentPath(section, changedField);
          const last = historyRef.current[historyRef.current.length - 1];
          if (last?.paths.includes(path)) {
            const updatedChange = contentChange(section, changedField, last.content, data);
            historyRef.current = [
              ...historyRef.current.slice(0, -1),
              { ...last, changes: [updatedChange] },
            ];
          }
        }
        return next;
      });

      pendingSectionsRef.current.add(section as string);
      setSaveStatus("unsaved");
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(flushSave, AUTOSAVE_DELAY);
    },
    [flushSave]
  );

  const undo = useCallback(() => {
    const history = historyRef.current;
    if (history.length === 0) return;
    const entry = history[history.length - 1];
    historyRef.current = history.slice(0, -1);
    redoRef.current = [
      ...redoRef.current.slice(-(MAX_HISTORY - 1)),
      { content: contentRef.current, paths: entry.paths, changes: entry.changes },
    ];
    const prev = entry.content;
    contentRef.current = prev;
    setCurrentContent(prev);
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
    showHighlight(entry.paths, entry.changes);
    Object.keys(prev).forEach(sec => pendingSectionsRef.current.add(sec));
    setSaveStatus("unsaved");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(flushSave, AUTOSAVE_DELAY);
  }, [flushSave, showHighlight]);

  const redo = useCallback(() => {
    const redoHistory = redoRef.current;
    if (redoHistory.length === 0) return;
    const entry = redoHistory[redoHistory.length - 1];
    redoRef.current = redoHistory.slice(0, -1);
    historyRef.current = [
      ...historyRef.current.slice(-(MAX_HISTORY - 1)),
      { content: contentRef.current, paths: entry.paths, changes: entry.changes },
    ];
    const next = entry.content;
    contentRef.current = next;
    setCurrentContent(next);
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
    showHighlight(entry.paths, entry.changes);
    Object.keys(next).forEach(sec => pendingSectionsRef.current.add(sec));
    setSaveStatus("unsaved");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(flushSave, AUTOSAVE_DELAY);
  }, [flushSave, showHighlight]);

  const saveSection = useCallback(async (section: keyof SiteContent) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    pendingSectionsRef.current.add(section as string);
    await flushSave();
  }, [flushSave]);

  const saveAll = useCallback(async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    Object.keys(contentRef.current).forEach(sec => pendingSectionsRef.current.add(sec));
    await flushSave();
  }, [flushSave]);

  const revertSection = useCallback((section: keyof SiteContent) => {
    setCurrentContent(prev => {
      historyRef.current = [
        ...historyRef.current.slice(-(MAX_HISTORY - 1)),
        { content: prev, paths: [contentPath(section)], changes: [{ path: contentPath(section), snippets: [] }] },
      ];
      redoRef.current = [];
      setCanUndo(true);
      setCanRedo(false);
      return { ...prev, [section]: savedContent[section] };
    });
  }, [savedContent]);

  const logout = useCallback(async () => {
    if (onLogout) await onLogout();
  }, [onLogout]);

  const noopAsync = async () => undefined;

  return (
    <ContentContext.Provider
      value={{
        content: currentContent,
        savedContent,
        admin: admin ?? { isAdmin: false, email: null, setupRequired: false },
        canUndo,
        canRedo,
        highlightedPaths,
        highlightedChanges,
        saveStatus,
        contentLoaded: true,
        updateSection,
        saveSection,
        saveAll,
        revertSection,
        undo,
        redo,
        logout,
        refreshAdmin: noopAsync,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

const MAX_HISTORY = 30;
const AUTOSAVE_DELAY = 1500; // ms
const HIGHLIGHT_DELAY = 2400; // ms

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [savedContent, setSavedContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [admin, setAdmin] = useState<AdminState>({ isAdmin: false, email: null, setupRequired: false });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [highlightedPaths, setHighlightedPaths] = useState<string[]>([]);
  const [highlightedChanges, setHighlightedChanges] = useState<HighlightChange[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [contentLoaded, setContentLoaded] = useState(false);

  const historyRef = useRef<ContentHistoryEntry[]>([]);
  const redoRef = useRef<ContentHistoryEntry[]>([]);
  const contentRef = useRef<SiteContent>(DEFAULT_CONTENT); // always up-to-date ref for closures
  const pendingSectionsRef = useRef<Set<string>>(new Set());
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep contentRef in sync
  contentRef.current = content;

  // ── Load on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch("/api/content").then(r => r.json()),
      fetch("/api/admin/me").then(r => r.json()),
    ]).then(([contentData, meData]) => {
      setContent(contentData);
      setSavedContent(contentData);
      contentRef.current = contentData;
      historyRef.current = [];
      redoRef.current = [];
      setHighlightedPaths([]);
      setHighlightedChanges([]);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      setCanUndo(false);
      setCanRedo(false);
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
    const sections = Array.from(pendingSectionsRef.current);
    if (sections.length === 0) return;
    pendingSectionsRef.current.clear();
    setSaveStatus("saving");
    try {
      await Promise.all(
        sections.map(sec =>
          fetch("/api/content", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section: sec, content: contentRef.current[sec as keyof SiteContent] }),
          })
        )
      );
      setSavedContent({ ...contentRef.current });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("unsaved");
    }
  }, []);

  const showHighlight = useCallback((paths: string[], changes: HighlightChange[] = []) => {
    if (paths.length === 0) return;
    setHighlightedPaths(paths);
    setHighlightedChanges(changes);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedPaths([]);
      setHighlightedChanges([]);
    }, HIGHLIGHT_DELAY);
  }, []);

  // ── updateSection — called by all editors ────────────────────────────────
  const updateSection = useCallback(
    <K extends keyof SiteContent>(section: K, data: SiteContent[K], changedField?: string, options?: { recordHistory?: boolean }) => {
      setContent(prev => {
        const next = { ...prev, [section]: data };
        contentRef.current = next;
        if (options?.recordHistory !== false) {
          const change = contentChange(section, changedField, prev, data);
          historyRef.current = [
            ...historyRef.current.slice(-(MAX_HISTORY - 1)),
            { content: prev, paths: [change.path], changes: [change] },
          ];
          redoRef.current = [];
          setCanUndo(true);
          setCanRedo(false);
        } else {
          const path = contentPath(section, changedField);
          const last = historyRef.current[historyRef.current.length - 1];
          if (last?.paths.includes(path)) {
            const updatedChange = contentChange(section, changedField, last.content, data);
            historyRef.current = [
              ...historyRef.current.slice(0, -1),
              { ...last, changes: [updatedChange] },
            ];
          }
        }
        return next;
      });

      // Queue autosave
      pendingSectionsRef.current.add(section as string);
      setSaveStatus("unsaved");
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(flushSave, AUTOSAVE_DELAY);
    },
    [flushSave]
  );

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    const history = historyRef.current;
    if (history.length === 0) return;
    const entry = history[history.length - 1];
    historyRef.current = history.slice(0, -1);
    redoRef.current = [
      ...redoRef.current.slice(-(MAX_HISTORY - 1)),
      { content: contentRef.current, paths: entry.paths, changes: entry.changes },
    ];
    const prev = entry.content;
    contentRef.current = prev;
    setContent(prev);
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
    showHighlight(entry.paths, entry.changes);
    // Queue autosave for reverted state
    Object.keys(prev).forEach(sec => pendingSectionsRef.current.add(sec));
    setSaveStatus("unsaved");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(flushSave, AUTOSAVE_DELAY);
  }, [flushSave, showHighlight]);

  // ── Redo ──────────────────────────────────────────────────────────────────
  const redo = useCallback(() => {
    const redoHistory = redoRef.current;
    if (redoHistory.length === 0) return;
    const entry = redoHistory[redoHistory.length - 1];
    redoRef.current = redoHistory.slice(0, -1);
    historyRef.current = [
      ...historyRef.current.slice(-(MAX_HISTORY - 1)),
      { content: contentRef.current, paths: entry.paths, changes: entry.changes },
    ];
    const next = entry.content;
    contentRef.current = next;
    setContent(next);
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
    showHighlight(entry.paths, entry.changes);
    Object.keys(next).forEach(sec => pendingSectionsRef.current.add(sec));
    setSaveStatus("unsaved");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(flushSave, AUTOSAVE_DELAY);
  }, [flushSave, showHighlight]);

  // ── Explicit save (single section) ───────────────────────────────────────
  const saveSection = useCallback(async (section: keyof SiteContent) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    pendingSectionsRef.current.add(section as string);
    await flushSave();
  }, [flushSave]);

  // ── Save all ──────────────────────────────────────────────────────────────
  const saveAll = useCallback(async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    Object.keys(contentRef.current).forEach(sec => pendingSectionsRef.current.add(sec));
    await flushSave();
  }, [flushSave]);

  // ── Revert section to last saved ─────────────────────────────────────────
  const revertSection = useCallback((section: keyof SiteContent) => {
    setContent(prev => {
      historyRef.current = [
        ...historyRef.current.slice(-(MAX_HISTORY - 1)),
        { content: prev, paths: [contentPath(section)], changes: [{ path: contentPath(section), snippets: [] }] },
      ];
      redoRef.current = [];
      setCanUndo(true);
      setCanRedo(false);
      return { ...prev, [section]: savedContent[section] };
    });
  }, [savedContent]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const refreshAdmin = useCallback(async () => {
    const meData = await fetch("/api/admin/me").then(r => r.json());
    setAdmin({
      isAdmin: meData.admin === true,
      email: meData.email || null,
      setupRequired: meData.setupRequired === true,
    });
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAdmin({ isAdmin: false, email: null, setupRequired: false });
    historyRef.current = [];
    redoRef.current = [];
    setHighlightedPaths([]);
    setHighlightedChanges([]);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const value = {
      content, savedContent, admin, canUndo, canRedo, highlightedPaths, highlightedChanges, saveStatus, contentLoaded,
      updateSection, saveSection, saveAll, revertSection, undo, redo, logout, refreshAdmin,
    };

  return (
    <ContentContext.Provider value={value}>
      {contentLoaded ? children : <div style={{ minHeight: "100vh", background: "#fff" }} />}
    </ContentContext.Provider>
  );
}
