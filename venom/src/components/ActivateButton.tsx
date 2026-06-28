"use client";

import { useState } from "react";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

interface Props {
  templateKey: string;
  templateName: string;
}

export function ActivateButton({ templateKey, templateName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex h-[48px] items-center justify-center gap-1.5 rounded-full bg-[#0a0a0a] px-7 text-[14.5px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition hover:bg-[#1a1a1a] active:scale-[0.98]"
      >
        Aktivovat tuto šablonu
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
      {open && (
        <OnboardingModal
          onClose={() => setOpen(false)}
          initialTemplate={templateKey}
          templateName={templateName}
        />
      )}
    </>
  );
}
