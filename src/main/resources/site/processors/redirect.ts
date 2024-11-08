export const HEADER_KEY_REDIRECT = "x-redirect";

export function responseProcessor(req: XP.Request, res: XP.Response): XP.Response {
  const redirectUrl = res.headers?.[HEADER_KEY_REDIRECT];
  return redirectUrl !== undefined
    ? {
        ...res,
        status: 303,
        redirect: redirectUrl,
      }
    : res;
}
