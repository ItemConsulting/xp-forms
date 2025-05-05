import { notEmptyOrUndefined } from "/lib/forms/utils";

/**
 * Returns an array of all matches of a regular expression in a string
 */
export function matchAll(regex: RegExp, str: string): RegExpExecArray[] {
  const matches: RegExpExecArray[] = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    matches.push(match);
  }

  return matches;
}

export function toSnakeCase(nonSnake?: string): string | undefined {
  if (notEmptyOrUndefined(nonSnake)) {
    return nonSnake
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map((x) => x.toLowerCase())
      .join("_");
  }

  return;
}

export function startsWith(str: string, searchString: string): boolean {
  return str.substring(0, searchString.length) === searchString;
}

export function getSubstringAfterLast(str: string, divider: string): string {
  const index = str.lastIndexOf(divider);
  return index === -1 ? "" : str.substring(index + divider.length);
}
