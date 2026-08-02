import { mkdirSync, writeFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const workerSource = `
async function withAbsoluteMetadata(response, request) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;
  const origin = new URL(request.url).origin;
  const html = (await response.text()).replaceAll("__SITE_ORIGIN__", origin);
  return new Response(html, { status: response.status, headers: response.headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);

    if (response.status === 404 && request.method === "GET" && !url.pathname.split("/").pop().includes(".")) {
      const fallback = new Request(new URL("/index.html", request.url), request);
      response = await env.ASSETS.fetch(fallback);
    }

    return withAbsoluteMetadata(response, request);
  },
};
`;

export default defineConfig({
  base: "/portfolio/",
  plugins: [
    react(),
    {
      name: "sites-worker-output",
      closeBundle() {
        mkdirSync("dist/server", { recursive: true });
        writeFileSync("dist/server/index.js", workerSource.trimStart());
      },
    },
  ],
  build: { outDir: "dist/client", emptyOutDir: true },
});
