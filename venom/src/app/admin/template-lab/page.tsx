"use client";

import { useState, useEffect, useCallback } from "react";

interface Template {
  id: number;
  template_slug: string;
  template_name: string;
  industry: string;
  source_url: string;
  status: string;
  preview_desktop: string | null;
  preview_mobile: string | null;
  created_at: string;
  approved_at: string | null;
  published_at: string | null;
}

interface Job {
  id: string;
  url: string;
  industry: string;
  status: string;
  stage: string | null;
  error: string | null;
  log: string[];
  templateSlug?: string;
  template_slug?: string;
  template_name?: string;
  createdAt?: string;
  created_at?: string;
}

interface StatusData {
  state: {
    currentWebsite: string | null;
    currentIndustry: string | null;
    currentStage: string;
    status: string;
    requiresHumanApproval: boolean;
    nextStep: string | null;
  };
  jobStats: {
    total: number;
    analyzing: number;
    readyForReview: number;
    approved: number;
    published: number;
    failed: number;
  };
  templates: Template[];
  reviewQueue: Array<{
    jobId: string;
    templateSlug: string;
    templateName: string;
    industry: string;
    sourceUrl: string;
    status: string;
  }>;
}

const INDUSTRY_LABELS: Record<string, string> = {
  barber: "Barber Shop",
  hairdresser: "Kadeřnictví",
  wellness: "Wellness & Masáže",
  tattoo: "Tetovací Studio",
  fitness: "Fitness & Gym",
  cosmetics: "Kosmetika",
  nails: "Nehtové Studio",
  physiotherapy: "Fyzioterapie",
  restaurant: "Restaurace",
  cafe: "Kavárna",
  realEstate: "Reality",
  autoService: "Autoservis",
  dentist: "Zubař",
  lawyer: "Advokát",
  craftsman: "Řemeslník",
  general: "Obecné",
};

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-gray-700 text-gray-200",
  analyzing: "bg-blue-600 text-white animate-pulse",
  generating: "bg-yellow-600 text-white animate-pulse",
  "ready-for-review": "bg-purple-600 text-white",
  approved: "bg-green-600 text-white",
  published: "bg-emerald-600 text-white",
  failed: "bg-red-600 text-white",
  rejected: "bg-red-800 text-white",
  draft: "bg-gray-600 text-white",
};

const PILOT_WEBSITES = [
  { url: "https://barbershopurban.cz", industry: "barber", label: "Barbershop Urban" },
  { url: "https://barbershop-buddy.cz", industry: "barber", label: "Barbershop Buddy" },
  { url: "https://www.thebarber.cz/home-cs", industry: "barber", label: "The Barber" },
  { url: "https://barberpraha.online", industry: "barber", label: "Barber Praha" },
  { url: "https://jarkacechova.cz", industry: "hairdresser", label: "Jarka Čechová" },
  { url: "https://www.prahamasaze.com", industry: "wellness", label: "Praha Masáže" },
  { url: "https://anandaspa.cz", industry: "wellness", label: "Ananda Spa" },
  { url: "https://www.ambi.cz", industry: "restaurant", label: "Ambi Restaurant" },
  { url: "https://www.zrnozrnko.cz", industry: "cafe", label: "Zrno Zrnko" },
  { url: "https://magicsmile.cz", industry: "dentist", label: "Magic Smile" },
  { url: "https://www.havelpartners.cz", industry: "lawyer", label: "Havel Partners" },
  { url: "https://www.lexxusnorton.cz", industry: "realEstate", label: "Lexxus Norton" },
];

