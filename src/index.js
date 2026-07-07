import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { UMT_BASE } from "./env.js";
import { createMentionsTool, currentDateAndTimeTool } from "./tools.js";
import { createUMTDAO } from "./umt-dao.js";

export async function main(options) {
  const auth = options.auth;
  const username = auth.username;
  const password = auth.password;
  const env = options.env;

  let dao = createUMTDAO({ auth: { username, password }, env });

  const server = new McpServer({
    name: "delta-mcp-prototype",
    version: "1.0.0",
  });

  [createMentionsTool({ dao }), currentDateAndTimeTool].map(
    ({ name, description, inputSchema, execute }) => {
      server.registerTool(
        name,
        {
          title: name,
          description: description,
          inputSchema: inputSchema,
        },
        execute,
      );
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
