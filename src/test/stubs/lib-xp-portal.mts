/**
 * Test stub for the XP `/lib/xp/portal` library. `apiUrl` gives a JSON Schema its `$id`, and
 * `getSiteConfig` and `processHtml` are only imported, by code that is given the config in the tests.
 */
export function apiUrl(params: { api: string; params?: Record<string, string> }): string {
  return `/api/${params.api}?${new URLSearchParams(params.params).toString()}`;
}

export function getSiteConfig(): null {
  return null;
}

export function processHtml(params: { value: string }): string {
  return params.value;
}
