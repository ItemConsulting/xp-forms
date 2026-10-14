import type { Content } from "/lib/xp/portal";
import type { Form as FormRaw } from "/cms/content-types";

export type ContentForm = Content<FormRaw, "no.item.forms:form">;
