import type { PartComponent, Request, Response } from "@enonic-types/core";
import { assetUrl } from "/lib/enonic/asset";
import { forceArray } from "/lib/forms/arrays";
import type { ContentForm } from "/lib/forms/contents";
import { deleteFromStore, loadFromStore, saveToStore } from "/lib/forms/data-store";
import { getFormType, getPrepopulationValues } from "/lib/forms/extensions";
import { verify as verifyHoneypot } from "/lib/forms/honeypot";
import { getLocale } from "/lib/forms/locale";
import { getPages, RETURN_ALL_PAGES, RETURN_REVIEW_PAGE, SUCCESS_PAGE_COUNT } from "/lib/forms/pages";
import { getSpamPreventionConfig } from "/lib/forms/spam-prevention";
import { sendFormEvent, validatePages } from "/lib/forms/submission";
import { FIELD_TURNSTILE_RESPONSE, TURNSTILE_CLIENT_JS, verifyTurnstile } from "/lib/forms/turnstile";
import { assertIsDefined, partPathToId } from "/lib/forms/utils";
import { render } from "/lib/freemarker";
import { localize } from "/lib/xp/i18n";
import { getComponent, getContent, getSite, getSiteConfig, pageUrl } from "/lib/xp/portal";
import type { FreemarkerParams, SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";
import { HEADER_KEY_REDIRECT } from "/cms/processors/redirect";

export type { FormEvent } from "/lib/forms/submission";

type FormViewPart = PartComponent<"no.item.forms:form-view">;

const view = resolve("./form-view.ftlh");

type QueryParams = {
  page: string;
  [FIELD_TURNSTILE_RESPONSE]: string | string[];
};

export function all(req: Request<{ params: QueryParams }>): Response {
  const content = getContent<ContentForm>();
  const part = getComponent<FormViewPart>();
  const siteConfig = getSiteConfig<XP.SiteConfig>();
  const spamPreventionType = siteConfig?.spamPrevention._selected ?? "honeypot";

  assertIsDefined(content);
  assertIsDefined(part);
  assertIsDefined(siteConfig);

  const { page, ...valuesFromUser } = req.params;
  const pagesRaw = forceArray(content.data.pages);
  const hasReviewPage = content.data.reviewPage?._selected === "showReviewPage";
  const totalPages = pagesRaw.length + (hasReviewPage ? 1 : 0) + SUCCESS_PAGE_COUNT;
  const currentPageNumber = Math.max(parseInt(page ?? part.config.firstPageNumber ?? "1", 10), RETURN_REVIEW_PAGE);
  const currentPageIndex = Math.min(currentPageNumber, totalPages) - 1; // zero indexed
  const currentPageRaw = pagesRaw[currentPageIndex];
  const locale = getLocale({ content });

  const values: SubmittedValues = {
    ...getPrepopulationValues(content.data.integrationId, content._id),
    ...loadFromStore(req, content._id),
    ...valuesFromUser,
  };

  const formType = getFormType(content.data.integrationId, content._id);

  const errors = req.method === "POST" && currentPageRaw ? validatePages([currentPageRaw], values, locale) : {};
  const hasErrors = Object.keys(errors).length > 0;

  // If after last page, send back to first page
  if (currentPageNumber > totalPages) {
    return redirectToPage(content, 1);
  }
  // If on the success page, send event
  else if (currentPageNumber === totalPages) {
    sendFormEvent(req, getSite(), content, values, formType?.integration);

    deleteFromStore(req, content._id);
  }
  // If this is a bot
  else if (req.method === "POST" && !isHuman(req, spamPreventionType)) {
    if (spamPreventionType === "turnstile") {
      errors[FIELD_TURNSTILE_RESPONSE] = [
        localize({
          key: "part.formView.verify.error.turnstile",
          locale,
        }),
      ];
    }
  }
  // If form submit, save values and redirect to next page
  else if (req.method === "POST" && !hasErrors) {
    saveToStore(req, content._id, values);

    return redirectToPage(content, currentPageNumber + 1);
  }

  const pages = getPages({
    locale,
    part,
    content,
    values,
    errors,
    pageIndex: req.mode === "edit" ? RETURN_ALL_PAGES : currentPageIndex,
    spamPreventionConfig: getSpamPreventionConfig(siteConfig),
  });

  return {
    status: hasErrors ? 400 : 200,
    headers: {
      "Cache-Control": "private, no-store",
    },
    body: render<FreemarkerParams>(view, {
      errors,
      pages,
      values,
      frameId: `${partPathToId(part.path)}-frame`,
    }),
    pageContributions: {
      headEnd: ([] as string[])
        .concat(
          createScriptTag(
            `${TURNSTILE_CLIENT_JS}?render=explicit&amp;onload=xpFormsTurnstileOnload`,
            spamPreventionType === "turnstile",
          ),
        )
        .concat(
          createScriptTag(assetUrl({ path: "scripts/cloudflare-turnstile.mjs" }), spamPreventionType === "turnstile"),
        )
        .concat(createStyleTag("styles/content-studio.min.css", req.mode !== "live"))
        .concat(createStyleTag("styles/main.min.css", siteConfig.includeStyles ?? true))
        .concat(createStyleTag("styles/form-h.min.css", spamPreventionType === "honeypot")),
    },
  };
}

function redirectToPage(content: ContentForm, pageNumber: number): Response {
  return {
    status: 303,
    headers: {
      [HEADER_KEY_REDIRECT]: pageUrl({
        path: content._path,
        params: {
          page: pageNumber.toString(),
        },
      }),
    },
  };
}

function isHuman(req: Request, spamPreventionType: string): boolean {
  return spamPreventionType === "honeypot" ? verifyHoneypot(req) : verifyTurnstile(req);
}

function createStyleTag(path: string, include: boolean): string[] {
  return include ? [`<link href="${assetUrl({ path })}" rel="stylesheet">`] : [];
}

function createScriptTag(path: string, include: boolean): string[] {
  return include ? [`<script src="${path}" async defer></script>`] : [];
}
