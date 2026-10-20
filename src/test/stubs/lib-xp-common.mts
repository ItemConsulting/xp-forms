/**
 * Test stub for the XP `/lib/xp/common` library. `sanitize` makes a name out of a label, which is all
 * the tested code needs: lower case, with anything but letters and digits turned into dashes.
 */
export function sanitize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
