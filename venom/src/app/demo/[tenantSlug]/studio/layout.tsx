import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Studio · Webero",
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="studio-root" data-studio-root>
      {children}
    </div>
  );
}
