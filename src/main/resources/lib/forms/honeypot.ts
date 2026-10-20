import type { Request } from "@enonic-types/core";
import { first } from "/lib/forms/arrays";
import { getOptionIfPresent } from "/lib/forms/utils";
import { getSiteConfig } from "/lib/xp/portal";

export const DEFAULT_FIELD_NAME_HONEYPOT = "website";

export function verify(req: Request): boolean {
  return (first(req.params[getFieldNameFromConfig()]) ?? "").length === 0;
}

export function getFieldNameFromConfig(
  siteConfig: XP.SiteConfig | null | undefined = getSiteConfig<XP.SiteConfig>(),
): string {
  return (
    getOptionIfPresent(siteConfig?.spamPrevention, "honeypot")?.honeypot.honeypotFieldName ??
    DEFAULT_FIELD_NAME_HONEYPOT
  );
}
