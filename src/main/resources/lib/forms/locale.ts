import { getSite, type Content, type Site } from "/lib/xp/portal";
import { LanguageRange, Locale } from "/lib/time";
import { getSupportedLocales } from "/lib/xp/i18n";
import type { Request } from "@enonic-types/core";

const DEFAULT_LOCALE = Locale.ENGLISH.toLanguageTag();

export function getLocale({ content, site }: GetLocaleParams): string {
  const language = content?.language ?? site?.language ?? getSite()?.language ?? DEFAULT_LOCALE;

  return language.replace("_", "-");
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
