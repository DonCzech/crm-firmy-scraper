"use client";

import { useEffect, useState } from "react";

interface TrialData {
  days_remaining: number | null;
  sub_status: string | null;
  slug: string;
}

export function TrialBanner({ tenantSlug }: { tenantSlug: string }) {
  const [data, setData] = useState<TrialData | null>(null);

  useEffect(() => {
    fetch(`/api/demo/${tenantSlug}/subscription`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {});
  }, [tenantSlug]);

  if (!data) return null;
  if (data.sub_status === "active") return null;

  const days = data.days_remaining ?? 0;
  const expired = days <= 0;
  const urgent = days <= 7 && days > 0;

  return (
    <div className={`w-full px-4 py-2.5 flex items-center justify-between text-sm ${
      expired ? "bg-red-600 text-white" : urgent ? "bg-orange-500 text-white" : "bg-indigo-600 text-white"
    }`}>
      <span>
        {expired
          ? "Zkušební doba vypršela. Aktivujte předplatné pro zachování přístupu."
          : `Zkušební doba: zbývá ${days} ${days === 1 ? "den" : days < 5 ? "dny" : "dní"}.`}
      </span>
      <a
        href={`/demo/${tenantSlug}/admin?tab=billing`}
        className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-white transition-colors whitespace-nowrap"
      >
        Aktivovat (499 Kč/měs.)
      </a>
    </div>
  );
}
