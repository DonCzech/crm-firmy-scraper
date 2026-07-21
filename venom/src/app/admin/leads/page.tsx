"use client";

import { Fragment, useEffect, useState } from "react";

interface Lead {
  id: number;
  project_type: string;
  goal: string;
  inspiration: string | null;
  current_web: string | null;
  budget: string;
  timeline: string | null;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  locale: string;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  new: { label: "Nová", cls: "bg-blue-500/15 text-blue-400" },
  contacted: { label: "Kontaktováno", cls: "bg-amber-500/15 text-amber-400" },
  won: { label: "Vyhráno", cls: "bg-emerald-500/15 text-emerald-400" },
  lost: { label: "Ztraceno", cls: "bg-gray-500/15 text-gray-400" },
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((d) => { setLeads(d.leads ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function setStatus(id: number, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Poptávky „Uděláme to za vás"</h1>
        <span className="text-sm text-gray-400">{leads.length} celkem</span>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {leads.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-gray-500">Zatím žádné poptávky.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Datum</th>
                <th className="px-4 py-3">Kontakt</th>
                <th className="px-4 py-3">Typ</th>
                <th className="px-4 py-3">Rozpočet</th>
                <th className="px-4 py-3">Termín</th>
                <th className="px-4 py-3">Stav</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <Fragment key={l.id}>
                  <tr
                    onClick={() => setOpenId(openId === l.id ? null : l.id)}
                    className="cursor-pointer border-b border-gray-800/60 text-gray-300 transition hover:bg-gray-800/40"
                  >
                    <td className="px-6 py-3 whitespace-nowrap text-gray-400">
                      {new Date(l.created_at).toLocaleDateString("cs-CZ")}{" "}
                      <span className="text-gray-600">{new Date(l.created_at).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{l.name}{l.company ? ` · ${l.company}` : ""}</div>
                      <div className="text-xs text-gray-500">{l.email}{l.phone ? ` · ${l.phone}` : ""}</div>
                    </td>
                    <td className="px-4 py-3">{l.project_type}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{l.budget}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400">{l.timeline ?? "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => void setStatus(l.id, e.target.value)}
                        className={`rounded-lg border-0 px-2 py-1 text-xs font-semibold outline-none ${STATUS_LABELS[l.status]?.cls ?? "bg-gray-500/15 text-gray-400"}`}
                        style={{ backgroundColor: "transparent" }}
                      >
                        {Object.entries(STATUS_LABELS).map(([v, s]) => (
                          <option key={v} value={v} className="bg-gray-900 text-white">{s.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {openId === l.id && (
                    <tr className="border-b border-gray-800/60 bg-gray-950/60">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="md:col-span-2">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Cíl projektu</p>
                            <p className="whitespace-pre-wrap text-gray-300">{l.goal}</p>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Inspirace</p>
                              <p className="text-gray-400">{l.inspiration ?? "—"}</p>
                            </div>
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Stávající web</p>
                              <p className="text-gray-400">{l.current_web ?? "—"}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
