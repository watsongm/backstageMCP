# backstage-plugin-mcp-backend

> Expose your Backstage service catalog, TechDocs, and scaffolder as MCP tools — making every Backstage instance visible and actionable by AI coding agents.

[![npm](https://img.shields.io/npm/v/backstage-plugin-mcp-backend)](https://www.npmjs.com/package/backstage-plugin-mcp-backend)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)

**Compatible with:** Claude Code · Cursor · Gemini CLI · any MCP client

---

## Installation

**1. Install the package**

```bash
yarn add --cwd packages/backend backstage-plugin-mcp-backend
```

**2. Register the plugin** (`packages/backend/src/index.ts`)

```typescript
backend.add(import('backstage-plugin-mcp-backend'));
```

That's it. The plugin starts an MCP endpoint at `POST /api/mcp`.

---

## Connect an AI agent

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "backstage": {
      "url": "https://your-backstage.example.com/api/mcp",
      "headers": {
        "Authorization": "Bearer <your-backstage-token>"
      }
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add backstage --transport http --url https://your-backstage.example.com/api/mcp \
  --header "Authorization: Bearer <your-backstage-token>"
```

### Cursor

In `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "backstage": {
      "url": "https://your-backstage.example.com/api/mcp",
      "headers": {
        "Authorization": "Bearer <your-backstage-token>"
      }
    }
  }
}
```

### Gemini CLI

```bash
gemini mcp add --name backstage --transport http \
  --url https://your-backstage.example.com/api/mcp \
  --header "Authorization: Bearer <your-backstage-token>"
```

---

## Tools

| Tool | Description |
|---|---|
| `search_catalog` | Full-text search across components, APIs, systems, groups, and users |
| `get_entity` | Get full details of an entity by kind/namespace/name |
| `list_entities` | List entities with optional kind and filter expressions |
| `get_system` | Get a system and all its components |
| `list_apis` | List all APIs, optionally filtered by type (openapi, graphql, grpc, asyncapi) |
| `list_teams` | List all Group entities |
| `register_component` | Register a repo by providing its `catalog-info.yaml` URL |
| `list_templates` | List all scaffolder templates, optionally filtered by tag |
| `scaffold_service` | Trigger a template to scaffold a new service, library, or docs site |
| `get_scaffolder_task` | Poll the status and logs of a running scaffolder task |
| `get_techdocs` | Retrieve TechDocs metadata for a catalog entity |
| `check_permission` | Check whether the current token has a given Backstage permission |

---

## How it works

The plugin registers a `POST /api/mcp` endpoint using the [MCP StreamableHTTP transport](https://spec.modelcontextprotocol.io/specification/2025-03-26/basic/transports/#streamable-http). Each client session gets a dedicated `McpServer` instance with all 12 tools registered against it.

**Authentication** is handled by forwarding the caller's Backstage token to each service call — catalog, scaffolder, TechDocs — via `auth.getPluginRequestToken()`. This means your existing Backstage RBAC policy is enforced automatically. A developer token can run templates; a guest token can only read.

**Sessions** are tracked by the `Mcp-Session-Id` response header. Send it back on subsequent requests to continue a session. Idle sessions are closed after 30 minutes (configurable via `mcp.sessionTimeoutMinutes` in `app-config.yaml`).

---

## Configuration

```yaml
# app-config.yaml (optional)
mcp:
  sessionTimeoutMinutes: 30  # default: 30
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All contributions welcome.

---

## License

Apache 2.0 — see [LICENSE](LICENSE).
