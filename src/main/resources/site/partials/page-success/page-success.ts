import { forceArray } from "/lib/forms/arrays";
import { render } from "/lib/tineikt/freemarker";
import { notEmptyOrUndefined } from "/lib/forms/utils";
import { processHtml, type Content } from "/lib/xp/portal";
import type { Form } from "/site/content-types";
import type { PageSuccess } from "/site/partials/page-success/page-success.freemarker";

const view = resolve("/site/partials/page-success/page-success.ftl");

export function process(form: Content<Form>, locale: string): string {
  return render<PageSuccess>(view, {
    locale,
    sections: forceArray(form.data.successPageSections)
      .map((section) => processHtml({ value: section.text ?? "" }))
      .filter(notEmptyOrUndefined),
  });
}
