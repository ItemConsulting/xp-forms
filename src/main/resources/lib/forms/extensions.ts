import type { JSONSchema } from "/lib/forms/json-schema";

type Integration = {
  id: string;
  displayName: string;
  description?: string;
};

const extensionsBean = __.newBean<{
  getIntegrations(): Integration[];
  getReferenceJsonSchema(id: string): JSONSchema | null;
}>("no.item.forms.ExtensionsBean");

export function getIntegrations(): Integration[] {
  return __.toNativeObject(extensionsBean.getIntegrations());
}

export function getReferenceJsonSchema(id: string): JSONSchema | undefined {
  return __.toNativeObject(extensionsBean.getReferenceJsonSchema(id)) ?? undefined;
}
