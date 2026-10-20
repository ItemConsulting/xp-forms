import type { Request, Response } from "@enonic-types/core";
import type { Form } from "/cms/content-types";
import { getJsonSchema } from "/lib/forms/json-schema";
import { getLocale } from "/lib/forms/locale";
import { type Content, get as getOne } from "/lib/xp/content";

type QueryParams = {
  id: string;
};

export function GET(req: Request<{ params: QueryParams }>): Response {
  const content = req.params.id
    ? getOne<Content<Form>>({
        key: req.params.id,
      })
    : null;

  if (content?.type !== "no.item.forms:form") {
    return {
      status: 404,
    };
  }

  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(getJsonSchema(content, getLocale({ content })), null, 2),
  };
}
