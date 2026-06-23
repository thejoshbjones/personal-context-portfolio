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
  return (
    text
      .split("\n")
      .map((s) => s.trim())
      .find((s) => s.length > 0) || ""
  );
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

function inferCollectionSection(payload: CapturePayload) {
  const text = `${payload.title || ""}\n${payload.content}`.toLowerCase();
  if (text.includes("1:1 down") || text.includes("direct report")) return "1:1 Down";
  if (text.includes("1:1 up") || text.includes("manager") || text.includes("executive")) return "1:1 Up";
  if (text.includes("integration")) return "Integrations";
  return "Projects";
}

function looksLikeMeeting(text: string, payload: CapturePayload) {
  const signals = ["meeting", "attendees", "participants", "agenda", "decisions", "follow-ups", "notes"];
  return Boolean(payload.participants?.length) || signals.some((s) => text.includes(s));
}

function looksLikeTask(text: string) {
  const verbs = ["follow up", "review", "schedule", "send", "build", "call", "prepare", "update"];
  return verbs.some((v) => text.includes(v));
}

function looksLikeBridge(text: string) {
  const work = ["security", "cloud", "integration", "datacenter", "platform"];
  const ai = ["ai", "mcp", "agent", "workflow", "governance"];
  return work.some((w) => text.includes(w)) && ai.some((a) => text.includes(a));
}

function inferCategory(text: string, map: Record<RootCategory, string[]>) {
  for (const [category, keywords] of Object.entries(map) as [RootCategory, string[]][]) {
    if (keywords.length && keywords.some((k) => text.includes(k))) return category;
  }
  return "Uncategorized";
}

function inferRelatedDomains(text: string) {
  const domains = [
    "Cyber Security",
    "Cloud",
    "Managed IT",
    "DataCenter",
    "Integrations",
    "Finance",
    "People",
    "Platform Strategy",
    "Vendor / Tooling",
    "Governance",
    "MCP",
    "Workflow",
    "Tools",
    "Research",
    "Principles",
    "Automation",
    "Local Models",
  ];
  return domains
    .filter((d) => text.toLowerCase().includes(d.toLowerCase().replace(" / ", " ")))
    .slice(0, 4);
}

function classify(payload: CapturePayload): Classification {
  const text = `${payload.title || ""}\n${payload.content}`.toLowerCase();

  if (looksLikeMeeting(text, payload)) {
    return {
      target: "collection",
      confidence: "high",
      reason: "meeting patterns matched",
      section: inferCollectionSection(payload),
    };
  }

  if (looksLikeTask(text)) {
    return {
      target: "daily-log",
      confidence: "high",
      reason: "task/action patterns matched",
    };
  }

  if (looksLikeBridge(text)) {
    return {
      target: "digital-transformation",
      confidence: "medium",
      reason: "work and AI overlap detected",
    };
  }

  const aiCategory = inferCategory(text, AI_KEYWORDS);
  if (aiCategory !== "Uncategorized") {
    return {
      target: "root-note",
      confidence: "medium",
      reason: "AI durable-note pattern matched",
      category: aiCategory,
      relatedDomains: inferRelatedDomains(text),
    };
  }

  const workCategory = inferCategory(text, WORK_KEYWORDS);
  if (workCategory !== "Uncategorized") {
    return {
      target: "root-note",
      confidence: "medium",
      reason: "work durable-note pattern matched",
      category: workCategory,
      relatedDomains: inferRelatedDomains(text),
    };
  }

  return {
    target: "hold",
    confidence: "low",
    reason: "no dominant routing pattern found",
    category: "Uncategorized",
  };
}

function extractTasks(content: string) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const tasks = lines
    .map((line) => line.replace(/^[-*]\s*/, "").replace(/^\[ \]\s*/, "").trim())
    .filter((line) => /^(follow up|review|schedule|send|build|call|prepare|update)\b/i.test(line));
  return [...new Set(tasks)];
}

