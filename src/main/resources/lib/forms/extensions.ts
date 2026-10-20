import type { JSONSchema } from "/lib/forms/json-schema";

export type Integration = {
  id: string;
  displayName: string;
  description?: string;
};

export type FormType = {
  integration: Integration;
  jsonSchema?: JSONSchema;
};

type FormTypeRaw = {
  integration: Integration;
  jsonSchema?: JSONSchema | Record<string, never>;
};

export type FormExtensions = {
  id: string;
  displayName: string;
  description?: string;
  jsonSchema?: JSONSchema;
  values?: () => Record<string, unknown> | undefined;
};

/*
  The form types are run with the site of the form passed in, since they read the site's config from
  the request, and Guillotine is served outside any site. Without a form, they get the request's site.
  The bean is given null rather than undefined, which the script engine would pass as "undefined".
*/

const extensionsBean = __.newBean<{
  getIntegrations(formId: string | null): Integration[];
  getPrepopulationValues(id: string, formId: string | null): Record<string, unknown> | undefined;
  getFormType(id: string, formId: string | null): FormTypeRaw | null;
}>("no.item.forms.ExtensionsBean");

export function getIntegrations(formId?: string): Integration[] {
  return __.toNativeObject(extensionsBean.getIntegrations(formId ?? null));
}

export function getPrepopulationValues(id: string | undefined, formId: string): Record<string, unknown> {
  return id ? (__.toNativeObject(extensionsBean.getPrepopulationValues(id, formId)) ?? {}) : {};
}

/** The form type a form is sent to, and the schema it expects of the form. Undefined without one. */
export function getFormType(id: string | undefined, formId: string): FormType | undefined {
  const formType = id ? __.toNativeObject(extensionsBean.getFormType(id, formId)) : null;

  return formType
    ? {
        integration: formType.integration,
        // A form type that expects nothing gives an empty schema
        jsonSchema:
          formType.jsonSchema && Object.keys(formType.jsonSchema).length > 0
            ? (formType.jsonSchema as JSONSchema)
            : undefined,
      }
    : undefined;
}
