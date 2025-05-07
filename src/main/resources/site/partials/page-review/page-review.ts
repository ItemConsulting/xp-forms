import { render } from "/lib/tineikt/freemarker";
import { forceArray } from "/lib/forms/arrays";
import type { PageReview, Section } from "/site/partials/page-review/page-review.freemarker";
import type { SubmittedValues } from "/site/parts/form-view/form-view.freemarker";
import type { Field } from "/site/partials/page-form/page-form.freemarker";

export type ProcessParams = {
  title: string;
  locale: string;
  sections: {
    title: string;
    fields: Field[];
  }[];
  values: SubmittedValues;
  backUrl: string;
  submitButtonText: string;
};

const view = resolve("/site/partials/page-review/page-review.ftl");

export function process(params: ProcessParams): string {
  return render<PageReview>(view, {
    locale: params.locale,
    title: params.title,
    sections: getSections(params),
    backUrl: params.backUrl,
    submitButtonText: params.submitButtonText,
  });
}

function getSections(params: ProcessParams): Section[] {
  return params.sections.map<Section>((page) => ({
    title: page.title,
    fields: page.fields.map((field) => {
      return {
        id: field.id,
        label: field.type === "hidden" ? field.name : field.label,
        name: field.name,
        values: forceArray(params.values[field.name]),
      };
    }),
  }));
}
