import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { credentialStore, type ToolOptions } from '../McpRouter';

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerPermissionsTools(server: McpServer, opts: ToolOptions): void {
  const { permissions } = opts;

  // ── check_permission ────────────────────────────────────────────────────
  server.tool(
    'check_permission',
    'Check whether the current token has a given Backstage permission.',
    {
      permission: z.string().describe('Permission name, e.g. catalog.entity.read'),
      resource_ref: z
        .string()
        .optional()
        .describe(
          'Entity ref to check against for resource permissions, e.g. component:default/my-service',
        ),
    },
    async ({ permission: permissionName, resource_ref }) => {
      const credentials = credentialStore.getStore();
      if (!credentials) throw new Error('No credentials in context');

      // Construct a basic permission. Resource permissions (those that accept
      // a resourceRef) use type 'resource'; simple yes/no permissions use 'basic'.
      // We infer from whether resource_ref was provided.
      const perm = resource_ref
        ? {
            name: permissionName,
            attributes: {},
            type: 'resource' as const,
            resourceType: 'catalog-entity',
          }
        : {
            name: permissionName,
            attributes: {},
            type: 'basic' as const,
          };

      const [decision] = await permissions.authorize(
        [{ permission: perm, ...(resource_ref ? { resourceRef: resource_ref } : {}) }],
        { credentials },
      );

      return ok({
        permission: permissionName,
        resourceRef: resource_ref,
        result: decision.result,
        allowed: decision.result === 'ALLOW',
      });
    },
  );
}
