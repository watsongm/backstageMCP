# Contributing

## Development setup

```bash
git clone https://github.com/watsongm/backstageMCP
cd backstageMCP
yarn install
```

## Project structure

```
packages/
  backstage-plugin-mcp-backend/   # The plugin
    src/
      plugin.ts       # createBackendPlugin() — DI wiring
      McpRouter.ts    # HTTP handler, session management
      tools/
        catalog.ts    # 7 catalog tools
        scaffolder.ts # 3 scaffolder tools
        techdocs.ts   # 1 TechDocs tool
        permissions.ts # 1 permissions tool
examples/
  backstage-app/      # Minimal reference Backstage backend
```

## Adding a tool

1. Open the relevant file under `src/tools/`
2. Add a `server.tool(name, description, schema, handler)` call inside the `register*Tools` function
3. The handler can access `credentialStore.getStore()` for the caller's Backstage credentials

## Running tests

```bash
yarn test
```

## Submitting a PR

- Keep PRs focused — one feature or fix per PR
- Add a test for new tools or behaviour changes
- Update the tool table in `README.md` if you add or rename a tool

## Releasing

Releases are automated via GitHub Actions on version tags:

```bash
npm version patch   # or minor / major
git push --follow-tags
```

The `publish.yml` workflow publishes to npm automatically.
