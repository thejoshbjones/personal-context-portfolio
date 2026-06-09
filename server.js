import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const portfolioDir = path.join(__dirname, "portfolio");

const server = new Server(
  {
    name: "personal-context-portfolio",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
    },
  }
);

async function getMarkdownFiles() {
  const entries = await fs.readdir(portfolioDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function toResourceUri(filename) {
  return `portfolio://${filename}`;
}

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const files = await getMarkdownFiles();

  return {
    resources: files.map((filename) => ({
      uri: toResourceUri(filename),
      name: filename.replace(/\.md$/i, ""),
      description: `Personal context portfolio file: ${filename}`,
      mimeType: "text/markdown",
    })),
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (!uri.startsWith("portfolio://")) {
    throw new Error(`Unsupported resource URI: ${uri}`);
  }

  const filename = decodeURIComponent(uri.replace("portfolio://", ""));
  const safePath = path.resolve(portfolioDir, filename);

  if (!safePath.startsWith(path.resolve(portfolioDir))) {
    throw new Error("Invalid resource path");
  }

  const content = await fs.readFile(safePath, "utf8");

  return {
    contents: [
      {
        uri,
        mimeType: "text/markdown",
        text: content,
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
