import type { Request } from "@enonic-types/core";
import { LanguageRange, Locale } from "/lib/time";
import { getSupportedLocales } from "/lib/xp/i18n";
import { type Content, getSite, type Site } from "/lib/xp/portal";

const DEFAULT_LOCALE = Locale.ROOT.toLanguageTag();

export function getLocale({ content, site }: GetLocaleParams): string {
  return content?.language ?? site?.language ?? getSite()?.language ?? DEFAULT_LOCALE;
}

type GetLocaleParams = {
  content?: Content<unknown>;
  site?: Site<XP.SiteConfig>;
};

export function getLocaleFromRequest(req: Request): string {
  const acceptLanguage = req.headers["Accept-Language"];

  if (acceptLanguage) {
    const languageRange = LanguageRange.parse(acceptLanguage);
    return Locale.filterTags(languageRange, getSupportedLocales(["i18n/phrases"]))[0] ?? DEFAULT_LOCALE;
  }

  return DEFAULT_LOCALE;
}
