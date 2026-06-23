---
title: Agent Entry Point
type: agent-entry
priority: highest
updated: 2026-06-21
---

# Cloudflare Workers

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

## Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Commands

| Command | Purpose |
|---------|---------|
| `npx wrangler dev` | Local development |
| `npx wrangler deploy` | Deploy to Cloudflare |
| `npx wrangler types` | Generate TypeScript types |

Run `wrangler types` after changing bindings in wrangler.jsonc.

## Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

## Best Practices (conditional)

If the application uses Durable Objects or Workflows, refer to the relevant best practices:

- Durable Objects: https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/
- Workflows: https://developers.cloudflare.com/workflows/build/rules-of-workflows/


# Agent Entry Point — Joshua Jones

> READ THIS FIRST before accessing any other file in this vault.
   Then read [[ai-agent-instructions]] before taking any action.

## Who I Am
- Joshua Jones
- Director of Operational Maturity and Alignment, IT Voice
- Based in Waco, TX
- Husband, father, faith practitioner
- Operator, systems thinker, public markets investor

## What This Vault Is
This is a multi-year Bullet Journal archive combined with an operational 
knowledge base for work, investing, faith, and personal life. It spans 
2018 through present (2026) and is the primary record of tasks, decisions, 
projects, collections, and context across all areas of my life.

## How This Vault Is Structured

### Bullet Journal Layer (primary layer)
Each year is self-contained with this structure:
- `YYYY-Index` — master index for the year, start here for any year
- `YYYY-Key` — symbols and notation guide for that year
- `YYYY-Collections` — all collections for the year (prayer, faith, 
   family, tasks, delegated items, notes and thoughts capture, projects that are unique and not based on recurring oversight roles)
- `YYYY-Future_Log` — future-dated items and planning
- `YYYY-Month` — monthly calendar and daily task entries
- `YYYY-Month_Collection` — monthly theme and project captures

Current year index: [[2026-Index]]
Current month: [[2026-June]]
Current collections: [[2026-Collections]]

Previous year indexes:
[[2018–2019]]
[[2020-Index]]
[[2021-Index]]
[[2022-Index]]
[[2023-Index]]
[[2024-Index]]
[[2025-Index]]

### Operational Knowledge Layer
- [[ITVoice]] — operational context, planning notes, vendor/partner 
  notes. These are reference notes, not action items.
- [[AI OS]] — AI research, frameworks, tools, resources being studied

### Faith Layer
- [[2026-Prayer_List]] — active prayer list
- [[2026-God_Thoughts]] — personal reflections for others
- [[2026-Memory_Verses]] — scripture memory
- 2026-Sermons — captured in Logos (external system, not in vault)

### Social Posts Layer
A flat archive of published LinkedIn posts stored in `02-Social-Posts/`.

- One file per post, named `M-D-YY.md` (e.g. `6-23-26.md`)
- Multiple posts on the same day: `M-D-YY-2.md`
- Each file contains: `[[LinkedIn Map]]` backlink, the LinkedIn URL, and the full post text

#### When to use this layer
- When asked about past LinkedIn posts or writing
- When drafting a new post — read recent posts first to match voice and tone
- When looking for content to repurpose or reference
- In Conjunction with the other layers when asking about a perspective on a given situation.

## How Tasks Work
- Tasks are captured via KRISP and flow into the current month's 
  daily entries automatically
- Meeting notes do NOT auto-populate — only tasks
- If meeting notes are needed, I will instruct an agent to append 
  a new section to [[2026-Collections]]
- Completed tasks are marked with `x`
- Open tasks have no prefix
- Carry-forward items reference original page numbers (e.g., `--pg41-6-10`)

## What You Can Do
- Read any file to provide context, answer questions, or summarize
- Search across years for patterns, decisions, or recurring themes
- Append to [[2026-Collections]] when explicitly instructed
- Add tasks to the current month's daily entry when explicitly instructed

## What You Must Ask Me Before Doing
- Deleting or modifying any existing note
- Creating new standalone files
- Moving or reorganizing anything
- Sending, publishing, or sharing any content
- Making any assumption about an open task being complete

## Priority Files for Context
1. [[AGENTS]]— this file
2. [[ai-agent-instructions]] — the "What You Must Ask Me Before Doing" rules
3. [[00-Personal-Context-Portfolio/Personal Context Portfolio|Personal Context Portfolio]] - This is the guide to who I am, what I do, and how to work with me.
4. [[2026-Index]] — current year index
5. [[2026-Collections]] — current year collections
6. [[2026-June]] — current month