import type { ReactNode } from "react";

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <div lang="en-GB">{children}</div>;
}
