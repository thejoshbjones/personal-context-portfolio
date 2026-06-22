import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

type Confidence = "high" | "medium" | "low";
type Target =
  | "portfolio"
  | "daily-log"
  | "collection"
  | "root-note"
  | "digital-transformation"
  | "hold";

type RootCategory =
  | "Cyber Security"
  | "Cloud"
  | "Managed IT"
  | "DataCenter"
  | "Integrations"
  | "Finance"
  | "People"
  | "Platform Strategy"
  | "Vendor / Tooling"
  | "Governance"
  | "MCP"
  | "Workflow"
  | "Tools"
  | "Research"
  | "Principles"
  | "Automation"
  | "Local Models"
  | "Uncategorized";

type CapturePayload = {
  source: "krisp" | "manual" | "agent" | "meeting" | "email";
  timestamp?: string;
  title?: string;
  participants?: string[];
  tags?: string[];
  content: string;
  links?: string[];
};

type Classification = {
  target: Target;
  confidence: Confidence;
  reason: string;
  category?: RootCategory;
  section?: string;
  relatedDomains?: string[];
};

type GitHubContentFile = {
  type: "file";
  sha: string;
  content?: string;
  encoding?: string;
  path: string;
  name: string;
};

type GitHubContentDirItem = {
  type: "file" | "dir";
  name: string;
  path: string;
  sha: string;
};

export interface Env {
  API_TOKEN: string;
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH?: string;
  MCP_OBJECT: DurableObjectNamespace;
}

const PORTFOLIO_DIR = "00-Personal-Context-Portfolio";
const EXECUTION_DIR = "01-Execution-Layer";
const DIGITAL_TRANSFORMATION_FILE = "Digital Transformation.md";

const PORTFOLIO_FILES = [
  "identity.md",
  "role-and-responsibilities.md",
  "current-projects.md",
  "team-and-relationships.md",
  "tools-and-systems.md",
  "communication-style.md",
  "goals-and-priorities.md",
  "preferences-and-constraints.md",
  "domain-knowledge.md",
  "decision-log.md",
] as const;

const WORK_KEYWORDS: Record<RootCategory, string[]> = {
  "Cyber Security": ["cyber", "security", "soc", "siem", "edr", "mfa", "phishing"],
  "Cloud": ["cloud", "aws", "azure", "m365", "office 365", "tenant"],
  "Managed IT": ["managed it", "helpdesk", "endpoint", "support", "ticket"],
  "DataCenter": ["datacenter", "data center", "colo", "rack", "server", "storage", "vm"],
  "Integrations": ["integration", "api", "connector", "sync", "webhook"],
  "Finance": ["budget", "finance", "capex", "opex", "pricing", "cost"],
  "People": ["hiring", "people", "manager", "1:1", "direct report", "org"],
  "Platform Strategy": ["platform", "strategy", "roadmap", "architecture"],
  "Vendor / Tooling": ["vendor", "tool", "contract", "quote", "evaluation"],
  "Governance": [],
  "MCP": [],
  "Workflow": [],
  "Tools": [],
  "Research": [],
  "Principles": [],
  "Automation": [],
  "Local Models": [],
  "Uncategorized": [],
};

const AI_KEYWORDS: Record<RootCategory, string[]> = {
  "Cyber Security": [],
  "Cloud": [],
  "Managed IT": [],
  "DataCenter": [],
  "Integrations": [],
  "Finance": [],
  "People": [],
  "Platform Strategy": [],
  "Vendor / Tooling": [],
  "Governance": ["governance", "policy", "guardrail", "privacy", "trust"],
  "MCP": ["mcp", "model context protocol", "remote mcp"],
  "Workflow": ["workflow", "process", "capture", "routing"],
  "Tools": ["plugin", "tool", "wrangler", "obsidian", "krisp"],
  "Research": ["research", "reference", "source"],
  "Principles": ["principle", "operating model", "belief"],
  "Automation": ["automation", "agent", "worker", "pipeline"],
  "Local Models": ["ollama", "local model", "llm", "embedding"],
  "Uncategorized": [],
};

function branch(env: Env) {
  return env.GITHUB_BRANCH || "main";
}

function ghHeaders(env: Env): HeadersInit {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "personalcontextportfolio-worker",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function ghUrl(env: Env, path: string) {
  return `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}${path}`;
}

function toBase64(text: string) {
  return btoa(unescape(encodeURIComponent(text)));
}

function fromBase64(text: string) {
  return decodeURIComponent(escape(atob(text.replace(/\n/g, ""))));
}

async function ghGetJson<T>(env: Env, path: string): Promise<T> {
  const res = await fetch(ghUrl(env, path), { headers: ghHeaders(env) });
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status} ${path}`);
  return (await res.json()) as T;
}

async function ghGetFile(env: Env, repoPath: string): Promise<{ content: string; sha: string }> {
  const data = await ghGetJson<GitHubContentFile>(
    env,
    `/contents/${encodeURIComponent(repoPath).replace(/%2F/g, "/")}?ref=${encodeURIComponent(branch(env))}`,
  );
  if (data.type !== "file") throw new Error(`Not a file: ${repoPath}`);
  return {
    content: fromBase64(data.content || ""),
    sha: data.sha,
  };
}

async function ghGetFileOrNull(env: Env, repoPath: string): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    ghUrl(env, `/contents/${encodeURIComponent(repoPath).replace(/%2F/g, "/")}?ref=${encodeURIComponent(branch(env))}`),
    { headers: ghHeaders(env) },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status} ${repoPath}`);
  const data = (await res.json()) as GitHubContentFile;
  return {
    content: fromBase64(data.content || ""),
    sha: data.sha,
  };
}

async function ghListDir(env: Env, repoPath: string): Promise<GitHubContentDirItem[]> {
  return await ghGetJson<GitHubContentDirItem[]>(
    env,
    `/contents/${encodeURIComponent(repoPath).replace(/%2F/g, "/")}?ref=${encodeURIComponent(branch(env))}`,
  );
}

async function ghPutFile(
  env: Env,
  repoPath: string,
  content: string,
  message: string,
  sha?: string,
) {
  const body: Record<string, string> = {
    message,
    content: toBase64(content),
    branch: branch(env),
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    ghUrl(env, `/contents/${encodeURIComponent(repoPath).replace(/%2F/g, "/")}`),
    {
      method: "PUT",
      headers: {
        ...ghHeaders(env),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} ${repoPath} ${text}`);
  }

  return await res.json();
}

function nowIso() {
  return new Date().toISOString();
}

function monthName(date: Date) {
  return date.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
}

function year(date: Date) {
  return date.getUTCFullYear();
}

function dateOnly(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function inferTimestamp(input?: string) {
  return input || nowIso();
}

function inferMonthFile(iso: string) {
  const d = new Date(iso);
  return `${year(d)}-${monthName(d)}.md`;
}

function inferCollectionFile(iso: string) {
  const d = new Date(iso);
  return `${year(d)}_Collection.md`;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function firstMeaningfulLine(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .find((s) => s.length > 0) || "";
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(text: string) {
  return text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

function summarize(text: string) {
  return text.trim().split(/\n+/).slice(0, 2).join(" ").slice(0, 500);
}

function canonicalRootPath(payload: CapturePayload, category: RootCategory) {
  const candidate = payload.title || firstMeaningfulLine(payload.content) || `${category} Note`;
  return `${titleCase(candidate).replace(/[\/\\:*?"<>|]/g, "").trim()}.md`;
}

function inferCollectionSection(payload: CapturePayload) 