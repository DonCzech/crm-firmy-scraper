import * as fs from "fs";
import * as path from "path";

const SYSTEM_DIR = path.join(process.cwd(), "template-lab", "system");

export interface WorkflowState {
  currentIndustry: string | null;
  currentWebsite: string | null;
  currentStage: string;
  status: string;
  lastCompletedStep: string | null;
  nextStep: string | null;
  generatedFiles: string[];
  startedAt: string | null;
  updatedAt: string;
  requiresHumanApproval: boolean;
  checkpoints: Record<string, CheckpointData>;
  queue: QueueItem[];
  pilotWebsite: string;
}

export interface CheckpointData {
  timestamp: string;
  log: string;
  generatedFiles: string[];
  duration?: number;
  errorCount: number;
  warningCount: number;
}

export interface QueueItem {
  industry: string;
  url: string;
  priority: number;
  status: "pending" | "processing" | "completed" | "failed" | "queued" | "review";
}

function readJson<T>(filename: string, fallback: T): T {
  try {
    const fullPath = path.join(SYSTEM_DIR, filename);
    if (!fs.existsSync(fullPath)) return fallback;
    return JSON.parse(fs.readFileSync(fullPath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(filename: string, data: unknown): void {
  try {
    fs.mkdirSync(SYSTEM_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(SYSTEM_DIR, filename),
      JSON.stringify(data, null, 2)
    );
  } catch (err) {
    console.error(`[workflow] Failed to write ${filename}:`, err);
  }
}

export function getWorkflowState(): WorkflowState {
  return readJson<WorkflowState>("workflow-state.json", {
    currentIndustry: null,
    currentWebsite: null,
    currentStage: "idle",
    status: "waiting",
    lastCompletedStep: null,
    nextStep: "start_pilot",
    generatedFiles: [],
    startedAt: null,
    updatedAt: new Date().toISOString(),
    requiresHumanApproval: false,
    checkpoints: {},
    queue: [],
    pilotWebsite: "https://barbershopurban.cz",
  });
}

export function saveWorkflowState(state: Partial<WorkflowState>): void {
  const current = getWorkflowState();
  const next = { ...current, ...state, updatedAt: new Date().toISOString() };
  writeJson("workflow-state.json", next);
}

export function addCheckpoint(
  name: string,
  data: Omit<CheckpointData, "timestamp">
): void {
  const state = getWorkflowState();
  state.checkpoints[name] = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  state.lastCompletedStep = name;
  writeJson("workflow-state.json", { ...state, updatedAt: new Date().toISOString() });
}

export function logProgress(message: string, level: "info" | "error" | "warn" = "info"): void {
  const logPath = path.join(SYSTEM_DIR, "progress-log.md");
  const timestamp = new Date().toISOString();
  const prefix = { info: "###", error: "### ❌", warn: "### ⚠️" }[level];
  const entry = `\n${prefix} [${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(logPath, entry);
  } catch {}
}

export interface Job {
  id: string;
  url: string;
  industry: string;
  status: "queued" | "analyzing" | "generating" | "ready-for-review" | "approved" | "published" | "failed";
  stage: string | null;
  error: string | null;
  log: string[];
  templateSlug: string | null;
  templateId: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function getJobs(): Job[] {
  return readJson<Job[]>("jobs.json", []);
}

export function getJob(id: string): Job | null {
  const jobs = getJobs();
  return jobs.find((j) => j.id === id) ?? null;
}

export function createJob(url: string, industry: string): Job {
  const jobs = getJobs();
  const job: Job = {
    id: `job-${Date.now()}`,
    url,
    industry,
    status: "queued",
    stage: null,
    error: null,
    log: [`[${new Date().toISOString()}] Job created`],
    templateSlug: null,
    templateId: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  jobs.unshift(job);
  writeJson("jobs.json", jobs);
  logProgress(`Job created: ${url} (${industry})`);
  return job;
}

export function updateJob(id: string, updates: Partial<Job>): void {
  const jobs = getJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return;
  jobs[idx] = { ...jobs[idx], ...updates, updatedAt: new Date().toISOString() };
  writeJson("jobs.json", jobs);
}

export function appendJobLog(id: string, message: string): void {
  const jobs = getJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return;
  jobs[idx].log.push(`[${new Date().toISOString()}] ${message}`);
  jobs[idx].updatedAt = new Date().toISOString();
  writeJson("jobs.json", jobs);
}

export interface ReviewItem {
  jobId: string;
  templateSlug: string;
  templateName: string;
  industry: string;
  sourceUrl: string;
  addedAt: string;
  status: "pending" | "approved" | "rejected";
  notes: string;
  screenshotDesktop?: string;
  screenshotMobile?: string;
}

export function addToReviewQueue(item: Omit<ReviewItem, "addedAt" | "status" | "notes">): void {
  const queue = readJson<ReviewItem[]>("review-queue.json", []);
  queue.push({ ...item, addedAt: new Date().toISOString(), status: "pending", notes: "" });
  writeJson("review-queue.json", queue);
  logProgress(`Added to review queue: ${item.templateSlug}`);
}

export function getReviewQueue(): ReviewItem[] {
  return readJson<ReviewItem[]>("review-queue.json", []);
}

export function updateReviewItem(
  templateSlug: string,
  updates: Partial<ReviewItem>
): void {
  const queue = getReviewQueue();
  const idx = queue.findIndex((i) => i.templateSlug === templateSlug);
  if (idx === -1) return;
  queue[idx] = { ...queue[idx], ...updates };
  writeJson("review-queue.json", queue);
}
