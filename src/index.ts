import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

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
];

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "Personal Context Portfolio",
    version: "1.0.0",
  });

  async init() {
    this.server.registerTool(
      "list_portfolio_files",
      {
        description: "List the available Personal Context Portfolio markdown files.",
        inputSchema: {},
      },
      async () => {
        return {
          content: [
            {
              type: "text",
              text: PORTFOLIO_FILES.join("\n"),
            },
          ],
        };
      },
    );

    this.server.registerTool(
      "get_portfolio_file",
      {
        description: "Read a Personal Context Portfolio markdown file by filename.",
        inputSchema: {
          filename: z.enum([
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
          ]),
        },
      },
      async ({ filename }, env) => {
        const assetUrl = new URL(`/${filename}`, "https://assets.local");
        const assetRequest = new Request(assetUrl.toString());
        const response = await env.ASSETS.fetch(assetRequest);

        if (!response.ok) {
          return {
            content: [
              {
                type: "text",
                text: `File not found: ${filename}`,
              },
            ],
          };
        }

        const text = await response.text();

        return {
          content: [
            {
              type: "text",
              text,
            },
          ],
        };
      },
    );
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/mcp") {
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
