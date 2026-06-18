import type { Request } from "@enonic-types/core";
import { verify } from "/lib/cloudflare-turnstile";
import { assertIsDefined, getOptionIfPresent } from "/lib/forms/utils";
import { getSiteConfig } from "/lib/xp/portal";

export { FIELD_TURNSTILE_RESPONSE, TURNSTILE_CLIENT_JS } from "/lib/cloudflare-turnstile";

export function verifyTurnstile(req: Request): boolean {
  const siteConfig = getSiteConfig<XP.SiteConfig>();
  const secretKey =
    getOptionIfPresent(siteConfig?.spamPrevention, "turnstile")?.turnstile.turnstileSecretKey ??
    app.config.turnstileSecretKey;

  assertIsDefined(secretKey);

  return verify(req, secretKey).success;
}
