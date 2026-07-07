# delta-mcp-prototype

An MCP (Model Context Protocol) server that wraps the [UMT](https://ubermetrics-technologies.com) media monitoring API, exposing media mention search as a tool for MCP-compatible clients (e.g. Claude Desktop, Claude Code).

## Requirements

- Node.js 22 (see `.nvmrc`)
- A UMT account (username/password)

## Installation

```bash
npm install
```

## Usage

Run the server with your UMT credentials passed as environment variables:

```bash
UMT_USERNAME=<username> UMT_PASSWORD=<password> node index.js [--env delta|beta]
```

- `UMT_USERNAME` / `UMT_PASSWORD` — UMT account credentials (required). Environment variables are recommended over CLI flags since flags are visible to other processes/users via the process list; `--username`/`--password` are still accepted as a fallback for quick local testing.
- `--env` — API environment, `delta` (default) or `beta`

The server communicates over stdio, so it's meant to be launched by an MCP client rather than run standalone.

### Connecting to an MCP client

Example configuration (e.g. Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "delta-mcp-prototype": {
      "command": "npx",
      "args": ["delta-mcp-prototype", "--env", "beta"],
      "env": {
        "UMT_USERNAME": "<username>",
        "UMT_PASSWORD": "<password>"
      }
    }
  }
}
```

## Tools

- **`fetch_mentions`** — Fetch media mentions with filters for search id, phrase, date range, language, country, media segment, sentiment, and tags. Returns a paginated list of mentions (title, url, media segment, published date, sentiment, virality, link counts).
- **`current_date_and_time`** — Returns the current date, time, and timezone; useful for resolving relative date ranges.

## Build

Bundle the server into a single file with esbuild:

```bash
npm run build
```

Output is written to `dist/index.js`.

## Project structure

```
index.js         CLI entry point — parses args, starts the server
src/index.js     MCP server setup and tool registration
src/tools.js     Tool definitions (fetch_mentions, current_date_and_time)
src/umt-dao.js   UMT API client (auth + mentions endpoint)
src/env.js       Environment/base URL constants
src/utils.js     Small helpers (object path access, TOON encoding, try/catch)
```
