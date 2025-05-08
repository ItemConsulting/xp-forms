import { getMap } from "/lib/xp/grid";
import type { Request } from "@enonic-types/core";
import type { SubmittedValues } from "/site/parts/form-view/form-view.freemarker";

const store = getMap<Record<string, string>>("no.item.forms");

export function loadFromStore(req: Request, contentId: string): SubmittedValues {
  return JSON.parse(store.get(getUniqueKeyForUserAndForm(req, contentId)) ?? "{}");
}

export function saveToStore(req: Request, contentId: string, values: SubmittedValues): void {
  store.set({
    key: getUniqueKeyForUserAndForm(req, contentId),
    value: JSON.stringify(values),
    ttlSeconds: 3600,
  });
}

export function deleteFromStore(req: Request, contentId: string): void {
  store.delete(getUniqueKeyForUserAndForm(req, contentId));
}

function getUniqueKeyForUserAndForm(req: Request, contentId: string): string {
  return `${req.cookies.JSESSIONID}-${contentId}`;
}
