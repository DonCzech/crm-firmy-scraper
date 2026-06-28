"use client";

import React from "react";
import clsx from "clsx";

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
        checked ? "bg-blue-600" : "bg-[#3f3f46]"
      )}
    >
      <span
        className={clsx(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function FormRow({
  label,
  help,
  children,
}: {
  label: string;
  help?: { title: string; text: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-8 py-5 border-b border-white/[0.06] last:border-0">
      <div className="w-48 shrink-0">
        <label className="text-[13px] font-medium text-[#e4e4e7]">{label}</label>
      </div>
      <div className="flex-1">{children}</div>
      {help && (
        <div className="w-64 shrink-0 text-[12px] text-[#71717a]">
          <p className="font-semibold text-[#a1a1aa] mb-1">{help.title}</p>
          <p>{help.text}</p>
        </div>
      )}
    </div>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={!onChange}
      className="w-full rounded-lg border border-white/[0.1] bg-[#1a1a1d] px-3 py-2 text-[13px] text-white placeholder-[#52525b] focus:border-blue-500 focus:outline-none disabled:opacity-60"
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-white/[0.1] bg-[#1a1a1d] px-3 py-2 text-[13px] text-white placeholder-[#52525b] focus:border-blue-500 focus:outline-none resize-none"
    />
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-[11px] font-bold tracking-[0.1em] text-[#52525b] uppercase mb-0 pt-6 pb-2">
      {title}
    </h2>
  );
}

export function SaveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded-lg bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
    >
      {loading ? "Ukládám…" : "Uložit změny"}
    </button>
  );
}

export function StatusMessage({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle" || status === "saving") return null;
  return (
    <span
      className={clsx(
        "text-[12px] font-medium",
        status === "saved" ? "text-green-400" : "text-red-400"
      )}
    >
      {status === "saved" ? "Uloženo" : "Chyba při ukládání"}
    </span>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111113] overflow-hidden">
      {children}
    </div>
  );
}

export function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="mb-6 opacity-30">
        <rect x="10" y="10" width="100" height="12" rx="4" fill="#3f3f46" />
        <rect x="10" y="28" width="80" height="8" rx="3" fill="#27272a" />
        <rect x="10" y="42" width="90" height="8" rx="3" fill="#27272a" />
        <rect x="10" y="56" width="70" height="8" rx="3" fill="#27272a" />
        <circle cx="100" cy="62" r="16" fill="#2563eb" />
        <path d="M94 62h12M100 56v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <p className="text-[14px] text-[#71717a] mb-6">
        Zdá se, že je zde prázdno.
        <br />
        Začněte vytvořením prvního záznamu.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onNew}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8]"
        >
          Nový záznam
        </button>
        <button
          type="button"
          className="rounded-lg border border-white/[0.1] bg-[#1a1a1d] px-4 py-2 text-[13px] text-[#a1a1aa] hover:bg-[#222226]"
        >
          Import
        </button>
      </div>
    </div>
  );
}
