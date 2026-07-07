import { parseArgs } from "node:util";
import { z } from "zod";
import { main } from "./src/index.js";

const {
  values: { username, password, env = "delta" },
} = parseArgs({
  options: {
    env: { type: "string" },
    username: { type: "string" },
    password: { type: "string" },
  },
});

const resolvedUsername = process.env.UMT_USERNAME ?? username;
const resolvedPassword = process.env.UMT_PASSWORD ?? password;

if (!resolvedUsername || !resolvedPassword) {
  console.error(
    "Usage: UMT_USERNAME=<username> UMT_PASSWORD=<password> node index.js [--env beta|delta]\n" +
      "(--username/--password flags are also accepted, but environment variables are recommended so credentials don't appear in the process list)",
  );
  process.exit(1);
}

const envResult = z.enum(["beta", "delta"]).safeParse(env);
if (!envResult.success) {
  console.error(`Invalid --env value: "${env}". Must be "beta" or "delta".`);
  process.exit(1);
}

main({
  auth: { username: resolvedUsername, password: resolvedPassword },
  env,
}).catch((error) => {
  console.error("Fatal error starting MCP server:", error);
  process.exit(1);
});
