import { forceArray } from "/lib/forms/arrays";
import { notEmptyOrUndefined } from "/lib/forms/utils";
import { render } from "/lib/freemarker";
import { processHtml } from "/lib/xp/portal";
import type { FormPageSuccess as FormPageSuccessRaw } from ".";
import type { PageSuccess } from "./form-page-success.freemarker";

const view = resolve("form-page-success.ftlh");

export function process(raw: FormPageSuccessRaw): string {
  return render<PageSuccess>(view, {
    sections: forceArray(raw)
      .map((section) => processHtml({ value: section.text ?? "" }))
      .filter(notEmptyOrUndefined),
  });
}
