import type { Response } from "@enonic-types/core";
import type { CustomSelectorServiceResponseBody } from "@item-enonic-types/global/controller";
import { getIntegrations } from "/lib/forms/extensions";

export function get(): Response<{ body: CustomSelectorServiceResponseBody }> {
  // Get every form registered

  // const selectedIds = req.params.ids?.split(",") ?? [];

  const integrations = getIntegrations();

  /*
  const hits = integrations.map((integration) => ({
    id: integration.id,
    displayName: integration.displayName,
  }));
*/
  return {
    status: 200,
    contentType: "application/json",
    body: {
      total: integrations.length,
      count: integrations.length,
      hits: integrations,
    },
  };
}
