import { getIntegrations } from "/lib/forms/extensions";
import type { Response } from "@enonic-types/core";
import type { CustomSelectorServiceResponseBody } from "@item-enonic-types/global";

export function GET(): Response<{ body: CustomSelectorServiceResponseBody }> {
  const integrations = getIntegrations();

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
