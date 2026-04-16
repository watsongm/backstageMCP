# backstage-plugin-mcp-backend

> Give AI coding agents a complete picture of your platform — services, teams, APIs, docs, and templates — via a single MCP endpoint.

[![npm](https://img.shields.io/npm/v/backstage-plugin-mcp-backend)](https://www.npmjs.com/package/backstage-plugin-mcp-backend)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)

**Compatible with:** Claude Code · Cursor · Gemini CLI · any MCP client

---

## Why this plugin?

Backstage now ships an [official MCP plugin](https://backstage.io/docs/ai/mcp-actions/) (`@backstage/plugin-mcp-actions-backend`) and you should know about it. It exposes Actions from the Actions Registry — including `catalog.get-catalog-entity` and `catalog.query-catalog-entities` — so there is genuine overlap with this plugin.

**This plugin exists because of how I work, not because the official one can't.**

Three reasons it still makes sense for my workflow right now:

1. **Full-text search.** `search_catalog` hits the Search backend — fuzzy matching across all entity fields. The official plugin's catalog actions use predicate filters on the catalog API, which is structured but not the same as "find me anything related to payments". For an AI agent exploring an unfamiliar codebase, search is the entry point.

2. **TechDocs and permissions.** No well-known actions exist for these yet. `get_techdocs` and `check_permission` have no equivalent in the Actions Registry today.

3. **Ergonomics for agents.** `list_teams`, `list_apis`, `get_system` are purpose-built with typed parameters and clear descriptions. The alternative is a generic `query-catalog-entities` call where the agent has to construct correct predicate filter syntax. In practice this produces fewer agent errors and fewer tool calls.

**If the official plugin works for you — use it.** It will be maintained by the Backstage core team and its auth story (DCR, CIMD) is the right long-term direction. The goal here isn't to compete; it's to fill gaps that matter for my specific workflow today. If those gaps get closed upstream, I'll deprecate this plugin and point people there.

---

## Installation

**1. Install**

```bash
yarn add --cwd packages/backend backstage-plugin-mcp-backend
```

**2. Register** (`packages/backend/src/index.ts`)

```typescript
backend.add(import('backstage-plugin-mcp-backend'));
```

That's it. The plugin starts an MCP endpoint at `POST /api/mcp`.

---

## Connect an AI agent

### Claude Code

```bash
claude mcp add --transport http backstage https://your-backstage.example.com/api/mcp \
  --header "Authorization: Bearer <your-backstage-token>"
```

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
| `get_system` | Get a system and all its components in one call |
| `list_apis` | List all APIs, optionally filtered by type (openapi, graphql, grpc, asyncapi) |
| `list_teams` | List all Group entities — teams, squads, and their members |
| `register_component` | Register a repo by providing its `catalog-info.yaml` URL |
| `list_templates` | List all scaffolder templates, optionally filtered by tag |
| `scaffold_service` | Trigger a template to scaffold a new service, library, or docs site |
| `get_scaffolder_task` | Poll the status and logs of a running scaffolder task |
| `get_techdocs` | Retrieve TechDocs metadata for a catalog entity |
| `check_permission` | Check whether the current token has a given Backstage permission |

---

## How it works

The plugin registers a `POST /api/mcp` endpoint using the [MCP StreamableHTTP transport](https://spec.modelcontextprotocol.io/specification/2025-03-26/basic/transports/#streamable-http). Each client session gets a dedicated `McpServer` instance with all 12 tools registered against it.

**Authentication** forwards the caller's Backstage token to each downstream service call — catalog, scaffolder, TechDocs — via `auth.getPluginRequestToken()`. Your existing Backstage RBAC policy is enforced automatically. A developer token can run templates; a guest token can only read.

**Sessions** are tracked by the `Mcp-Session-Id` response header. Send it back on subsequent requests to continue a session. Idle sessions close after 30 minutes (configurable via `mcp.sessionTimeoutMinutes`).

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
