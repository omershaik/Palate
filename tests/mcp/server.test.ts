import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { loadCorpus } from "../../src/corpus/load-corpus.js";
import { createPalateServer } from "../../src/mcp/server.js";

describe("MCP protocol integration", () => {
  const corpus = loadCorpus({ specRoot: resolve(__dirname, "../../spec") });
  const server = createPalateServer({ corpus });
  const client = new Client({ name: "palate-integration-test", version: "1.0.0" });

  beforeAll(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  it("negotiates and exposes the five implemented tools", async () => {
    const result = await client.listTools();
    expect(result.tools.map(tool => tool.name).sort()).toEqual([
      "get_brand_fingerprint", "list_canonical", "route", "route_multi", "validate",
    ]);
  });

  it("returns the real corpus through a protocol call", async () => {
    const result = await client.callTool({ name: "list_canonical", arguments: {} });
    expect(result.isError).not.toBe(true);
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0]?.type).toBe("text");
    const payload = JSON.parse(content[0]!.text);
    expect(payload.count).toBe(15);
    expect(payload.canonicals).toHaveLength(15);
    expect(payload.canonicals[0].id).toBe("CANONICAL-1");
  });

  it("routes a brief and returns a design card without network model calls", async () => {
    const result = await client.callTool({
      name: "route",
      arguments: { brief: "A luxury hotel like Aman with quiet luxury and editorial photography" },
    });
    expect(result.isError).not.toBe(true);
    const content = result.content as Array<{ type: string; text: string }>;
    const payload = JSON.parse(content[0]!.text);
    expect(payload.card).toBeDefined();
    expect(payload.canonical_match).toBe("Luxury Hospitality");
    expect(Array.isArray(payload.open_warnings)).toBe(true);
  });

  it("returns a diagnostic for an empty brief", async () => {
    const result = await client.callTool({ name: "route", arguments: { brief: " " } });
    expect(result.isError).toBe(true);
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0]!.text).toContain("Missing or empty");
  });
});
