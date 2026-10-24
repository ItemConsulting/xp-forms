import { process as processFields } from "/cms/form-fragments/fields/fields";
import type { Errors } from "/cms/partials/error-summary/error-summary";
import type { SpamPreventionConfig } from "/cms/partials/spam-prevention/spam-prevention.freemarker";
import type { SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";
import { render } from "/lib/freemarker";
import { localize } from "/lib/xp/i18n";
import { type Content, pageUrl, processHtml } from "/lib/xp/portal";
import type { FormPageForm as FormPageFormRaw } from ".";
import type { PageForm } from "./form-page-form.freemarker";

export type ProcessParams = {
  locale: string;
  partId: string;
  values: SubmittedValues;
  errors: Errors;
  content: Content;
  pageNumber: number;
  spamPreventionConfig: SpamPreventionConfig;
};

const view = resolve("form-page-form.ftlh");

export function process(raw: FormPageFormRaw, params: ProcessParams): string {
  const pageId = `${params.partId}-page-${params.pageNumber}`;

  return render<PageForm>(view, {
    frameId: `${params.partId}-frame`,
    pageId,
    title: raw.title,
    text: processHtml({
      value: raw.text ?? "",
    }),
    submitButtonText:
      raw.submitButtonText ??
      localize({
        key: "part.formView.submit",
        locale: params.locale,
      }),
    errors: params.errors,
    fields: processFields(raw, pageId, params.values),
    spamPreventionConfig: params.spamPreventionConfig,
    backUrl:
      params.pageNumber > 1
        ? pageUrl({
            path: params.content._path,
            params: {
              page: (params.pageNumber - 1).toString(),
            },
          })
        : undefined,
  });
}