function appendDailyTasks(existing: string, iso: string, tasks: string[]) {
  if (!tasks.length) return existing;
  const heading = `## ${dateOnly(iso)}`;
  const taskLines = tasks.map((t) => `- [ ] ${t}`);
  const current = existing || "";

  if (!current.includes(heading)) {
    const prefix = current.trim().length ? `${current.trimEnd()}\n\n` : "";
    return `${prefix}${heading}\n\n${taskLines.join("\n")}\n`;
  }

  const sectionRegex = new RegExp(`(${escapeRegExp(heading)}\\n\\n)([\\s\\S]*?)(?=\\n## |$)`);
  const match = current.match(sectionRegex);
  if (!match) return current;

  const existingSection = match[2];
  const newTasks = taskLines.filter((task) => !existingSection.includes(task));
  if (!newTasks.length) return current;

  const replacement = `${match[1]}${existingSection.trimEnd()}\n${newTasks.join("\n")}\n`;
  return current.replace(sectionRegex, replacement);
}

function buildCollectionBlock(payload: CapturePayload, iso: string) {
  const title = payload.title || payload.participants?.join(", ") || "Meeting Note";
  return [
    `### ${dateOnly(iso)} — ${title}`,
    "",
    "- Context:",
    "- Key points:",
    "- Decisions:",
    "- Follow-ups:",
    "",
    payload.content.trim(),
    "",
  ].join("\n");
}

function appendCollectionBlock(existing: string, section: string, block: string, iso: string) {
  const heading = `## ${section}`;
  const title = `# ${year(new Date(iso))} Collection`;
  const current = existing.trim().length ? existing : `${title}\n\n`;
  if (current.includes(block.trim())) return current;

  if (!current.includes(heading)) {
    return `${current.trimEnd()}\n\n${heading}\n\n${block}`;
  }

  const sectionRegex = new RegExp(`(${escapeRegExp(heading)}\\n\\n)([\\s\\S]*?)(?=\\n## |$)`);
  const match = current.match(sectionRegex);
  if (!match) return `${current.trimEnd()}\n\n${block}`;

  const replacement = `${match[1]}${block}\n${match[2]}`;
  return current.replace(sectionRegex, replacement);
}

function buildRootNote(payload: CapturePayload, category: RootCategory, relatedDomains: string[]) {
  const title = payload.title || titleCase(firstMeaningfulLine(payload.content) || `${category} Note`);
  return [
    `# ${title}`,
    "",
    `category: ${category}`,
    `related-domains: [${relatedDomains.join(", ")}]`,
    "",
    "## Summary",
    "",
    summarize(payload.content),
    "",
    "## Current state",
    "",
    "## Key constraints",
    "",
    "## Decisions / implications",
    "",
    "## Sources / references",
    "",
  ].join("\n");
}

function mergeDigitalTransformation(existing: string, payload: CapturePayload) {
  const current = existing.trim().length
    ? existing
    : "# Digital Transformation\n\n## Active bridges\n";
  const title = payload.title || firstMeaningfulLine(payload.content) || "Bridge Note";
  const block = [
    `### ${title}`,
    "",
    "- Work-side implication:",
    "- System-side implication:",
    "- Decision:",
    "",
    payload.content.trim(),
    "",
  ].join("\n");
  if (current.includes(block.trim())) return current;
  return `${current.trimEnd()}\n\n${block}`;
}

function asText(content: string) {
  return {
    content: [{ type: "text" as const, text: content }],
  };
}

function asJson(obj: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }],
  };
}

export class MyMCP extends McpAgent<Env> {
  server = new McpServer({
    name: "Personal Context Portfolio",
    version: "2.0.0",
  });

