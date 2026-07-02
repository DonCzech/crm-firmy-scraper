"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children, userName, companyName, plan }: {
  children: React.ReactNode;
  userName: string;
  companyName?: string;
  plan: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/35 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} plan={plan} />

      <div className="main-shell">
        <Topbar
          userName={userName}
          companyName={companyName}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
