import { forceArray } from "/lib/forms/arrays";
import { render } from "/lib/freemarker";
import { notEmptyOrUndefined } from "/lib/forms/utils";
import { processHtml, type Content } from "/lib/xp/portal";
import type { Form } from "/cms/content-types";
import type { PageSuccess } from "/cms/partials/page-success/page-success.freemarker";

const view = resolve("/cms/partials/page-success/page-success.ftlh");

export function process(form: Content<Form>): string {
  return render<PageSuccess>(view, {
    sections: forceArray(form.data.successPageSections)
      .map((section) => processHtml({ value: section.text ?? "" }))
      .filter(notEmptyOrUndefined),
  });
}
