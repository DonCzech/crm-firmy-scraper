"use client";

import { useState, useEffect, useCallback } from "react";

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export async function apiGet<T = any>(url: string): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Chyba" };
    return { data };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function apiPost<T = any>(url: string, body: any): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Chyba" };
    return { data };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function apiPatch<T = any>(url: string, body: any): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Chyba" };
    return { data };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function apiDelete(url: string): Promise<{ error?: string }> {
  try {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || "Chyba" };
    }
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}
