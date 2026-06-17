/**
 * Test mock for the XP `/lib/xp/i18n` library.
 *
 * `localize` normally resolves a phrase from the app's i18n bundles. In tests there is no XP runtime,
 * so we return the `key` verbatim. That keeps assertions deterministic and lets a test confirm which
 * phrase key a validator falls back to when no explicit `errorMessage` is provided.
 */
export function localize(params: { key: string; values?: string[]; locale?: string | string[] }): string {
  return params.key;
}
