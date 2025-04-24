import type { Response } from "@enonic-types/core";
import type { CustomSelectorServiceResponseBody } from "@item-enonic-types/global/controller";

export function get(): Response<{ body: CustomSelectorServiceResponseBody }> {
  // Get every form registered

  // const selectedIds = req.params.ids?.split(",") ?? [];

  const hits = [
    {
      id: "email",
      displayName: "Email",
      description: "Send form submissions by email",
    },
  ];

  return {
    status: 200,
    contentType: "application/json",
    body: {
      total: hits.length,
      count: hits.length,
      hits,
    },
  };
}
