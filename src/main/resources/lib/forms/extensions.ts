import { find } from "/lib/forms/arrays";
import type { JSONSchema } from "/lib/forms/json-schema";

export type Integration = {
  id: string;
  displayName: string;
  description?: string;
};

export type FormExtensions = {
  id: string;
  displayName: string;
  description?: string;
  jsonSchema?: JSONSchema;
  values?: () => Record<string, unknown> | undefined;
};

const extensionsBean = __.newBean<{
  getIntegrations(): Integration[];
  getPrepopulationValues(id: string): Record<string, unknown> | undefined;
  getReferenceJsonSchema(id: string): JSONSchema | null;
}>("no.item.forms.ExtensionsBean");

export function getIntegrations(): Integration[] {
  return __.toNativeObject(extensionsBean.getIntegrations());
}

export function getPrepopulationValues(id?: string): Record<string, unknown> {
  return id ? (__.toNativeObject(extensionsBean.getPrepopulationValues(id)) ?? {}) : {};
}

export function getIntegration(id: string): Integration | undefined {
  return find(getIntegrations(), (integration) => integration.id === id);
}

export function getReferenceJsonSchema(id: string): JSONSchema | undefined {
  return __.toNativeObject(extensionsBean.getReferenceJsonSchema(id)) ?? undefined;
}
