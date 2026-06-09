import { get as getOne, type Content } from "/lib/xp/content";
import { getJsonSchema } from "/lib/forms/json-schema";
import type { Form } from "/site/content-types";
import type { Request, Response } from "@enonic-types/core";

type QueryParams = {
  id: string;
};

export function get(req: Request<{ params: QueryParams }>): Response {
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
    body: JSON.stringify(getJsonSchema(content), null, 2),
  };
}