  async init() {
    this.server.registerTool(
      "list_portfolio_files",
      {
        description: "List the available Personal Context Portfolio markdown files.",
        inputSchema: {},
      },
      async () => asText(PORTFOLIO_FILES.join("\n")),
    );

    this.server.registerTool(
      "get_portfolio_file",
      {
        description: "Read a Personal Context Portfolio markdown file by filename from GitHub.",
        inputSchema: {
          filename: z.enum(PORTFOLIO_FILES),
        },
      },
      async ({ filename }) => {
        const path = `${PORTFOLIO_DIR}/${filename}`;
        const file = await ghGetFile(this.env, path);
        return asText(file.content);
      },
    );

    this.server.registerTool(
      "list_execution_files",
      {
        description: "List files in the execution layer folder.",
        inputSchema: {},
      },
      async () => {
        const items = await ghListDir(this.env, EXECUTION_DIR);
        return asText(
          items
            .filter((i) => i.type === "file")
            .map((i) => i.name)
            .join("\n"),
        );
      },
    );

    this.server.registerTool(
      "get_file",
      {
        description: "Read any markdown file in the vault by repo-relative path.",
        inputSchema: {
          path: z.string(),
        },
      },
      async ({ path }) => {
        const file = await ghGetFile(this.env, path);
        return asText(file.content);
      },
    );

    this.server.registerTool(
      "route_capture",
      {
        description:
          "Classify and route a captured note into the execution layer, collection file, Digital Transformation, or a flat root durable note.",
        inputSchema: {
          source: z.enum(["krisp", "manual", "agent", "meeting", "email"]),
          timestamp: z.string().optional(),
          title: z.string().optional(),
          participants: z.array(z.string()).optional(),
          tags: z.array(z.string()).optional(),
          content: z.string(),
          links: z.array(z.string()).optional(),
          apply: z.boolean().default(true),
        },
      },
      async ({ apply, ...payload }) => {
        const iso = inferTimestamp(payload.timestamp);
        const classification = classify(payload);

        if (!apply) {
          return asJson({ mode: "preview", classification });
        }

        if (classification.target === "hold") {
          return asJson({ action: "hold", classification });
        }

        if (classification.target === "daily-log") {
          const fileName = inferMonthFile(iso);
          const path = `${EXECUTION_DIR}/${fileName}`;
          const existing = await ghGetFileOrNull(this.env, path);
          const updated = appendDailyTasks(existing?.content || "", iso, extractTasks(payload.content));
          if ((existing?.content || "") === updated) {
            return asJson({ action: "noop", path, classification, reason: "no new tasks" });
          }
          await ghPutFile(
            this.env,
            path,
            updated,
            `brain: append tasks to ${fileName}`,
            existing?.sha,
          );
          return asJson({ action: "updated", path, classification });
        }

        if (classification.target === "collection") {
          const fileName = inferCollectionFile(iso);
          const path = `${EXECUTION_DIR}/${fileName}`;
          const existing = await ghGetFileOrNull(this.env, path);
          const block = buildCollectionBlock(payload, iso);
          const updated = appendCollectionBlock(
            existing?.content || "",
            classification.section || "Projects",
            block,
            iso,
          );
          if ((existing?.content || "") === updated) {
            return asJson({ action: "noop", path, classification, reason: "duplicate meeting block" });
          }
          await ghPutFile(
            this.env,
            path,
            updated,
            `brain: append collection note to ${fileName}`,
            existing?.sha,
          );
          return asJson({ action: "updated", path, classification });
        }

        if (classification.target === "digital-transformation") {
          const existing = await ghGetFileOrNull(this.env, DIGITAL_TRANSFORMATION_FILE);
          const updated = mergeDigitalTransformation(existing?.content || "", payload);
          if ((existing?.content || "") === updated) {
            return asJson({ action: "noop", path: DIGITAL_TRANSFORMATION_FILE, classification });
          }
          await ghPutFile(
            this.env,
            DIGITAL_TRANSFORMATION_FILE,
            updated,
            "brain: update Digital Transformation bridge",
            existing?.sha,
          );
          return asJson({ action: "updated", path: DIGITAL_TRANSFORMATION_FILE, classification });
        }

        if (classification.target === "root-note") {
          const category = classification.category || "Uncategorized";
          const path = canonicalRootPath(payload, category);
          const existing = await ghGetFileOrNull(this.env, path);
          if (existing) {
            return asJson({
              action: "noop",
              path,
              classification,
              reason: "root note already exists; manual merge recommended",
            });
          }
          const content = buildRootNote(payload, category, classification.relatedDomains || []);
          await ghPutFile(
            this.env,
            path,
            content,
            `brain: create root note ${path}`,
          );
          return asJson({ action: "created", path, classification });
        }

        return asJson({ action: "hold", classification });
      },
    );

    this.server.registerTool(
      "append_tasks",
      {
        description: "Append checkbox tasks into the active execution-layer monthly note.",
        inputSchema: {
          timestamp: z.string().optional(),
          content: z.string(),
        },
      },
      async ({ timestamp, content }) => {
        const iso = inferTimestamp(timestamp);
        const fileName = inferMonthFile(iso);
        const path = `${EXECUTION_DIR}/${fileName}`;
        const existing = await ghGetFileOrNull(this.env, path);
        const updated = appendDailyTasks(existing?.content || "", iso, extractTasks(content));
        await ghPutFile(
          this.env,
          path,
          updated,
          `brain: append tasks to ${fileName}`,
          existing?.sha,
        );
        return asJson({ action: "updated", path });
      },
    );

    this.server.registerTool(
      "append_meeting_note",
      {
        description: "Append a meeting note into the yearly collection file.",
        inputSchema: {
          timestamp: z.string().optional(),
          title: z.string().optional(),
          participants: z.array(z.string()).optional(),
          content: z.string(),
          section: z.string().optional(),
        },
      },
      async ({ timestamp, title, participants, content, section }) => {
        const iso = inferTimestamp(timestamp);
        const payload: CapturePayload = {
          source: "meeting",
          timestamp: iso,
          title,
          participants,
          content,
        };
        const fileName = inferCollectionFile(iso);
        const path = `${EXECUTION_DIR}/${fileName}`;
        const existing = await ghGetFileOrNull(this.env, path);
        const block = buildCollectionBlock(payload, iso);
        const updated = appendCollectionBlock(
          existing?.content || "",
          section || inferCollectionSection(payload),
          block,
          iso,
        );
        await ghPutFile(
          this.env,
          path,
          updated,
          `brain: append collection note to ${fileName}`,
          existing?.sha,
        );
        return asJson({ action: "updated", path });
      },
    );
    
    this.server.registerTool(
      "list_directory",
      {
        description: "List files and folders for any repo-relative directory path.",
        inputSchema: {
          path: z.string(),
        },
      },
      async ({ path }) => {
        const items = await ghListDir(this.env, path);
        return asJson(
          items.map((i) => ({
            type: i.type,
            name: i.name,
            path: i.path,
          })),
        );
      },
    );

    this.server.tool(
      "get_social_post",
      "Get a LinkedIn post by date. Use format M-D-YY (example: 6-23-26). If there were multiple posts that day, use instance: 2 for the second.",
      {
        date: z.string().describe("Date in M-D-YY format, e.g. 6-23-26"),
        instance: z.number().optional().describe("Post number if multiple on same day, e.g. 2")
      },
      async ({ date, instance }) => {
        const filename = instance ? `${date}-${instance}.md` : `${date}.md`;
        const response = await fetch(
          `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/02-Social-Posts/${filename}`,
          {
            headers: {
              Authorization: `Bearer ${env.GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3.raw",
              "User-Agent": "personal-context-portfolio-mcp",
            },
          }
        );
        if (!response.ok) {
          return { content: [{ type: "text", text: `No post found for ${filename}` }] };
        }
        const text = await response.text();
        return { content: [{ type: "text", text }] };
      }
    );

  } 
  }

function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "WWW-Authenticate": 'Bearer realm="personal-context-portfolio"',
    },
  });
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url, "https://placeholder.local");

    if (url.pathname === "/mcp") {
      const authHeader = request.headers.get("Authorization");
      const expectedAuth = `Bearer ${env.API_TOKEN}`;

      if (!env.API_TOKEN) {
        return new Response("Missing API_TOKEN secret", { status: 500 });
      }

      if (authHeader !== expectedAuth) {
        return unauthorized();
      }

      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        service: "personal-context-portfolio",
        transport: "mcp",
      });
    }

    return new Response("Not found", { status: 404 });
  },
};