export default function TemplateLabPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzeUrl, setAnalyzeUrl] = useState("");
  const [analyzeIndustry, setAnalyzeIndustry] = useState("barber");
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "templates" | "jobs" | "queue">("overview");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, jobsRes] = await Promise.all([
        fetch("/api/template-lab/status"),
        fetch("/api/template-lab/jobs"),
      ]);
      const statusData = await statusRes.json();
      const jobsData = await jobsRes.json();
      setStatus(statusData);
      setJobs(jobsData.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function startAnalysis(url?: string, industry?: string) {
    const targetUrl = url || analyzeUrl;
    const targetIndustry = industry || analyzeIndustry;
    if (!targetUrl) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/template-lab/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, industry: targetIndustry }),
      });
      const data = await res.json();
      if (data.jobId) {
        setAnalyzeUrl("");
        setActiveTab("jobs");
        setTimeout(fetchData, 1000);
      }
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleApprove(templateSlug: string, action: "approve" | "reject") {
    await fetch("/api/template-lab/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateSlug, action, notes: approveNotes }),
    });
    setApproveNotes("");
    setSelectedTemplate(null);
    fetchData();
  }

  async function handlePublish(templateSlug: string) {
    await fetch("/api/template-lab/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateSlug }),
    });
    fetchData();
  }

  const templates = status?.templates || [];
  const readyForReview = templates.filter((t) => t.status === "ready-for-review");
  const approved = templates.filter((t) => t.status === "approved");
  const published = templates.filter((t) => t.status === "published");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">🧬 Template Intelligence Lab</h1>
            <p className="text-sm text-gray-400">Automatizovaný systém pro tvorbu Venom šablon</p>
          </div>
          <div className="flex items-center gap-3">
            {status?.state.currentWebsite && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-900/40 border border-blue-700 px-3 py-1.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-300">
                  {status.state.currentWebsite}
                </span>
              </div>
            )}
            <a
              href="/admin"
              className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:border-gray-500"
            >
              ← Admin
            </a>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 border-r border-gray-800 bg-gray-900 min-h-screen p-4">
          <nav className="space-y-1">
            {(["overview", "templates", "jobs", "queue"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeTab === tab
                    ? "bg-purple-900/40 border border-purple-700 text-purple-300"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {tab === "overview" && "📊 Přehled"}
                {tab === "templates" && `🎨 Šablony ${templates.length > 0 ? `(${templates.length})` : ""}`}
                {tab === "jobs" && `⚙️ Jobs ${jobs.length > 0 ? `(${jobs.length})` : ""}`}
                {tab === "queue" && "📋 Fronta"}
              </button>
            ))}
          </nav>

          {readyForReview.length > 0 && (
            <div className="mt-6 rounded-lg border border-purple-700 bg-purple-900/20 p-3">
              <p className="text-xs font-semibold text-purple-400">Čeká na review</p>
              <p className="text-2xl font-bold text-purple-300">{readyForReview.length}</p>
            </div>
          )}

          {/* Stats */}
          {status && (
            <div className="mt-4 space-y-2 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Celkem jobs</span>
                <span className="text-white">{status.jobStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Analyzuje</span>
                <span className="text-blue-400">{status.jobStats.analyzing}</span>
              </div>
              <div className="flex justify-between">
                <span>Review</span>
                <span className="text-purple-400">{status.jobStats.readyForReview}</span>
              </div>
              <div className="flex justify-between">
                <span>Schváleno</span>
                <span className="text-green-400">{status.jobStats.approved}</span>
              </div>
              <div className="flex justify-between">
                <span>Publikováno</span>
                <span className="text-emerald-400">{status.jobStats.published}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Načítám...
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <StatCard label="V analýze" value={status?.jobStats.analyzing || 0} color="blue" />
                    <StatCard label="Čeká na review" value={readyForReview.length} color="purple" />
                    <StatCard label="Schváleno" value={approved.length} color="green" />
                    <StatCard label="Publikováno" value={published.length} color="emerald" />
                  </div>

                  {/* Workflow state */}
                  {status?.state.currentWebsite && (
                    <div className="rounded-xl border border-blue-700 bg-blue-900/20 p-4">
                      <h3 className="text-sm font-semibold text-blue-300 mb-2">Aktuálně zpracovává</h3>
                      <p className="text-white font-medium">{status.state.currentWebsite}</p>
                      <p className="text-sm text-gray-400">
                        Průmysl: {INDUSTRY_LABELS[status.state.currentIndustry || ""] || status.state.currentIndustry} • Fáze: {status.state.currentStage}
                      </p>
                      {status.state.requiresHumanApproval && (
                        <p className="mt-2 text-yellow-400 text-sm">⚠️ Čeká na manuální schválení</p>
                      )}
                    </div>
                  )}

                  {/* Quick analyze */}
                  <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">Spustit analýzu</h3>
                    <div className="flex gap-3">
                      <input
                        value={analyzeUrl}
                        onChange={(e) => setAnalyzeUrl(e.target.value)}
                        placeholder="https://example.cz"
                        className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      />
                      <select
                        value={analyzeIndustry}
                        onChange={(e) => setAnalyzeIndustry(e.target.value)}
                        className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                      >
                        {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => startAnalysis()}
                        disabled={analyzing || !analyzeUrl}
                        className="rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-4 py-2 text-sm font-medium transition-colors"
                      >
                        {analyzing ? "Spouštím..." : "Analyzovat"}
                      </button>
                    </div>
                  </div>

                  {/* Pilot websites */}
                  <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">
                      🎯 Pilotní weby — Spustit analýzu
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {PILOT_WEBSITES.map((site) => {
                        const existingJob = jobs.find((j) => j.url === site.url);
                        const existingTemplate = templates.find((t) => t.source_url === site.url);
                        return (
                          <div
                            key={site.url}
                            className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-white">{site.label}</p>
                              <p className="text-xs text-gray-500">
                                {INDUSTRY_LABELS[site.industry]}
                              </p>
                            </div>
                            {existingTemplate ? (
                              <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[existingTemplate.status]}`}>
                                {existingTemplate.status}
                              </span>
                            ) : existingJob ? (
                              <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[existingJob.status]}`}>
                                {existingJob.status}
                              </span>
                            ) : (
                              <button
                                onClick={() => startAnalysis(site.url, site.industry)}
                                disabled={analyzing}
                                className="rounded bg-purple-700 hover:bg-purple-600 px-2 py-1 text-xs transition-colors disabled:opacity-50"
                              >
                                Analyzovat
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === "templates" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Generované šablony</h2>

                  {templates.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center text-gray-500">
                      <p className="text-4xl mb-3">🧬</p>
                      <p className="font-medium">Žádné šablony</p>
                      <p className="text-sm mt-1">Spusť analýzu webů v záložce Přehled</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden"
                        >
                          {/* Preview */}
                          <div className="aspect-video bg-gray-800 flex items-center justify-center">
                            {template.preview_desktop ? (
                              <img
                                src={template.preview_desktop}
                                alt="Desktop preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center text-gray-600">
                                <p className="text-3xl">🖼️</p>
                                <p className="text-xs mt-1">Bez náhledu</p>
                              </div>
                            )}
                          </div>

                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-medium text-white text-sm">{template.template_name}</h3>
                                <p className="text-xs text-gray-500">
                                  {INDUSTRY_LABELS[template.industry]} • {template.template_slug}
                                </p>
                              </div>
                              <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[template.status] || "bg-gray-700"}`}>
                                {template.status}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 mb-3 truncate">{template.source_url}</p>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedTemplate(template)}
                                className="flex-1 rounded bg-gray-700 hover:bg-gray-600 px-2 py-1.5 text-xs transition-colors"
                              >
                                Detail
                              </button>
                              {template.status === "ready-for-review" && (
                                <button
                                  onClick={() => {
                                    setSelectedTemplate(template);
                                  }}
                                  className="flex-1 rounded bg-purple-700 hover:bg-purple-600 px-2 py-1.5 text-xs transition-colors"
                                >
                                  Zkontrolovat
                                </button>
                              )}
                              {template.status === "approved" && (
                                <button
                                  onClick={() => handlePublish(template.template_slug)}
                                  className="flex-1 rounded bg-emerald-700 hover:bg-emerald-600 px-2 py-1.5 text-xs transition-colors"
                                >
                                  🚀 Publikovat
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Jobs Tab */}
              {activeTab === "jobs" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Analytic Jobs</h2>
                  {jobs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center text-gray-500">
                      <p>Žádné jobs. Spusť analýzu v záložce Přehled.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          className="rounded-xl border border-gray-700 bg-gray-900 p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm truncate">{job.url}</p>
                              <p className="text-xs text-gray-500">
                                {INDUSTRY_LABELS[job.industry]} • {job.id}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              {job.stage && (
                                <span className="text-xs text-gray-500">{job.stage}</span>
                              )}
                              <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[job.status] || "bg-gray-700"}`}>
                                {job.status}
                              </span>
                            </div>
                          </div>

                          {job.error && (
                            <p className="text-xs text-red-400 mb-2">❌ {job.error}</p>
                          )}

                          {job.log && job.log.length > 0 && (
                            <div className="rounded bg-gray-800 p-2 max-h-24 overflow-y-auto">
                              {job.log.slice(-5).map((line, i) => (
                                <p key={i} className="text-xs text-gray-400 font-mono">{line}</p>
                              ))}
                            </div>
                          )}

                          {(job.templateSlug || job.template_slug) && (
                            <p className="text-xs text-green-400 mt-2">
                              ✅ Šablona: {job.templateSlug || job.template_slug}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Queue Tab */}
              {activeTab === "queue" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Fronta webů (54 celkem)</h2>
                  <p className="text-sm text-gray-400">
                    Weby jsou zpracovávány jeden po druhém. Po každém webu je nutné manuální schválení.
                  </p>
                  <div className="grid grid-cols-1 gap-2 max-h-[600px] overflow-y-auto pr-2">
                    {/* Group by industry */}
                    {Object.entries(INDUSTRY_LABELS).map(([industry, label]) => {
                      const industryTemplates = templates.filter((t) => t.industry === industry);
                      const industryJobs = jobs.filter((j) => j.industry === industry);
                      if (!industryTemplates.length && !industryJobs.length) {
                        return (
                          <div key={industry} className="rounded-lg border border-gray-800 p-3 text-sm">
                            <span className="text-gray-500 font-medium">{label}</span>
                            <span className="ml-2 text-xs text-gray-600">čeká</span>
                          </div>
                        );
                      }
                      return (
                        <div key={industry} className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                          <p className="text-sm font-medium text-white mb-2">{label}</p>
                          <div className="space-y-1">
                            {industryTemplates.map((t) => (
                              <div key={t.id} className="flex items-center gap-2 text-xs">
                                <span className={`rounded px-1.5 py-0.5 ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                                <span className="text-gray-400 truncate">{t.source_url}</span>
                              </div>
                            ))}
                            {industryJobs.filter(j => !industryTemplates.find(t => t.source_url === j.url)).map((j) => (
                              <div key={j.id} className="flex items-center gap-2 text-xs">
                                <span className={`rounded px-1.5 py-0.5 ${STATUS_COLORS[j.status]}`}>{j.status}</span>
                                <span className="text-gray-400 truncate">{j.url}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedTemplate(null)}>
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-700 bg-gray-900 px-6 py-4 z-10">
              <div>
                <h2 className="font-bold text-white">{selectedTemplate.template_name}</h2>
                <p className="text-sm text-gray-400">{selectedTemplate.template_slug} • {INDUSTRY_LABELS[selectedTemplate.industry]}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex rounded-lg border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-3 py-1.5 text-xs transition-colors ${previewMode === "desktop" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-white"}`}
                  >
                    🖥 Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-3 py-1.5 text-xs transition-colors ${previewMode === "mobile" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-white"}`}
                  >
                    📱 Mobile
                  </button>
                </div>
                <button onClick={() => setSelectedTemplate(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
            </div>

            <div className="p-6">
              {/* Preview */}
              <div className={`mb-6 bg-gray-800 rounded-xl overflow-hidden ${previewMode === "mobile" ? "max-w-sm mx-auto" : ""}`}>
                {(previewMode === "desktop" ? selectedTemplate.preview_desktop : selectedTemplate.preview_mobile) ? (
                  <img
                    src={previewMode === "desktop" ? selectedTemplate.preview_desktop! : selectedTemplate.preview_mobile!}
                    alt={`${previewMode} preview`}
                    className="w-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-600">
                    <div className="text-center">
                      <p className="text-4xl">🖼️</p>
                      <p className="text-sm mt-2">Screenshot nedostupný</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Zdroj</p>
                  <a href={selectedTemplate.source_url} target="_blank" rel="noopener" className="text-blue-400 hover:underline text-xs">
                    {selectedTemplate.source_url}
                  </a>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Status</p>
                  <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[selectedTemplate.status]}`}>
                    {selectedTemplate.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Vytvořeno</p>
                  <p className="text-white text-xs">{new Date(selectedTemplate.created_at).toLocaleString("cs-CZ")}</p>
                </div>
                {selectedTemplate.approved_at && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Schváleno</p>
                    <p className="text-white text-xs">{new Date(selectedTemplate.approved_at).toLocaleString("cs-CZ")}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedTemplate.status === "ready-for-review" && (
                <div className="space-y-3">
                  <textarea
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    placeholder="Poznámky k review (volitelné)..."
                    rows={2}
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedTemplate.template_slug, "approve")}
                      className="flex-1 rounded-lg bg-green-700 hover:bg-green-600 py-2 text-sm font-medium transition-colors"
                    >
                      ✅ Schválit
                    </button>
                    <button
                      onClick={() => handleApprove(selectedTemplate.template_slug, "reject")}
                      className="flex-1 rounded-lg bg-red-800 hover:bg-red-700 py-2 text-sm font-medium transition-colors"
                    >
                      ❌ Zamítnout
                    </button>
                  </div>
                </div>
              )}

              {selectedTemplate.status === "approved" && (
                <button
                  onClick={() => { handlePublish(selectedTemplate.template_slug); setSelectedTemplate(null); }}
                  className="w-full rounded-lg bg-emerald-700 hover:bg-emerald-600 py-3 text-sm font-medium transition-colors"
                >
                  🚀 Publikovat do katalogu šablon
                </button>
              )}

              {selectedTemplate.status === "published" && (
                <div className="text-center text-emerald-400 py-3">
                  ✅ Šablona je publikována ve veřejném katalogu
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "border-blue-700 bg-blue-900/20",
    purple: "border-purple-700 bg-purple-900/20",
    green: "border-green-700 bg-green-900/20",
    emerald: "border-emerald-700 bg-emerald-900/20",
    red: "border-red-700 bg-red-900/20",
  };
  const textColors: Record<string, string> = {
    blue: "text-blue-300",
    purple: "text-purple-300",
    green: "text-green-300",
    emerald: "text-emerald-300",
    red: "text-red-300",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color] || "border-gray-700 bg-gray-900"}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${textColors[color] || "text-white"}`}>{value}</p>
    </div>
  );
}
