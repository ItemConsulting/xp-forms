import type { Request, Response } from "@enonic-types/core";

export const HEADER_KEY_REDIRECT = "x-redirect";

export function responseProcessor(req: Request, res: Response): Response {
  const redirectUrl = res.headers?.[HEADER_KEY_REDIRECT];
  return typeof redirectUrl === "string"
    ? {
        ...res,
        status: 303,
        redirect: redirectUrl,
      }
    : res;
}
