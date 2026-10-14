// Module resolver for `node --test`. XP resolves absolute specifiers like "/lib/forms/utils"
// against the app's own resources; the test runner needs the same mapping. "/lib/xp/*" are
// Java-backed with no Node implementation, so the ones the tested code uses map to stubs.
// Registered from register.mjs.
import { existsSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

const RESOURCES = resolvePath(process.cwd(), "src/main/resources");
const STUBS = resolvePath(process.cwd(), "src/test/stubs");

const STUBBED = {
  "/lib/xp/i18n": `${STUBS}/lib-xp-i18n.mts`,
};

export function resolve(specifier, context, next) {
  if (specifier in STUBBED) {
    return { url: pathToFileURL(STUBBED[specifier]).href, shortCircuit: true };
  }
  if (specifier.startsWith("/")) {
    const file = `${RESOURCES}${specifier}.ts`;
    if (existsSync(file)) {
      return { url: pathToFileURL(file).href, shortCircuit: true };
    }
  }
  return next(specifier, context);
}
