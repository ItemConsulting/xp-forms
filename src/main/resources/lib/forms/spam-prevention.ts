import type { SpamPreventionConfig } from "/cms/partials/spam-prevention/spam-prevention.freemarker";
import { getFieldNameFromConfig } from "/lib/forms/honeypot";
import { assertIsDefined } from "/lib/forms/utils";

export type SpamPreventionType = SpamPreventionConfig["type"];

/**
 * The spam prevention chosen in the site's config, or "none" when the site has no config, or none is
 * chosen. Takes the config as a parameter, since Guillotine reads it from the form's site rather than
 * from the current request.
 */
export function getSpamPreventionType(siteConfig: XP.SiteConfig | null | undefined): SpamPreventionType {
  // A config saved before spam prevention was added to it has none
  const selected = siteConfig?.spamPrevention?._selected;

  return selected === "turnstile" || selected === "honeypot" ? selected : "none";
}

/** The key to render the Turnstile widget with, from the site's config or else the app's */
export function getTurnstileSiteKey(siteConfig: XP.SiteConfig | null | undefined): string | undefined {
  const spamPrevention = siteConfig?.spamPrevention;

  return (
    (spamPrevention?._selected === "turnstile" ? spamPrevention.turnstile.turnstileSiteKey : undefined) ??
    app.config.turnstileSiteKey
  );
}

/** What a form needs to render the spam prevention chosen in the site's config */
export function getSpamPreventionConfig(siteConfig: XP.SiteConfig | null | undefined): SpamPreventionConfig {
  switch (getSpamPreventionType(siteConfig)) {
    case "honeypot":
      return {
        type: "honeypot",
        honeypotFiledName: getFieldNameFromConfig(siteConfig),
      };
    case "turnstile": {
      const turnstileSiteKey = getTurnstileSiteKey(siteConfig);
      assertIsDefined(turnstileSiteKey, "turnstileSiteKey");
      return {
        type: "turnstile",
        turnstileSiteKey,
      };
    }
    default:
      return {
        type: "none",
      };
  }
}
